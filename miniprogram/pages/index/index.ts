// index.ts
// 数字名片 - 3D空间入场动画

Component({
  data: {
    // 用户信息 - 请根据实际情况修改
    userInfo: {
      avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
      name: '张三',
      title: '全栈开发工程师',
      bio: '热爱技术，专注前端与移动端开发。擅长 React、Vue、微信小程序等技术栈，追求极致用户体验。'
    },

    // 技能标签
    skills: ['前端开发', '小程序', 'React', 'Vue', 'TypeScript', 'Node.js'],

    // 社交链接
    socialLinks: [
      { id: 1, app: 'wechat', label: '微信号', icon: 'wechat', emoji: '💬' },
      { id: 2, app: 'email', label: '发送邮件', icon: 'email', emoji: '📧' },
      { id: 3, app: 'github', label: 'GitHub', icon: 'github', emoji: '🔗' },
      { id: 4, app: 'blog', label: '个人博客', icon: 'blog', emoji: '📝' }
    ],

    // 底部文字
    footerText: '© 2024 Digital Card'
  },

  lifetimes: {
    attached() {
      // 页面加载时触发
      console.log('数字名片加载完成')
    }
  },

  methods: {
    /**
     * 处理社交链接点击
     */
    handleSocialTap(e: any) {
      const app = e.currentTarget.dataset.app

      switch (app) {
        case 'wechat':
          this.copyToClipboard('WeChat_ID', '微信号已复制')
          break
        case 'email':
          this.sendEmail()
          break
        case 'github':
          this.openUrl('https://github.com/yourusername')
          break
        case 'blog':
          this.openUrl('https://yourblog.com')
          break
        default:
          wx.showToast({
            title: '即将开放',
            icon: 'none'
          })
      }
    },

    /**
     * 复制到剪贴板
     */
    copyToClipboard(text: string, message: string) {
      wx.setClipboardData({
        data: text,
        success: () => {
          wx.showToast({
            title: message,
            icon: 'success'
          })
        }
      })
    },

    /**
     * 发送邮件
     */
    sendEmail() {
      wx.showModal({
        title: '邮箱地址',
        content: 'your.email@example.com',
        confirmText: '复制',
        success: (res) => {
          if (res.confirm) {
            this.copyToClipboard('your.email@example.com', '邮箱已复制')
          }
        }
      })
    },

    /**
     * 打开链接（小程序内不支持直接打开外部链接，需要复制或使用 web-view）
     */
    openUrl(url: string) {
      wx.showModal({
        title: '访问链接',
        content: '链接已复制到剪贴板',
        confirmText: '复制',
        success: (res) => {
          if (res.confirm) {
            this.copyToClipboard(url, '链接已复制')
          }
        }
      })
    }
  }
})
