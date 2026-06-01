// utils/sensitiveWordFilter.js
// 敏感词过滤系统 - 集成内容安全审核策略

const app = getApp();
const safetyPolicy = require('../config/contentSafetyPolicy');

/**
 * DFA算法实现的敏感词过滤器
 * 严格遵循内容安全审核策略
 */
class SensitiveWordFilter {
  constructor() {
    this.keywordMap = new Map();
    this.sensitiveWords = [];
    this.initialized = false;
    this.policy = safetyPolicy;
    this.auditLogs = []; // 审核日志缓存
  }

  /**
   * 初始化敏感词库
   * 优先加载内容安全策略中的敏感词
   */
  async init() {
    if (this.initialized) return;

    try {
      // 1. 首先从安全策略加载核心敏感词（零容忍级别）
      const policyWords = this.policy.getAllSensitiveWords();
      console.log('[SensitiveFilter] 从安全策略加载', policyWords.length, '个核心敏感词');

      // 2. 尝试从云数据库加载扩展敏感词
      let cloudWords = [];
      if (wx.cloud && wx.cloud.database) {
        try {
          const db = wx.cloud.database();
          const { data } = await db.collection('sensitive_words')
            .where({ enabled: true })
            .get();
          cloudWords = data;
          console.log('[SensitiveFilter] 从云端加载', cloudWords.length, '个扩展敏感词');
        } catch (cloudError) {
          console.warn('[SensitiveFilter] 云端加载失败，使用本地策略词库');
        }
      }

      // 3. 合并词库（策略词优先）
      this.sensitiveWords = this.mergeWordLists(policyWords, cloudWords);
      this.buildKeywordMap(this.sensitiveWords);
      this.initialized = true;

      console.log('[SensitiveFilter] 敏感词库初始化完成，共', this.sensitiveWords.length, '个词');
      
      // 4. 记录初始化日志
      this.logAuditEvent('SYSTEM_INIT', {
        totalWords: this.sensitiveWords.length,
        policyWords: policyWords.length,
        cloudWords: cloudWords.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('[SensitiveFilter] 初始化失败:', error);
      // 使用策略中的默认敏感词
      this.loadPolicyWords();
    }
  }

  /**
   * 从安全策略加载敏感词
   */
  loadPolicyWords() {
    const policyWords = this.policy.getAllSensitiveWords();
    this.sensitiveWords = policyWords;
    this.buildKeywordMap(policyWords);
    this.initialized = true;
    console.log('[SensitiveFilter] 已加载策略敏感词，共', policyWords.length, '个词');
  }

  /**
   * 合并敏感词列表（去重，策略词优先）
   */
  mergeWordLists(policyWords, cloudWords) {
    const wordMap = new Map();
    
    // 先添加策略词（高优先级）
    policyWords.forEach(word => {
      wordMap.set(word.word, word);
    });
    
    // 再添加云端词（不覆盖策略词）
    cloudWords.forEach(word => {
      if (!wordMap.has(word.word)) {
        wordMap.set(word.word, word);
      }
    });
    
    return Array.from(wordMap.values());
  }

  /**
   * 构建DFA树
   * @param {Array} words - 敏感词列表
   */
  buildKeywordMap(words) {
    this.keywordMap.clear();

    words.forEach(item => {
      const word = item.word;
      let currentMap = this.keywordMap;

      for (let i = 0; i < word.length; i++) {
        const char = word[i];

        if (!currentMap.has(char)) {
          currentMap.set(char, new Map());
        }

        currentMap = currentMap.get(char);

        // 标记词尾
        if (i === word.length - 1) {
          currentMap.set('isEnd', true);
          currentMap.set('wordInfo', item);
        }
      }
    });
  }

  /**
   * 检测文本中的敏感词
   * @param {String} text - 待检测文本
   * @returns {Array} 检测结果
   */
  detect(text) {
    if (!text || !this.initialized) return [];

    const results = [];
    const textLength = text.length;

    for (let i = 0; i < textLength; i++) {
      let currentMap = this.keywordMap;
      let matchLength = 0;
      let matchWord = '';
      let wordInfo = null;

      for (let j = i; j < textLength; j++) {
        const char = text[j];

        if (!currentMap.has(char)) {
          break;
        }

        currentMap = currentMap.get(char);
        matchLength++;
        matchWord += char;

        if (currentMap.get('isEnd')) {
          wordInfo = currentMap.get('wordInfo');

          // 获取上下文
          const contextStart = Math.max(0, i - 10);
          const contextEnd = Math.min(textLength, j + 11);
          const context = text.substring(contextStart, contextEnd);

          results.push({
            word: matchWord,
            type: wordInfo.type,
            level: wordInfo.level,
            position: { start: i, end: j },
            context: context,
            index: results.length
          });
        }
      }
    }

    return results;
  }

  /**
   * 过滤敏感词（替换为*）
   * @param {String} text - 原文本
   * @param {String} replaceChar - 替换字符
   * @returns {String} 过滤后的文本
   */
  filter(text, replaceChar = '*') {
    if (!text || !this.initialized) return text;

    const detections = this.detect(text);
    if (detections.length === 0) return text;

    let result = text;
    // 从后向前替换，避免位置变化
    detections.reverse().forEach(item => {
      const replacement = replaceChar.repeat(item.word.length);
      result = result.substring(0, item.position.start) +
               replacement +
               result.substring(item.position.end + 1);
    });

    return result;
  }

  /**
   * 检查文本是否包含敏感词
   * @param {String} text - 待检测文本
   * @returns {Boolean}
   */
  contains(text) {
    return this.detect(text).length > 0;
  }

  /**
   * 实时检测（带防抖）
   * @param {String} text - 待检测文本
   * @param {Function} callback - 回调函数
   * @param {Number} delay - 延迟时间
   */
  detectRealtime(text, callback, delay = 300) {
    clearTimeout(this.detectTimer);
    this.detectTimer = setTimeout(() => {
      const results = this.detect(text);
      callback(results);
    }, delay);
  }

  /**
   * 添加敏感词
   * @param {Object} wordData - 敏感词数据
   * @returns {Promise<Boolean>}
   */
  async addWord(wordData) {
    try {
      const db = wx.cloud.database();

      // 检查是否已存在
      const { data } = await db.collection('sensitive_words')
        .where({ word: wordData.word })
        .get();

      if (data.length > 0) {
        throw new Error('敏感词已存在');
      }

      // 添加到数据库
      await db.collection('sensitive_words').add({
        data: {
          ...wordData,
          createTime: new Date(),
          enabled: true
        }
      });

      // 重新加载敏感词库
      await this.init();

      return true;
    } catch (error) {
      console.error('[SensitiveFilter] 添加敏感词失败:', error);
      throw error;
    }
  }

  /**
   * 删除敏感词
   * @param {String} wordId - 敏感词ID
   * @returns {Promise<Boolean>}
   */
  async deleteWord(wordId) {
    try {
      const db = wx.cloud.database();

      await db.collection('sensitive_words').doc(wordId).remove();

      // 重新加载敏感词库
      await this.init();

      return true;
    } catch (error) {
      console.error('[SensitiveFilter] 删除敏感词失败:', error);
      throw error;
    }
  }

  /**
   * 更新敏感词
   * @param {String} wordId - 敏感词ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Boolean>}
   */
  async updateWord(wordId, updateData) {
    try {
      const db = wx.cloud.database();

      await db.collection('sensitive_words').doc(wordId).update({
        data: {
          ...updateData,
          updateTime: new Date()
        }
      });

      // 重新加载敏感词库
      await this.init();

      return true;
    } catch (error) {
      console.error('[SensitiveFilter] 更新敏感词失败:', error);
      throw error;
    }
  }

  /**
   * 批量导入敏感词
   * @param {Array} words - 敏感词数组
   * @returns {Promise<Object>} 导入结果
   */
  async batchImport(words) {
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    const db = wx.cloud.database();

    for (const word of words) {
      try {
        // 检查是否已存在
        const { data } = await db.collection('sensitive_words')
          .where({ word: word.word })
          .get();

        if (data.length === 0) {
          await db.collection('sensitive_words').add({
            data: {
              ...word,
              createTime: new Date(),
              enabled: true
            }
          });
          results.success++;
        } else {
          results.failed++;
          results.errors.push(`${word.word}: 已存在`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${word.word}: ${error.message}`);
      }
    }

    // 重新加载敏感词库
    await this.init();

    return results;
  }

  /**
   * 导出敏感词
   * @returns {Promise<Array>}
   */
  async exportWords() {
    try {
      const db = wx.cloud.database();
      const { data } = await db.collection('sensitive_words').get();
      return data;
    } catch (error) {
      console.error('[SensitiveFilter] 导出敏感词失败:', error);
      throw error;
    }
  }

  /**
   * 记录敏感词命中
   * @param {Object} hitInfo - 命中信息
   */
  async recordHit(hitInfo) {
    try {
      const db = wx.cloud.database();

      await db.collection('sensitive_word_hits').add({
        data: {
          ...hitInfo,
          createTime: new Date(),
          handled: false
        }
      });
    } catch (error) {
      console.error('[SensitiveFilter] 记录命中失败:', error);
    }
  }

  /**
   * 记录审核事件（符合AUDIT_LOG_CONFIG规范）
   * @param {String} eventType - 事件类型
   * @param {Object} details - 事件详情
   */
  async logAuditEvent(eventType, details) {
    const event = {
      timestamp: new Date().toISOString(),
      eventType,
      details,
      // 符合AUDIT_LOG_CONFIG.REQUIRED_FIELDS
      contentHash: this.generateContentHash(JSON.stringify(details)),
      deviceInfo: wx.getSystemInfoSync(),
    };

    // 添加到本地缓存
    this.auditLogs.push(event);

    // 如果达到批量大小，提交到云端
    if (this.auditLogs.length >= 10) {
      await this.flushAuditLogs();
    }

    // 同时输出到控制台（开发调试）
    console.log('[AuditLog]', eventType, details);
  }

  /**
   * 生成内容哈希（用于追溯）
   */
  generateContentHash(content) {
    // 简单的哈希函数
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  /**
   * 批量提交审核日志到云端
   */
  async flushAuditLogs() {
    if (this.auditLogs.length === 0) return;

    try {
      const db = wx.cloud.database();
      const batch = this.auditLogs.splice(0, 10); // 每次最多10条

      for (const log of batch) {
        await db.collection('audit_logs').add({
          data: log
        });
      }

      console.log('[SensitiveFilter] 审核日志已提交:', batch.length, '条');
    } catch (error) {
      console.error('[SensitiveFilter] 提交审核日志失败:', error);
      // 失败时将日志重新放回队列
      this.auditLogs.unshift(...batch);
    }
  }

  /**
   * 内容安全审核（完整流程）
   * @param {String} content - 待审核内容
   * @param {Object} context - 上下文信息（用户ID、内容类型等）
   * @returns {Object} 审核结果
   */
  async auditContent(content, context = {}) {
    // 1. 机器预检
    const detectionResult = this.detect(content);
    
    // 2. 确定最高危险等级
    let maxLevel = 0;
    let violations = [];
    
    detectionResult.forEach(hit => {
      if (hit.level > maxLevel) {
        maxLevel = hit.level;
      }
      violations.push({
        word: hit.word,
        type: hit.type,
        level: hit.level,
        context: hit.context
      });
    });

    // 3. 获取处理策略
    const strategy = this.policy.getActionStrategy(maxLevel);

    // 4. 记录审核日志
    await this.logAuditEvent('CONTENT_AUDIT', {
      userId: context.userId || 'anonymous',
      contentType: context.contentType || 'unknown',
      contentLength: content.length,
      detectionResult: violations,
      maxLevel,
      action: strategy.action,
      timestamp: new Date().toISOString()
    });

    // 5. 如果命中零容忍级别，记录到敏感词命中表
    if (maxLevel >= 4) {
      await this.recordHit({
        userId: context.userId,
        content: content.substring(0, 200), // 只记录前200字符
        violations: violations,
        level: maxLevel,
        action: strategy.action
      });
    }

    // 6. 返回审核结果
    return {
      passed: maxLevel < 3, // 等级3及以上不通过
      level: maxLevel,
      strategy: strategy,
      violations: violations,
      action: strategy.action,
      message: strategy.notification
    };
  }
}

// 创建单例
const sensitiveFilter = new SensitiveWordFilter();

module.exports = sensitiveFilter;
