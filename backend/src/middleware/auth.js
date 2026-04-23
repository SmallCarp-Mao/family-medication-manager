// 认证中间件 - 验证 JWT Token
const { verifyToken, extractToken } = require('../utils/jwt');
const prisma = require('../utils/prisma');

/**
 * 验证用户身份
 */
async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }

    // 验证 Token
    const decoded = verifyToken(token);

    // 从数据库获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        family: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }

    // 将用户信息附加到请求对象
    req.user = user;
    next();
  } catch (error) {
    console.error('认证错误:', error);
    res.status(401).json({ error: '认证失败: ' + error.message });
  }
}

/**
 * 验证用户是否为家庭管理员
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: '需要管理员权限' });
  }

  next();
}

/**
 * 验证用户是否已加入家庭
 */
function requireFamily(req, res, next) {
  if (!req.user || !req.user.familyId) {
    return res.status(403).json({ error: '请先加入或创建一个家庭' });
  }

  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
  requireFamily,
};
