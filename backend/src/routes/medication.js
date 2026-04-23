// 药物相关路由
const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medication');
const { requireAuth, requireAdmin, requireFamily } = require('../middleware/auth');

// 所有药物相关接口都需要认证
router.use(requireAuth);
router.use(requireFamily);

// 获取药物列表
router.get('/', medicationController.getMedications);

// 获取药物详情
router.get('/:id', medicationController.getMedicationDetail);

// 添加药物
router.post('/', medicationController.addMedication);

// 更新药物
router.put('/:id', medicationController.updateMedication);

// 归档药物
router.post('/:id/archive', medicationController.archiveMedication);

// 删除药物（仅管理员）
router.delete('/:id', requireAdmin, medicationController.deleteMedication);

// 获取过期药物列表
router.get('/expired/list', medicationController.getExpiredMedications);

// 检查药物过敏
router.post('/check-allergy', medicationController.checkAllergy);

module.exports = router;
