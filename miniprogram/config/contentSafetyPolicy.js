/**
 * 内容安全审核策略配置文件
 * 核心安全规范 - 必须严格执行
 * 
 * 制定日期: 2024
 * 版本: v1.0
 * 适用范围: 所有用户生成内容(UGC)
 */

// ============================================
// 一、绝对禁止内容范畴（零容忍原则）
// ============================================

const ZERO_TOLERANCE_CATEGORIES = {
  // 1. 真实社会敏感事件
  SOCIAL_EVENTS: {
    description: '涉及真实社会敏感事件的任何表述与讨论',
    level: 5, // 最高危险等级
    action: 'BLOCK', // 立即阻断
    keywords: [
      // 政治敏感
      '政治事件', '社会运动', '群体性事件', '示威', '抗议',
      // 真实灾难（具体事件名称）
      // 注：这里需要定期更新，避免列出具体事件造成二次伤害
    ],
    semanticRules: [
      '禁止讨论当前真实发生的政治事件',
      '禁止传播未经证实的社会谣言',
      '禁止煽动群体性对立情绪'
    ]
  },

  // 2. 真实灾难相关
  REAL_DISASTERS: {
    description: '与真实灾难相关的描述、评论及引申内容',
    level: 5,
    action: 'BLOCK',
    keywords: [
      // 真实灾难中的具体伤亡数字（示例，实际需要更完善）
      // 注：避免使用真实灾难中的敏感数字
    ],
    semanticRules: [
      '禁止消费真实灾难中的受害者',
      '禁止对真实灾难进行不当调侃',
      '禁止传播灾难现场的恐怖细节'
    ]
  },

  // 3. 违法违规鼓励
  ILLEGAL_ACTIVITIES: {
    description: '任何形式的违法违规行为鼓励或指导',
    level: 5,
    action: 'BLOCK',
    keywords: [
      '违法', '犯罪', '作案', '逃避法律', '钻法律空子',
      '黑客', '入侵', '攻击', '破坏', '窃取',
      '伪造', '假冒', '欺诈', '骗', '诈',
      '毒品', '吸毒', '贩毒', '制毒',
      '赌博', '博彩', '赌局', '庄家',
      '武器', '枪支', '弹药', '爆炸物',
      '走私', '偷渡', '人口贩卖'
    ],
    semanticRules: [
      '禁止提供任何违法行为的操作指南',
      '禁止美化或浪漫化犯罪行为',
      '禁止分享规避法律监管的方法'
    ]
  },

  // 4. 自残自伤诱导
  SELF_HARM: {
    description: '自残、自伤行为的诱导或美化内容',
    level: 5,
    action: 'BLOCK',
    keywords: [
      '自杀', '自残', '自伤', '自虐',
      '结束生命', '不想活', '死了算了',
      '割腕', '跳楼', '上吊', '服毒',
      '教唆自杀', '鼓励自杀', '美化自杀'
    ],
    semanticRules: [
      '禁止描述自残的具体方法',
      '禁止美化或浪漫化自杀行为',
      '禁止诱导他人产生自伤念头',
      '发现自杀倾向内容必须立即拦截并提示求助热线'
    ]
  },

  // 5. 歧视性言论
  DISCRIMINATION: {
    description: '基于种族、性别、地域、宗教等的歧视性言论',
    level: 4,
    action: 'BLOCK',
    keywords: [
      // 种族歧视
      '种族歧视', '种族优越', '种族清洗',
      // 性别歧视
      '性别歧视', '男尊女卑', '女尊男卑', '厌女', '厌男',
      // 地域歧视
      '地域黑', '地域歧视', '地图炮',
      // 宗教歧视
      '宗教歧视', '宗教攻击', '邪教',
      // 其他歧视
      '年龄歧视', '职业歧视', '学历歧视', '身份歧视'
    ],
    semanticRules: [
      '禁止针对特定群体的攻击性言论',
      '禁止传播刻板印象和偏见',
      '禁止煽动群体对立和仇恨'
    ]
  },

  // 6. 色情低俗内容
  PORNOGRAPHY: {
    description: '含有性暗示、色情描述或低俗性相关内容',
    level: 4,
    action: 'BLOCK',
    keywords: [
      '色情', '淫秽', '猥亵', '性暗示',
      '性行为', '性描写', '性器官',
      '嫖娼', '卖淫', '性交易', '性服务',
      '裸聊', '裸照', '偷拍', '走光',
      '约炮', '一夜情', '性伴侣', '乱伦',
      '强奸', '性骚扰', '性侵犯', '性暴力'
    ],
    semanticRules: [
      '禁止露骨的性描写',
      '禁止性暗示的隐喻和双关',
      '禁止传播色情内容',
      '禁止性化未成年人'
    ]
  }
};

// ============================================
// 二、内容创作核心准则
// ============================================

const CONTENT_CREATION_GUIDELINES = {
  // 允许的荒谬性表达手法
  ALLOWED_TECHNIQUES: {
    description: '价值逻辑的荒谬性表达 - 推荐手法',
    examples: [
      {
        technique: '逻辑谬误',
        description: '使用错误的推理方式得出荒谬结论',
        example: '因为猫有九条命，所以猫可以承受九次核爆炸'
      },
      {
        technique: '概念混淆',
        description: '将不相关的概念强行关联',
        example: '量子力学与泡面的烹饪时间的关系研究'
      },
      {
        technique: '认知偏差',
        description: '利用人类的认知偏差制造荒谬效果',
        example: '确认偏误导致的荒谬结论'
      },
      {
        technique: '夸张类比',
        description: '将事物夸张到荒谬的程度',
        example: '如果蚂蚁拥有人类的智慧，它们会建立怎样的文明'
      },
      {
        technique: '反事实推理',
        description: '基于不可能的前提进行逻辑推演',
        example: '如果时间可以倒流，咖啡会不会自己回到杯子里'
      }
    ]
  },

  // 禁止的内容低俗化手法
  PROHIBITED_TECHNIQUES: {
    description: '依赖内容的低俗化 - 严格禁止',
    examples: [
      {
        technique: '粗俗语言',
        description: '使用脏话、粗口获取效果',
        action: 'BLOCK'
      },
      {
        technique: '生理排泄物玩笑',
        description: '以排泄物为噱头的低俗内容',
        action: 'BLOCK'
      },
      {
        technique: '身体部位恶搞',
        description: '不当使用身体部位制造笑料',
        action: 'BLOCK'
      },
      {
        technique: '性暗示幽默',
        description: '通过性暗示获取关注',
        action: 'BLOCK'
      },
      {
        technique: '恶意模仿残障',
        description: '模仿或嘲笑残障人士',
        action: 'BLOCK'
      }
    ]
  }
};

// ============================================
// 三、审核等级与处理策略
// ============================================

const REVIEW_LEVELS = {
  // 等级 1: 提示级
  LEVEL_1: {
    name: '提示',
    description: '轻微敏感，建议修改',
    action: 'WARN',
    color: '#FFC107',
    autoPublish: true,
    requireReview: false,
    notification: '内容包含轻微敏感词汇，建议优化表达'
  },

  // 等级 2: 警告级
  LEVEL_2: {
    name: '警告',
    description: '中度敏感，需要审核',
    action: 'REVIEW',
    color: '#FF9800',
    autoPublish: false,
    requireReview: true,
    notification: '内容需要人工审核后才能发布'
  },

  // 等级 3: 拦截级
  LEVEL_3: {
    name: '拦截',
    description: '高度敏感，禁止发布',
    action: 'BLOCK',
    color: '#F44336',
    autoPublish: false,
    requireReview: true,
    notification: '内容违反社区规范，禁止发布',
    recordLog: true
  },

  // 等级 4: 严重违规
  LEVEL_4: {
    name: '严重违规',
    description: '严重违反安全策略',
    action: 'BLOCK_AND_RECORD',
    color: '#D32F2F',
    autoPublish: false,
    requireReview: true,
    notification: '内容严重违规，已被拦截并记录',
    recordLog: true,
    alertAdmin: true
  },

  // 等级 5: 零容忍
  LEVEL_5: {
    name: '零容忍',
    description: '触碰安全生死线',
    action: 'BLOCK_AND_BAN',
    color: '#B71C1C',
    autoPublish: false,
    requireReview: true,
    notification: '内容违反安全底线，已被永久封禁',
    recordLog: true,
    alertAdmin: true,
    banUser: true
  }
};

// ============================================
// 四、审核日志与追溯机制
// ============================================

const AUDIT_LOG_CONFIG = {
  // 日志记录级别
  LOG_LEVELS: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'],

  // 必须记录的字段
  REQUIRED_FIELDS: [
    'timestamp',        // 时间戳
    'userId',          // 用户ID
    'contentId',       // 内容ID
    'contentType',     // 内容类型
    'contentHash',     // 内容哈希（用于追溯）
    'detectionResult', // 检测结果
    'actionTaken',     // 采取的行动
    'reviewerId',      // 审核员ID（人工审核时）
    'ipAddress',       // IP地址
    'deviceInfo'       // 设备信息
  ],

  // 日志保留策略
  RETENTION_POLICY: {
    LEVEL_1: 30,   // 30天
    LEVEL_2: 90,   // 90天
    LEVEL_3: 180,  // 180天
    LEVEL_4: 365,  // 1年
    LEVEL_5: 1095  // 3年
  },

  // 定期复盘配置
  REVIEW_SCHEDULE: {
    daily: '每日审核统计报告',
    weekly: '每周审核案例分析',
    monthly: '每月审核策略优化会议'
  }
};

// ============================================
// 五、内容审核流程
// ============================================

const AUDIT_WORKFLOW = {
  // 步骤1: 机器预检
  STEP_1_MACHINE_PRECHECK: {
    description: '机器自动检测敏感词',
    tools: ['DFA敏感词检测', '语义分析', '图像识别'],
    timeout: 2000, // 2秒超时
    nextStep: (result) => {
      if (result.level >= 4) return 'BLOCK';
      if (result.level >= 2) return 'MANUAL_REVIEW';
      return 'AUTO_PUBLISH';
    }
  },

  // 步骤2: 人工审核
  STEP_2_MANUAL_REVIEW: {
    description: '人工审核可疑内容',
    sla: 24 * 60 * 60 * 1000, // 24小时SLA
    reviewers: ['初级审核员', '高级审核员', '专家审核员'],
    escalation: true // 支持升级
  },

  // 步骤3: 发布或拦截
  STEP_3_FINAL_DECISION: {
    description: '最终决策',
    actions: ['PUBLISH', 'REJECT', 'MODIFY']
  },

  // 步骤4: 事后抽查
  STEP_4_POST_AUDIT: {
    description: '已发布内容事后抽查',
    sampleRate: 0.05, // 5%抽查率
    frequency: 'DAILY'
  }
};

// ============================================
// 六、用户申诉机制
// ============================================

const APPEAL_MECHANISM = {
  // 申诉条件
  ELIGIBILITY: {
    maxAppealsPerContent: 2,     // 每条内容最多申诉2次
    appealWindow: 7 * 24 * 60 * 60 * 1000, // 7天内可申诉
    minInterval: 24 * 60 * 60 * 1000       // 每次申诉间隔至少24小时
  },

  // 申诉流程
  PROCESS: {
    step1: '用户提交申诉理由',
    step2: '系统分配复审员',
    step3: '复审员独立审核',
    step4: '给出最终结论',
    step5: '通知用户结果'
  },

  // 申诉结果
  OUTCOMES: {
    UPHELD: '维持原判',
    OVERTURNED: '推翻原判，恢复内容',
    MODIFIED: '修改后通过'
  }
};

// ============================================
// 导出配置
// ============================================

module.exports = {
  ZERO_TOLERANCE_CATEGORIES,
  CONTENT_CREATION_GUIDELINES,
  REVIEW_LEVELS,
  AUDIT_LOG_CONFIG,
  AUDIT_WORKFLOW,
  APPEAL_MECHANISM,

  // 辅助函数：获取处理策略
  getActionStrategy(level) {
    return REVIEW_LEVELS[`LEVEL_${level}`] || REVIEW_LEVELS.LEVEL_1;
  },

  // 辅助函数：检查是否零容忍
  isZeroTolerance(category) {
    const cat = ZERO_TOLERANCE_CATEGORIES[category];
    return cat && cat.level === 5;
  },

  // 辅助函数：获取所有敏感词
  getAllSensitiveWords() {
    const words = [];
    Object.values(ZERO_TOLERANCE_CATEGORIES).forEach(category => {
      if (category.keywords) {
        words.push(...category.keywords.map(word => ({
          word,
          type: category.description,
          level: category.level,
          action: category.action
        })));
      }
    });
    return words;
  }
};
