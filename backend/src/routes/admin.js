// 管理员路由
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { adminAuth, superAdminAuth } = require('../middleware/adminAuth');

// 管理员登录（无需认证）
router.post('/login', adminController.adminLogin);

// 获取统计数据（需要管理员认证）
router.get('/stats', adminAuth, adminController.getStats);

// 用户管理
router.get('/users', adminAuth, adminController.getAllUsers);

// 家庭管理
router.get('/families', adminAuth, adminController.getAllFamilies);

// 药物管理
router.get('/medications', adminAuth, adminController.getAllMedications);

// 管理员管理
router.get('/admins', adminAuth, adminController.getAllAdmins);
router.post('/admins', superAdminAuth, adminController.createAdmin);
router.put('/admins/:id/status', superAdminAuth, adminController.updateAdminStatus);

module.exports = router;
