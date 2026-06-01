// pages/admin/components/score-manager/score-manager.js
// 评分人工调整模块

Component({
  properties: {
    adminInfo: {
      type: Object,
      value: null
    }
  },

  data: {
    // 论文列表
    paperList: [],
    
    // 筛选条件
    filter: {
      keyword: '',
      hasAdjusted: 'all',  // all, yes, no
      minScore: '',
      maxScore: ''
    },
    
    // 分页
    pagination: {
      page: 1,
      pageSize: 20,
      total: 0,
      hasMore: true
    },
    
    // 加载状态
    loading: false,
    
    // 当前编辑的论文
    editingPaper: null,
    
    // 是否显示编辑弹窗
    showEditModal: false,
    
    // 调整表单
    adjustForm: {
      meaninglessness: 0,
      novelty: 0,
      absurdity: 0,
      formality: 0,
      statistics_abuse: 0,
      logic_consistency: 0,
      emotional_coldness: 0,
      shareability: 0,
      reason: ''
    },
    
    // 调整历史
    adjustmentHistory: [],
    
    // 是否显示历史弹窗
    showHistoryModal: false
  },

  lifetimes: {
    attached() {
      this.loadPaperList();
    }
  },

  methods: {
    /**
     * 加载论文列表
     */
    async loadPaperList(reset = false) {
      if (this.data.loading) return;
      
      if (reset) {
        this.setData({
          'pagination.page': 1,
          paperList: []
        });
      }
      
      this.setData({ loading: true });
      
      try {
        const db = wx.cloud.database();
        const _ = db.command;
        
        // 构建查询条件
        let where = {};
        
        if (this.data.filter.keyword) {
          where.title = db.RegExp({
            regexp: this.data.filter.keyword,
            options: 'i'
          });
        }
        
        if (this.data.filter.hasAdjusted !== 'all') {
          where.scoreAdjusted = this.data.filter.hasAdjusted === 'yes';
        }
        
        if (this.data.filter.minScore || this.data.filter.maxScore) {
          where['aif.total'] = {};
          if (this.data.filter.minScore) {
            where['aif.total'] = _.gte(parseFloat(this.data.filter.minScore));
          }
          if (this.data.filter.maxScore) {
            where['aif.total'] = _.lte(parseFloat(this.data.filter.maxScore));
          }
        }
        
        // 查询数据
        const { data } = await db.collection('papers')
          .where(where)
          .orderBy('createTime', 'desc')
          .skip((this.data.pagination.page - 1) * this.data.pagination.pageSize)
          .limit(this.data.pagination.pageSize)
          .get();
        
        // 获取总数
        const countRes = await db.collection('papers').where(where).count();
        
        this.setData({
          paperList: reset ? data : [...this.data.paperList, ...data],
          'pagination.total': countRes.total,
          'pagination.hasMore': data.length === this.data.pagination.pageSize,
          loading: false
        });
      } catch (error) {
        console.error('加载论文列表失败:', error);
        this.setData({ loading: false });
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      }
    },

    /**
     * 打开评分调整弹窗
     */
    openAdjustModal(e) {
      const paper = e.currentTarget.dataset.paper;
      const currentScores = paper.manualScore || paper.aif?.breakdown || {};
      
      this.setData({
        editingPaper: paper,
        showEditModal: true,
        adjustForm: {
          meaninglessness: (currentScores.meaninglessness || 0.5) * 100,
          novelty: (currentScores.novelty || 0.5) * 100,
          absurdity: (currentScores.absurdity || 0.5) * 100,
          formality: (currentScores.formality || 0.5) * 100,
          statistics_abuse: (currentScores.statistics_abuse || 0.5) * 100,
          logic_consistency: (currentScores.logic_consistency || 0.5) * 100,
          emotional_coldness: (currentScores.emotional_coldness || 0.5) * 100,
          shareability: (currentScores.shareability || 0.5) * 100,
          reason: ''
        }
      });
    },

    /**
     * 关闭编辑弹窗
     */
    closeAdjustModal() {
      this.setData({
        showEditModal: false,
        editingPaper: null
      });
    },

    /**
     * 评分滑块变化
     */
    onScoreChange(e) {
      const { field } = e.currentTarget.dataset;
      const value = e.detail.value;
      this.setData({
        [`adjustForm.${field}`]: value
      });
    },

    /**
     * 调整原因输入
     */
    onReasonInput(e) {
      this.setData({
        'adjustForm.reason': e.detail.value
      });
    },

    /**
     * 计算总分
     */
    calculateTotal() {
      const form = this.data.adjustForm;
      const scores = [
        form.meaninglessness,
        form.novelty,
        form.absurdity,
        form.formality,
        form.statistics_abuse,
        form.logic_consistency,
        form.emotional_coldness,
        form.shareability
      ];
      const total = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      return total.toFixed(1);
    },

    /**
     * 保存评分调整
     */
    async saveAdjustment() {
      if (!this.data.adjustForm.reason) {
        wx.showToast({
          title: '请输入调整原因',
          icon: 'none'
        });
        return;
      }

      wx.showLoading({ title: '保存中...' });

      try {
        const db = wx.cloud.database();
        const paper = this.data.editingPaper;
        
        // 构建新的评分数据
        const manualScore = {
          meaninglessness: this.data.adjustForm.meaninglessness / 100,
          novelty: this.data.adjustForm.novelty / 100,
          absurdity: this.data.adjustForm.absurdity / 100,
          formality: this.data.adjustForm.formality / 100,
          statistics_abuse: this.data.adjustForm.statistics_abuse / 100,
          logic_consistency: this.data.adjustForm.logic_consistency / 100,
          emotional_coldness: this.data.adjustForm.emotional_coldness / 100,
          shareability: this.data.adjustForm.shareability / 100
        };

        const total = parseFloat(this.calculateTotal());

        // 保存到调整历史
        await db.collection('score_adjustments').add({
          data: {
            paperId: paper._id,
            paperTitle: paper.title,
            originalScore: paper.aif,
            newScore: {
              total,
              breakdown: manualScore
            },
            reason: this.data.adjustForm.reason,
            adjustedBy: this.data.adminInfo.username,
            adjustedAt: new Date()
          }
        });

        // 更新论文评分
        await db.collection('papers').doc(paper._id).update({
          data: {
            autoScore: paper.aif,  // 保存原始自动评分
            aif: {
              total,
              breakdown: manualScore
            },
            manualScore,
            scoreAdjusted: true,
            adjustedBy: this.data.adminInfo.username,
            adjustedAt: new Date(),
            adjustmentReason: this.data.adjustForm.reason
          }
        });

        // 记录操作日志
        await this.addOperationLog('adjust_score', `调整论文评分: ${paper.title}`);

        wx.hideLoading();
        wx.showToast({
          title: '调整成功',
          icon: 'success'
        });

        this.closeAdjustModal();
        this.loadPaperList(true);
      } catch (error) {
        wx.hideLoading();
        console.error('保存评分调整失败:', error);
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    },

    /**
     * 查看调整历史
     */
    async viewHistory(e) {
      const paperId = e.currentTarget.dataset.id;
      
      this.setData({ showHistoryModal: true });
      
      try {
        const db = wx.cloud.database();
        const { data } = await db.collection('score_adjustments')
          .where({ paperId })
          .orderBy('adjustedAt', 'desc')
          .get();
        
        this.setData({
          adjustmentHistory: data
        });
      } catch (error) {
        console.error('加载调整历史失败:', error);
      }
    },

    /**
     * 关闭历史弹窗
     */
    closeHistoryModal() {
      this.setData({
        showHistoryModal: false,
        adjustmentHistory: []
      });
    },

    /**
     * 重置为自动评分
     */
    async resetToAuto(e) {
      const paper = e.currentTarget.dataset.paper;
      
      wx.showModal({
        title: '确认重置',
        content: '确定要重置为自动评分吗？人工调整记录将被保留。',
        success: async (res) => {
          if (res.confirm) {
            wx.showLoading({ title: '重置中...' });
            
            try {
              const db = wx.cloud.database();
              
              await db.collection('papers').doc(paper._id).update({
                data: {
                  aif: paper.autoScore || paper.aif,
                  scoreAdjusted: false,
                  resetAt: new Date(),
                  resetBy: this.data.adminInfo.username
                }
              });

              await this.addOperationLog('reset_score', `重置论文评分为自动: ${paper.title}`);
              
              wx.hideLoading();
              wx.showToast({
                title: '重置成功',
                icon: 'success'
              });
              
              this.loadPaperList(true);
            } catch (error) {
              wx.hideLoading();
              wx.showToast({
                title: '重置失败',
                icon: 'none'
              });
            }
          }
        }
      });
    },

    /**
     * 添加操作日志
     */
    async addOperationLog(type, description) {
      try {
        const db = wx.cloud.database();
        await db.collection('operation_logs').add({
          data: {
            type,
            description,
            operator: this.data.adminInfo.username,
            operatorId: this.data.adminInfo._id,
            module: 'score',
            createTime: new Date()
          }
        });
      } catch (error) {
        console.error('记录操作日志失败:', error);
      }
    },

    /**
     * 筛选条件变更
     */
    onFilterChange(e) {
      const { field, value } = e.currentTarget.dataset;
      this.setData({
        [`filter.${field}`]: value
      }, () => {
        this.loadPaperList(true);
      });
    },

    /**
     * 搜索
     */
    onSearch(e) {
      this.setData({
        'filter.keyword': e.detail.value
      }, () => {
        this.loadPaperList(true);
      });
    },

    /**
     * 加载更多
     */
    loadMore() {
      if (!this.data.pagination.hasMore || this.data.loading) return;
      
      this.setData({
        'pagination.page': this.data.pagination.page + 1
      }, () => {
        this.loadPaperList();
      });
    }
  }
});
