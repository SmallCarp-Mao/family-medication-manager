#!/bin/bash

# ========================================
# 家庭药物管理系统 - 一键部署脚本
# ========================================
# 使用方法:
#   ./deploy.sh              # 首次部署
#   ./deploy.sh --rebuild    # 重新构建镜像
#   ./deploy.sh --no-cache   # 无缓存构建
# ========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 图标
ICON_OK="${GREEN}✓${NC}"
ICON_ERROR="${RED}✗${NC}"
ICON_INFO="${BLUE}ℹ${NC}"
ICON_WARN="${YELLOW}⚠${NC}"

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 检查环境
check_environment() {
    print_header "检查部署环境"

    # 检查 Docker
    if command_exists docker; then
        print_success "Docker 已安装: $(docker --version)"
    else
        print_error "Docker 未安装，请先安装 Docker"
        echo "   访问 https://docs.docker.com/get-docker/ 获取安装指南"
        exit 1
    fi

    # 检查 Docker Compose
    if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
        print_success "Docker Compose 已安装"
    else
        print_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi

    # 检查 docker-compose.yml
    if [ ! -f "docker-compose.yml" ]; then
        print_error "未找到 docker-compose.yml 文件"
        exit 1
    fi

    # 检查环境变量文件
    if [ ! -f ".env.docker" ]; then
        print_warn "未找到 .env.docker 文件"
        if [ -f ".env.docker.example" ]; then
            print_info "正在从 .env.docker.example 创建 .env.docker..."
            cp .env.docker.example .env.docker
            print_success "已创建 .env.docker 文件"
            print_warn "请编辑 .env.docker 文件，配置数据库密码和 JWT 密钥后重新运行"
            echo ""
            echo "编辑命令: nano .env.docker"
            echo "或: vim .env.docker"
            exit 0
        else
            print_error "未找到 .env.docker.example 文件"
            exit 1
        fi
    fi

    # 检查是否修改了默认密码
    if grep -q "root_password_123456" .env.docker || grep -q "med_password_123456" .env.docker; then
        print_warn "检测到使用默认密码，建议修改 .env.docker 中的密码"
        read -p "是否继续部署? (y/N): " continue_anyway
        if [ "$continue_anyway" != "y" ] && [ "$continue_anyway" != "Y" ]; then
            print_info "已取消部署"
            exit 0
        fi
    fi

    print_success "环境检查通过"
}

# 停止现有服务
stop_services() {
    print_header "停止现有服务"

    if docker-compose ps | grep -q "Up"; then
        print_info "正在停止现有容器..."
        docker-compose down
        print_success "现有服务已停止"
    else
        print_info "没有运行中的服务"
    fi
}

# 构建镜像
build_images() {
    print_header "构建 Docker 镜像"

    print_info "这可能需要几分钟时间，请耐心等待..."

    if [ "$1" = "--no-cache" ]; then
        print_info "使用 --no-cache 模式构建"
        docker-compose build --no-cache
    else
        docker-compose build
    fi

    print_success "镜像构建完成"
}

# 启动服务
start_services() {
    print_header "启动服务"

    print_info "正在启动容器..."
    docker-compose up -d

    print_success "服务已启动"
}

# 等待数据库就绪
wait_for_database() {
    print_header "等待数据库启动"

    print_info "等待 MySQL 数据库就绪..."
    max_attempts=30
    attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if docker-compose exec -T mysql mysqladmin ping -h localhost -u root -p${MYSQL_ROOT_PASSWORD:-root_password_123456} >/dev/null 2>&1; then
            print_success "数据库已就绪"
            return 0
        fi
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done

    print_error "数据库启动超时"
    return 1
}

# 运行数据库迁移
run_migrations() {
    print_header "运行数据库迁移"

    print_info "正在执行 Prisma 迁移..."
    docker-compose exec -T backend npx prisma migrate deploy

    print_success "数据库迁移完成"
}

# 显示服务状态
show_status() {
    print_header "服务状态"

    docker-compose ps
}

# 显示访问信息
show_access_info() {
    print_header "访问信息"

    echo -e "${GREEN}🎉 部署完成！${NC}"
    echo ""
    echo "服务访问地址："
    echo "  • 前端应用:     ${GREEN}http://localhost${NC}"
    echo "  • 后端API:      ${GREEN}http://localhost:3000${NC}"
    echo "  • 后台管理:     ${GREEN}http://localhost:8080${NC}"
    echo "  • MySQL数据库:  ${GREEN}localhost:3306${NC}"
    echo ""
    echo "常用命令："
    echo "  • 查看日志:     ${YELLOW}docker-compose logs -f${NC}"
    echo "  • 停止服务:     ${YELLOW}docker-compose down${NC}"
    echo "  • 重启服务:     ${YELLOW}./manage.sh restart${NC}"
    echo "  • 管理服务:     ${YELLOW}./manage.sh [command]${NC}"
    echo ""
}

# 主函数
main() {
    print_header "家庭药物管理系统 - 自动部署"

    # 解析参数
    REBUILD=false
    NO_CACHE=false

    for arg in "$@"; do
        case $arg in
            --rebuild)
                REBUILD=true
                ;;
            --no-cache)
                NO_CACHE=true
                ;;
        esac
    done

    # 执行部署流程
    check_environment

    if [ "$REBUILD" = true ]; then
        stop_services
    fi

    if [ "$NO_CACHE" = true ]; then
        build_images --no-cache
    else
        build_images
    fi

    start_services
    wait_for_database
    run_migrations
    show_status
    show_access_info
}

# 运行主函数
main "$@"
