-- 家庭药物管理系统 - 数据库初始化脚本
-- 此文件在 MySQL 容器首次启动时自动执行

-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 使用数据库
USE family_medication;

-- 创建默认管理员账号（如果需要后台管理）
-- 密码: admin123 (需要bcrypt加密后替换)
-- INSERT INTO admins (email, password, name, role) VALUES
-- ('admin@example.com', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', '系统管理员', 'SUPER_ADMIN');
