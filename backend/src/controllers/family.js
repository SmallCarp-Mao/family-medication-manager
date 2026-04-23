// 家庭控制器
const prisma = require('../utils/prisma');

/**
 * 生成邀请码
 */
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * 创建家庭
 */
async function createFamily(req, res) {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: '家庭名称不能为空' });
    }

    // 检查用户是否已经有家庭
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (existingUser.familyId) {
      return res.status(400).json({ error: '您已经有一个家庭了' });
    }

    // 生成唯一的邀请码
    let inviteCode;
    let codeExists = true;
    let attempts = 0;

    while (codeExists && attempts < 10) {
      inviteCode = generateInviteCode();
      const existing = await prisma.family.findUnique({
        where: { inviteCode },
      });
      codeExists = !!existing;
      attempts++;
    }

    // 创建家庭
    const family = await prisma.family.create({
      data: {
        name,
        inviteCode,
        createdBy: userId,
      },
    });

    // 更新用户的家庭 ID
    await prisma.user.update({
      where: { id: userId },
      data: { familyId: family.id, role: 'ADMIN' },
    });

    // 创建一个默认成员（用户自己）
    await prisma.familyMember.create({
      data: {
        familyId: family.id,
        name: req.user.nickname || '我',
        relation: '本人',
        createdBy: userId,
      },
    });

    res.json({
      id: family.id,
      name: family.name,
      inviteCode: family.inviteCode,
    });
  } catch (error) {
    console.error('创建家庭错误:', error);
    res.status(500).json({ error: '创建家庭失败' });
  }
}

/**
 * 获取我的家庭信息
 */
async function getMyFamily(req, res) {
  try {
    const family = await prisma.family.findUnique({
      where: { id: req.user.familyId },
      include: {
        members: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!family) {
      return res.status(404).json({ error: '家庭不存在' });
    }

    res.json(family);
  } catch (error) {
    console.error('获取家庭信息错误:', error);
    res.status(500).json({ error: '获取家庭信息失败' });
  }
}

/**
 * 获取家庭成员列表
 */
async function getMembers(req, res) {
  try {
    const members = await prisma.familyMember.findMany({
      where: { familyId: req.user.familyId },
      orderBy: { createdAt: 'asc' },
    });

    res.json(members);
  } catch (error) {
    console.error('获取成员列表错误:', error);
    res.status(500).json({ error: '获取成员列表失败' });
  }
}

/**
 * 获取成员详情
 */
async function getMemberDetail(req, res) {
  try {
    const member = await prisma.familyMember.findFirst({
      where: {
        id: parseInt(req.params.id),
        familyId: req.user.familyId,
      },
      include: {
        medications: {
          where: { status: 'ACTIVE' },
          orderBy: { expiryDate: 'asc' },
        },
      },
    });

    if (!member) {
      return res.status(404).json({ error: '成员不存在' });
    }

    res.json(member);
  } catch (error) {
    console.error('获取成员详情错误:', error);
    res.status(500).json({ error: '获取成员详情失败' });
  }
}

/**
 * 更新成员信息（过敏/病史）
 */
async function updateMember(req, res) {
  try {
    const { name, relation, allergies, medicalHistory } = req.body;

    const member = await prisma.familyMember.findFirst({
      where: {
        id: parseInt(req.params.id),
        familyId: req.user.familyId,
      },
    });

    if (!member) {
      return res.status(404).json({ error: '成员不存在' });
    }

    const updated = await prisma.familyMember.update({
      where: { id: member.id },
      data: {
        ...(name && { name }),
        ...(relation !== undefined && { relation }),
        ...(allergies !== undefined && { allergies }),
        ...(medicalHistory !== undefined && { medicalHistory: medicalHistory }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('更新成员信息错误:', error);
    res.status(500).json({ error: '更新成员信息失败' });
  }
}

/**
 * 删除成员（仅管理员）
 */
async function deleteMember(req, res) {
  try {
    const member = await prisma.familyMember.findFirst({
      where: {
        id: parseInt(req.params.id),
        familyId: req.user.familyId,
      },
    });

    if (!member) {
      return res.status(404).json({ error: '成员不存在' });
    }

    // 检查是否有药物关联
    const medicationsCount = await prisma.medication.count({
      where: { memberId: member.id },
    });

    if (medicationsCount > 0) {
      return res.status(400).json({
        error: '该成员还有关联的药物，请先删除或转移药物',
        medicationsCount,
      });
    }

    await prisma.familyMember.delete({
      where: { id: member.id },
    });

    res.json({ message: '成员已删除' });
  } catch (error) {
    console.error('删除成员错误:', error);
    res.status(500).json({ error: '删除成员失败' });
  }
}

/**
 * 生成邀请链接
 */
async function generateInvite(req, res) {
  try {
    const family = await prisma.family.findUnique({
      where: { id: req.user.familyId },
    });

    if (!family) {
      return res.status(404).json({ error: '家庭不存在' });
    }

    // 创建邀请记录，7天有效期
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.invitation.create({
      data: {
        familyId: family.id,
        inviteCode: generateInviteCode(),
        invitedBy: req.user.id,
        expiresAt,
      },
    });

    // 生成邀请链接
    const inviteUrl = `${process.env.FRONTEND_URL}/join?code=${invitation.inviteCode}`;

    res.json({
      inviteCode: invitation.inviteCode,
      inviteUrl,
      expiresAt: invitation.expiresAt,
    });
  } catch (error) {
    console.error('生成邀请错误:', error);
    res.status(500).json({ error: '生成邀请失败' });
  }
}

/**
 * 通过邀请码加入家庭
 */
async function joinFamily(req, res) {
  try {
    const { inviteCode } = req.body;
    const userId = req.user.id;

    if (!inviteCode) {
      return res.status(400).json({ error: '邀请码不能为空' });
    }

    // 检查用户是否已经有家庭
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user.familyId) {
      return res.status(400).json({ error: '您已经有一个家庭了，请先退出当前家庭' });
    }

    // 查找邀请记录
    const invitation = await prisma.invitation.findUnique({
      where: { inviteCode },
      include: { family: true },
    });

    if (!invitation) {
      return res.status(404).json({ error: '邀请码无效' });
    }

    // 检查邀请是否过期
    if (invitation.expiresAt < new Date() || invitation.status === 'EXPIRED') {
      return res.status(400).json({ error: '邀请码已过期' });
    }

    // 更新邀请状态
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED',
        invitedOpenid: user.openid,
        acceptedAt: new Date(),
      },
    });

    // 将用户加入家庭
    await prisma.user.update({
      where: { id: userId },
      data: { familyId: invitation.familyId, role: 'MEMBER' },
    });

    // 创建一个默认成员
    await prisma.familyMember.create({
      data: {
        familyId: invitation.familyId,
        name: user.nickname || '新成员',
        relation: '家人',
        createdBy: userId,
      },
    });

    res.json({
      message: '成功加入家庭',
      family: invitation.family,
    });
  } catch (error) {
    console.error('加入家庭错误:', error);
    res.status(500).json({ error: '加入家庭失败' });
  }
}

module.exports = {
  createFamily,
  getMyFamily,
  getMembers,
  getMemberDetail,
  updateMember,
  deleteMember,
  generateInvite,
  joinFamily,
};
