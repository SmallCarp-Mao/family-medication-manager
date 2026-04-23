# 家庭药物管理系统

<div align="center">
  <h1>💊 家庭药物管理系统</h1>
  <p>守护家人用药安全</p>
</div>

## ✨ 功能特性

### 核心功能
- 👤 **微信登录** - 公众号 OAuth 认证
- 👨‍👩‍👧‍👦 **家庭管理** - 创建/加入家庭，邀请成员
- 💊 **药物管理** - 添加、编辑、归档药物信息
- 📸 **扫码添加** - 支持条形码扫描快速录入
- ⚠️ **过敏提醒** - 自动检测并标红过敏药物
- 📅 **过期提醒** - 打开首页弹窗提醒过期药物
- 📤 **数据导出** - 导出 Excel 给医生查看

### 详细功能
| 功能 | 描述 |
|------|------|
| 用户授权 | 微信公众号 OAuth 登录 |
| 家庭邀请 | 6位邀请码，7天有效期 |
| 角色管理 | 管理员可删除成员和药物 |
| 药物信息 | 名称、照片、用法用量、总量、日期 |
| 过敏管理 | 每个成员可记录过敏药物和病史 |
| 状态管理 | 使用中/已归档，归档药物置灰置底 |

## 🛠️ 技术栈

### 前端
- Vue 3 + Composition API
- Vant 4 (移动端 UI 组件库)
- Pinia (状态管理)
- Vue Router
- Axios
- html5-qrcode (扫码)
- Day.js

### 后端
- Node.js + Express
- Prisma (ORM)
- MySQL 8.0
- JWT 认证
- Multer (文件上传)
- ExcelJS (数据导出)

## 📦 项目结构

```
family-medication-manager/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── views/           # 页面组件
│   │   ├── components/      # 通用组件
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── api/             # API 接口
│   │   ├── router/          # 路由配置
│   │   └── utils/           # 工具函数
│   └── package.json
│
└── backend/                  # 后端项目
    ├── src/
    │   ├── routes/          # 路由定义
    │   ├── controllers/     # 控制器
    │   ├── services/        # 业务逻辑
    │   ├── middleware/      # 中间件
    │   └── utils/           # 工具函数
    ├── prisma/
    │   └── schema.prisma    # 数据库模型
    └── package.json
```

## 🚀 快速开始

### 前置要求
- Node.js 18+
- MySQL 8.0+
- 微信公众号（测试环境可选）

### 1. 克隆项目
```bash
cd /opt/hermes/family-medication-manager
```

### 2. 配置数据库
```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE family_medication CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 配置后端
```bash
cd backend

# 安装依赖
npm install

# 配置环境变量（编辑 .env 文件）
DATABASE_URL="mysql://root:password@localhost:3306/family_medication?schema=public"
JWT_SECRET=your-super-secret-jwt-key
PORT=3001

# 生成 Prisma Client
npx prisma generate

# 创建数据库表
npx prisma migrate dev --name init

# 启动后端
npm run dev
```

### 4. 配置前端
```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量（编辑 .env 文件）
VITE_API_BASE_URL=http://localhost:3001

# 启动前端
npm run dev
```

### 5. 访问应用
- 前端: http://localhost:5173
- 后端: http://localhost:3001
- 后台管理: http://localhost:5174

## 🐳 Docker 部署

### 一键部署
```bash
# 复制环境变量文件
cp .env.docker.example .env.docker

# 编辑配置（修改密码等）
nano .env.docker

# 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 服务管理
```bash
# 启动服务
./manage.sh start

# 停止服务
./manage.sh stop

# 查看日志
./manage.sh logs

# 查看状态
./manage.sh status

# 备份数据库
./manage.sh backup
```

### 服务地址
- 前端应用: http://localhost
- 后端API: http://localhost:3000
- 后台管理: http://localhost:8080
- MySQL数据库: localhost:3306

## 🎛️ 后台管理系统

### 功能特性
- 📊 数据概览 - 用户、家庭、药物统计
- 👥 用户管理 - 查看所有微信用户
- 🏠 家庭管理 - 查看所有家庭及成员
- 💊 药物管理 - 全局药物搜索与管理
- 👤 管理员管理 - 管理后台管理员账号

### 默认账号
需要在首次部署后通过数据库创建管理员账号：

```sql
INSERT INTO admins (email, password, name, role)
VALUES ('admin@example.com', '$2a$10$...', '管理员', 'SUPER_ADMIN');
```

或通过后端API创建（需要先实现bcrypt加密的密码）。

## 📱 使用说明

### 测试登录
1. 访问 http://localhost:5173/login
2. 输入任意 OpenID（如：`test_user_001`）
3. 点击登录

### 创建家庭
1. 登录后自动跳转到家庭管理页
2. 点击"创建家庭"
3. 输入家庭名称

### 添加药物
1. 首页点击悬浮 + 按钮
2. 选择扫码或手动添加
3. 填写药物信息
4. 系统自动检测过敏

### 邀请成员
1. 进入"家庭管理"
2. 点击"邀请成员"
3. 分享邀请链接或邀请码

## 🗄️ 数据库设计

### 核心表
- `users` - 用户表
- `families` - 家庭表
- `family_members` - 家庭成员表
- `medications` - 药物表
- `invitations` - 邀请记录表

详细结构见 `backend/prisma/schema.prisma`

## 🔐 环境变量说明

### 后端 (.env)
```env
# 数据库
DATABASE_URL=mysql://user:password@localhost:3306/dbname

# 服务器
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# 微信公众号
WECHAT_APP_ID=your_app_id
WECHAT_APP_SECRET=your_app_secret

# 前端地址（CORS）
FRONTEND_URL=http://localhost:5173
```

### 前端 (.env)
```env
VITE_API_BASE_URL=http://localhost:3001
```

## 📸 页面预览

### 首页
- 药物列表展示
- 过敏药物标红
- 过期弹窗提醒
- 已归档置灰置底

### 添加药物
- 扫码/手动输入
- 照片上传
- 过敏检测

### 家庭管理
- 成员列表
- 邀请生成
- 成员编辑

## 🛡️ 安全注意事项

1. **生产环境必须更改**：
   - `JWT_SECRET`
   - MySQL 密码
   - 微信 AppSecret

2. **公众号配置**：
   - 配置授权域名
   - 设置 IP 白名单

3. **数据备份**：
   - 定期导出用药记录
   - 数据库自动备份

## 📝 开发计划

- [x] Phase 1: 基础搭建
- [x] Phase 2: 认证与家庭管理
- [x] Phase 3: 药物核心功能
- [x] Phase 4: 提醒与展示优化
- [x] Phase 5: 成员管理与导出
- [ ] Phase 6: 测试与上线

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

<div align="center">
  Made with ❤️ by Hermes Agent
</div>
