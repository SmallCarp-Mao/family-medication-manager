# 家庭药物管理系统 - 手动测试清单

## 📱 前端功能测试

### 1. 用户认证模块

#### 1.1 登录页面 (`Login.vue`)
- [ ] 页面正常加载，显示"登录"按钮
- [ ] 点击登录按钮调用微信OAuth接口
- [ ] 登录成功后跳转到首页
- [ ] 登录失败显示错误提示

#### 1.2 回调页面 (`AuthCallback.vue`)
- [ ] 微信回调后正确获取code
- [ ] code换取token成功
- [ ] token正确存储到localStorage
- [ ] 跳转到首页

#### 1.3 个人中心 (`Profile.vue`)
- [ ] 显示用户昵称
- [ ] 显示用户头像
- [ ] 显示用户角色（管理员/成员）
- [ ] 退出登录功能正常
- [ ] 退出后清除token，返回登录页

---

### 2. 家庭管理模块

#### 2.1 加入家庭 (`JoinFamily.vue`)
- [ ] 输入框可输入6位邀请码
- [ ] 有效邀请码加入成功
- [ ] 无效邀请码显示错误提示
- [ ] 过期邀请码显示"已过期"提示
- [ ] 加入成功后跳转到首页

#### 2.2 创建家庭 (`FamilyManage.vue`)
- [ ] 点击"创建家庭"按钮显示创建对话框
- [ ] 输入家庭名称后创建成功
- [ ] 创建成功后显示6位邀请码
- [ ] 邀请码可复制到剪贴板
- [ ] 显示邀请链接（二维码）

#### 2.3 邀请成员 (`InviteMember.vue`)
- [ ] 生成新的邀请码
- [ ] 显示邀请有效期（7天）
- [ ] 邀请链接可分享
- [ ] 显示已发送的邀请列表
- [ ] 显示邀请状态（待接受/已接受/已过期）

#### 2.4 成员列表 (`FamilyManage.vue`)
- [ ] 显示所有家庭成员
- [ ] 显示成员头像、姓名、关系
- [ ] 管理员可看到"删除成员"按钮
- [ ] 删除成员需要二次确认
- [ ] 删除成功后列表更新

---

### 3. 成员管理模块

#### 3.1 添加成员 (`FamilyManage.vue`)
- [ ] 点击"添加成员"打开对话框
- [ ] 输入成员姓名
- [ ] 选择或输入关系（父亲/母亲/子女等）
- [ ] 添加成功后成员列表更新

#### 3.2 成员详情 (`MemberDetail.vue`)
- [ ] 显示成员基本信息
- [ ] 显示过敏药物列表
- [ ] 添加过敏药物
- [ ] 编辑过敏药物（严重程度）
- [ ] 删除过敏药物
- [ ] 显示病史列表
- [ ] 添加病史记录
- [ ] 编辑病史记录

---

### 4. 药物管理模块

#### 4.1 药物列表 (`Home.vue`)
- [ ] 首页显示所有"使用中"的药物
- [ ] 显示药物照片/图标
- [ ] 显示药物名称
- [ ] 显示所属成员
- [ ] 显示用法用量
- [ ] 显示过期日期
- [ ] 过期药物红色标记
- [ ] 过敏药物红色标记
- [ ] 点击药物卡片进入详情

#### 4.2 过期提醒 (`Home.vue`)
- [ ] 打开首页弹窗显示过期药物
- [ ] 显示过期药物数量
- [ ] 列出所有过期药物
- [ ] 关闭弹窗后正常使用

#### 4.3 添加药物 (`AddMedication.vue`)
- [ ] 输入药物名称（必填）
- [ ] 选择所属成员（必填）
- [ ] 上传药物照片
- [ ] 输入用法用量
- [ ] 输入药物总量
- [ ] 选择开始用药日期
- [ ] 选择预计/实际吃完日期
- [ ] 选择过期日期（必填）
- [ ] 输入备注
- [ ] 扫码功能（条形码扫描）
- [ ] 提交后药物添加成功
- [ ] 返回药物列表

#### 4.4 扫码添加 (`AddMedication.vue`)
- [ ] 点击"扫码"按钮打开相机
- [ ] html5-qrcode 正常初始化
- [ ] 扫描条形码后识别成功
- [ ] 自动填充药物名称
- [ ] 关闭扫码窗口

#### 4.5 药物详情 (`MedicationDetail.vue`)
- [ ] 显示药物完整信息
- [ ] 显示药物照片（可放大查看）
- [ ] 编辑按钮进入编辑页面
- [ ] 归档按钮
- [ ] 归档需要二次确认
- [ ] 归档后返回列表

#### 4.6 编辑药物 (`AddMedication.vue` 编辑模式)
- [ ] 加载现有药物数据
- [ ] 修改任意字段
- [ ] 更换药物照片
- [ ] 保存修改成功
- [ ] 返回详情页

#### 4.7 归档药物
- [ ] 归档后药物状态变为 ARCHIVED
- [ ] 归档药物在列表中置灰
- [ ] 归档药物排在列表底部
- [ ] 可撤销归档

---

### 5. 数据导出模块

#### 5.1 导出数据 (`ExportData.vue`)
- [ ] 点击"导出数据"按钮
- [ ] 显示导出选项（全部/按成员）
- [ ] 选择导出范围
- [ ] 点击确认后开始导出
- [ ] 下载Excel文件
- [ ] Excel可正常打开
- [ ] Excel包含所有药物信息
- [ ] Excel包含成员信息
- [ ] Excel包含过敏信息

---

### 6. 过敏检测功能

#### 6.1 自动过敏检测
- [ ] 药物名称包含过敏成分时标红
- [ ] 标红药物显示过敏提示
- [ ] 点击提示查看过敏详情
- [ ] 显示是哪个成员过敏

---

## 🔧 后端API测试

### 测试前准备
```bash
# 1. 启动后端服务
cd backend
npm run dev

# 2. 设置测试token（先登录获取）
export TEST_TOKEN="your_jwt_token_here"
```

### API 测试清单

#### 1. 用户认证 (`/api/auth/*`)

##### 1.1 微信登录
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code": "test_code"}'
```
- [ ] 返回状态码 200
- [ ] 返回 JWT token
- [ ] 返回用户信息

##### 1.2 获取当前用户
```bash
curl -X GET http://localhost:3000/api/auth/user \
  -H "Authorization: Bearer $TEST_TOKEN"
```
- [ ] 返回状态码 200
- [ ] 返回完整用户信息

##### 1.3 无效token测试
```bash
curl -X GET http://localhost:3000/api/auth/user \
  -H "Authorization: Bearer invalid_token"
```
- [ ] 返回状态码 401

---

#### 2. 家庭管理 (`/api/families/*`)

##### 2.1 创建家庭
```bash
curl -X POST http://localhost:3000/api/families \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "测试家庭"}'
```
- [ ] 返回状态码 201
- [ ] 返回家庭ID
- [ ] 返回6位邀请码
- [ ] 数据库中创建记录

##### 2.2 加入家庭
```bash
curl -X POST http://localhost:3000/api/families/join \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inviteCode": "ABC123"}'
```
- [ ] 有效邀请码加入成功（200）
- [ ] 无效邀请码返回错误（400）
- [ ] 过期邀请码返回错误（400）

##### 2.3 获取家庭详情
```bash
curl -X GET http://localhost:3000/api/families/1 \
  -H "Authorization: Bearer $TEST_TOKEN"
```
- [ ] 返回状态码 200
- [ ] 返回完整家庭信息
- [ ] 包含成员列表

##### 2.4 删除家庭成员（管理员）
```bash
curl -X DELETE http://localhost:3000/api/families/1/members/2 \
  -H "Authorization: Bearer $TEST_TOKEN"
```
- [ ] 管理员可删除（200）
- [ ] 普通成员无权限（403）

---

#### 3. 成员管理 (`/api/members/*`)

##### 3.1 添加成员
```bash
curl -X POST http://localhost:3000/api/families/1/members \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "测试成员", "relation": "父亲"}'
```
- [ ] 返回状态码 201
- [ ] 返回成员ID

##### 3.2 更新成员信息
```bash
curl -X PUT http://localhost:3000/api/members/1 \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"allergies": [{"drug": "青霉素", "severity": "严重"}]}'
```
- [ ] 返回状态码 200
- [ ] 过敏信息更新成功

##### 3.3 获取成员详情
```bash
curl -X GET http://localhost:3000/api/members/1 \
  -H "Authorization: Bearer $TEST_TOKEN"
```
- [ ] 返回状态码 200
- [ ] 包含过敏信息
- [ ] 包含病史信息

---

#### 4. 药物管理 (`/api/medications/*`)

##### 4.1 获取药物列表
```bash
curl -X GET http://localhost:3000/api/medications \
  -H "Authorization: Bearer $TEST_TOKEN"
```
- [ ] 返回状态码 200
- [ ] 返回药物数组
- [ ] 使用中药物排在前面
- [ ] 归档药物排在后面

##### 4.2 添加药物
```bash
curl -X POST http://localhost:3000/api/medications \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": 1,
    "name": "阿莫西林",
    "dosage": "每日3次，每次1粒",
    "totalQuantity": "30粒",
    "expiryDate": "2025-12-31",
    "notes": "饭后服用"
  }'
```
- [ ] 返回状态码 201
- [ ] 返回药物ID
- [ ] 数据库中创建记录

##### 4.3 上传药物照片
```bash
curl -X POST http://localhost:3000/api/medications/1/photo \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -F "photo=@/path/to/image.jpg"
```
- [ ] 返回状态码 200
- [ ] 返回照片URL
- [ ] 照片可访问

##### 4.4 更新药物
```bash
curl -X PUT http://localhost:3000/api/medications/1 \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dosage": "每日2次，每次1粒"}'
```
- [ ] 返回状态码 200

##### 4.5 归档药物
```bash
curl -X POST http://localhost:3000/api/medications/1/archive \
  -H "Authorization: Bearer $TEST_TOKEN"
```
- [ ] 返回状态码 200
- [ ] 状态变为 ARCHIVED

##### 4.6 删除药物
```bash
curl -X DELETE http://localhost:3000/api/medications/1 \
  -H "Authorization: Bearer $TEST_TOKEN"
```
- [ ] 返回状态码 200
- [ ] 数据库中删除记录

---

#### 5. 数据导出 (`/api/export/*`)

##### 5.1 导出Excel
```bash
curl -X GET http://localhost:3000/api/export/excel \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -o output.xlsx
```
- [ ] 返回状态码 200
- [ ] Content-Type 为 Excel 类型
- [ ] 文件可下载
- [ ] Excel可正常打开
- [ ] 包含所有数据

---

## 📊 统计测试结果

| 模块 | 测试项 | 通过 | 失败 |
|------|--------|------|------|
| 用户认证 | 7 | __ | __ |
| 家庭管理 | 12 | __ | __ |
| 成员管理 | 8 | __ | __ |
| 药物管理 | 18 | __ | __ |
| 数据导出 | 4 | __ | __ |
| **总计** | **49** | __ | __ |

---

## 🐛 问题记录

| 序号 | 模块 | 问题描述 | 严重程度 | 状态 |
|------|------|----------|----------|------|
| 1 | | | ⚠️/🔴 | |
| 2 | | | ⚠️/🔴 | |

---

## ✅ 验收标准

- [ ] 所有核心功能测试通过
- [ ] 无🔴级别bug
- [ ] ⚠️级别bug少于3个
- [ ] 所有API接口返回正确
- [ ] 数据库操作正确

---

*测试执行人：__________*
*测试日期：__________*
*版本号：v1.0.0*
