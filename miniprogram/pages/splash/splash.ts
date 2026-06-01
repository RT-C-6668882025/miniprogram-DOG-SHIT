// splash.ts
// 启动动画页 - 3D空间穿越效果

Component({
  data: {
    // 启动页名字
    splashName: '张三',
    splashTitle: '数字名片',

    // 隧道环数据
    rings: [] as any[],

    // 星星粒子数据
    stars: [] as any[],

    // 内容显示控制
    contentOpacity: 0,
    contentScale: 0.5,

    // 加载进度
    showLoading: true,
    loadingProgress: 0
  },

  lifetimes: {
    attached() {
      this.initSplash()
    }
  },

  methods: {
    /**
     * 初始化启动动画
     */
    initSplash() {
      // 生成隧道环
      const rings: any[] = []
      for (let i = 0; i < 8; i++) {
        rings.push({
          delay: i * 0.2,
          opacity: 1 - i * 0.1
        })
      }
      this.setData({ rings })

      // 生成星星粒子
      const stars: any[] = []
      for (let i = 0; i < 50; i++) {
        stars.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 2,
          delay: Math.random() * 1.5
        })
      }
      this.setData({ stars })

      // 内容淡入
      setTimeout(() => {
        this.setData({
          contentOpacity: 1,
          contentScale: 1
        })
      }, 300)

      // 模拟加载进度
      this.simulateLoading()
    },

    /**
     * 模拟加载进度
     */
    simulateLoading() {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 15
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          this.setData({ loadingProgress: progress })

          // 延迟后跳转
          setTimeout(() => {
            this.navigateToMain()
          }, 500)
        } else {
          this.setData({ loadingProgress: progress })
        }
      }, 200)
    },

    /**
     * 跳转到主页
     */
    navigateToMain() {
      // 淡出效果
      this.setData({
        contentOpacity: 0,
        contentScale: 1.5
      })

      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/index/index',
          fail: () => {
            // 如果跳转失败，可能已经在首页了
            console.log('跳转完成')
          }
        })
      }, 300)
    }
  }
})
