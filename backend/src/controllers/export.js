// 数据导出控制器
const ExcelJS = require('exceljs');
const prisma = require('../utils/prisma');

/**
 * 导出用药记录（Excel）
 */
async function exportMedications(req, res) {
  try {
    const medications = await prisma.medication.findMany({
      where: {
        familyId: req.user.familyId,
      },
      include: {
        member: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 创建 Excel 工作簿
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('用药记录');

    // 设置列
    worksheet.columns = [
      { header: '药物名称', key: 'name', width: 30 },
      { header: '使用者', key: 'memberName', width: 15 },
      { header: '用法用量', key: 'dosage', width: 20 },
      { header: '药物总量', key: 'totalQuantity', width: 15 },
      { header: '开始用药日期', key: 'startDate', width: 15 },
      { header: '吃完日期', key: 'endDate', width: 15 },
      { header: '过期日期', key: 'expiryDate', width: 15 },
      { header: '状态', key: 'status', width: 10 },
      { header: '备注', key: 'notes', width: 30 },
    ];

    // 添加数据
    medications.forEach(med => {
      worksheet.addRow({
        name: med.name,
        memberName: med.member.name,
        dosage: med.dosage || '-',
        totalQuantity: med.totalQuantity || '-',
        startDate: med.startDate ? med.startDate.toISOString().split('T')[0] : '-',
        endDate: med.endDate ? med.endDate.toISOString().split('T')[0] : '-',
        expiryDate: med.expiryDate.toISOString().split('T')[0],
        status: med.status === 'ACTIVE' ? '使用中' : '已归档',
        notes: med.notes || '-',
      });
    });

    // 设置表头样式
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' },
    };

    // 生成文件名
    const fileName = `家庭用药记录_${new Date().toISOString().split('T')[0]}.xlsx`;

    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);

    // 发送文件
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('导出错误:', error);
    res.status(500).json({ error: '导出失败' });
  }
}

module.exports = {
  exportMedications,
};
