// pages/index/index.js
// 首页 - 集成隐藏管理员入口

const adminManager = require('../../utils/adminManager');
const sensitiveFilter = require('../../utils/sensitiveWordFilter');

Page({
  data: {
    // 预设论文列表
    featuredPapers: [
      {
        id: 'preset_001',
        title: '拖鞋对量子纠缠的宏观影响：一项跨物种实验研究',
        zone: 'SSS一区',
        aif: 98.5,
        citations: 1247,
        authors: ['张三', '李四', '王五'],
        affiliations: ['荒谬物理学研究所', '跨维度科学实验室'],
        abstract: '本研究通过严谨的实证方法，深入探讨了拖鞋穿戴状态对量子纠缠现象的影响。通过对1000名参与者的跨物种实验，我们发现拖鞋的存在会导致量子纠缠效率下降23.5%。这一发现为量子通信与日常生活的关联提供了新的理论视角。',
        content: '## 摘要\n\n本研究通过严谨的实证方法，深入探讨了拖鞋穿戴状态对量子纠缠现象的影响。通过对1000名参与者的跨物种实验，我们发现拖鞋的存在会导致量子纠缠效率下降23.5%。这一发现为量子通信与日常生活的关联提供了新的理论视角。\n\n## 1. 引言\n\n量子纠缠作为量子力学中最神秘的现象之一，长期以来被认为是微观世界的专属。然而，本研究团队注意到一个被忽视的变量——拖鞋。拖鞋作为人类日常生活中最常见的物品之一，其与量子现象的潜在关联值得深入研究。\n\n## 2. 方法\n\n### 2.1 实验设计\n\n我们招募了1000名志愿者，分为实验组（穿着拖鞋）和对照组（赤脚）。通过量子纠缠发生器，测量两组参与者的量子纠缠效率。\n\n### 2.2 数据分析\n\n采用SPSS 25.0进行统计分析，显著性水平设定为p<0.05。\n\n## 3. 结果\n\n实验结果显示，穿着拖鞋的实验组，其量子纠缠效率平均为34.2%，显著低于赤脚组的57.8%（p < 0.001）。有趣的是，不同材质的拖鞋对量子纠缠的影响也存在显著差异，其中人字拖的影响最大。\n\n## 4. 讨论\n\n本研究首次证实了拖鞋与量子纠缠的负相关性。这一发现不仅拓展了量子力学的研究边界，也为日常生活中的量子效应提供了实证支持。\n\n## 5. 结论\n\n本研究表明，拖鞋对量子纠缠具有显著的抑制作用。未来研究可进一步探讨袜子对量子隧穿效应的影响。\n\n## 参考文献\n\n[1] 张三, 李四. 拖鞋与量子力学[J]. 荒谬物理学报, 2024, 1(1): 1-10.\n[2] 王五. 跨物种量子纠缠研究[J]. 跨维度科学, 2024, 2(1): 20-30.'
      },
      {
        id: 'preset_002',
        title: '香蕉皮在星际航行中的应用：基于滑倒动力学的推进系统',
        zone: 'S一区',
        aif: 95.2,
        citations: 892,
        authors: ['赵六', '钱七'],
        affiliations: ['星际滑倒工程实验室'],
        abstract: '本研究提出了一种基于香蕉皮滑倒动力学的新型星际推进系统。通过理论计算和模拟实验，我们证明了香蕉皮滑倒时产生的动量足以推动小型航天器在太空中移动。',
        content: '## 摘要\n\n本研究提出了一种基于香蕉皮滑倒动力学的新型星际推进系统。通过理论计算和模拟实验，我们证明了香蕉皮滑倒时产生的动量足以推动小型航天器在太空中移动。\n\n## 1. 引言\n\n传统的化学推进系统效率低下，而新兴的离子推进技术成本高昂。本研究从日常生活中获得灵感，提出了一个革命性的推进方案。\n\n## 2. 理论基础\n\n### 2.1 滑倒动力学\n\n根据牛顿第三定律，当人踩到香蕉皮滑倒时，会产生一个反作用力。\n\n### 2.2 动量守恒\n\n通过精确计算滑倒角度和速度，可以最大化推进效率。\n\n## 3. 实验结果\n\n模拟显示，一个标准的香蕉皮可以产生约0.5N的推力，足以推动1kg的航天器以0.5m/s²的加速度移动。\n\n## 4. 结论\n\n香蕉皮推进系统具有成本低、环保、可再生的优点，是未来星际航行的理想选择。'
      },
      {
        id: 'preset_003',
        title: '袜子失踪现象的量子力学解释：平行宇宙假说',
        zone: 'A一区',
        aif: 91.8,
        citations: 567,
        authors: ['孙八', '周九', '吴十'],
        affiliations: ['家庭量子现象研究中心'],
        abstract: '本研究提出了一个革命性的理论：洗衣机中的袜子并非真正丢失，而是通过量子隧穿效应进入了平行宇宙。我们建立了数学模型来解释这一现象。',
        content: '## 摘要\n\n本研究提出了一个革命性的理论：洗衣机中的袜子并非真正丢失，而是通过量子隧穿效应进入了平行宇宙。我们建立了数学模型来解释这一现象。\n\n## 1. 问题背景\n\n全球每年有超过10亿只袜子在洗衣机中神秘失踪，这一现象长期以来困扰着科学家和普通民众。\n\n## 2. 理论模型\n\n### 2.1 量子隧穿\n\n根据量子力学，微观粒子有一定概率穿越经典力学无法逾越的势垒。\n\n### 2.2 平行宇宙理论\n\n我们假设在洗衣机旋转时，会产生局部的时空扭曲，形成通往平行宇宙的通道。\n\n## 3. 数学推导\n\n通过薛定谔方程，我们计算得出袜子穿越到平行宇宙的概率约为0.001%。\n\n## 4. 实验验证\n\n我们在100台洗衣机中进行了为期一年的观测，记录到3起疑似袜子穿越事件。\n\n## 5. 结论\n\n袜子失踪现象可以用量子力学和平行宇宙理论得到合理解释。'
      }
    ],

    // 隐藏手势计数
    logoTapCount: 0,
    lastTapTime: 0,

    // 是否显示管理员入口提示
    showAdminHint: false
  },

  onLoad: function() {
    // 页面加载时，将预设论文保存到本地存储
    this.savePresetPapers();

    // 初始化敏感词过滤器
    sensitiveFilter.init();
  },

  // 保存预设论文到本地存储
  savePresetPapers: function() {
    try {
      const presetPapers = this.data.featuredPapers;
      let history = wx.getStorageSync('paper_history') || [];

      // 检查是否已存在预设论文
      presetPapers.forEach(paper => {
        const exists = history.some(item => item.id === paper.id);
        if (!exists) {
          history.unshift({
            id: paper.id,
            title: paper.title,
            content: paper.content,
            createTime: '2024-01-15',
            isPreset: true
          });
        }
      });

      // 只保留最近20篇
      if (history.length > 20) {
        history = history.slice(0, 20);
      }

      wx.setStorageSync('paper_history', history);
      console.log('[Index Page] 预设论文已保存到本地存储');
    } catch (error) {
      console.error('[Index Page] 保存预设论文失败:', error);
    }
  },

  // ========== 隐藏管理员入口手势 ==========

  /**
   * Logo点击事件 - 隐藏手势触发
   */
  onLogoTap: function() {
    const now = Date.now();
    const timeSinceLastTap = now - this.data.lastTapTime;

    // 如果间隔超过1秒，重置计数
    if (timeSinceLastTap > 1000) {
      this.setData({
        logoTapCount: 1,
        lastTapTime: now
      });
      console.log('[Index] 开始计数: 1');
      return;
    }

    // 增加计数
    const newCount = this.data.logoTapCount + 1;
    this.setData({
      logoTapCount: newCount,
      lastTapTime: now
    });
    console.log('[Index] 点击计数:', newCount);

    // 检查是否触发管理员入口（5次连续点击）
    if (newCount >= 5) {
      console.log('[Index] 触发管理员入口');
      this.setData({
        logoTapCount: 0,
        lastTapTime: 0
      });
      this.tryAccessAdmin();
    }
  },

  /**
   * Logo长按事件 - 备用进入方式（长按3秒）
   */
  onLogoLongPress: function() {
    console.log('[Index] Logo长按，进入管理员系统');
    wx.showModal({
      title: '管理员入口',
      content: '确定要进入后台管理系统吗？',
      success: (res) => {
        if (res.confirm) {
          console.log('[Index] 用户确认，跳转到管理后台');
          wx.navigateTo({
            url: '/pages/admin/admin',
            success: () => {
              console.log('[Index] 跳转成功');
            },
            fail: (err) => {
              console.error('[Index] 跳转失败:', err);
              wx.showToast({
                title: '跳转失败: ' + err.errMsg,
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },

  /**
   * 直接测试跳转（调试用）
   */
  directNavigateToAdmin: function() {
    console.log('[Index] 直接跳转到管理员页面');
    wx.navigateTo({
      url: '/pages/admin/admin',
      success: () => {
        console.log('[Index] 直接跳转成功');
      },
      fail: (err) => {
        console.error('[Index] 直接跳转失败:', err);
      }
    });
  },

  /**
   * 尝试访问管理员系统（5次点击触发）
   */
  async tryAccessAdmin() {
    console.log('[Index] 5次点击触发，跳转到管理后台');
    
    // 直接跳转到管理后台页面
    // 登录验证会在 admin 页面进行
    wx.navigateTo({
      url: '/pages/admin/admin',
      success: () => {
        console.log('[Index] 跳转成功');
      },
      fail: (err) => {
        console.error('[Index] 跳转失败:', err);
        wx.showToast({
          title: '跳转失败: ' + err.errMsg,
          icon: 'none'
        });
      }
    });
  },

  // ========== 页面导航 ==========

  // 跳转到论文生成页面
  goToPaper: function() {
    wx.navigateTo({
      url: '/pages/paper/paper'
    });
  },

  // 跳转到排行榜页面
  goToRanking: function() {
    wx.navigateTo({
      url: '/pages/ranking/ranking'
    });
  },

  // 跳转到论文详情
  goToDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  onShareAppMessage: function() {
    return {
      title: '荒谬论文生成器 - Nature Absurdity Edition',
      path: '/pages/index/index'
    };
  }
});
