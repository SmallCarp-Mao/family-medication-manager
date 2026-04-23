#!/bin/bash

# ========================================
# Git 仓库初始化和推送脚本
# ========================================
# 使用方法:
#   1. 修改下方的 GITHUB_REPO_URL 为你的仓库地址
#   2. 运行: ./git-setup.sh
# ========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ========================================
# 配置区域 - 请修改为你的信息
# ========================================
GITHUB_USERNAME="YOUR_USERNAME"
REPO_NAME="family-medication-manager"
GITHUB_REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
# ========================================

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# 主函数
main() {
    print_header "Git 仓库初始化和推送"

    # 检查是否已配置仓库URL
    if [ "$GITHUB_USERNAME" = "YOUR_USERNAME" ]; then
        print_error "请先配置 GITHUB_USERNAME 和 REPO_NAME"
        echo ""
        echo "编辑脚本，修改以下变量："
        echo "  GITHUB_USERNAME=\"your_github_username\""
        echo "  REPO_NAME=\"family-medication-manager\""
        echo ""
        echo "或者在 GitHub 创建仓库后，直接使用仓库 URL："
        echo "  git init"
        echo "  git add ."
        echo "  git commit -m \"Initial commit\""
        echo "  git remote add origin YOUR_REPO_URL"
        echo "  git push -u origin main"
        exit 1
    fi

    print_info "仓库地址: $GITHUB_REPO_URL"
    echo ""

    # 检查 git 是否安装
    if ! command -v git &> /dev/null; then
        print_error "Git 未安装，请先安装 Git"
        exit 1
    fi

    # 检查是否已经是 git 仓库
    if [ -d ".git" ]; then
        print_warn "当前目录已经是 Git 仓库"
        read -p "是否继续? (y/N): " continue_anyway
        if [ "$continue_anyway" != "y" ] && [ "$continue_anyway" != "Y" ]; then
            exit 0
        fi
    else
        # 初始化 Git 仓库
        print_info "初始化 Git 仓库..."
        git init
        print_success "Git 仓库初始化完成"
    fi

    # 添加所有文件
    print_info "添加文件到暂存区..."
    git add .
    print_success "文件添加完成"

    # 创建首次提交
    print_info "创建首次提交..."
    git commit -m "feat: 家庭药物管理系统初始版本

- ✅ 微信登录认证
- 👨‍👩‍👧‍👦 家庭管理功能
- 💊 药物管理（添加、编辑、归档）
- 📸 扫码添加药物
- ⚠️ 过敏检测和提醒
- 📅 过期提醒
- 📤 数据导出（Excel）
- 🎛️ 后台管理系统
- 🐳 Docker 部署支持
- 📋 完整测试文档

技术栈:
- 前端: Vue 3 + Vant 4 + Pinia
- 后端: Node.js + Express + Prisma
- 数据库: MySQL 8.0
- 后台: Vue 3 + Element Plus"
    print_success "提交完成"

    # 添加远程仓库
    if git remote get-url origin &> /dev/null; then
        print_info "远程仓库已存在，更新 URL..."
        git remote set-url origin "$GITHUB_REPO_URL"
    else
        print_info "添加远程仓库..."
        git remote add origin "$GITHUB_REPO_URL"
    fi
    print_success "远程仓库配置完成"

    # 创建 main 分支
    print_info "设置 main 分支..."
    git branch -M main
    print_success "分支设置完成"

    # 推送到 GitHub
    print_info "推送到 GitHub..."
    print_info "如果提示输入密码，请使用 GitHub Personal Access Token"
    git push -u origin main
    print_success "推送完成"

    print_header "完成！"

    echo -e "${GREEN}🎉 代码已成功推送到 GitHub！${NC}"
    echo ""
    echo "仓库地址: ${BLUE}$GITHUB_REPO_URL${NC}"
    echo ""
    echo "后续操作："
    echo "  1. 访问 GitHub 仓库，确认文件已上传"
    echo "  2. 在 GitHub 仓库设置中配置:"
    echo "     - 仓库描述"
    echo "     - Topics（标签）"
    echo "     - License"
    echo "  3. 部署到服务器:"
    echo "     git clone $GITHUB_REPO_URL"
    echo "     cd $REPO_NAME"
    echo "     ./deploy.sh"
    echo ""
}

main "$@"
