/**
 * 前置过滤系统 - 用户输入侧
 * 严格遵循设计规范 v1.0
 */

// 零宽度字符列表
const ZERO_WIDTH_CHARS = [
  '\u200B', // 零宽空格
  '\u200C', // 零宽非连接符
  '\u200D', // 零宽连接符
  '\uFEFF', // 零宽无断空格
  '\u2060', // 单词连接符
  '\u180E', // 蒙古文元音分隔符
];

// 特殊空格字符
const SPECIAL_SPACES = [
  '\u00A0', // 不间断空格
  '\u3000', // 全角空格
  '\u2000', // 半角空格
  '\u2001', // 全角空格
  '\u2002', // 半角空格
  '\u2003', // 全角空格
  '\u2004', // 三分之一空格
  '\u2005', // 四分之一空格
  '\u2006', // 六分之一空格
  '\u2007', // 数字空格
  '\u2008', // 标点空格
  '\u2009', // 窄空格
  '\u200A', // 超窄空格
];

// 风险部首列表（拆字检测用）
const RISK_RADICALS = [
  '尸', '歹', '亡', '死', '血', '杀', '刀', '匕'
];

// 同音字映射（简化版）
const HOMOPHONE_MAP = {
  '政': ['正', '证', '症'],
  '治': ['制', '质', '致'],
  '党': ['挡', '档', '荡'],
  '国': ['果', '裹', '过'],
  '杀': ['沙', '纱', '煞'],
  '死': ['四', '似', '寺'],
};

/**
 * 输入过滤器类
 */
class InputFilter {
  constructor() {
    this.maxLength = 200;
    this.minLength = 5;
    this.timeout = 300; // 300ms超时
  }

  /**
   * 主过滤函数
   * @param {String} input - 用户输入
   * @returns {Object} 过滤结果
   */
  filter(input) {
    const startTime = Date.now();
    
    // 1. 长度检查
    const lengthCheck = this.checkLength(input);
    if (!lengthCheck.valid) {
      return {
        valid: false,
        action: 'BLOCK',
        message: lengthCheck.message,
        filtered: ''
      };
    }

    // 2. 字符清洗
    let cleaned = this.cleanInput(input);
    
    // 3. 拆字/谐音检测
    const riskScore = this.calculateRiskScore(cleaned);
    
    // 4. 检查处理时间
    const processTime = Date.now() - startTime;
    if (processTime > this.timeout) {
      console.warn('[InputFilter] 处理超时:', processTime, 'ms');
    }

    // 5. 根据风险评分返回结果
    if (riskScore >= 80) {
      return {
        valid: false,
        action: 'BLOCK',
        message: this.getFriendlyPrompt(),
        filtered: cleaned,
        riskScore,
        reason: '高风险内容'
      };
    }

    if (riskScore >= 50) {
      return {
        valid: true,
        action: 'WARN',
        message: this.getFriendlyPrompt(),
        filtered: cleaned,
        riskScore,
        reason: '中风险内容'
      };
    }

    return {
      valid: true,
      action: 'PASS',
      message: '',
      filtered: cleaned,
      riskScore,
      reason: '正常'
    };
  }

  /**
   * 长度检查
   */
  checkLength(input) {
    if (!input || input.length === 0) {
      return {
        valid: false,
        message: '请输入内容'
      };
    }

    if (input.length < this.minLength) {
      return {
        valid: false,
        message: `输入太短了，至少需要${this.minLength}个字符`
      };
    }

    if (input.length > this.maxLength) {
      return {
        valid: false,
        message: `输入太长了，最多${this.maxLength}个字符`
      };
    }

    return { valid: true };
  }

  /**
   * 字符清洗
   */
  cleanInput(input) {
    let cleaned = input;

    // 1. 移除零宽度字符
    ZERO_WIDTH_CHARS.forEach(char => {
      cleaned = cleaned.split(char).join('');
    });

    // 2. 移除emoji
    cleaned = this.removeEmoji(cleaned);

    // 3. 标准化特殊空格
    SPECIAL_SPACES.forEach(space => {
      cleaned = cleaned.split(space).join(' ');
    });

    // 4. 清理特殊Unicode字符
    cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

    // 5. 规范化连续空格
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  }

  /**
   * 移除emoji
   */
  removeEmoji(text) {
    // 匹配emoji的正则表达式
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{FE0F}]/gu;
    
    return text.replace(emojiRegex, '');
  }

  /**
   * 计算风险评分
   */
  calculateRiskScore(text) {
    let score = 0;

    // 1. 拆字检测（风险部首）
    const radicalScore = this.checkRadicals(text);
    score += radicalScore;

    // 2. 谐音替换检测
    const homophoneScore = this.checkHomophones(text);
    score += homophoneScore;

    // 3. 异常字符密度检测
    const densityScore = this.checkCharDensity(text);
    score += densityScore;

    // 4. 重复字符检测（可能用于绕过）
    const repeatScore = this.checkRepeatedChars(text);
    score += repeatScore;

    return Math.min(score, 100); // 最高100分
  }

  /**
   * 检查风险部首
   */
  checkRadicals(text) {
    let score = 0;
    let foundRadicals = [];

    for (const radical of RISK_RADICALS) {
      const count = (text.match(new RegExp(radical, 'g')) || []).length;
      if (count > 0) {
        foundRadicals.push(radical);
        score += count * 5; // 每个风险部首+5分
      }
    }

    // 如果同时出现多个不同风险部首，额外加分
    if (foundRadicals.length >= 2) {
      score += foundRadicals.length * 10;
    }

    return Math.min(score, 40); // 最高40分
  }

  /**
   * 检查谐音替换
   */
  checkHomophones(text) {
    let score = 0;
    let homophoneCount = 0;

    for (const [original, variants] of Object.entries(HOMOPHONE_MAP)) {
      for (const variant of variants) {
        if (text.includes(variant)) {
          homophoneCount++;
          score += 8; // 每个谐音替换+8分
        }
      }
    }

    // 如果连续出现多个谐音替换，额外加分
    if (homophoneCount >= 3) {
      score += homophoneCount * 5;
    }

    return Math.min(score, 35); // 最高35分
  }

  /**
   * 检查字符密度异常
   */
  checkCharDensity(text) {
    const totalChars = text.length;
    
    // 检查标点符号密度
    const punctuationCount = (text.match(/[，。？！；：""''（）【】]/g) || []).length;
    const punctuationRatio = punctuationCount / totalChars;
    
    if (punctuationRatio > 0.3) {
      return 15; // 标点过多
    }

    // 检查数字密度
    const numberCount = (text.match(/\d/g) || []).length;
    const numberRatio = numberCount / totalChars;
    
    if (numberRatio > 0.4) {
      return 10; // 数字过多
    }

    return 0;
  }

  /**
   * 检查重复字符（可能用于绕过）
   */
  checkRepeatedChars(text) {
    // 检查连续重复3次以上的字符
    const repeatMatches = text.match(/(.)\1{2,}/g);
    if (repeatMatches) {
      return Math.min(repeatMatches.length * 5, 20);
    }
    return 0;
  }

  /**
   * 获取友好提示语
   */
  getFriendlyPrompt() {
    const prompts = [
      '我懂你的意思，我会用更体面的说法来表达。',
      '换个角度思考，我们可以用更有趣的方式表达。',
      '这个思路不错，让我用更学术的方式来呈现。',
      '理解你的想法，我会用更专业的术语来阐述。',
    ];
    
    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  /**
   * 实时检测（用于输入时检查）
   */
  realtimeCheck(input) {
    // 快速长度检查
    if (!input || input.length < 3) {
      return { status: 'normal', message: '' };
    }

    // 快速清洗
    const cleaned = this.cleanInput(input);
    
    // 快速风险评分（简化版）
    let quickScore = 0;
    
    // 只检查最明显的风险信号
    for (const radical of RISK_RADICALS.slice(0, 4)) {
      if (cleaned.includes(radical)) {
        quickScore += 10;
      }
    }

    if (quickScore >= 20) {
      return {
        status: 'warning',
        message: '检测到特殊字符组合'
      };
    }

    return { status: 'normal', message: '' };
  }
}

// 创建单例
const inputFilter = new InputFilter();

module.exports = inputFilter;
