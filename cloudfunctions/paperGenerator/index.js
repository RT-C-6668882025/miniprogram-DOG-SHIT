// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 云函数入口函数
exports.main = async (event, context) => {
  const { topic, apiKey } = event;

  if (!topic || !apiKey) {
    return {
      success: false,
      error: '缺少必要参数'
    };
  }

  const prompt = `请生成一篇荒谬但结构严谨的学术论文，主题："${topic}"。
要求：
1. 包含标题、摘要、关键词、引言、方法、结果、讨论、参考文献等完整学术结构
2. 内容要荒谬可笑但使用严肃的学术语言
3. 包含虚构的数据和图表描述
4. 引用不存在的学术文献
5. 字数控制在2000字左右`;

  try {
    const response = await cloud.openapi.request({
      method: 'POST',
      url: 'https://api.deepseek.com/v1/chat/completions',
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
      }
    });

    if (response.data && response.data.choices && response.data.choices[0]) {
      return {
        success: true,
        content: response.data.choices[0].message.content
      };
    } else {
      return {
        success: false,
        error: 'API返回数据格式错误'
      };
    }
  } catch (error) {
    console.error('调用DeepSeek API失败:', error);
    return {
      success: false,
      error: error.message || '网络请求失败'
    };
  }
};
