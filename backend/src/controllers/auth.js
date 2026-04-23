// 认证控制器
const { generateToken } = require('../utils/jwt');
const prisma = require('../utils/prisma');

/**
 * 微信 OAuth 授权跳转
 */
async function wechatAuthorize(req, res) {
  const appId = process.env.WECHAT_APP_ID;
  const redirectUri = encodeURIComponent(process.env.WECHAT_REDIRECT_URI);
  const scope = 'snsapi_userinfo';

  const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}#wechat_redirect`;

  res.redirect(authUrl);
}

/**
 * 微信 OAuth 回调处理
 */
async function wechatCallback(req, res) {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: '授权码缺失' });
    }

    // 获取 access_token
    const tokenResponse = await fetch(
      `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${process.env.WECHAT_APP_ID}&secret=${process.env.WECHAT_APP_SECRET}&code=${code}&grant_type=authorization_code`
    );
    const tokenData = await tokenResponse.json();

    if (tokenData.errcode) {
      return res.status(400).json({ error: '获取 Access Token 失败: ' + tokenData.errmsg });
    }

    const { access_token, openid } = tokenData;

    // 获取用户信息
    const userResponse = await fetch(
      `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`
    );
    const userData = await userResponse.json();

    // 查找或创建用户
    let user = await prisma.user.findUnique({
      where: { openid },
      include: { family: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          openid,
          unionid: userData.unionid,
          nickname: userData.nickname,
          avatar: userData.headimgurl,
          role: 'ADMIN', // 第一个用户默认为管理员
        },
        include: { family: true },
      });
    } else {
      // 更新用户信息
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          nickname: userData.nickname,
          avatar: userData.headimgurl,
        },
        include: { family: true },
      });
    }

    // 生成 JWT
    const token = generateToken({ userId: user.id });

    // 重定向到前端，携带 token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('微信登录错误:', error);
    res.status(500).json({ error: '登录失败' });
  }
}

/**
 * 登录接口（用于测试，生产环境使用 OAuth）
 */
async function login(req, res) {
  try {
    const { openid, nickname, avatar } = req.body;

    if (!openid) {
      return res.status(400).json({ error: 'openid 不能为空' });
    }

    let user = await prisma.user.findUnique({
      where: { openid },
      include: { family: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          openid,
          nickname: nickname || '新用户',
          avatar,
          role: 'ADMIN',
        },
        include: { family: true },
      });
    }

    const token = generateToken({ userId: user.id });

    res.json({
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        familyId: user.familyId,
      },
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '登录失败' });
  }
}

/**
 * 刷新 Token
 */
async function refreshToken(req, res) {
  try {
    // 简化实现：直接用旧的 token 获取用户信息并生成新 token
    const { verifyToken } = require('../utils/jwt');
    const token = req.headers.authorization?.substring(7);

    if (!token) {
      return res.status(401).json({ error: '未提供 Token' });
    }

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }

    const newToken = generateToken({ userId: user.id });

    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: 'Token 刷新失败' });
  }
}

/**
 * 获取当前用户信息
 */
async function getCurrentUser(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        family: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      role: user.role,
      familyId: user.familyId,
      family: user.family,
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
}

module.exports = {
  wechatAuthorize,
  wechatCallback,
  login,
  refreshToken,
  getCurrentUser,
};
