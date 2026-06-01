// cloudfunctions/verifyAdmin/index.js
// 管理员身份验证云函数

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

/**
 * 验证管理员身份
 * @param {String} openId - 用户OpenID
 * @returns {Promise<Object>} 验证结果
 */
async function verifyAdmin(openId) {
  try {
    // 从数据库查询管理员信息
    const { data } = await db.collection('admins')
      .where({
        openId: openId,
        status: 'active'
      })
      .limit(1)
      .get();

    if (data.length === 0) {
      return {
        isAdmin: false,
        message: '未找到管理员信息'
      };
    }

    const admin = data[0];

    // 更新最后登录时间
    await db.collection('admins').doc(admin._id).update({
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: '', // 云函数中无法直接获取IP
        loginCount: db.command.inc(1)
      }
    });

    // 记录登录日志
    await db.collection('admin_logs').add({
      data: {
        type: 'login',
        adminId: admin._id,
        openId: openId,
        action: '管理员登录',
        createTime: new Date()
      }
    });

    return {
      isAdmin: true,
      role: admin.role,
      permissions: admin.permissions || [],
      username: admin.username
    };
  } catch (error) {
    console.error('验证管理员失败:', error);
    return {
      isAdmin: false,
      message: '验证失败'
    };
  }
}

/**
 * 验证管理员权限（二次验证）
 * @param {String} openId - OpenID
 * @param {String} permission - 权限标识
 * @returns {Promise<Boolean>}
 */
async function checkPermission(openId, permission) {
  try {
    const { data } = await db.collection('admins')
      .where({
        openId: openId,
        status: 'active'
      })
      .limit(1)
      .get();

    if (data.length === 0) {
      return false;
    }

    const admin = data[0];

    // 超级管理员拥有所有权限
    if (admin.role === 'super_admin') {
      return true;
    }

    return admin.permissions && admin.permissions.includes(permission);
  } catch (error) {
    console.error('权限检查失败:', error);
    return false;
  }
}

// 云函数入口
exports.main = async (event, context) => {
  const { openId, action, permission } = event;

  // 参数验证
  if (!openId) {
    return {
      success: false,
      message: '缺少openId参数'
    };
  }

  try {
    switch (action) {
      case 'checkPermission':
        // 二次权限验证
        const hasPermission = await checkPermission(openId, permission);
        return {
          success: true,
          hasPermission
        };

      case 'verify':
      default:
        // 默认进行身份验证
        return await verifyAdmin(openId);
    }
  } catch (error) {
    console.error('云函数执行失败:', error);
    return {
      success: false,
      message: '服务器错误'
    };
  }
};
