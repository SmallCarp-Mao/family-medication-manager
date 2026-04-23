// 认证相关路由
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// 微信 OAuth 授权跳转
router.get('/wechat', authController.wechatAuthorize);

// OAuth 回调处理
router.get('/callback', authController.wechatCallback);

// 登录（获取 JWT）
router.post('/login', authController.login);

// 刷新 Token
router.post('/refresh', authController.refreshToken);

// 获取当前用户信息
router.get('/me', require('../middleware/auth').requireAuth, authController.getCurrentUser);

module.exports = router;
