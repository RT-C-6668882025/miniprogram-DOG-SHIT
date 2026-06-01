// cloudfunctions/initDatabase/index.js
// 初始化云数据库集合

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

/**
 * 创建集合（如果不存在）
 */
async function createCollectionIfNotExists(collectionName) {
  try {
    await db.createCollection(collectionName);
    console.log(`集合 ${collectionName} 创建成功`);
    return true;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`集合 ${collectionName} 已存在`);
      return true;
    }
    console.error(`创建集合 ${collectionName} 失败:`, error);
    return false;
  }
}

/**
 * 初始化敏感词集合
 */
async function initSensitiveWordsCollection() {
  const success = await createCollectionIfNotExists('sensitive_words');
  if (!success) return false;

  // 添加默认敏感词
  const defaultWords = [
    { word: '暴力', type: 'violence', level: 3, enabled: true },
    { word: '色情', type: 'porn', level: 5, enabled: true },
    { word: '赌博', type: 'gambling', level: 4, enabled: true },
    { word: '毒品', type: 'drugs', level: 5, enabled: true },
    { word: '诈骗', type: 'fraud', level: 4, enabled: true }
  ];

  try {
    for (const word of defaultWords) {
      // 检查是否已存在
      const { data } = await db.collection('sensitive_words')
        .where({ word: word.word })
        .get();

      if (data.length === 0) {
        await db.collection('sensitive_words').add({
          data: {
            ...word,
            createTime: new Date()
          }
        });
        console.log(`添加敏感词: ${word.word}`);
      }
    }
    return true;
  } catch (error) {
    console.error('添加默认敏感词失败:', error);
    return false;
  }
}

/**
 * 初始化管理员集合
 */
async function initAdminsCollection() {
  const success = await createCollectionIfNotExists('admins');
  if (!success) return false;

  // 创建索引
  try {
    await db.collection('admins').createIndex({
      data: {
        username: 1
      },
      unique: true
    });
    console.log('admins 集合索引创建成功');
  } catch (error) {
    console.log('索引可能已存在:', error.message);
  }

  return true;
}

/**
 * 初始化其他集合
 */
async function initOtherCollections() {
  const collections = [
    'sensitive_word_hits',
    'admin_logs',
    'operation_logs',
    'score_adjustments',
    'delete_records'
  ];

  for (const collectionName of collections) {
    await createCollectionIfNotExists(collectionName);
  }

  return true;
}

// 云函数入口
exports.main = async (event, context) => {
  const { action } = event;

  try {
    switch (action) {
      case 'sensitive_words':
        await initSensitiveWordsCollection();
        return {
          success: true,
          message: '敏感词集合初始化完成'
        };

      case 'admins':
        await initAdminsCollection();
        return {
          success: true,
          message: '管理员集合初始化完成'
        };

      case 'all':
      default:
        await initSensitiveWordsCollection();
        await initAdminsCollection();
        await initOtherCollections();
        return {
          success: true,
          message: '所有集合初始化完成'
        };
    }
  } catch (error) {
    console.error('初始化失败:', error);
    return {
      success: false,
      message: error.message
    };
  }
};
