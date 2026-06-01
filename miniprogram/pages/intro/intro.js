// intro.js
// 高级开场动画 - 三阶段效果

// 顶点着色器
const vsSource = `
  attribute vec3 aPosition;
  attribute float aSize;
  attribute vec3 aColor;

  uniform mat4 uProjection;
  uniform mat4 uView;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uAttract;  // 粒子吸引强度

  varying vec3 vColor;

  void main() {
    float z = mod(aPosition.z - uTime * uSpeed, 2000.0) - 1000.0;

    // 粒子向中心吸引效果
    vec2 pos = aPosition.xy;
    float distFromCenter = length(pos);
    float attraction = smoothstep(500.0, 0.0, distFromCenter) * uAttract;
    pos = mix(pos, vec2(0.0), attraction);

    vec4 viewPosition = uView * vec4(pos.x, pos.y, z, 1.0);
    gl_Position = uProjection * viewPosition;

    float d = length(viewPosition.xyz);
    gl_PointSize = aSize * (1000.0 / max(d, 1.0));

    vColor = aColor;
  }
`;

// 片元着色器
const fsSource = `
  precision mediump float;
  varying vec3 vColor;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) {
      discard;
    }
    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
    gl_FragColor = vec4(vColor, alpha);
  }
`;

Component({
  data: {
    // LOGO 内容
    logoLetter: 'Z',
    introName: 'ZHANG SAN',

    // 入场阶段控制
    glowOpacity: 0,
    blurryOpacity: 0,
    blurAmount: 40,
    clearOpacity: 0,
    logoScale: 0.8,

    // 动画变量
    ringRotation: 0,
    letterSpacing: 20,
    lineWidth: 0,

    // 持续阶段控制
    sustainGlowOpacity: 0,
    nameOpacity: 0,
    floatOffset: 0,
    textColor: '#ffffff',

    // 消失阶段控制
    skipOpacity: 1
  },

  lifetimes: {
    attached() {
      this.initWebGL()
      this.startIntroAnimation()
    },

    detached() {
      this.cleanup()
    }
  },

  methods: {
    /**
     * 初始化WebGL粒子系统
     */
    initWebGL() {
      const query = wx.createSelectorQuery().in(this)
      query.select('#webgl-canvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res[0]) return

          const canvas = res[0].node
          const gl = canvas.getContext('webgl')

          if (!gl) {
            console.error('WebGL not supported')
            return
          }

          this.canvas = canvas
          this.gl = gl

          const { width, height } = res[0]
          const pixelRatio = wx.getSystemInfoSync().pixelRatio
          canvas.width = width * pixelRatio
          canvas.height = height * pixelRatio
          gl.viewport(0, 0, canvas.width, canvas.height)

          this.program = this.createProgram(gl, vsSource, fsSource)
          gl.useProgram(this.program)

          this.particleCount = 3000
          this.createParticles(gl)

          this.locations = {
            aPosition: gl.getAttribLocation(this.program, 'aPosition'),
            aSize: gl.getAttribLocation(this.program, 'aSize'),
            aColor: gl.getAttribLocation(this.program, 'aColor'),
            uProjection: gl.getUniformLocation(this.program, 'uProjection'),
            uView: gl.getUniformLocation(this.program, 'uView'),
            uTime: gl.getUniformLocation(this.program, 'uTime'),
            uSpeed: gl.getUniformLocation(this.program, 'uSpeed'),
            uAttract: gl.getUniformLocation(this.program, 'uAttract')
          }

          this.setupMatrices()
          this.startTime = Date.now()
          this.particleAttract = 0  // 粒子吸引强度
          this.animateParticles()
        })
    },

    createProgram(gl, vsSource, fsSource) {
      const vs = this.compileShader(gl, gl.VERTEX_SHADER, vsSource)
      const fs = this.compileShader(gl, gl.FRAGMENT_SHADER, fsSource)

      const program = gl.createProgram()
      gl.attachShader(program, vs)
      gl.attachShader(program, fs)
      gl.linkProgram(program)

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program))
        return null
      }

      return program
    },

    compileShader(gl, type, source) {
      const shader = gl.createShader(type)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }

      return shader
    },

    createParticles(gl) {
      const positions = []
      const sizes = []
      const colors = []

      const cyan = { r: 0, g: 1, b: 1 }
      const purple = { r: 0.545, g: 0.361, b: 0.965 }

      for (let i = 0; i < this.particleCount; i++) {
        const x = (Math.random() - 0.5) * 1000
        const y = (Math.random() - 0.5) * 1000
        const z = Math.random() * 2000 - 1000

        positions.push(x, y, z)
        sizes.push(Math.random() * 3 + 1)

        const t = (z + 1000) / 2000
        const r = cyan.r + (purple.r - cyan.r) * t
        const g = cyan.g + (purple.g - cyan.g) * t
        const b = cyan.b + (purple.b - cyan.b) * t

        colors.push(r, g, b)
      }

      this.positionBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

      this.sizeBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, this.sizeBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizes), gl.STATIC_DRAW)

      this.colorBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
    },

    setupMatrices() {
      const gl = this.gl
      const aspect = this.canvas.width / this.canvas.height
      const fov = 60 * Math.PI / 180
      const near = 1
      const far = 3000

      const f = 1.0 / Math.tan(fov / 2)
      const projection = new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) / (near - far), -1,
        0, 0, (2 * far * near) / (near - far), 0
      ])

      const view = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ])

      this.projectionMatrix = projection
      this.viewMatrix = view
    },

    animateParticles() {
      if (!this.gl || !this.program) return

      const gl = this.gl
      const time = (Date.now() - this.startTime) / 1000

      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE)

      gl.uniformMatrix4fv(this.locations.uProjection, false, this.projectionMatrix)
      gl.uniformMatrix4fv(this.locations.uView, false, this.viewMatrix)
      gl.uniform1f(this.locations.uTime, time)
      gl.uniform1f(this.locations.uSpeed, 600)
      gl.uniform1f(this.locations.uAttract, this.particleAttract)

      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
      gl.enableVertexAttribArray(this.locations.aPosition)
      gl.vertexAttribPointer(this.locations.aPosition, 3, gl.FLOAT, false, 0, 0)

      gl.bindBuffer(gl.ARRAY_BUFFER, this.sizeBuffer)
      gl.enableVertexAttribArray(this.locations.aSize)
      gl.vertexAttribPointer(this.locations.aSize, 1, gl.FLOAT, false, 0, 0)

      gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer)
      gl.enableVertexAttribArray(this.locations.aColor)
      gl.vertexAttribPointer(this.locations.aColor, 3, gl.FLOAT, false, 0, 0)

      gl.drawArrays(gl.POINTS, 0, this.particleCount)

      this.particleFrame = setTimeout(() => this.animateParticles(), 16)
    },

    /**
     * 完整开场动画序列
     */
    startIntroAnimation() {
      // 阶段1: 入场 (0-2.5s) - 光晕先行 + 模糊到清晰 + 弹性缩放
      this.playEntrancePhase(() => {
        // 阶段2: 持续 (2.5-5s) - 漂浮 + 颜色流转 + 粒子吸引
        this.playSustainPhase(() => {
          // 阶段3: 消失 (5-6s) - 退行性模糊
          this.playDisappearPhase()
        })
      })
    },

    /**
     * 阶段1: 入场 - 光晕先行 + 模糊到清晰 + 弹性缩放
     */
    playEntrancePhase(callback) {
      const duration = 2500
      const frameDuration = 16
      let currentFrame = 0
      const totalFrames = duration / frameDuration

      // 环旋转动画
      const rotateRing = () => {
        this.setData({ ringRotation: (this.data.ringRotation + 0.5) % 360 })
        setTimeout(rotateRing, 16)
      }
      rotateRing()

      const animate = () => {
        currentFrame++
        const progress = Math.min(currentFrame / totalFrames, 1)

        // BackOut 缓动函数 (0.8 -> 1.05 -> 1.0)
        const backOut = (t) => {
          const c1 = 1.70158
          const c3 = c1 + 1
          return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
        }

        const eased = backOut(progress)

        // 光晕先行 - 快速出现然后淡出
        let glowOp = 0
        if (progress < 0.3) {
          glowOp = progress / 0.3
        } else {
          glowOp = 1 - (progress - 0.3) / 0.7
        }

        // 弹性缩放: 0.8 -> 1.05 -> 1.0
        let scale = 0.8
        if (progress < 0.7) {
          scale = 0.8 + (1.05 - 0.8) * backOut(progress / 0.7)
        } else {
          scale = 1.05 - (1.05 - 1.0) * ((progress - 0.7) / 0.3)
        }

        // 模糊度: 40 -> 0
        const blur = Math.max(0, 40 * (1 - eased * 1.5))

        // 清晰层淡入
        const clearOp = Math.min(1, eased)

        // 字母间距动画: 20 -> 8
        const spacing = 20 - (12 * eased)

        // 装饰线展开
        const lineWidth = eased * 60

        this.setData({
          glowOpacity: glowOp,
          blurAmount: blur,
          clearOpacity: clearOp,
          logoScale: scale,
          letterSpacing: spacing,
          lineWidth: lineWidth,
          // 粒子吸引随 LOGO 出现增强
          particleAttract: eased * 0.3
        })

        if (progress < 1) {
          setTimeout(() => animate(), frameDuration)
        } else {
          this.setData({ sustainGlowOpacity: 1 })
          callback && callback()
        }
      }

      animate()
    },

    /**
     * 阶段2: 持续 - 漂浮 + 颜色流转 + 粒子吸引
     */
    playSustainPhase(callback) {
      const duration = 2500
      const startTime = Date.now()

      // 名字淡入
      this.setData({ nameOpacity: 1 })

      // 微妙漂浮动画
      const floatAnimate = () => {
        const elapsed = Date.now() - startTime
        if (elapsed >= duration) {
          callback && callback()
          return
        }

        // 正弦波漂浮
        const floatOffset = Math.sin(elapsed / 300) * 8
        this.setData({ floatOffset })

        setTimeout(floatAnimate, 16)
      }
      floatAnimate()
    },

    /**
     * 阶段3: 消失 - 退行性模糊
     */
    playDisappearPhase() {
      const duration = 1000
      const frameDuration = 16
      let currentFrame = 0
      const totalFrames = duration / frameDuration

      const animate = () => {
        currentFrame++
        const progress = Math.min(currentFrame / totalFrames, 1)

        // 使用 easeIn 曲线
        const eased = progress * progress

        // 对比度降低 - 颜色变暗
        const textColorProgress = 1 - eased * 0.6
        const textColor = `rgba(255, 255, 255, ${textColorProgress})`

        // 透明度降低
        const opacity = 1 - eased

        this.setData({
          textColor,
          clearOpacity: opacity,
          sustainGlowOpacity: 1 - eased,
          // 粒子吸引释放
          particleAttract: 0.3 * (1 - eased)
        })

        if (progress < 1) {
          setTimeout(() => animate(), frameDuration)
        } else {
          // 动画完成，跳转
          setTimeout(() => {
            this.navigateToMain()
          }, 200)
        }
      }

      animate()
    },

    skipIntro() {
      this.navigateToMain()
    },

    navigateToMain() {
      this.cleanup()
      wx.redirectTo({
        url: '/pages/index/index'
      })
    },

    cleanup() {
      if (this.particleFrame) {
        clearTimeout(this.particleFrame)
      }

      if (this.gl) {
        const gl = this.gl
        if (this.positionBuffer) gl.deleteBuffer(this.positionBuffer)
        if (this.sizeBuffer) gl.deleteBuffer(this.sizeBuffer)
        if (this.colorBuffer) gl.deleteBuffer(this.colorBuffer)
        if (this.program) gl.deleteProgram(this.program)
      }
    }
  }
})
