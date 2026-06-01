// utils/iconManager.js
// 图标资源管理工具 - 用于统一管理图标资源

// 图标映射表（对应CSV配置）
const ICON_MAP = {
  // 主要功能图标
  paper: { name: 'paper', char: '\ue900', color: '#2196F3' },
  ranking: { name: 'ranking', char: '\ue901', color: '#FF9800' },
  search: { name: 'search', char: '\ue902', color: '#607D8B' },
  chat: { name: 'chat', char: '\ue903', color: '#00BCD4' },
  log: { name: 'log', char: '\ue904', color: '#795548' },
  settings: { name: 'settings', char: '\ue905', color: '#607D8B' },
  
  // 操作图标
  warning: { name: 'warning', char: '\ue906', color: '#FF5722' },
  add: { name: 'add', char: '\ue907', color: '#4CAF50' },
  refresh: { name: 'refresh', char: '\ue908', color: '#2196F3' },
  delete: { name: 'delete', char: '\ue909', color: '#F44336' },
  close: { name: 'close', char: '\ue90a', color: '#9E9E9E' },
  edit: { name: 'edit', char: '\ue90b', color: '#2196F3' },
  view: { name: 'view', char: '\ue90c', color: '#607D8B' },
  logout: { name: 'logout', char: '\ue90d', color: '#F44336' },
  
  // 状态图标
  idea: { name: 'idea', char: '\ue90e', color: '#FFC107' },
  key: { name: 'key', char: '\ue90f', color: '#FF9800' },
  sparkle: { name: 'sparkle', char: '\ue910', color: '#FFD700' },
  pdf: { name: 'pdf', char: '\ue911', color: '#F44336' },
  share: { name: 'share', char: '\ue912', color: '#4CAF50' },
  image: { name: 'image', char: '\ue913', color: '#9C27B0' },
  
  // 业务图标
  forbidden: { name: 'forbidden', char: '\ue914', color: '#F44336' },
  star: { name: 'star', char: '\ue915', color: '#FF9800' },
  construction: { name: 'construction', char: '\ue916', color: '#FF9800' },
  empty: { name: 'empty', char: '\ue917', color: '#BDBDBD' },
  thinking: { name: 'thinking', char: '\ue918', color: '#9C27B0' },
  error: { name: 'error', char: '\ue919', color: '#F44336' },
  success: { name: 'success', char: '\ue91a', color: '#4CAF50' },
  info: { name: 'info', char: '\ue91b', color: '#2196F3' },
};

/**
 * 图标管理器类
 */
class IconManager {
  constructor() {
    this.icons = ICON_MAP;
    this.cache = new Map();
  }

  /**
   * 获取图标
   * @param {string} name - 图标名称
   * @param {Object} options - 配置选项
   * @returns {Object} 图标对象
   */
  get(name, options = {}) {
    const icon = this.icons[name];
    if (!icon) {
      console.warn(`[IconManager] 图标不存在: ${name}`);
      return null;
    }

    return {
      ...icon,
      size: options.size || 24,
      color: options.color || icon.color,
      className: options.className || '',
    };
  }

  /**
   * 获取图标字符
   * @param {string} name - 图标名称
   * @returns {string} 图标字符
   */
  getChar(name) {
    const icon = this.icons[name];
    return icon ? icon.char : '';
  }

  /**
   * 获取图标颜色
   * @param {string} name - 图标名称
   * @returns {string} 图标默认颜色
   */
  getColor(name) {
    const icon = this.icons[name];
    return icon ? icon.color : '#666';
  }

  /**
   * 批量获取图标
   * @param {Array<string>} names - 图标名称数组
   * @returns {Object} 图标映射对象
   */
  getBatch(names) {
    const result = {};
    names.forEach(name => {
      result[name] = this.get(name);
    });
    return result;
  }

  /**
   * 获取所有图标
   * @returns {Object} 所有图标
   */
  getAll() {
    return { ...this.icons };
  }

  /**
   * 检查图标是否存在
   * @param {string} name - 图标名称
   * @returns {boolean} 是否存在
   */
  has(name) {
    return !!this.icons[name];
  }

  /**
   * 注册自定义图标
   * @param {string} name - 图标名称
   * @param {Object} config - 图标配置
   */
  register(name, config) {
    this.icons[name] = {
      name,
      char: config.char || '\ue900',
      color: config.color || '#666',
      ...config,
    };
  }
}

// 创建单例
const iconManager = new IconManager();

module.exports = iconManager;
