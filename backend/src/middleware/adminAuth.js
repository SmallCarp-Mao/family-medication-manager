// 管理员认证中间件
const jwt = require('jsonwebtoken');

const adminAuth = (req, res, next) => {
  try {
    // 从请求头获取 token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }

    const token = authHeader.substring(7);

    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    if (!decoded.adminId) {
      return res.status(403).json({ error: '无权访问' });
    }

    // 将管理员信息添加到请求对象
    req.admin = {
      id: decoded.adminId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: '无效的认证令牌' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: '认证令牌已过期' });
    }
    console.error('管理员认证错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 超级管理员权限检查
const superAdminAuth = (req, res, next) => {
  if (req.admin.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: '需要超级管理员权限' });
  }
  next();
};

module.exports = {
  adminAuth,
  superAdminAuth,
};
