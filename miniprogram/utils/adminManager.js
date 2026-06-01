// utils/adminManager.js
// 管理员管理工具 - 固定ID、权限管理、敏感词过滤

const FIXED_ADMIN_KEY = 'fixed_admin_config';
const ADMIN_SESSION_KEY = 'admin_session_v2';

/**
 * 管理员管理器
 * 提供固定ID、权限管理、敏感词过滤等功能
 */
class AdminManager {
  constructor() {
    this.defaultAdmin = {
      id: 'ADMIN_001',
      openId: '',
      username: '超级管理员',
      role: 'super_admin',
      permissions: [
        'dashboard_view',
        'user_manage',
        'content_manage',
        'sensitive_word_manage',
        'system_config',
        'log_view',
        'admin_manage'
      ],
      status: 'active',
      createdAt: Date.now(),
      lastLoginAt: null,
      loginCount: 0
    };
    
    // 敏感词列表
    this.sensitiveWords = [];
    this.sensitiveWordsInitialized = false;
    
    // 初始化
    this.init();
  }

  /**
   * 初始化管理员系统
   */
  init() {
    console.log('[AdminManager] 初始化管理员系统');
    
    // 检查是否已设置固定管理员
    const fixedAdmin = this.getFixedAdmin();
    if (!fixedAdmin) {
      // 首次使用，创建默认管理员
      this.setFixedAdmin(this.defaultAdmin);
      console.log('[AdminManager] 已创建默认管理员');
    }
    
    // 加载敏感词
    this.loadSensitiveWords();
  }

  /**
   * 获取固定管理员配置
   */
  getFixedAdmin() {
    try {
      return wx.getStorageSync(FIXED_ADMIN_KEY);
    } catch (error) {
      console.error('[AdminManager] 获取固定管理员失败:', error);
      return null;
    }
  }

  /**
   * 设置固定管理员
   */
  setFixedAdmin(adminConfig) {
    try {
      wx.setStorageSync(FIXED_ADMIN_KEY, adminConfig);
      return true;
    } catch (error) {
      console.error('[AdminManager] 设置固定管理员失败:', error);
      return false;
    }
  }

  /**
   * 获取或创建固定设备ID
   */
  getDeviceId() {
    const deviceKey = 'admin_device_id';
    let deviceId = wx.getStorageSync(deviceKey);
    
    if (!deviceId) {
      // 生成固定设备ID
      deviceId = 'DEV_' + this.generateFixedId();
      wx.setStorageSync(deviceKey, deviceId);
      console.log('[AdminManager] 创建设备ID:', deviceId);
    }
    
    return deviceId;
  }

  /**
   * 生成固定格式的ID
   */
  generateFixedId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${timestamp}${random}`;
  }

  /**
   * 获取用户 OpenID
   */
  async getUserOpenId() {
    try {
      // 调用云函数获取 OpenID
      if (wx.cloud) {
        const { result } = await wx.cloud.callFunction({
          name: 'getUserOpenId'
        });
        if (result && result.openid) {
          return result.openid;
        }
      }
    } catch (error) {
      console.warn('[AdminManager] 获取 OpenID 失败:', error);
    }
    
    // 降级：使用本地存储的标识
    let localId = wx.getStorageSync('local_user_id');
    if (!localId) {
      localId = 'LOCAL_' + this.generateFixedId();
      wx.setStorageSync('local_user_id', localId);
    }
    return localId;
  }

  /**
   * 管理员登录 - 基于微信 OpenID 自动认证
   */
  async login() {
    const fixedAdmin = this.getFixedAdmin();
    
    if (!fixedAdmin) {
      return { success: false, message: '管理员未配置' };
    }
    
    if (fixedAdmin.status !== 'active') {
      return { success: false, message: '管理员账户已禁用' };
    }
    
    // 获取当前用户的 OpenID
    const userOpenId = await this.getUserOpenId();
    console.log('[AdminManager] 当前用户 OpenID:', userOpenId);
    
    // 检查是否已绑定管理员
    if (fixedAdmin.openId && fixedAdmin.openId !== userOpenId) {
      return { success: false, message: '您没有管理员权限' };
    }
    
    // 如果管理员未绑定 OpenID，则自动绑定
    if (!fixedAdmin.openId) {
      fixedAdmin.openId = userOpenId;
      console.log('[AdminManager] 自动绑定 OpenID:', userOpenId);
    }
    
    // 创建会话
    const session = {
      adminId: fixedAdmin.id,
      openId: userOpenId,
      deviceId: this.getDeviceId(),
      loginTime: Date.now(),
      token: this.generateToken(),
      permissions: fixedAdmin.permissions,
      role: fixedAdmin.role
    };
    
    // 保存会话
    wx.setStorageSync(ADMIN_SESSION_KEY, session);
    
    // 更新管理员信息
    fixedAdmin.lastLoginAt = Date.now();
    fixedAdmin.loginCount++;
    this.setFixedAdmin(fixedAdmin);
    
    // 记录登录日志
    this.addLog('login', '管理员登录', { deviceId: session.deviceId, openId: userOpenId });
    
    return {
      success: true,
      message: '登录成功',
      admin: fixedAdmin
    };
  }

  /**
   * 获取当前会话
   */
  getSession() {
    const session = wx.getStorageSync(ADMIN_SESSION_KEY);
    if (!session) return null;
    
    // 检查会话是否过期（24小时）
    const expireTime = 24 * 60 * 60 * 1000;
    if (Date.now() - session.loginTime > expireTime) {
      this.logout();
      return null;
    }
    
    return session;
  }

  /**
   * 检查是否已登录
   */
  isLoggedIn() {
    return this.getSession() !== null;
  }

  /**
   * 获取当前管理员信息
   */
  getCurrentAdmin() {
    const session = this.getSession();
    if (!session) return null;
    
    const fixedAdmin = this.getFixedAdmin();
    if (!fixedAdmin) return null;
    
    return {
      id: fixedAdmin.id,
      username: fixedAdmin.username,
      role: fixedAdmin.role,
      permissions: fixedAdmin.permissions,
      lastLoginAt: fixedAdmin.lastLoginAt,
      loginCount: fixedAdmin.loginCount
    };
  }

  /**
   * 退出登录
   */
  logout() {
    const session = wx.getStorageSync(ADMIN_SESSION_KEY);
    if (session) {
      this.addLog('logout', '管理员退出', { deviceId: session.deviceId });
    }
    wx.removeStorageSync(ADMIN_SESSION_KEY);
  }

  /**
   * 解绑当前微信账号
   */
  unbindWechat() {
    const fixedAdmin = this.getFixedAdmin();
    if (fixedAdmin) {
      const oldOpenId = fixedAdmin.openId;
      fixedAdmin.openId = '';
      this.setFixedAdmin(fixedAdmin);
      this.addLog('unbind', '解绑微信账号', { oldOpenId });
    }
    this.logout();
    return { success: true, message: '已解绑微信账号' };
  }

  /**
   * 生成令牌
   */
  generateToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /**
   * 检查权限
   */
  hasPermission(permission) {
    const session = wx.getStorageSync(ADMIN_SESSION_KEY);
    if (!session) return false;
    
    if (session.role === 'super_admin') return true;
    
    return session.permissions && session.permissions.includes(permission);
  }

  /**
   * 修改密码
   */
  changePassword(oldPassword, newPassword) {
    const fixedAdmin = this.getFixedAdmin();
    const currentPassword = fixedAdmin.password || 'admin123';
    
    if (oldPassword !== currentPassword) {
      return { success: false, message: '原密码错误' };
    }
    
    if (newPassword.length < 6) {
      return { success: false, message: '新密码至少6位' };
    }
    
    fixedAdmin.password = newPassword;
    this.setFixedAdmin(fixedAdmin);
    
    this.addLog('password_change', '修改密码');
    
    return { success: true, message: '密码修改成功' };
  }

  // ========== 敏感词管理 ==========

  /**
   * 加载敏感词
   */
  async loadSensitiveWords() {
    if (this.sensitiveWordsInitialized) return;
    
    try {
      // 尝试从云数据库加载
      if (wx.cloud && wx.cloud.database) {
        const db = wx.cloud.database();
        const { data } = await db.collection('sensitive_words')
          .where({ enabled: true })
          .get();
        
        if (data.length > 0) {
          this.sensitiveWords = data;
          this.sensitiveWordsInitialized = true;
          console.log('[AdminManager] 从云端加载敏感词:', data.length);
          return;
        }
      }
    } catch (error) {
      console.warn('[AdminManager] 从云端加载敏感词失败:', error);
    }
    
    // 使用默认敏感词
    this.sensitiveWords = this.getDefaultSensitiveWords();
    this.sensitiveWordsInitialized = true;
    console.log('[AdminManager] 使用默认敏感词');
  }

  /**
   * 获取默认敏感词
   */
  getDefaultSensitiveWords() {
    return [
      { id: 'SW_001', word: '暴力', type: 'violence', level: 3, enabled: true },
      { id: 'SW_002', word: '色情', type: 'porn', level: 5, enabled: true },
      { id: 'SW_003', word: '赌博', type: 'gambling', level: 4, enabled: true },
      { id: 'SW_004', word: '毒品', type: 'drugs', level: 5, enabled: true },
      { id: 'SW_005', word: '诈骗', type: 'fraud', level: 4, enabled: true },
      { id: 'SW_006', word: '反动', type: 'political', level: 5, enabled: true },
      { id: 'SW_007', word: '恐怖主义', type: 'terrorism', level: 5, enabled: true },
      { id: 'SW_008', word: '枪支', type: 'weapon', level: 3, enabled: true }
    ];
  }

  /**
   * 获取敏感词列表（带中文映射）
   */
  getSensitiveWords() {
    const typeMap = {
      'political': '政治敏感',
      'porn': '色情低俗',
      'violence': '暴力恐怖',
      'abuse': '辱骂攻击',
      'spam': '垃圾广告',
      'gambling': '赌博',
      'drugs': '毒品',
      'fraud': '诈骗',
      'terrorism': '恐怖主义',
      'weapon': '武器',
      'other': '其他'
    };
    
    const levelMap = {
      1: '低危',
      2: '低危',
      3: '中危',
      4: '中危',
      5: '高危',
      'low': '低危',
      'medium': '中危',
      'high': '高危'
    };
    
    return this.sensitiveWords.map(word => ({
      ...word,
      typeName: typeMap[word.type] || word.type || '其他',
      levelName: levelMap[word.level] || '中危'
    }));
  }

  /**
   * 添加敏感词
   */
  addSensitiveWord(wordData) {
    const newWord = {
      id: 'SW_' + Date.now(),
      ...wordData,
      enabled: true,
      createTime: Date.now()
    };
    
    this.sensitiveWords.push(newWord);
    this.saveSensitiveWords();
    
    this.addLog('sensitive_word_add', '添加敏感词', { word: wordData.word });
    
    return { success: true, word: newWord };
  }

  /**
   * 删除敏感词
   */
  removeSensitiveWord(wordId) {
    const index = this.sensitiveWords.findIndex(w => w.id === wordId);
    if (index === -1) {
      return { success: false, message: '敏感词不存在' };
    }
    
    const word = this.sensitiveWords[index];
    this.sensitiveWords.splice(index, 1);
    this.saveSensitiveWords();
    
    this.addLog('sensitive_word_delete', '删除敏感词', { word: word.word });
    
    return { success: true };
  }

  /**
   * 更新敏感词
   */
  updateSensitiveWord(wordId, updateData) {
    const word = this.sensitiveWords.find(w => w.id === wordId);
    if (!word) {
      return { success: false, message: '敏感词不存在' };
    }
    
    Object.assign(word, updateData, { updateTime: Date.now() });
    this.saveSensitiveWords();
    
    this.addLog('sensitive_word_update', '更新敏感词', { word: word.word });
    
    return { success: true, word };
  }

  /**
   * 保存敏感词
   */
  async saveSensitiveWords() {
    try {
      // 保存到本地
      wx.setStorageSync('local_sensitive_words', this.sensitiveWords);
      
      // 尝试同步到云端
      if (wx.cloud && wx.cloud.database) {
        const db = wx.cloud.database();
        // 批量更新到云端
        for (const word of this.sensitiveWords) {
          try {
            const exist = await db.collection('sensitive_words')
              .where({ word: word.word })
              .get();
            
            if (exist.data.length === 0) {
              await db.collection('sensitive_words').add({ data: word });
            }
          } catch (e) {
            // 忽略单条错误
          }
        }
      }
    } catch (error) {
      console.error('[AdminManager] 保存敏感词失败:', error);
    }
  }

  /**
   * 检测敏感词
   */
  detectSensitiveWords(text) {
    if (!text || !this.sensitiveWordsInitialized) {
      return [];
    }
    
    const results = [];
    
    for (const word of this.sensitiveWords) {
      if (!word.enabled) continue;
      
      const index = text.indexOf(word.word);
      if (index !== -1) {
        results.push({
          word: word.word,
          type: word.type,
          level: word.level,
          position: index,
          context: text.substring(Math.max(0, index - 5), Math.min(text.length, index + word.word.length + 5))
        });
      }
    }
    
    return results;
  }

  /**
   * 过滤敏感词
   */
  filterSensitiveWords(text, replaceChar = '*') {
    let filteredText = text;
    
    for (const word of this.sensitiveWords) {
      if (!word.enabled) continue;
      
      const regex = new RegExp(word.word, 'g');
      filteredText = filteredText.replace(regex, replaceChar.repeat(word.word.length));
    }
    
    return filteredText;
  }

  /**
   * 刷新敏感词缓存
   */
  async refreshSensitiveWords() {
    this.sensitiveWordsInitialized = false;
    await this.loadSensitiveWords();
    console.log('[AdminManager] 敏感词缓存已刷新');
  }

  // ========== 日志管理 ==========

  /**
   * 添加日志
   */
  addLog(type, description, details = {}) {
    try {
      const logs = wx.getStorageSync('admin_logs') || [];
      const session = wx.getStorageSync(ADMIN_SESSION_KEY);
      
      logs.unshift({
        id: 'LOG_' + Date.now(),
        type,
        description,
        details,
        adminId: session ? session.adminId : 'unknown',
        deviceId: session ? session.deviceId : 'unknown',
        createTime: Date.now()
      });
      
      // 只保留最近100条
      if (logs.length > 100) {
        logs.pop();
      }
      
      wx.setStorageSync('admin_logs', logs);
    } catch (error) {
      console.error('[AdminManager] 添加日志失败:', error);
    }
  }

  /**
   * 获取日志
   */
  getLogs(filter = {}) {
    try {
      let logs = wx.getStorageSync('admin_logs') || [];
      
      // 过滤
      if (filter.type) {
        logs = logs.filter(log => log.type === filter.type);
      }
      
      if (filter.startTime) {
        logs = logs.filter(log => log.createTime >= filter.startTime);
      }
      
      if (filter.endTime) {
        logs = logs.filter(log => log.createTime <= filter.endTime);
      }
      
      return logs;
    } catch (error) {
      console.error('[AdminManager] 获取日志失败:', error);
      return [];
    }
  }

  /**
   * 获取操作日志（带格式化时间）
   */
  getOperationLogs(limit = 50) {
    try {
      let logs = wx.getStorageSync('admin_logs') || [];
      
      // 格式化日志
      const formattedLogs = logs.slice(0, limit).map(log => {
        const date = new Date(log.createTime);
        const timeStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        return {
          ...log,
          timeStr,
          action: log.description || log.type
        };
      });
      
      return formattedLogs;
    } catch (error) {
      console.error('[AdminManager] 获取操作日志失败:', error);
      return [];
    }
  }

  /**
   * 清除日志
   */
  clearLogs() {
    wx.removeStorageSync('admin_logs');
    this.addLog('log_clear', '清除日志');
  }
}

// 创建单例
const adminManager = new AdminManager();

module.exports = adminManager;
