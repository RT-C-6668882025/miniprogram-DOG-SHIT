// utils/configManager.js
// 全局配置管理工具 - 管理API配置等全局设置

const CONFIG_KEY = 'deepseek_api_key';
const CONFIG_STORAGE_KEY = 'app_config';

/**
 * 配置管理器
 * 提供统一的配置读取、保存和监听功能
 */
class ConfigManager {
  constructor() {
    this.config = {
      apiKey: '',
      lastUpdated: null,
    };
    this.listeners = [];
    this.initialized = false;
  }

  /**
   * 初始化配置管理器
   * 从本地存储加载配置
   */
  init() {
    if (this.initialized) {
      console.log('[ConfigManager] 已经初始化，跳过');
      return this.config;
    }

    console.log('[ConfigManager] 开始初始化');
    try {
      // 读取API Key
      const apiKey = wx.getStorageSync(CONFIG_KEY) || '';
      
      // 读取完整配置
      const savedConfig = wx.getStorageSync(CONFIG_STORAGE_KEY) || {};
      
      this.config = {
        ...this.config,
        ...savedConfig,
        apiKey: apiKey,
      };

      this.initialized = true;
      console.log('[ConfigManager] 初始化完成，apiKey:', this.config.apiKey ? '已配置' : '未配置');
      
      return this.config;
    } catch (error) {
      console.error('[ConfigManager] 初始化失败:', error);
      return this.config;
    }
  }

  /**
   * 获取当前配置
   * @returns {Object} 配置对象
   */
  getConfig() {
    if (!this.initialized) {
      this.init();
    }
    return { ...this.config };
  }

  /**
   * 获取API Key
   * @returns {String} API Key
   */
  getApiKey() {
    if (!this.initialized) {
      this.init();
    }
    return this.config.apiKey || '';
  }

  /**
   * 检查是否已配置API Key
   * @returns {Boolean}
   */
  hasApiKey() {
    return !!this.getApiKey();
  }

  /**
   * 保存API Key
   * @param {String} apiKey - API Key
   * @returns {Boolean} 是否保存成功
   */
  saveApiKey(apiKey) {
    console.log('[ConfigManager] 保存API Key');
    try {
      // 保存到本地存储
      wx.setStorageSync(CONFIG_KEY, apiKey);
      
      // 更新配置
      this.config.apiKey = apiKey;
      this.config.lastUpdated = new Date().toISOString();
      
      // 保存完整配置
      this.saveConfig();
      
      // 通知监听器
      this.notifyListeners('apiKey', apiKey);
      
      console.log('[ConfigManager] API Key保存成功');
      return true;
    } catch (error) {
      console.error('[ConfigManager] 保存API Key失败:', error);
      return false;
    }
  }

  /**
   * 保存完整配置
   * @returns {Boolean}
   */
  saveConfig() {
    try {
      wx.setStorageSync(CONFIG_STORAGE_KEY, this.config);
      return true;
    } catch (error) {
      console.error('[ConfigManager] 保存配置失败:', error);
      return false;
    }
  }

  /**
   * 清除API Key
   * @returns {Boolean}
   */
  clearApiKey() {
    console.log('[ConfigManager] 清除API Key');
    try {
      wx.removeStorageSync(CONFIG_KEY);
      this.config.apiKey = '';
      this.saveConfig();
      this.notifyListeners('apiKey', '');
      return true;
    } catch (error) {
      console.error('[ConfigManager] 清除API Key失败:', error);
      return false;
    }
  }

  /**
   * 添加配置变更监听器
   * @param {Function} callback - 回调函数(key, value)
   */
  addListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }

  /**
   * 移除配置变更监听器
   * @param {Function} callback - 回调函数
   */
  removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 通知所有监听器
   * @param {String} key - 变更的配置项
   * @param {*} value - 新值
   */
  notifyListeners(key, value) {
    this.listeners.forEach(callback => {
      try {
        callback(key, value);
      } catch (error) {
        console.error('[ConfigManager] 监听器执行失败:', error);
      }
    });
  }

  /**
   * 验证API Key格式
   * @param {String} apiKey - API Key
   * @returns {Object} 验证结果 {valid: Boolean, message: String}
   */
  validateApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      return { valid: false, message: 'API Key不能为空' };
    }

    const trimmed = apiKey.trim();
    
    if (trimmed.length === 0) {
      return { valid: false, message: 'API Key不能为空' };
    }

    // DeepSeek API Key通常以sk-开头
    if (!trimmed.startsWith('sk-')) {
      return { 
        valid: true, 
        warning: 'DeepSeek API Key通常以"sk-"开头，请确认格式是否正确'
      };
    }

    return { valid: true };
  }
}

// 创建单例实例
const configManager = new ConfigManager();

// 在应用启动时自动初始化
configManager.init();

module.exports = configManager;
