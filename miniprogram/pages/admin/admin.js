// pages/admin/admin.js
// 后台管理系统主控制器 - 使用 adminManager

const adminManager = require('../../utils/adminManager');

Page({
  data: {
    // 当前登录的管理员信息
    adminInfo: null,
    
    // 是否已登录
    isLoggedIn: false,
    
    // 是否显示登录中提示
    showLoginLoading: false,
    
    // 登录错误信息
    loginError: '',
    
    // 当前激活的模块
    activeModule: 'dashboard',
    
    // 功能模块列表
    modules: [
      { id: 'dashboard', name: '数据概览', iconClass: 'icon-search', permission: 'dashboard_view', color: '#4CAF50' },
      { id: 'violation', name: '违规论文管理', iconClass: 'icon-forbidden', permission: 'content_manage', color: '#F44336' },
      { id: 'score', name: '评分人工调整', iconClass: 'icon-star', permission: 'content_manage', color: '#FF9800' },
      { id: 'ranking', name: '排行榜控制', iconClass: 'icon-ranking', permission: 'system_config', color: '#9C27B0' },
      { id: 'sensitive', name: '敏感词管理', iconClass: 'icon-search', permission: 'sensitive_word_manage', color: '#2196F3' },
      { id: 'prompt', name: '提示词管理', iconClass: 'icon-chat', permission: 'system_config', color: '#00BCD4' },
      { id: 'log', name: '操作日志', iconClass: 'icon-log', permission: 'log_view', color: '#795548' },
      { id: 'settings', name: '系统设置', iconClass: 'icon-settings', permission: 'system_config', color: '#607D8B' }
    ],
    
    // 统计数据
    statistics: {
      totalPapers: 0,
      todayPapers: 0,
      violationPapers: 0,
      pendingReview: 0
    },
    
    // 敏感词管理数据
    sensitiveWords: [],
    showAddWordModal: false,
    newWord: '',
    newWordType: 'political',
    newWordLevel: 'high',
    newWordTypeLabel: '政治敏感',
    newWordLevelLabel: '高危',
    wordTypes: [
      { value: 'political', label: '政治敏感' },
      { value: 'porn', label: '色情低俗' },
      { value: 'violence', label: '暴力恐怖' },
      { value: 'abuse', label: '辱骂攻击' },
      { value: 'spam', label: '垃圾广告' },
      { value: 'other', label: '其他' }
    ],
    wordLevels: [
      { value: 'high', label: '高危' },
      { value: 'medium', label: '中危' },
      { value: 'low', label: '低危' }
    ],
    
    // 操作日志
    operationLogs: [],
    
    // 加载状态
    loading: false,
    
    // 错误信息
    error: ''
  },

  onLoad(options) {
    // 检查管理员登录状态
    this.checkAdminAuth();
  },

  onShow() {
    if (this.data.isLoggedIn) {
      this.loadStatistics();
      this.loadSensitiveWords();
      this.loadOperationLogs();
    }
  },

  /**
   * 检查管理员权限 - 自动登录
   */
  async checkAdminAuth() {
    // 先检查是否已有会话
    const session = adminManager.getSession();
    
    if (session) {
      // 已登录，加载管理员信息
      const adminInfo = adminManager.getCurrentAdmin();
      
      this.setData({ 
        isLoggedIn: true,
        adminInfo: adminInfo,
        showLoginLoading: false
      }, () => {
        this.loadStatistics();
        this.loadSensitiveWords();
        this.loadOperationLogs();
      });
      return;
    }
    
    // 未登录，尝试自动登录
    this.setData({ showLoginLoading: true, loginError: '' });
    
    try {
      const result = await adminManager.login();
      
      if (result.success) {
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
        
        const adminInfo = adminManager.getCurrentAdmin();
        
        this.setData({
          isLoggedIn: true,
          adminInfo: adminInfo,
          showLoginLoading: false
        }, () => {
          this.loadStatistics();
          this.loadSensitiveWords();
          this.loadOperationLogs();
        });
      } else {
        console.log('[Admin] 登录失败:', result.message);
        this.setData({ 
          showLoginLoading: false,
          loginError: result.message || '登录失败'
        });
        
        wx.showModal({
          title: '无法访问',
          content: result.message || '您没有管理员权限',
          showCancel: false,
          success: () => {
            wx.navigateBack();
          }
        });
      }
    } catch (error) {
      console.error('[Admin] 登录失败:', error);
      this.setData({ 
        showLoginLoading: false,
        loginError: '登录失败'
      });
      
      wx.showModal({
        title: '错误',
        content: '登录过程中发生错误',
        showCancel: false,
        success: () => {
          wx.navigateBack();
        }
      });
    }
  },

  /**
   * 切换功能模块
   */
  switchModule(e) {
    const moduleId = e.currentTarget.dataset.module;
    const module = this.data.modules.find(m => m.id === moduleId);
    
    // 检查权限
    if (!this.checkPermission(module.permission)) {
      wx.showToast({
        title: '无权访问该模块',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ activeModule: moduleId });
    
    // 根据不同模块加载对应数据
    switch (moduleId) {
      case 'sensitive':
        this.loadSensitiveWords();
        break;
      case 'log':
        this.loadOperationLogs();
        break;
      default:
        break;
    }
  },

  /**
   * 检查权限
   */
  checkPermission(permission) {
    if (!this.data.adminInfo) return false;
    if (this.data.adminInfo.role === 'super_admin') return true;
    return this.data.adminInfo.permissions && this.data.adminInfo.permissions.includes(permission);
  },

  /**
   * 加载统计数据
   */
  async loadStatistics() {
    this.setData({ loading: true });

    try {
      // 检查云开发是否可用
      if (!wx.cloud || !wx.cloud.database) {
        console.warn('[Admin] 云开发未初始化，使用本地数据');
        this.setData({
          statistics: {
            totalPapers: 3,
            todayPapers: 0,
            violationPapers: 0,
            pendingReview: 0
          },
          loading: false
        });
        return;
      }

      // 从云数据库获取统计数据
      const db = wx.cloud.database();

      // 总论文数
      let totalRes = { total: 0 };
      try {
        totalRes = await db.collection('papers').count();
      } catch (e) {
        console.warn('[Admin] papers集合不存在，使用默认值');
      }

      this.setData({
        statistics: {
          totalPapers: totalRes.total,
          todayPapers: 0,
          violationPapers: 0,
          pendingReview: 0
        },
        loading: false
      });
    } catch (error) {
      console.error('[Admin] 加载统计数据失败:', error);
      this.setData({
        statistics: {
          totalPapers: 3,
          todayPapers: 0,
          violationPapers: 0,
          pendingReview: 0
        },
        loading: false
      });
    }
  },

  /**
   * 加载敏感词列表
   */
  async loadSensitiveWords() {
    try {
      const words = await adminManager.getSensitiveWords();
      this.setData({ sensitiveWords: words });
    } catch (error) {
      console.error('[Admin] 加载敏感词失败:', error);
    }
  },

  /**
   * 加载操作日志
   */
  async loadOperationLogs() {
    try {
      const logs = await adminManager.getOperationLogs(50);
      this.setData({ operationLogs: logs });
    } catch (error) {
      console.error('[Admin] 加载操作日志失败:', error);
    }
  },

  /**
   * 显示添加敏感词弹窗
   */
  showAddWordModal() {
    this.setData({
      showAddWordModal: true,
      newWord: '',
      newWordType: 'political',
      newWordLevel: 'high',
      newWordTypeLabel: '政治敏感',
      newWordLevelLabel: '高危'
    });
  },

  /**
   * 关闭添加敏感词弹窗
   */
  closeAddWordModal() {
    this.setData({ showAddWordModal: false });
  },

  /**
   * 敏感词输入
   */
  onNewWordInput(e) {
    this.setData({ newWord: e.detail.value });
  },

  /**
   * 敏感词类型选择
   */
  onWordTypeChange(e) {
    const index = e.detail.value;
    const selectedType = this.data.wordTypes[index];
    this.setData({ 
      newWordType: selectedType.value,
      newWordTypeLabel: selectedType.label
    });
  },

  /**
   * 敏感词级别选择
   */
  onWordLevelChange(e) {
    const index = e.detail.value;
    const selectedLevel = this.data.wordLevels[index];
    this.setData({ 
      newWordLevel: selectedLevel.value,
      newWordLevelLabel: selectedLevel.label
    });
  },

  /**
   * 添加敏感词
   */
  async addSensitiveWord() {
    const { newWord, newWordType, newWordLevel } = this.data;
    
    if (!newWord.trim()) {
      wx.showToast({
        title: '请输入敏感词',
        icon: 'none'
      });
      return;
    }
    
    try {
      const result = await adminManager.addSensitiveWord({
        word: newWord.trim(),
        type: newWordType,
        level: newWordLevel
      });
      
      if (result.success) {
        wx.showToast({
          title: '添加成功',
          icon: 'success'
        });
        this.closeAddWordModal();
        this.loadSensitiveWords();
      } else {
        wx.showToast({
          title: result.message || '添加失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('[Admin] 添加敏感词失败:', error);
      wx.showToast({
        title: '添加失败',
        icon: 'none'
      });
    }
  },

  /**
   * 删除敏感词
   */
  async deleteSensitiveWord(e) {
    const wordId = e.currentTarget.dataset.id;
    const word = e.currentTarget.dataset.word;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除敏感词 "${word}" 吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await adminManager.removeSensitiveWord(wordId);
            
            if (result.success) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });
              this.loadSensitiveWords();
            } else {
              wx.showToast({
                title: result.message || '删除失败',
                icon: 'none'
              });
            }
          } catch (error) {
            console.error('[Admin] 删除敏感词失败:', error);
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  /**
   * 刷新敏感词缓存
   */
  async refreshSensitiveWords() {
    try {
      await adminManager.refreshSensitiveWords();
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
      this.loadSensitiveWords();
    } catch (error) {
      console.error('[Admin] 刷新敏感词失败:', error);
      wx.showToast({
        title: '刷新失败',
        icon: 'none'
      });
    }
  },

  /**
   * 退出登录
   */
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出后台管理系统吗？',
      success: (res) => {
        if (res.confirm) {
          adminManager.logout();
          this.setData({
            isLoggedIn: false,
            adminInfo: null,
            showLoginLoading: false
          });
          // 返回首页
          wx.navigateBack();
        }
      }
    });
  },

  /**
   * 格式化时间
   */
  formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }
});
