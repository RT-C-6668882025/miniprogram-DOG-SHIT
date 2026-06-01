// splash.js
// 启动动画页 - Google Material Design 风格

Component({
  data: {
    // 启动页内容
    splashInitial: 'Z',      // 名字首字母
    splashName: 'ZHANG SAN',  // 英文名
    splashTitle: 'DIGITAL CARD',

    // 动画状态
    stageOpacity: 0,
    stageScale: 0.8,
    nameOpacity: 0,
    titleOpacity: 0,
    underlineWidth: 0,
    dotsOpacity: 1,

    // 粒子数据
    particles: []
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
      // 生成装饰粒子
      const colors = ['#4285f4', '#34a853', '#fbbc04', '#ea4335']
      const particles = []
      for (let i = 0; i < 20; i++) {
        particles.push({
          x: 15 + Math.random() * 70,
          y: 15 + Math.random() * 70,
          delay: Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)]
        })
      }
      this.setData({ particles })

      // 阶段1: 舞台进场
      setTimeout(() => {
        this.setData({
          stageOpacity: 1,
          stageScale: 1
        })
      }, 100)

      // 阶段2: 名字淡入
      setTimeout(() => {
        this.setData({ nameOpacity: 1 })
      }, 500)

      // 阶段3: 下划线展开
      setTimeout(() => {
        this.setData({ underlineWidth: 80 })
      }, 700)

      // 阶段4: 标题淡入
      setTimeout(() => {
        this.setData({ titleOpacity: 1 })
      }, 900)

      // 阶段5: 加载完成后跳转
      setTimeout(() => {
        this.navigateWithTransition()
      }, 2500)
    },

    /**
     * 平滑过渡跳转
     */
    navigateWithTransition() {
      // 淡出效果
      this.setData({
        dotsOpacity: 0,
        stageScale: 1.1,
        stageOpacity: 0
      })

      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/index/index',
          fail: () => {
            console.log('跳转完成')
          }
        })
      }, 500)
    }
  }
})
