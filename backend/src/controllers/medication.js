// 药物控制器
const prisma = require('../utils/prisma');

/**
 * 获取药物列表
 */
async function getMedications(req, res) {
  try {
    const { status } = req.query;

    const medications = await prisma.medication.findMany({
      where: {
        familyId: req.user.familyId,
        ...(status && { status: status }),
      },
      include: {
        member: true,
      },
      orderBy: [
        { status: 'asc' },  // ACTIVE 在前，ARCHIVED 在后
        { expiryDate: 'asc' },  // 按过期日期排序
      ],
    });

    res.json(medications);
  } catch (error) {
    console.error('获取药物列表错误:', error);
    res.status(500).json({ error: '获取药物列表失败' });
  }
}

/**
 * 获取药物详情
 */
async function getMedicationDetail(req, res) {
  try {
    const medication = await prisma.medication.findFirst({
      where: {
        id: parseInt(req.params.id),
        familyId: req.user.familyId,
      },
      include: {
        member: true,
      },
    });

    if (!medication) {
      return res.status(404).json({ error: '药物不存在' });
    }

    res.json(medication);
  } catch (error) {
    console.error('获取药物详情错误:', error);
    res.status(500).json({ error: '获取药物详情失败' });
  }
}

/**
 * 添加药物
 */
async function addMedication(req, res) {
  try {
    const {
      memberId,
      name,
      photo,
      dosage,
      totalQuantity,
      startDate,
      endDate,
      expiryDate,
      notes,
    } = req.body;

    // 验证必填字段
    if (!memberId || !name || !expiryDate) {
      return res.status(400).json({
        error: '缺少必填字段：memberId, name, expiryDate',
      });
    }

    // 验证成员是否属于当前家庭
    const member = await prisma.familyMember.findFirst({
      where: {
        id: memberId,
        familyId: req.user.familyId,
      },
    });

    if (!member) {
      return res.status(400).json({ error: '成员不存在或不属于您的家庭' });
    }

    const medication = await prisma.medication.create({
      data: {
        familyId: req.user.familyId,
        memberId,
        name,
        photo,
        dosage,
        totalQuantity,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        expiryDate: new Date(expiryDate),
        notes,
        createdBy: req.user.id,
      },
      include: {
        member: true,
      },
    });

    res.status(201).json(medication);
  } catch (error) {
    console.error('添加药物错误:', error);
    res.status(500).json({ error: '添加药物失败' });
  }
}

/**
 * 更新药物
 */
async function updateMedication(req, res) {
  try {
    const {
      memberId,
      name,
      photo,
      dosage,
      totalQuantity,
      startDate,
      endDate,
      expiryDate,
      notes,
    } = req.body;

    const medication = await prisma.medication.findFirst({
      where: {
        id: parseInt(req.params.id),
        familyId: req.user.familyId,
      },
    });

    if (!medication) {
      return res.status(404).json({ error: '药物不存在' });
    }

    // 如果要更改成员，验证新成员是否属于当前家庭
    if (memberId && memberId !== medication.memberId) {
      const member = await prisma.familyMember.findFirst({
        where: {
          id: memberId,
          familyId: req.user.familyId,
        },
      });

      if (!member) {
        return res.status(400).json({ error: '成员不存在或不属于您的家庭' });
      }
    }

    const updated = await prisma.medication.update({
      where: { id: medication.id },
      data: {
        ...(memberId && { memberId }),
        ...(name && { name }),
        ...(photo !== undefined && { photo }),
        ...(dosage !== undefined && { dosage }),
        ...(totalQuantity !== undefined && { totalQuantity }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(expiryDate && { expiryDate: new Date(expiryDate) }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        member: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('更新药物错误:', error);
    res.status(500).json({ error: '更新药物失败' });
  }
}

/**
 * 归档药物
 */
async function archiveMedication(req, res) {
  try {
    const medication = await prisma.medication.findFirst({
      where: {
        id: parseInt(req.params.id),
        familyId: req.user.familyId,
      },
    });

    if (!medication) {
      return res.status(404).json({ error: '药物不存在' });
    }

    const archived = await prisma.medication.update({
      where: { id: medication.id },
      data: { status: 'ARCHIVED' },
      include: {
        member: true,
      },
    });

    res.json(archived);
  } catch (error) {
    console.error('归档药物错误:', error);
    res.status(500).json({ error: '归档药物失败' });
  }
}

/**
 * 删除药物（仅管理员）
 */
async function deleteMedication(req, res) {
  try {
    const medication = await prisma.medication.findFirst({
      where: {
        id: parseInt(req.params.id),
        familyId: req.user.familyId,
      },
    });

    if (!medication) {
      return res.status(404).json({ error: '药物不存在' });
    }

    await prisma.medication.delete({
      where: { id: medication.id },
    });

    res.json({ message: '药物已删除' });
  } catch (error) {
    console.error('删除药物错误:', error);
    res.status(500).json({ error: '删除药物失败' });
  }
}

/**
 * 获取过期药物列表
 */
async function getExpiredMedications(req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expired = await prisma.medication.findMany({
      where: {
        familyId: req.user.familyId,
        status: 'ACTIVE',
        expiryDate: {
          lt: today,
        },
      },
      include: {
        member: true,
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });

    res.json(expired);
  } catch (error) {
    console.error('获取过期药物错误:', error);
    res.status(500).json({ error: '获取过期药物失败' });
  }
}

/**
 * 检查药物过敏
 */
async function checkAllergy(req, res) {
  try {
    const { drugName } = req.body;

    if (!drugName) {
      return res.status(400).json({ error: '药物名称不能为空' });
    }

    // 获取家庭成员及其过敏信息
    const members = await prisma.familyMember.findMany({
      where: {
        familyId: req.user.familyId,
      },
    });

    const allergicMembers = [];

    for (const member of members) {
      const allergies = member.allergies || [];

      for (const allergy of allergies) {
        // 检查药物名称是否包含过敏原，或过敏原是否包含药物名称
        const drugLower = drugName.toLowerCase();
        const allergyLower = (allergy.drug || '').toLowerCase();

        if (drugLower.includes(allergyLower) || allergyLower.includes(drugLower)) {
          allergicMembers.push({
            memberId: member.id,
            memberName: member.name,
            allergy: allergy.drug,
            severity: allergy.severity || '未知',
          });
          break; // 每个成员只记录一次
        }
      }
    }

    res.json({
      hasAllergy: allergicMembers.length > 0,
      allergicMembers,
    });
  } catch (error) {
    console.error('检查过敏错误:', error);
    res.status(500).json({ error: '检查过敏失败' });
  }
}

module.exports = {
  getMedications,
  getMedicationDetail,
  addMedication,
  updateMedication,
  archiveMedication,
  deleteMedication,
  getExpiredMedications,
  checkAllergy,
};
