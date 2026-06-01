// pages/settings/settings.js
Page({
  data: {
    envId: '',
    cloudConfigured: false,
    aiConfigured: false,
    sdkVersionOk: true,
    currentSDKVersion: '',
    saving: false
  },

  onLoad() {
    this.loadSavedConfig();
    this.checkSDKVersion();
  },

  /**
   * 加载已保存的配置
   */
  loadSavedConfig() {
    try {
      const envId = wx.getStorageSync('cloud_env_id') || '';
      this.setData({
        envId,
        cloudConfigured: envId && envId !== 'your-env-id'
      });
    } catch (error) {
      console.error('加载配置失败:', error);
    }
  },

  /**
   * 检查基础库版本
   */
  checkSDKVersion() {
    const appBaseInfo = wx.getAppBaseInfo();
    const version = appBaseInfo.SDKVersion;

    this.setData({
      currentSDKVersion: version,
      sdkVersionOk: this.compareVersions(version, '3.7.7') >= 0
    });
  },

  /**
   * 版本号比较
   */
  compareVersions(version1, version2) {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    const maxLength = Math.max(v1Parts.length, v2Parts.length);

    for (let i = 0; i < maxLength; i++) {
      const num1 = v1Parts[i] || 0;
      const num2 = v2Parts[i] || 0;

      if (num1 > num2) {
        return 1;
      } else if (num1 < num2) {
        return -1;
      }
    }
    return 0;
  },

  /**
   * 环境ID输入
   */
  onEnvIdInput(e) {
    this.setData({
      envId: e.detail.value
    });
  },

  /**
   * 保存云开发配置
   */
  async saveCloudConfig() {
    const envId = this.data.envId.trim();

    if (!envId) {
      wx.showToast({
        title: '请输入环境 ID',
        icon: 'none'
      });
      return;
    }

    this.setData({ saving: true });

    try {
      // 保存到本地存储
      wx.setStorageSync('cloud_env_id', envId);

      // 尝试初始化云开发验证配置是否正确
      wx.cloud.init({
        env: envId,
        traceUser: true
      });

      this.setData({
        cloudConfigured: true,
        saving: false
      });

      wx.showToast({
        title: '配置已保存',
        icon: 'success'
      });

    } catch (error) {
      console.error('保存配置失败:', error);
      this.setData({ saving: false });

      wx.showToast({
        title: '配置失败，请检查环境 ID',
        icon: 'none'
      });
    }
  },

  /**
   * 打开 AI 服务页面
   */
  openAIService() {
    const url = 'https://console.cloud.tencent.com/tcb/aice/feature';
    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showModal({
          title: '链接已复制',
          content: 'AI 服务控制台链接已复制到剪贴板，请在浏览器中打开进行配置',
          showCancel: false
        });
      }
    });
  },

  /**
   * 清除缓存
   */
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有本地缓存吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.clearStorageSync();
            wx.showToast({
              title: '缓存已清除',
              icon: 'success'
            });
            // 重新加载配置
            this.loadSavedConfig();
          } catch (error) {
            wx.showToast({
              title: '清除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  /**
   * 检查配置
   */
  checkConfig() {
    const checks = [];

    // 检查云开发配置
    if (this.data.cloudConfigured) {
      checks.push('✅ 云开发环境已配置');
    } else {
      checks.push('❌ 云开发环境未配置');
    }

    // 检查基础库版本
    if (this.data.sdkVersionOk) {
      checks.push('✅ 基础库版本正常');
    } else {
      checks.push('❌ 基础库版本过低');
    }

    // 检查 AI 服务
    if (wx.cloud && wx.cloud.extend && wx.cloud.extend.AI) {
      checks.push('✅ AI 服务可用');
    } else {
      checks.push('❌ AI 服务未开通');
    }

    wx.showModal({
      title: '配置检查结果',
      content: checks.join('\n'),
      showCancel: false
    });
  },

  onShareAppMessage() {
    return {
      title: '荒谬论文生成系统',
      path: '/pages/index/index'
    };
  }
});
