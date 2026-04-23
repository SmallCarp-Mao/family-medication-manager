// 数据导出路由
const express = require('express');
const router = express.Router();
const exportController = require('../controllers/export');
const { requireAuth, requireFamily } = require('../middleware/auth');

// 导出用药记录（Excel）
router.get('/medications', requireAuth, requireFamily, exportController.exportMedications);

module.exports = router;
