// pages/paper/paper.js
// 荒谬论文生成页面 - 集成AI对话功能

// 引入配置管理器
const configManager = require('../../utils/configManager');

Page({
  data: {
    // API配置相关
    apiKey: '',
    showSettingsModal: false,
    tempApiKey: '',

    // 页面状态
    isGenerating: false,
    generatedPaper: null,

    // agent-ui组件配置
    chatMode: 'model',
    agentConfig: {
      botId: '',
      allowUploadFile: false,
      allowWebSearch: false,
      allowPullRefresh: false,
      allowUploadImage: false,
      allowMultiConversation: false,
      allowVoice: false,
      showToolCallDetail: false,
      showBotName: false,
    },
    modelConfig: {
      modelProvider: 'deepseek',
      quickResponseModel: 'deepseek-chat',
      logo: '/assets/images/ai-avatar.png',
      welcomeMsg: '请输入论文主题，我将为您生成一篇荒谬学术论文',
    },

    // 是否显示聊天组件
    showChatComponent: false,

    // 论文主题输入
    paperTopic: '',
  },

  /**
   * 页面加载
   */
  onLoad(options) {
    console.log('[Paper Page] onLoad started');

    // 从本地存储加载API Key
    this.loadApiKeyFromStorage();

    console.log('[Paper Page] onLoad completed');
  },

  /**
   * 页面显示
   */
  onShow() {
    console.log('[Paper Page] onShow');
  },

  /**
   * 页面初次渲染完成
   */
  onReady() {
    console.log('[Paper Page] onReady');
  },

  /**
   * 从本地存储加载API Key
   */
  loadApiKeyFromStorage() {
    console.log('[Paper Page] loadApiKeyFromStorage');
    try {
      // 使用配置管理器获取API Key
      const apiKey = configManager.getApiKey();

      // 使用setData更新视图，确保页面显示正确的配置状态
      this.setData({
        apiKey: apiKey,
        showChatComponent: !!apiKey, // 如果已配置，显示聊天组件
      });
      console.log('[Paper Page] apiKey loaded:', apiKey ? '已配置' : '未配置');
    } catch (error) {
      console.error('[Paper Page] 加载API Key失败:', error);
    }
  },

  /**
   * 显示API配置对话框
   */
  showSettings() {
    console.log('[Paper Page] showSettings');
    this.setData({
      showSettingsModal: true,
      tempApiKey: this.data.apiKey || '',
    });
  },

  /**
   * 关闭配置对话框
   */
  closeSettings() {
    console.log('[Paper Page] closeSettings 被调用');
    console.log('[Paper Page] 关闭前 showSettingsModal:', this.data.showSettingsModal);

    this.setData({
      showSettingsModal: false,
    }, () => {
      console.log('[Paper Page] 关闭后 showSettingsModal:', this.data.showSettingsModal);
    });
  },

  /**
   * 阻止事件冒泡
   */
  preventBubble() {
    console.log('[Paper Page] preventBubble');
  },

  /**
   * 输入API Key
   */
  onApiKeyInput(e) {
    this.setData({ tempApiKey: e.detail.value });
  },

  /**
   * 保存API配置
   */
  saveSettings() {
    const { tempApiKey } = this.data;
    const trimmedKey = tempApiKey.trim();

    if (!trimmedKey) {
      wx.showToast({
        title: '请输入API Key',
        icon: 'none',
      });
      return;
    }

    // 验证API Key格式（DeepSeek Key通常以sk-开头）
    if (!trimmedKey.startsWith('sk-')) {
      wx.showModal({
        title: '格式警告',
        content: 'DeepSeek API Key通常以"sk-"开头，是否继续保存？',
        success: (res) => {
          if (res.confirm) {
            this.doSaveApiKey(trimmedKey);
          }
        },
      });
      return;
    }

    this.doSaveApiKey(trimmedKey);
  },

  /**
   * 执行保存API Key
   */
  doSaveApiKey(apiKey) {
    console.log('[Paper Page] doSaveApiKey 被调用');
    console.log('[Paper Page] 保存前 showSettingsModal:', this.data.showSettingsModal);

    try {
      // 使用配置管理器保存API Key
      const success = configManager.saveApiKey(apiKey);

      if (success) {
        console.log('[Paper Page] API Key已保存到本地存储');

        // 更新数据并关闭对话框
        this.setData({
          apiKey: apiKey,
          showSettingsModal: false,
        }, () => {
          console.log('[Paper Page] 保存后 showSettingsModal:', this.data.showSettingsModal);

          // 对话框关闭后再显示聊天组件
          setTimeout(() => {
            this.setData({
              showChatComponent: true,
            });
            console.log('[Paper Page] showChatComponent已设置为true');
          }, 300);
        });

        wx.showToast({
          title: '配置已保存',
          icon: 'success',
        });
      } else {
        throw new Error('保存失败');
      }
    } catch (error) {
      console.error('[Paper Page] 保存API Key失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'none',
      });
    }
  },

  /**
   * 快速生成论文
   */
  quickGenerate() {
    const { apiKey } = this.data;
    console.log('[Paper Page] quickGenerate, apiKey:', apiKey ? '已配置' : '未配置');

    if (!apiKey) {
      // 未配置API Key，显示配置对话框
      this.setData({
        showSettingsModal: true,
        tempApiKey: '',
      });
      return;
    }

    // 显示输入主题对话框
    wx.showModal({
      title: '生成论文',
      editable: true,
      placeholderText: '请输入荒谬论文主题（如：量子拖鞋对猫咪情绪的影响）',
      success: (res) => {
        if (res.confirm && res.content) {
          this.generatePaper(res.content);
        }
      },
    });
  },

  /**
   * 生成论文 - 使用工作流
   */
  async generatePaper(topic) {
    const { apiKey } = this.data;

    this.setData({ isGenerating: true });
    wx.showLoading({ title: '生成中...' });

    try {
      // 使用论文生成工作流
      const paperWorkflow = require('../../utils/paperWorkflow');
      
      const workflowResult = await paperWorkflow.execute(topic, {
        apiKey: apiKey
      });

      if (!workflowResult.success) {
        wx.hideLoading();
        this.setData({ isGenerating: false });
        
        wx.showModal({
          title: '生成失败',
          content: workflowResult.error.message || '论文生成失败',
          showCancel: false
        });
        return;
      }

      // 工作流成功，获取生成的论文
      const { data } = workflowResult;
      
      this.setData({
        generatedPaper: {
          title: data.title,
          content: data.content,
          createTime: new Date().toLocaleString(),
          metadata: data.metadata
        },
        isGenerating: false
      });

      wx.hideLoading();
      wx.showToast({
        title: '生成成功',
        icon: 'success',
      });

      // 保存到历史记录
      const paperId = this.saveToHistory(data.title, data.content);

      // 显示成功提示
      wx.showModal({
        title: '生成成功',
        content: '论文已生成，是否查看详情？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: `/pages/detail/detail?id=${paperId}`,
            });
          }
        },
      });

    } catch (error) {
      wx.hideLoading();
      this.setData({ isGenerating: false });
      console.error('生成论文失败:', error);
      wx.showModal({
        title: '生成失败',
        content: error.message || '请检查API Key是否正确',
        showCancel: false,
      });
    }
  },

  /**
   * 旧版生成论文（保留备用）
   */
  async generatePaperLegacy(topic) {
    const { apiKey } = this.data;

    this.setData({ isGenerating: true });
    wx.showLoading({ title: '生成中...' });

    try {
      // 调用DeepSeek API生成论文
      const response = await this.callDeepSeekAPI(topic, apiKey);

      this.setData({
        generatedPaper: {
          title: topic,
          content: response,
          createTime: new Date().toLocaleString(),
        },
      });

      wx.hideLoading();
      wx.showToast({
        title: '生成成功',
        icon: 'success',
      });

      // 保存到历史记录并获取id
      const paperId = this.saveToHistory(topic, response);

      // 显示成功提示，询问是否查看详情
      wx.showModal({
        title: '生成成功',
        content: '论文已生成，是否查看详情？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: `/pages/detail/detail?id=${paperId}`,
            });
          }
        },
      });

    } catch (error) {
      wx.hideLoading();
      console.error('生成论文失败:', error);
      wx.showModal({
        title: '生成失败',
        content: error.message || '请检查API Key是否正确',
        showCancel: false,
      });
    } finally {
      this.setData({ isGenerating: false });
    }
  },

  /**
   * 调用DeepSeek API
   */
  callDeepSeekAPI(topic, apiKey) {
    console.log('[Paper Page] 调用DeepSeek API');

    return new Promise((resolve, reject) => {
      const prompt = `请生成一篇荒谬但结构严谨的学术论文，主题："${topic}"。
要求：
1. 包含标题、摘要、关键词、引言、方法、结果、讨论、参考文献等完整学术结构
2. 内容要荒谬可笑但使用严肃的学术语言
3. 包含虚构的数据和图表描述
4. 引用不存在的学术文献
5. 字数控制在2000字左右`;

      wx.request({
        url: 'https://api.deepseek.com/v1/chat/completions',
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        data: {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是一位擅长写荒谬学术论文的AI助手，你能用严肃的学术语言写出内容荒谬可笑的论文。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.9,
          max_tokens: 3000,
        },
        success: (res) => {
          console.log('[Paper Page] API响应:', res.statusCode, res.data);
          if (res.statusCode === 200 && res.data.choices && res.data.choices[0]) {
            resolve(res.data.choices[0].message.content);
          } else {
            reject(new Error(res.data.error?.message || 'API调用失败'));
          }
        },
        fail: (err) => {
          console.error('[Paper Page] 请求失败:', err);
          reject(new Error('网络请求失败，请检查网络连接'));
        },
      });
    });
  },

  /**
   * 保存到历史记录
   * @returns {string} 返回保存的论文id
   */
  saveToHistory(title, content) {
    try {
      const paperId = Date.now().toString();
      let history = wx.getStorageSync('paper_history') || [];
      history.unshift({
        id: paperId,
        title,
        content,
        createTime: new Date().toLocaleString(),
      });
      // 只保留最近20篇
      if (history.length > 20) {
        history = history.slice(0, 20);
      }
      wx.setStorageSync('paper_history', history);
      console.log('[Paper Page] 论文已保存到历史记录, id:', paperId);
      return paperId;
    } catch (error) {
      console.error('[Paper Page] 保存历史记录失败:', error);
      return null;
    }
  },

  /**
   * 保存论文
   */
  savePaper() {
    const { generatedPaper } = this.data;
    if (!generatedPaper) {
      wx.showToast({
        title: '请先生成论文',
        icon: 'none',
      });
      return;
    }

    // 复制到剪贴板
    wx.setClipboardData({
      data: generatedPaper.content,
      success: () => {
        wx.showModal({
          title: '已复制',
          content: '论文内容已复制到剪贴板，您可以粘贴到其他地方保存',
          showCancel: false,
        });
      },
    });
  },

  /**
   * 查看历史记录
   */
  viewHistory() {
    wx.navigateTo({
      url: '/pages/logs/logs',
    });
  },

  /**
   * 查看论文详情
   */
  viewPaperDetail() {
    const { generatedPaper } = this.data;
    if (!generatedPaper) {
      wx.showToast({
        title: '请先生成论文',
        icon: 'none',
      });
      return;
    }

    // 从历史记录中找到最新保存的论文id
    try {
      const history = wx.getStorageSync('paper_history') || [];
      const latestPaper = history.find(item => item.title === generatedPaper.title);

      if (latestPaper && latestPaper.id) {
        wx.navigateTo({
          url: `/pages/detail/detail?id=${latestPaper.id}`,
        });
      } else {
        wx.showToast({
          title: '未找到论文记录',
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('[Paper Page] 查看详情失败:', error);
      wx.showToast({
        title: '查看详情失败',
        icon: 'none',
      });
    }
  },

  /**
   * 分享论文
   */
  onShareAppMessage() {
    const { generatedPaper } = this.data;
    return {
      title: generatedPaper?.title || '荒谬论文生成系统 - Nature Absurdity Edition',
      path: '/pages/paper/paper',
    };
  },

  /**
   * 强制显示对话框（调试用）
   */
  forceShowModal() {
    console.log('[Paper Page] 强制显示对话框');
    this.showSettingsSafe();
  },
});
