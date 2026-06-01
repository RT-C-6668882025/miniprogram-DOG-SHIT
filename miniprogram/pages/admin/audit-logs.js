// pages/admin/audit-logs.js
// 审核日志查看页面

const app = getApp();

Page({
  data: {
    logs: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 20,
    filterLevel: 'all',
    filterType: 'all',
    stats: {
      total: 0,
      passed: 0,
      blocked: 0
    }
  },

  onLoad() {
    this.loadLogs();
    this.loadStats();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, logs: [] });
    this.loadLogs().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadLogs();
    }
  },

  async loadLogs() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      const db = wx.cloud.database();
      const { page, pageSize, filterLevel, filterType } = this.data;
      
      let query = db.collection('audit_logs');
      
      // 应用筛选
      if (filterLevel !== 'all') {
        query = query.where({ 'details.maxLevel': parseInt(filterLevel) });
      }
      
      if (filterType !== 'all') {
        query = query.where({ eventType: filterType });
      }
      
      const { data } = await query
        .orderBy('timestamp', 'desc')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .get();
      
      const newLogs = data.map(log => ({
        ...log,
        timeStr: this.formatTime(log.timestamp),
        levelColor: this.getLevelColor(log.details?.maxLevel || 0)
      }));
      
      this.setData({
        logs: page === 1 ? newLogs : [...this.data.logs, ...newLogs],
        page: page + 1,
        hasMore: data.length === pageSize,
        loading: false
      });
    } catch (error) {
      console.error('加载审核日志失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  async loadStats() {
    try {
      const db = wx.cloud.database();
      
      // 获取总数
      const { total } = await db.collection('audit_logs').count();
      
      // 获取通过数
      const { total: passed } = await db.collection('audit_logs')
        .where({ 'details.maxLevel': db.command.lt(3) })
        .count();
      
      // 获取拦截数
      const { total: blocked } = await db.collection('audit_logs')
        .where({ 'details.maxLevel': db.command.gte(3) })
        .count();
      
      this.setData({
        stats: { total, passed, blocked }
      });
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  },

  formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  },

  getLevelColor(level) {
    const colors = {
      0: '#4CAF50',
      1: '#FFC107',
      2: '#FF9800',
      3: '#F44336',
      4: '#D32F2F',
      5: '#B71C1C'
    };
    return colors[level] || '#999';
  },

  onFilterChange(e) {
    const { type, value } = e.currentTarget.dataset;
    this.setData({
      [type === 'level' ? 'filterLevel' : 'filterType']: value,
      page: 1,
      logs: []
    });
    this.loadLogs();
  },

  viewDetail(e) {
    const log = e.currentTarget.dataset.log;
    wx.showModal({
      title: '审核详情',
      content: JSON.stringify(log, null, 2).substring(0, 500),
      showCancel: false
    });
  }
});
