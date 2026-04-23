// 家庭相关路由
const express = require('express');
const router = express.Router();
const familyController = require('../controllers/family');
const { requireAuth, requireAdmin, requireFamily } = require('../middleware/auth');

// 所有家庭相关接口都需要认证
router.use(requireAuth);

// 创建家庭
router.post('/', familyController.createFamily);

// 获取我的家庭信息
router.get('/mine', requireFamily, familyController.getMyFamily);

// 获取家庭成员列表
router.get('/members', requireFamily, familyController.getMembers);

// 获取成员详情
router.get('/members/:id', requireFamily, familyController.getMemberDetail);

// 更新成员信息（过敏/病史）
router.put('/members/:id', requireFamily, familyController.updateMember);

// 删除成员（仅管理员）
router.delete('/members/:id', requireFamily, requireAdmin, familyController.deleteMember);

// 生成邀请链接
router.post('/invite', requireFamily, familyController.generateInvite);

// 通过邀请码加入家庭
router.post('/join', familyController.joinFamily);

module.exports = router;
