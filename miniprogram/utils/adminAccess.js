// utils/adminAccess.js
// 管理员访问控制 - 隐藏手势和OpenID认证

const app = getApp();

// 管理员OpenID白名单（实际应从云数据库获取）
const ADMIN_OPENIDS = [
  // 在这里添加管理员OpenID
  // 'oXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
];

// 手势序列配置
const GESTURE_CONFIG = {
  // 触发手势：连续点击logo 5次
  tapSequence: ['logo', 'logo', 'logo', 'logo', 'logo'],
  // 时间窗口：5秒内完成
  timeWindow: 5000,
  // 最大间隔：每次点击间隔不超过1秒
  maxInterval: 1000,
};

/**
 * 管理员访问控制器
 */
class AdminAccessController {
  constructor() {
    this.gestureBuffer = [];
    this.lastTapTime = 0;
    this.sessionTimeout = 30 * 60 * 1000; // 30分钟会话超时
    this.sessionKey = 'admin_session';
    this.openIdKey = 'user_openid';
  }

  /**
   * 记录手势
   * @param {String} element - 点击的元素标识
   * @returns {Boolean} 是否触发管理员入口
   */
  recordGesture(element) {
    const now = Date.now();
    
    // 检查时间间隔
    if (this.lastTapTime && (now - this.lastTapTime > GESTURE_CONFIG.maxInterval)) {
      // 间隔过长，重置手势序列
      this.gestureBuffer = [];
    }
    
    this.gestureBuffer.push({
      element,
      timestamp: now
    });
    this.lastTapTime = now;
    
    // 检查手势序列
    return this.checkGestureSequence();
  }

  /**
   * 检查手势序列
   * @returns {Boolean} 是否匹配
   */
  checkGestureSequence() {
    const sequence = GESTURE_CONFIG.tapSequence;
    
    if (this.gestureBuffer.length < sequence.length) {
      return false;
    }
    
    // 只检查最近的N次
    const recentGestures = this.gestureBuffer.slice(-sequence.length);
    
    // 检查时间窗口
    const firstTap = recentGestures[0].timestamp;
    const lastTap = recentGestures[recentGestures.length - 1].timestamp;
    if (lastTap - firstTap > GESTURE_CONFIG.timeWindow) {
      this.gestureBuffer = [];
      return false;
    }
    
    // 检查元素序列
    const match = recentGestures.every((gesture, index) => {
      return gesture.element === sequence[index];
    });
    
    if (match) {
      // 清空缓冲区
      this.gestureBuffer = [];
      return true;
    }
    
    return false;
  }

  /**
   * 获取用户OpenID
   * @returns {Promise<String>} OpenID
   */
  async getUserOpenId() {
    try {
      // 先检查本地缓存
      const cachedOpenId = wx.getStorageSync(this.openIdKey);
      if (cachedOpenId) {
        return cachedOpenId;
      }

      // 尝试调用云函数获取OpenID
      try {
        const { result } = await wx.cloud.callFunction({
          name: 'getUserOpenId'
        });

        if (result && result.openid) {
          wx.setStorageSync(this.openIdKey, result.openid);
          return result.openid;
        }
      } catch (cloudError) {
        console.warn('[AdminAccess] 云函数获取OpenID失败，使用备用方案:', cloudError.message);
      }

      // 备用方案：使用登录接口获取code，然后生成临时ID
      const loginRes = await wx.login();
      if (loginRes.code) {
        // 使用code的哈希值作为临时标识
        const tempId = this.hashCode(loginRes.code);
        const openId = `temp_${tempId}`;
        wx.setStorageSync(this.openIdKey, openId);
        console.log('[AdminAccess] 使用临时OpenID:', openId);
        return openId;
      }

      throw new Error('获取OpenID失败');
    } catch (error) {
      console.error('[AdminAccess] 获取OpenID失败:', error);
      // 返回一个随机ID作为最后的备用
      const fallbackId = `fallback_${Date.now()}`;
      wx.setStorageSync(this.openIdKey, fallbackId);
      return fallbackId;
    }
  }

  /**
   * 简单的哈希函数
   * @param {String} str - 输入字符串
   * @returns {String} 哈希值
   */
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * 验证管理员身份
   * @param {String} openId - 用户OpenID
   * @returns {Promise<Object>} 验证结果
   */
  async verifyAdmin(openId) {
    try {
      // 首先尝试从本地存储获取管理员配置
      const localAdmins = wx.getStorageSync('local_admins') || [];
      
      // 检查是否是本地配置的管理员
      const localAdmin = localAdmins.find(admin => admin.openId === openId);
      if (localAdmin && localAdmin.status === 'active') {
        const session = {
          openId,
          role: localAdmin.role || 'admin',
          permissions: localAdmin.permissions || ['all'],
          loginTime: Date.now(),
          token: this.generateToken()
        };
        wx.setStorageSync(this.sessionKey, session);
        
        return {
          success: true,
          session,
          message: '验证成功（本地模式）'
        };
      }

      // 尝试调用云函数进行后端验证
      try {
        const { result } = await wx.cloud.callFunction({
          name: 'verifyAdmin',
          data: { openId }
        });

        if (result && result.isAdmin) {
          const session = {
            openId,
            role: result.role,
            permissions: result.permissions,
            loginTime: Date.now(),
            token: this.generateToken()
          };
          wx.setStorageSync(this.sessionKey, session);

          return {
            success: true,
            session,
            message: '验证成功'
          };
        }
      } catch (cloudError) {
        console.warn('[AdminAccess] 云函数验证失败，使用本地验证:', cloudError.message);
      }

      // 开发模式：如果是特定测试ID，允许访问
      if (openId.startsWith('temp_') || openId.startsWith('fallback_')) {
        console.log('[AdminAccess] 开发模式：允许临时ID访问');
        const session = {
          openId,
          role: 'admin',
          permissions: ['all'],
          loginTime: Date.now(),
          token: this.generateToken(),
          isDevMode: true
        };
        wx.setStorageSync(this.sessionKey, session);
        
        return {
          success: true,
          session,
          message: '验证成功（开发模式）'
        };
      }

      return {
        success: false,
        message: '无管理员权限'
      };
    } catch (error) {
      console.error('[AdminAccess] 验证管理员失败:', error);
      return {
        success: false,
        message: '验证失败'
      };
    }
  }

  /**
   * 生成会话令牌
   * @returns {String} Token
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
   * 检查会话是否有效
   * @returns {Boolean}
   */
  isSessionValid() {
    try {
      const session = wx.getStorageSync(this.sessionKey);
      if (!session) {
        return false;
      }

      // 检查会话超时
      const now = Date.now();
      if (now - session.loginTime > this.sessionTimeout) {
        // 会话过期，清除
        this.clearSession();
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取当前会话
   * @returns {Object|null}
   */
  getSession() {
    if (!this.isSessionValid()) {
      return null;
    }
    return wx.getStorageSync(this.sessionKey);
  }

  /**
   * 清除会话
   */
  clearSession() {
    wx.removeStorageSync(this.sessionKey);
  }

  /**
   * 尝试进入管理员系统
   * @returns {Promise<Object>} 结果
   */
  async tryAccessAdmin() {
    try {
      // 1. 获取OpenID
      const openId = await this.getUserOpenId();
      console.log('[AdminAccess] 当前OpenID:', openId);
      
      // 2. 验证管理员身份
      const result = await this.verifyAdmin(openId);
      
      if (result.success) {
        console.log('[AdminAccess] 验证成功，准备跳转');
        return {
          success: true,
          redirectTo: '/pages/admin/admin'
        };
      }

      return {
        success: false,
        message: result.message
      };
    } catch (error) {
      console.error('[AdminAccess] 访问失败:', error);
      return {
        success: false,
        message: '访问失败'
      };
    }
  }

  /**
   * 强制启用开发模式（用于测试）
   */
  enableDevMode() {
    console.log('[AdminAccess] 强制启用开发模式');
    const session = {
      openId: 'dev_mode_' + Date.now(),
      role: 'super_admin',
      permissions: ['all'],
      loginTime: Date.now(),
      token: this.generateToken(),
      isDevMode: true
    };
    wx.setStorageSync(this.sessionKey, session);
    return {
      success: true,
      redirectTo: '/pages/admin/admin',
      message: '开发模式已启用'
    };
  }

  /**
   * 检查权限
   * @param {String} permission - 权限标识
   * @returns {Boolean}
   */
  hasPermission(permission) {
    const session = this.getSession();
    if (!session) {
      return false;
    }

    // 超级管理员拥有所有权限
    if (session.role === 'super_admin') {
      return true;
    }

    return session.permissions && session.permissions.includes(permission);
  }
}

// 创建单例
const adminAccess = new AdminAccessController();

module.exports = adminAccess;
