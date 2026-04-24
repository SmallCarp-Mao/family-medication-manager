// 管理员控制器
const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 管理员登录
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 查找管理员
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 检查账号是否激活
    if (!admin.isActive) {
      return res.status(403).json({ error: '账号已被禁用' });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 更新最后登录时间
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    // 生成 JWT token
    const token = jwt.sign(
      { adminId: admin.id, role: admin.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('管理员登录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取统计数据
exports.getStats = async (req, res) => {
  try {
    // 统计用户数量
    const userCount = await prisma.user.count();

    // 统计家庭数量
    const familyCount = await prisma.family.count();

    // 统计家庭成员数量
    const memberCount = await prisma.familyMember.count();

    // 统计药物数量
    const medicationCount = await prisma.medication.count();

    // 统计过期药物数量
    const expiredMedicationCount = await prisma.medication.count({
      where: {
        expiryDate: { lt: new Date() },
        status: 'ACTIVE',
      },
    });

    // 统计管理员数量
    const adminCount = await prisma.admin.count();

    // 统计最近7天新增用户
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUserCount = await prisma.user.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
    });

    res.json({
      users: userCount,
      families: familyCount,
      members: memberCount,
      medications: medicationCount,
      expiredMedications: expiredMedicationCount,
      admins: adminCount,
      newUsers: newUserCount,
    });
  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取所有用户
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, keyword } = req.query;
    const skip = (page - 1) * limit;

    const where = keyword
      ? {
          OR: [
            { nickname: { contains: keyword } },
            { openid: { contains: keyword } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          family: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取所有家庭
exports.getAllFamilies = async (req, res) => {
  try {
    const { page = 1, limit = 20, keyword } = req.query;
    const skip = (page - 1) * limit;

    const where = keyword
      ? {
          OR: [{ name: { contains: keyword } }, { inviteCode: { contains: keyword } }],
        }
      : {};

    const [families, total] = await Promise.all([
      prisma.family.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          _count: {
            select: {
              users: true,
              members: true,
              medications: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.family.count({ where }),
    ]);

    res.json({
      families,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('获取家庭列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取所有药物
exports.getAllMedications = async (req, res) => {
  try {
    const { page = 1, limit = 20, keyword, status } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      AND: [
        keyword
          ? {
              OR: [{ name: { contains: keyword } }],
            }
          : {},
        status ? { status } : {},
      ],
    };

    const [medications, total] = await Promise.all([
      prisma.medication.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          family: {
            select: {
              id: true,
              name: true,
            },
          },
          member: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.medication.count({ where }),
    ]);

    res.json({
      medications,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('获取药物列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取所有管理员
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ admins });
  } catch (error) {
    console.error('获取管理员列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 创建管理员
exports.createAdmin = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // 检查邮箱是否已存在
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return res.status(400).json({ error: '该邮箱已被注册' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建管理员
    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'ADMIN',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json({ admin });
  } catch (error) {
    console.error('创建管理员错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 更新管理员状态
exports.updateAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const admin = await prisma.admin.update({
      where: { id: parseInt(id) },
      data: { isActive },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
      },
    });

    res.json({ admin });
  } catch (error) {
    console.error('更新管理员状态错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = exports;
