// utils/contentAuditor.js
// 内容审核中间件 - 集成敏感词过滤、安全策略和前置过滤

const sensitiveFilter = require('./sensitiveWordFilter');
const safetyPolicy = require('../config/contentSafetyPolicy');
const inputFilter = require('./inputFilter');

/**
 * 内容审核器类
 * 提供统一的内容安全审核接口
 */
class ContentAuditor {
  constructor() {
    this.initialized = false;
  }

  /**
   * 初始化审核器
   */
  async init() {
    if (this.initialized) return;
    
    // 初始化敏感词过滤器
    await sensitiveFilter.init();
    this.initialized = true;
    
    console.log('[ContentAuditor] 初始化完成');
  }

  /**
   * 审核论文主题
   * @param {String} topic - 论文主题
   * @param {Object} context - 上下文信息
   * @returns {Object} 审核结果
   */
  async auditPaperTopic(topic, context = {}) {
    // 确保已初始化
    if (!this.initialized) {
      await this.init();
    }

    console.log('[ContentAuditor] 审核论文主题:', topic);

    // ========== 前置过滤系统（用户输入侧）==========
    
    // 1. 前置输入过滤（长度、字符清洗、拆字/谐音检测）
    const inputFilterResult = inputFilter.filter(topic);
    
    // 如果前置过滤不通过，直接返回
    if (!inputFilterResult.valid) {
      // 记录前置过滤拦截日志
      await sensitiveFilter.logAuditEvent('INPUT_FILTER_BLOCKED', {
        userId: context.userId,
        originalInput: topic,
        filteredInput: inputFilterResult.filtered,
        reason: inputFilterResult.reason,
        riskScore: inputFilterResult.riskScore,
        action: inputFilterResult.action
      });
      
      return {
        passed: false,
        level: 4,
        message: inputFilterResult.message,
        action: 'BLOCK',
        reason: '前置过滤拦截',
        filtered: inputFilterResult.filtered
      };
    }

    // 使用清洗后的输入继续审核
    const cleanedTopic = inputFilterResult.filtered;

    // 2. 敏感词检测（基于清洗后的输入）
    const auditResult = await sensitiveFilter.auditContent(cleanedTopic, {
      userId: context.userId,
      contentType: 'paper_topic',
      originalInput: topic,
      ...context
    });

    // 3. 特殊检查：确保主题是"荒谬性"而非"低俗性"
    const absurdityCheck = this.checkAbsurdityVsVulgarity(cleanedTopic);
    if (!absurdityCheck.passed) {
      return {
        passed: false,
        level: 4,
        message: absurdityCheck.message,
        action: 'BLOCK',
        reason: '内容偏向低俗化而非逻辑荒谬性'
      };
    }

    // 4. 返回审核结果
    if (!auditResult.passed) {
      return {
        passed: false,
        level: auditResult.level,
        message: auditResult.message,
        action: auditResult.action,
        violations: auditResult.violations
      };
    }

    // 5. 通过审核
    return {
      passed: true,
      level: auditResult.level,
      message: '审核通过',
      action: 'PASS',
      filtered: cleanedTopic,
      suggestions: this.generateSuggestions(cleanedTopic)
    };
  }

  /**
   * 检查内容是否偏向荒谬性而非低俗性
   * @param {String} content - 内容
   * @returns {Object} 检查结果
   */
  checkAbsurdityVsVulgarity(content) {
    // 低俗化关键词（禁止）
    const vulgarKeywords = [
      '屎', '尿', '屁', '粪', '呕吐', '排泄',
      '傻逼', '傻B', '脑残', '弱智', '白痴',
      '他妈的', 'TMD', '草泥马', 'CNM'
    ];

    // 检查是否包含低俗关键词
    for (const keyword of vulgarKeywords) {
      if (content.includes(keyword)) {
        return {
          passed: false,
          message: `内容包含低俗词汇"${keyword}"，请使用逻辑谬误、概念混淆等手法表达荒谬性，而非依赖低俗内容`
        };
      }
    }

    // 荒谬性正面示例检查（鼓励）
    const absurdityPatterns = [
      /如果.*那么/,           // 反事实推理
      /.*与.*的关系/,         // 概念混淆
      /基于.*的.*研究/,       // 荒谬基础研究
      /.*对.*的影响/,         // 因果谬误
      /论.*的可行性/,         // 荒谬可行性
      /.*的.*机制/            // 伪科学机制
    ];

    const hasAbsurdityPattern = absurdityPatterns.some(pattern => 
      pattern.test(content)
    );

    return {
      passed: true,
      hasAbsurdityPattern,
      message: '内容符合荒谬性表达要求'
    };
  }

  /**
   * 生成改进建议
   * @param {String} topic - 论文主题
   * @returns {Array} 建议列表
   */
  generateSuggestions(topic) {
    const suggestions = [];
    
    // 检查是否使用了推荐的荒谬性手法
    const techniques = safetyPolicy.CONTENT_CREATION_GUIDELINES.ALLOWED_TECHNIQUES.examples;
    
    const techniqueMatches = techniques.filter(tech => {
      // 简单的关键词匹配
      const keywords = tech.example.split(/[：，。]/);
      return keywords.some(kw => topic.includes(kw.trim()));
    });

    if (techniqueMatches.length === 0) {
      suggestions.push({
        type: 'tip',
        message: '💡 建议：尝试使用逻辑谬误、概念混淆或反事实推理等手法增强荒谬性'
      });
    }

    // 检查主题长度
    if (topic.length < 10) {
      suggestions.push({
        type: 'tip',
        message: '💡 建议：主题可以更具体一些，例如"量子力学与泡面的关系研究"'
      });
    }

    return suggestions;
  }

  /**
   * 审核生成的论文内容
   * @param {Object} paper - 论文对象
   * @param {Object} context - 上下文
   * @returns {Object} 审核结果
   */
  async auditPaperContent(paper, context = {}) {
    if (!this.initialized) {
      await this.init();
    }

    const violations = [];
    const sections = ['abstract', 'introduction', 'results', 'conclusion'];

    // 审核每个章节
    for (const section of sections) {
      const content = paper.content?.sections?.[section];
      if (content) {
        const result = sensitiveFilter.detect(content);
        if (result.length > 0) {
          violations.push({
            section,
            hits: result
          });
        }
      }
    }

    // 确定最高等级
    let maxLevel = 0;
    violations.forEach(v => {
      v.hits.forEach(hit => {
        if (hit.level > maxLevel) {
          maxLevel = hit.level;
        }
      });
    });

    // 记录审核日志
    await sensitiveFilter.logAuditEvent('PAPER_CONTENT_AUDIT', {
      paperId: paper._id,
      userId: context.userId,
      violations: violations.map(v => ({
        section: v.section,
        count: v.hits.length
      })),
      maxLevel,
      passed: maxLevel < 3
    });

    if (maxLevel >= 3) {
      return {
        passed: false,
        level: maxLevel,
        message: '生成的论文内容包含敏感信息，已被拦截',
        violations,
        action: 'BLOCK'
      };
    }

    return {
      passed: true,
      level: maxLevel,
      message: '论文内容审核通过',
      violations: [],
      action: 'PASS'
    };
  }

  /**
   * 快速检测（用于实时输入检查）
   * @param {String} text - 输入文本
   * @returns {Object} 检测结果
   */
  quickCheck(text) {
    if (!text || text.length === 0) {
      return { safe: true, level: 0 };
    }

    const results = sensitiveFilter.detect(text);
    
    if (results.length === 0) {
      return { safe: true, level: 0 };
    }

    const maxLevel = Math.max(...results.map(r => r.level));
    
    return {
      safe: maxLevel < 2,
      level: maxLevel,
      hits: results.slice(0, 3) // 只返回前3个
    };
  }
}

// 创建单例
const contentAuditor = new ContentAuditor();

module.exports = contentAuditor;
