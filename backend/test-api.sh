#!/bin/bash

# 家庭药物管理系统 - API测试脚本
# 使用方法: ./test-api.sh

set -e

API_BASE="http://localhost:3000/api"
TOKEN=""
FAMILY_ID=""
MEMBER_ID=""
MEDICATION_ID=""

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印测试结果
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2 通过${NC}"
    else
        echo -e "${RED}✗ $2 失败${NC}"
        exit 1
    fi
}

# 检查服务器是否运行
echo "🔍 检查后端服务..."
if ! curl -s "$API_BASE/health" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  后端服务未启动，请先运行: cd backend && npm run dev${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 后端服务运行中${NC}"
echo ""

# ============================================
# 1. 用户认证测试
# ============================================
echo "📝 测试1: 用户认证"

# 1.1 测试登录（使用测试code）
echo "  → 测试微信登录..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"code": "test_code_123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    print_result 0 "微信登录"
else
    print_result 1 "微信登录"
fi

# 1.2 获取当前用户
echo "  → 测试获取用户信息..."
USER_RESPONSE=$(curl -s -X GET "$API_BASE/auth/user" \
  -H "Authorization: Bearer $TOKEN")

if echo "$USER_RESPONSE" | grep -q "id"; then
    print_result 0 "获取用户信息"
else
    print_result 1 "获取用户信息"
fi

# 1.3 测试无效token
echo "  → 测试无效token..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_BASE/auth/user" \
  -H "Authorization: Bearer invalid_token")

if [ "$HTTP_CODE" = "401" ]; then
    print_result 0 "无效token返回401"
else
    print_result 1 "无效token返回401"
fi

echo ""

# ============================================
# 2. 家庭管理测试
# ============================================
echo "📝 测试2: 家庭管理"

# 2.1 创建家庭
echo "  → 测试创建家庭..."
FAMILY_RESPONSE=$(curl -s -X POST "$API_BASE/families" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "测试家庭"}')

FAMILY_ID=$(echo $FAMILY_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
INVITE_CODE=$(echo $FAMILY_RESPONSE | grep -o '"inviteCode":"[^"]*' | cut -d'"' -f4)

if [ -n "$FAMILY_ID" ] && [ -n "$INVITE_CODE" ]; then
    print_result 0 "创建家庭 (ID: $FAMILY_ID, 邀请码: $INVITE_CODE)"
else
    print_result 1 "创建家庭"
fi

# 2.2 获取家庭详情
echo "  → 测试获取家庭详情..."
FAMILY_DETAIL=$(curl -s -X GET "$API_BASE/families/$FAMILY_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$FAMILY_DETAIL" | grep -q "$FAMILY_ID"; then
    print_result 0 "获取家庭详情"
else
    print_result 1 "获取家庭详情"
fi

# 2.3 测试无效邀请码
echo "  → 测试无效邀请码..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_BASE/families/join" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inviteCode": "INVALID"}')

if [ "$HTTP_CODE" = "400" ]; then
    print_result 0 "无效邀请码返回400"
else
    print_result 1 "无效邀请码返回400"
fi

echo ""

# ============================================
# 3. 成员管理测试
# ============================================
echo "📝 测试3: 成员管理"

# 3.1 添加成员
echo "  → 测试添加成员..."
MEMBER_RESPONSE=$(curl -s -X POST "$API_BASE/families/$FAMILY_ID/members" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "测试成员", "relation": "父亲"}')

MEMBER_ID=$(echo $MEMBER_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -n "$MEMBER_ID" ]; then
    print_result 0 "添加成员 (ID: $MEMBER_ID)"
else
    print_result 1 "添加成员"
fi

# 3.2 更新成员过敏信息
echo "  → 测试更新成员过敏信息..."
UPDATE_RESPONSE=$(curl -s -X PUT "$API_BASE/members/$MEMBER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "allergies": [
      {"drug": "青霉素", "severity": "严重"},
      {"drug": "阿司匹林", "severity": "轻微"}
    ]
  }')

if echo "$UPDATE_RESPONSE" | grep -q "青霉素"; then
    print_result 0 "更新成员过敏信息"
else
    print_result 1 "更新成员过敏信息"
fi

# 3.3 获取成员详情
echo "  → 测试获取成员详情..."
MEMBER_DETAIL=$(curl -s -X GET "$API_BASE/members/$MEMBER_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$MEMBER_DETAIL" | grep -q "青霉素"; then
    print_result 0 "获取成员详情"
else
    print_result 1 "获取成员详情"
fi

echo ""

# ============================================
# 4. 药物管理测试
# ============================================
echo "📝 测试4: 药物管理"

# 4.1 添加药物
echo "  → 测试添加药物..."
MED_RESPONSE=$(curl -s -X POST "$API_BASE/medications" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"memberId\": $MEMBER_ID,
    \"name\": \"阿莫西林\",
    \"dosage\": \"每日3次，每次1粒\",
    \"totalQuantity\": \"30粒\",
    \"expiryDate\": \"2025-12-31\",
    \"notes\": \"饭后服用\"
  }")

MEDICATION_ID=$(echo $MED_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -n "$MEDICATION_ID" ]; then
    print_result 0 "添加药物 (ID: $MEDICATION_ID)"
else
    print_result 1 "添加药物"
fi

# 4.2 获取药物列表
echo "  → 测试获取药物列表..."
MED_LIST=$(curl -s -X GET "$API_BASE/medications" \
  -H "Authorization: Bearer $TOKEN")

if echo "$MED_LIST" | grep -q "阿莫西林"; then
    print_result 0 "获取药物列表"
else
    print_result 1 "获取药物列表"
fi

# 4.3 更新药物
echo "  → 测试更新药物..."
UPDATE_MED=$(curl -s -X PUT "$API_BASE/medications/$MEDICATION_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dosage": "每日2次，每次2粒"}')

if echo "$UPDATE_MED" | grep -q "每日2次"; then
    print_result 0 "更新药物"
else
    print_result 1 "更新药物"
fi

# 4.4 归档药物
echo "  → 测试归档药物..."
ARCHIVE_RESPONSE=$(curl -s -X POST "$API_BASE/medications/$MEDICATION_ID/archive" \
  -H "Authorization: Bearer $TOKEN")

if echo "$ARCHIVE_RESPONSE" | grep -q "ARCHIVED"; then
    print_result 0 "归档药物"
else
    print_result 1 "归档药物"
fi

# 4.5 删除药物
echo "  → 测试删除药物..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API_BASE/medications/$MEDICATION_ID" \
  -H "Authorization: Bearer $TOKEN")

if [ "$HTTP_CODE" = "200" ]; then
    print_result 0 "删除药物"
else
    print_result 1 "删除药物"
fi

echo ""

# ============================================
# 5. 数据导出测试
# ============================================
echo "📝 测试5: 数据导出"

# 5.1 导出Excel
echo "  → 测试导出Excel..."
curl -s -X GET "$API_BASE/export/excel" \
  -H "Authorization: Bearer $TOKEN" \
  -o /tmp/test_export.xlsx

if [ -f "/tmp/test_export.xlsx" ] && [ -s "/tmp/test_export.xlsx" ]; then
    print_result 0 "导出Excel"
    rm /tmp/test_export.xlsx
else
    print_result 1 "导出Excel"
fi

echo ""

# ============================================
# 测试完成
# ============================================
echo "============================================"
echo -e "${GREEN}✅ 所有API测试通过！${NC}"
echo "============================================"
echo ""
echo "📊 测试总结："
echo "  ✓ 用户认证: 3/3 通过"
echo "  ✓ 家庭管理: 3/3 通过"
echo "  ✓ 成员管理: 3/3 通过"
echo "  ✓ 药物管理: 5/5 通过"
echo "  ✓ 数据导出: 1/1 通过"
echo "  总计: 15/15 通过"
echo ""
echo "🎉 API功能正常，可以继续部署！"
