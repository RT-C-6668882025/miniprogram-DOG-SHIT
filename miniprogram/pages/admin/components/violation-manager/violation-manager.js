// pages/admin/components/violation-manager/violation-manager.js
// 违规论文管理组件

Component({
  properties: {
    // 管理员信息
    adminInfo: {
      type: Object,
      value: null
    }
  },

  data: {
    // 违规论文列表
    violationList: [],
    
    // 筛选条件
    filter: {
      keyword: '',
      violationType: 'all',
      startDate: '',
      endDate: '',
      status: 'all'
    },
    
    // 违规类型选项
    violationTypes: [
      { value: 'all', label: '全部类型' },
      { value: 'sensitive_content', label: '敏感内容' },
      { value: 'inappropriate_language', label: '不当言论' },
      { value: 'copyright_issue', label: '版权问题' },
      { value: 'spam', label: '垃圾信息' },
      { value: 'other', label: '其他违规' }
    ],
    
    // 状态选项
    statusOptions: [
      { value: 'all', label: '全部状态' },
      { value: 'pending', label: '待处理' },
      { value: 'confirmed', label: '已确认' },
      { value: 'deleted', label: '已删除' }
    ],
    
    // 分页
    pagination: {
      page: 1,
      pageSize: 20,
      total: 0,
      hasMore: true
    },
    
    // 加载状态
    loading: false,
    
    // 选中的论文ID
    selectedIds: [],
    
    // 是否显示批量操作栏
    showBatchActions: false,
    
    // 删除记录
    deleteRecords: [],
    
    // 是否显示删除记录弹窗
    showDeleteRecords: false
  },

  lifetimes: {
    attached() {
      this.loadViolationList();
    }
  },

  methods: {
    /**
     * 加载违规论文列表
     */
    async loadViolationList(reset = false) {
      if (this.data.loading) return;
      
      if (reset) {
        this.setData({
          'pagination.page': 1,
          violationList: []
        });
      }
      
      this.setData({ loading: true });
      
      try {
        const db = wx.cloud.database();
        const _ = db.command;
        
        // 构建查询条件
        let where = {
          isViolation: true
        };
        
        if (this.data.filter.violationType !== 'all') {
          where.violationType = this.data.filter.violationType;
        }
        
        if (this.data.filter.status !== 'all') {
          where.violationStatus = this.data.filter.status;
        }
        
        if (this.data.filter.keyword) {
          where.title = db.RegExp({
            regexp: this.data.filter.keyword,
            options: 'i'
          });
        }
        
        if (this.data.filter.startDate && this.data.filter.endDate) {
          where.createTime = _.gte(new Date(this.data.filter.startDate))
            .and(_.lte(new Date(this.data.filter.endDate)));
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
          violationList: reset ? data : [...this.data.violationList, ...data],
          'pagination.total': countRes.total,
          'pagination.hasMore': data.length === this.data.pagination.pageSize,
          loading: false
        });
      } catch (error) {
        console.error('加载违规论文列表失败:', error);
        this.setData({ loading: false });
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
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
        this.loadViolationList(true);
      });
    },

    /**
     * 搜索
     */
    onSearch(e) {
      this.setData({
        'filter.keyword': e.detail.value
      }, () => {
        this.loadViolationList(true);
      });
    },

    /**
     * 选择/取消选择论文
     */
    toggleSelect(e) {
      const id = e.currentTarget.dataset.id;
      const selectedIds = this.data.selectedIds;
      const index = selectedIds.indexOf(id);
      
      if (index > -1) {
        selectedIds.splice(index, 1);
      } else {
        selectedIds.push(id);
      }
      
      this.setData({
        selectedIds,
        showBatchActions: selectedIds.length > 0
      });
    },

    /**
     * 全选/取消全选
     */
    toggleSelectAll() {
      if (this.data.selectedIds.length === this.data.violationList.length) {
        this.setData({
          selectedIds: [],
          showBatchActions: false
        });
      } else {
        const allIds = this.data.violationList.map(item => item._id);
        this.setData({
          selectedIds: allIds,
          showBatchActions: true
        });
      }
    },

    /**
     * 标记违规
     */
    markViolation(e) {
      const id = e.currentTarget.dataset.id;
      wx.showActionSheet({
        itemList: ['敏感内容', '不当言论', '版权问题', '垃圾信息', '其他违规'],
        success: (res) => {
          const types = ['sensitive_content', 'inappropriate_language', 'copyright_issue', 'spam', 'other'];
          this.updateViolationStatus(id, 'confirmed', types[res.tapIndex]);
        }
      });
    },

    /**
     * 删除论文（二次确认）
     */
    deletePaper(e) {
      const id = e.currentTarget.dataset.id;
      const paper = this.data.violationList.find(p => p._id === id);
      
      wx.showModal({
        title: '确认删除',
        content: `确定要删除论文"${paper.title}"吗？此操作不可恢复。`,
        confirmColor: '#dc2626',
        success: (res) => {
          if (res.confirm) {
            this.performDelete([id]);
          }
        }
      });
    },

    /**
     * 批量删除
     */
    batchDelete() {
      if (this.data.selectedIds.length === 0) return;
      
      wx.showModal({
        title: '确认批量删除',
        content: `确定要删除选中的 ${this.data.selectedIds.length} 篇论文吗？此操作不可恢复。`,
        confirmColor: '#dc2626',
        success: (res) => {
          if (res.confirm) {
            this.performDelete(this.data.selectedIds);
          }
        }
      });
    },

    /**
     * 执行删除操作
     */
    async performDelete(ids) {
      wx.showLoading({ title: '删除中...' });
      
      try {
        const db = wx.cloud.database();
        const deleteRecords = [];
        
        for (const id of ids) {
          // 获取论文信息
          const { data } = await db.collection('papers').doc(id).get();
          
          // 添加到删除记录
          deleteRecords.push({
            paperId: id,
            paperTitle: data.title,
            deletedBy: this.data.adminInfo.username,
            deletedAt: new Date(),
            reason: data.violationReason || '违规内容'
          });
          
          // 删除论文
          await db.collection('papers').doc(id).remove();
        }
        
        // 保存删除记录
        await db.collection('delete_records').add({
          data: deleteRecords
        });
        
        // 记录操作日志
        await this.addOperationLog('delete', `删除论文 ${ids.length} 篇`);
        
        wx.hideLoading();
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });
        
        this.setData({
          selectedIds: [],
          showBatchActions: false
        });
        
        this.loadViolationList(true);
      } catch (error) {
        wx.hideLoading();
        console.error('删除失败:', error);
        wx.showToast({
          title: '删除失败',
          icon: 'none'
        });
      }
    },

    /**
     * 查看删除记录
     */
    async viewDeleteRecords() {
      this.setData({ showDeleteRecords: true });
      
      try {
        const db = wx.cloud.database();
        const { data } = await db.collection('delete_records')
          .orderBy('deletedAt', 'desc')
          .limit(50)
          .get();
        
        this.setData({
          deleteRecords: data
        });
      } catch (error) {
        console.error('加载删除记录失败:', error);
      }
    },

    /**
     * 关闭删除记录弹窗
     */
    closeDeleteRecords() {
      this.setData({ showDeleteRecords: false });
    },

    /**
     * 更新违规状态
     */
    async updateViolationStatus(id, status, type) {
      try {
        const db = wx.cloud.database();
        await db.collection('papers').doc(id).update({
          data: {
            violationStatus: status,
            violationType: type,
            updatedAt: new Date(),
            updatedBy: this.data.adminInfo.username
          }
        });
        
        await this.addOperationLog('update', `标记违规: ${id}`);
        
        wx.showToast({
          title: '标记成功',
          icon: 'success'
        });
        
        this.loadViolationList(true);
      } catch (error) {
        console.error('更新失败:', error);
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      }
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
            module: 'violation',
            createTime: new Date()
          }
        });
      } catch (error) {
        console.error('记录操作日志失败:', error);
      }
    },

    /**
     * 加载更多
     */
    loadMore() {
      if (!this.data.pagination.hasMore || this.data.loading) return;
      
      this.setData({
        'pagination.page': this.data.pagination.page + 1
      }, () => {
        this.loadViolationList();
      });
    }
  }
});
