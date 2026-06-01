// 云数据库集合配置
// 定义后台管理系统所需的数据库结构

const collections = {
  // 管理员集合
  admins: {
    fields: {
      username: String,      // 用户名
      password: String,      // 加密密码
      role: String,          // 角色: super_admin, admin, operator
      permissions: Array,    // 权限列表
      status: String,        // 状态: active, disabled
      lastLoginAt: Date,     // 最后登录时间
      lastLoginIp: String,   // 最后登录IP
      createdAt: Date,       // 创建时间
      updatedAt: Date        // 更新时间
    },
    indexes: [
      { fields: { username: 1 }, unique: true },
      { fields: { role: 1 } },
      { fields: { status: 1 } }
    ]
  },

  // 论文集合（扩展字段）
  papers: {
    fields: {
      // 基础字段...
      isViolation: Boolean,      // 是否违规
      violationType: String,     // 违规类型
      violationReason: String,   // 违规原因
      violationStatus: String,   // 违规处理状态
      
      // 评分相关
      autoScore: Object,         // 自动评分
      manualScore: Object,       // 人工调整评分
      scoreAdjusted: Boolean,    // 是否调整过
      adjustedBy: String,        // 调整人
      adjustedAt: Date,          // 调整时间
      adjustmentReason: String,  // 调整原因
      
      // 排行榜相关
      rankingWeight: Number,     // 排行榜权重
      isPinned: Boolean,         // 是否置顶
      isHidden: Boolean,         // 是否隐藏
      rankingOrder: Number,      // 排序序号
      
      // 审核相关
      reviewStatus: String,      // 审核状态
      reviewedBy: String,        // 审核人
      reviewedAt: Date,          // 审核时间
      reviewComment: String      // 审核意见
    }
  },

  // 敏感词集合
  sensitiveWords: {
    fields: {
      word: String,          // 敏感词
      type: String,          // 类型: political, porn, violence, spam, custom
      level: Number,         // 级别: 1-5
      enabled: Boolean,      // 是否启用
      createdBy: String,     // 创建人
      createdAt: Date,       // 创建时间
      updatedAt: Date        // 更新时间
    },
    indexes: [
      { fields: { word: 1 }, unique: true },
      { fields: { type: 1 } },
      { fields: { enabled: 1 } }
    ]
  },

  // 敏感词命中记录
  sensitiveWordHits: {
    fields: {
      paperId: String,       // 论文ID
      paperTitle: String,    // 论文标题
      word: String,          // 命中的敏感词
      type: String,          // 敏感词类型
      context: String,       // 上下文
      position: String,      // 位置: title, abstract, content
      handled: Boolean,      // 是否已处理
      handledBy: String,     // 处理人
      handledAt: Date,       // 处理时间
      createdAt: Date        // 创建时间
    },
    indexes: [
      { fields: { paperId: 1 } },
      { fields: { word: 1 } },
      { fields: { handled: 1 } }
    ]
  },

  // 提示词集合
  systemPrompts: {
    fields: {
      name: String,          // 提示词名称
      scene: String,         // 应用场景
      content: String,       // 提示词内容
      version: Number,       // 版本号
      status: String,        // 状态: draft, pending, approved, rejected
      enabled: Boolean,      // 是否启用
      createdBy: String,     // 创建人
      approvedBy: String,    // 审批人
      approvedAt: Date,      // 审批时间
      createdAt: Date,       // 创建时间
      updatedAt: Date,       // 更新时间
      history: Array         // 历史版本
    },
    indexes: [
      { fields: { scene: 1 } },
      { fields: { status: 1 } },
      { fields: { enabled: 1 } }
    ]
  },

  // 删除记录
  deleteRecords: {
    fields: {
      paperId: String,       // 论文ID
      paperTitle: String,    // 论文标题
      deletedBy: String,     // 删除人
      deletedAt: Date,       // 删除时间
      reason: String,        // 删除原因
      operatorId: String     // 操作人ID
    },
    indexes: [
      { fields: { deletedAt: -1 } },
      { fields: { deletedBy: 1 } }
    ]
  },

  // 操作日志
  operationLogs: {
    fields: {
      type: String,          // 操作类型
      description: String,   // 操作描述
      operator: String,      // 操作人用户名
      operatorId: String,    // 操作人ID
      module: String,        // 所属模块
      details: Object,       // 详细信息
      ip: String,            // 操作IP
      userAgent: String,     // 用户代理
      createTime: Date       // 创建时间
    },
    indexes: [
      { fields: { createTime: -1 } },
      { fields: { operatorId: 1 } },
      { fields: { module: 1 } },
      { fields: { type: 1 } }
    ]
  },

  // 排行榜配置
  rankingConfig: {
    fields: {
      name: String,          // 配置名称
      type: String,          // 类型: daily, weekly, monthly, all
      sortBy: String,        // 排序字段
      sortOrder: String,     // 排序方式: asc, desc
      filter: Object,        // 筛选条件
      limit: Number,         // 显示数量
      updateFrequency: String, // 更新频率
      enabled: Boolean,      // 是否启用
      createdBy: String,     // 创建人
      createdAt: Date,       // 创建时间
      updatedAt: Date        // 更新时间
    }
  }
};

module.exports = collections;
