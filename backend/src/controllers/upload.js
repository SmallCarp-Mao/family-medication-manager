// 文件上传控制器
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置本地存储（用于开发环境）
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/medications';
    // 确保目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'med-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 限制 5MB
  },
  fileFilter: function (req, file, cb) {
    // 只允许图片
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  },
});

/**
 * 上传药物照片
 */
async function uploadImage(req, res) {
  try {
    // 单文件上传
    upload.single('photo')(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: '上传错误: ' + err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: '请选择要上传的图片' });
      }

      // 返回文件 URL
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/medications/${req.file.filename}`;

      res.json({
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size,
      });
    });
  } catch (error) {
    console.error('上传错误:', error);
    res.status(500).json({ error: '上传失败' });
  }
}

module.exports = {
  uploadImage,
};
