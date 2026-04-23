// Prisma 客户端初始化
const { PrismaClient } = require('@prisma/client');

// 创建 Prisma 客户端实例
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// 测试数据库连接
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
}

testConnection();

// 优雅关闭
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
