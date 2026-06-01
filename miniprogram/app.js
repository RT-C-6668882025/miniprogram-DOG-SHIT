App({
  onLaunch: function() {
    console.log('App Launch');

    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      try {
        // 尝试使用默认环境
        wx.cloud.init({
          traceUser: true,
        });
        console.log('云开发初始化完成（使用默认环境）');
      } catch (error) {
        console.error('云开发初始化失败:', error);
        console.warn('请确保已开通云开发并绑定小程序');
      }
    }
  },

  onShow: function() {
    console.log('App Show');
  },

  onHide: function() {
    console.log('App Hide');
  }
});
