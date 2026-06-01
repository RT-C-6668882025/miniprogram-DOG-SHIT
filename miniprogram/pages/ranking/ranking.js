// pages/ranking/ranking.js
Page({
  data: {
    activeTab: 'weekly',
    rankingList: [],
    // 本周一区榜数据
    weeklyList: [
      {
        id: 1,
        rank: 1,
        title: "拖鞋对量子纠缠的宏观影响：一项跨物种实验研究",
        zone: "SSS一区",
        aif: 98.5,
        doi: "10.1038/absurd.2024.001",
        citations: 1247,
      },
      {
        id: 2,
        rank: 2,
        title: "方便面与存在主义哲学的实证分析：基于深夜食堂视角",
        zone: "SSS一区",
        aif: 95.2,
        doi: "10.1038/absurd.2024.002",
        citations: 892,
      },
      {
        id: 3,
        rank: 3,
        title: "二维角色跨次元恋爱行为的社会学研究",
        zone: "S一区",
        aif: 88.7,
        doi: "10.1038/absurd.2024.003",
        citations: 756,
      },
      {
        id: 4,
        rank: 4,
        title: "猫咪对人类工作时间的反向操控机制研究",
        zone: "A一区",
        aif: 76.3,
        doi: "10.1038/absurd.2024.004",
        citations: 534,
      },
      {
        id: 5,
        rank: 5,
        title: "朋友圈自拍次数与自我意识的负相关性分析",
        zone: "A一区",
        aif: 72.1,
        doi: "10.1038/absurd.2024.005",
        citations: 421,
      },
      {
        id: 6,
        rank: 6,
        title: "量子波动速读对智商影响的长期追踪研究",
        zone: "B一区",
        aif: 68.4,
        doi: "10.1038/absurd.2024.006",
        citations: 389,
      },
      {
        id: 7,
        rank: 7,
        title: "甲方需求变更与程序员寿命的负相关研究",
        zone: "B一区",
        aif: 65.2,
        doi: "10.1038/absurd.2024.007",
        citations: 356,
      },
    ],
    // 荒谬指数榜数据
    absurdityList: [
      {
        id: 101,
        rank: 1,
        title: "论如何用微波炉加热黑洞：一项可行性研究",
        zone: "SSS一区",
        aif: 99.9,
        doi: "10.1038/absurd.2024.101",
        citations: 3421,
      },
      {
        id: 102,
        rank: 2,
        title: "时间旅行者的便秘问题：因果律的悖论分析",
        zone: "SSS一区",
        aif: 97.8,
        doi: "10.1038/absurd.2024.102",
        citations: 2890,
      },
      {
        id: 103,
        rank: 3,
        title: "平行宇宙中的我是否也在写这篇论文：多元宇宙实证",
        zone: "SSS一区",
        aif: 96.5,
        doi: "10.1038/absurd.2024.103",
        citations: 2156,
      },
      {
        id: 104,
        rank: 4,
        title: "用塔罗牌预测股票市场的有效性研究",
        zone: "S一区",
        aif: 89.3,
        doi: "10.1038/absurd.2024.104",
        citations: 1876,
      },
      {
        id: 105,
        rank: 5,
        title: "论如何用意念改变WiFi信号强度",
        zone: "S一区",
        aif: 87.2,
        doi: "10.1038/absurd.2024.105",
        citations: 1654,
      },
    ],
    // 反人类逻辑榜数据
    logicList: [
      {
        id: 201,
        rank: 1,
        title: "证明1+1=3的数学推导：基于领导意志的公理体系",
        zone: "SSS一区",
        aif: 98.2,
        doi: "10.1038/absurd.2024.201",
        citations: 4521,
      },
      {
        id: 202,
        rank: 2,
        title: "论如何用Excel制作原子弹：办公软件的军事化应用",
        zone: "SSS一区",
        aif: 96.8,
        doi: "10.1038/absurd.2024.202",
        citations: 3890,
      },
      {
        id: 203,
        rank: 3,
        title: "老板永远是对的：职场相对论的基本原理",
        zone: "S一区",
        aif: 92.5,
        doi: "10.1038/absurd.2024.203",
        citations: 3234,
      },
      {
        id: 204,
        rank: 4,
        title: " deadline是第一生产力：拖延症的量子力学解释",
        zone: "S一区",
        aif: 88.9,
        doi: "10.1038/absurd.2024.204",
        citations: 2876,
      },
      {
        id: 205,
        rank: 5,
        title: "如何用废话文学写论文：语言学的自我指涉研究",
        zone: "A一区",
        aif: 85.4,
        doi: "10.1038/absurd.2024.205",
        citations: 2456,
      },
    ],
  },

  onLoad() {
    console.log('ranking page loaded');
    // 初始化显示本周榜单
    this.setData({
      rankingList: this.data.weeklyList
    });
  },

  onShow() {
    // 每次显示页面时刷新当前标签的数据
    this.refreshCurrentTab();
  },

  // 刷新当前标签数据
  refreshCurrentTab() {
    const { activeTab } = this.data;
    let newList = [];
    
    switch(activeTab) {
      case 'weekly':
        newList = this.data.weeklyList;
        break;
      case 'absurdity':
        newList = this.data.absurdityList;
        break;
      case 'logic':
        newList = this.data.logicList;
        break;
      default:
        newList = this.data.weeklyList;
    }
    
    this.setData({ rankingList: newList });
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    
    // 先显示加载状态
    this.setData({ 
      activeTab: tab,
      rankingList: [] // 清空列表，显示加载效果
    });
    
    // 模拟加载延迟，然后切换数据
    setTimeout(() => {
      this.refreshCurrentTab();
    }, 200);
  },

  // 查看论文详情
  viewPaper(e) {
    const id = e.currentTarget.dataset.id;
    console.log('查看论文详情:', id);
    
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`,
      success: () => {
        console.log('跳转成功');
      },
      fail: (err) => {
        console.error('跳转失败:', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('下拉刷新');
    
    // 模拟刷新
    setTimeout(() => {
      this.refreshCurrentTab();
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1000
      });
    }, 500);
  },

  onShareAppMessage() {
    const { activeTab } = this.data;
    const titles = {
      weekly: "荒谬学术排行榜 - 本周一区榜",
      absurdity: "荒谬学术排行榜 - 荒谬指数榜",
      logic: "荒谬学术排行榜 - 反人类逻辑榜"
    };
    
    return {
      title: titles[activeTab] || "荒谬学术排行榜",
      path: "/pages/ranking/ranking",
    };
  },
});
