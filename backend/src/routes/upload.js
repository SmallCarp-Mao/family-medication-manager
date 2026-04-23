// 文件上传路由
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload');
const { requireAuth, requireFamily } = require('../middleware/auth');

// 上传药物照片
router.post('/image', requireAuth, requireFamily, uploadController.uploadImage);

module.exports = router;
