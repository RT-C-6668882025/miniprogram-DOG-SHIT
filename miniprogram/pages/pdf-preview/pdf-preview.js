// pages/pdf-preview/pdf-preview.js
// PDF预览页面 - 使用web-view显示HTML内容

Page({
  data: {
    htmlContent: '',
    loading: true
  },

  onLoad() {
    // 从全局数据获取PDF内容
    const app = getApp();
    const pdfContent = app.globalData?.pdfContent;
    
    if (pdfContent) {
      this.setData({
        htmlContent: pdfContent,
        loading: false
      });
    } else {
      wx.showToast({
        title: 'PDF内容加载失败',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  onReady() {
    // 页面准备就绪
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 分享PDF
  sharePDF() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 复制HTML到剪贴板
  copyHTML() {
    const { htmlContent } = this.data;
    if (htmlContent) {
      wx.setClipboardData({
        data: htmlContent,
        success: () => {
          wx.showToast({
            title: 'HTML已复制',
            icon: 'success'
          });
        }
      });
    }
  },

  // 保存PDF（提示用户）
  savePDF() {
    wx.showModal({
      title: '保存PDF',
      content: '请使用浏览器的打印功能（Ctrl+P / Cmd+P）将页面保存为PDF',
      showCancel: false
    });
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '荒谬学术论文PDF',
      path: '/pages/index/index'
    };
  }
});
