// pages/profile/profile.js
Page({
  data: {
    userInfo: {},
    userStats: {
      papersCount: 0,
      totalCitations: 0,
      highestAIF: 0,
      bestZone: ''
    },
    myPapers: [],
    loading: true
  },

  onLoad() {
    this.loadUserData();
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadUserData();
  },

  /**
   * 加载用户数据
   */
  async loadUserData() {
    this.setData({ loading: true });

    try {
      // 获取用户信息
      const userInfo = await this.getUserInfo();

      // 获取用户的论文列表
      const myPapers = await this.getMyPapers();

      // 计算统计数据
      const userStats = this.calculateStats(myPapers);

      this.setData({
        userInfo,
        myPapers,
        userStats,
        loading: false
      });
    } catch (error) {
      console.error('加载用户数据失败:', error);
      this.setData({ loading: false });

      // 使用模拟数据
      this.loadMockData();
    }
  },

  /**
   * 获取用户信息
   */
  async getUserInfo() {
    return new Promise((resolve) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          resolve(res.userInfo);
        },
        fail: () => {
          // 用户拒绝授权，返回默认信息
          resolve({
            nickName: '研究员',
            avatarUrl: ''
          });
        }
      });
    });
  },

  /**
   * 获取用户的论文列表
   */
  async getMyPapers() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'paperGenerator',
        data: {
          action: 'getMyPapers'
        }
      });

      if (res.result && res.result.papers) {
        return res.result.papers;
      }
      return [];
    } catch (error) {
      console.error('获取论文列表失败:', error);
      return [];
    }
  },

  /**
   * 计算统计数据
   */
  calculateStats(papers) {
    const stats = {
      papersCount: papers.length,
      totalCitations: 0,
      highestAIF: 0,
      bestZone: ''
    };

    if (papers.length === 0) {
      return stats;
    }

    // 计算总引用数
    stats.totalCitations = papers.reduce((sum, paper) => sum + (paper.citations || 0), 0);

    // 找出最高 AIF
    const sortedByAIF = [...papers].sort((a, b) => (b.aif?.total || 0) - (a.aif?.total || 0));
    stats.highestAIF = sortedByAIF[0]?.aif?.total || 0;
    stats.bestZone = sortedByAIF[0]?.zone || '';

    return stats;
  },

  /**
   * 加载模拟数据
   */
  loadMockData() {
    this.setData({
      userInfo: {
        nickName: '学术荒谬家',
        avatarUrl: ''
      },
      userStats: {
        papersCount: 3,
        totalCitations: 2586,
        highestAIF: 98.5,
        bestZone: 'SSS一区'
      },
      myPapers: [
        {
          _id: 'mock_001',
          title: '拖鞋对量子纠缠的宏观影响：一项跨物种实验研究',
          zone: 'SSS一区',
          aif: { total: 98.5 },
          citations: 1247,
          createdAt: '2024-01-15'
        },
        {
          _id: 'mock_002',
          title: '方便面与存在主义哲学的实证分析：基于深夜食堂视角',
          zone: 'S一区',
          aif: { total: 85.2 },
          citations: 867,
          createdAt: '2024-01-18'
        },
        {
          _id: 'mock_003',
          title: '猫咪对人类工作时间的反向操控机制研究',
          zone: 'A一区',
          aif: { total: 76.3 },
          citations: 472,
          createdAt: '2024-01-20'
        }
      ],
      loading: false
    });
  },

  /**
   * 获取分区样式类
   */
  getZoneClass(zone) {
    const zoneMap = {
      'SSS一区': 'SSS',
      'S一区': 'S',
      'A一区': 'A',
      'B区': 'B',
      'C区': 'C'
    };
    return zoneMap[zone] || 'C';
  },

  /**
   * 查看论文详情
   */
  viewPaper(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  /**
   * 去创建论文
   */
  goToCreate() {
    wx.navigateTo({
      url: '/pages/paper/paper'
    });
  },

  /**
   * 去设置
   */
  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  onShareAppMessage() {
    return {
      title: '荒谬论文生成 - Nature Absurdity Edition',
      path: '/pages/index/index'
    };
  }
});
