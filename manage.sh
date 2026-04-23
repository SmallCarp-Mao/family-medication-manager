#!/bin/bash

# ========================================
# 家庭药物管理系统 - 管理脚本
# ========================================
# 使用方法: ./manage.sh [command]
# ========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 加载环境变量
if [ -f .env.docker ]; then
    export $(cat .env.docker | grep -v '^#' | xargs)
fi

# 显示帮助信息
show_help() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  家庭药物管理系统 - 管理脚本${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "用法: ./manage.sh [command]"
    echo ""
    echo "命令:"
    echo "  ${GREEN}start${NC}          启动所有服务"
    echo "  ${GREEN}stop${NC}           停止所有服务"
    echo "  ${GREEN}restart${NC}        重启所有服务"
    echo "  ${GREEN}status${NC}         查看服务状态"
    echo "  ${GREEN}logs${NC}           查看所有服务日志"
    echo "  ${GREEN}logs [service]${NC} 查看指定服务日志 (frontend/backend/mysql)"
    echo "  ${GREEN}migrate${NC}        运行数据库迁移"
    echo "  ${GREEN}studio${NC}         启动 Prisma Studio (数据库管理工具)"
    echo "  ${GREEN}shell [service]${NC} 进入服务容器 (backend/mysql)"
    echo "  ${GREEN}rebuild${NC}        重新构建并启动所有服务"
    echo "  ${GREEN}clean${NC}          清理所有容器和数据卷 (危险操作)"
    echo "  ${GREEN}backup${NC}         备份数据库"
    echo "  ${GREEN}restore [file]${NC} 恢复数据库"
    echo "  ${GREEN}health${NC}         检查服务健康状态"
    echo "  ${GREEN}help${NC}           显示此帮助信息"
    echo ""
}

# 启动服务
start_services() {
    echo -e "${BLUE}▶ 启动服务...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✓ 服务已启动${NC}"
    echo ""
    docker-compose ps
}

# 停止服务
stop_services() {
    echo -e "${YELLOW}⏹ 停止服务...${NC}"
    docker-compose down
    echo -e "${GREEN}✓ 服务已停止${NC}"
}

# 重启服务
restart_services() {
    echo -e "${BLUE}↻ 重启服务...${NC}"
    docker-compose restart
    echo -e "${GREEN}✓ 服务已重启${NC}"
}

# 查看状态
show_status() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  服务状态${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    docker-compose ps
    echo ""
}

# 查看日志
show_logs() {
    if [ -z "$1" ]; then
        echo -e "${BLUE}📋 查看所有服务日志...${NC}"
        echo -e "${YELLOW}按 Ctrl+C 退出${NC}"
        echo ""
        docker-compose logs -f
    else
        echo -e "${BLUE}📋 查看 $1 服务日志...${NC}"
        echo -e "${YELLOW}按 Ctrl+C 退出${NC}"
        echo ""
        docker-compose logs -f "$1"
    fi
}

# 运行数据库迁移
run_migrations() {
    echo -e "${BLUE}🗄 运行数据库迁移...${NC}"
    docker-compose exec -T backend npx prisma migrate deploy
    echo -e "${GREEN}✓ 迁移完成${NC}"
}

# 启动 Prisma Studio
start_studio() {
    echo -e "${BLUE}🔧 启动 Prisma Studio...${NC}"
    echo -e "${YELLOW}Prisma Studio 将在 http://localhost:5555 打开${NC}"
    echo -e "${YELLOW}按 Ctrl+C 停止${NC}"
    echo ""
    docker-compose exec backend npx prisma studio --browser none
}

# 进入容器
enter_shell() {
    if [ -z "$1" ]; then
        echo -e "${RED}✗ 请指定服务名称 (backend/mysql)${NC}"
        exit 1
    fi

    echo -e "${BLUE}🐚 进入 $1 容器...${NC}"
    docker-compose exec "$1" /bin/sh
}

# 重新构建
rebuild_services() {
    echo -e "${BLUE}🔨 重新构建镜像...${NC}"
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    echo -e "${GREEN}✓ 重新构建完成${NC}"
}

# 清理容器和数据卷
clean_all() {
    echo -e "${RED}⚠ 警告: 此操作将删除所有容器和数据卷！${NC}"
    read -p "确定要继续吗? (yes/NO): " confirm

    if [ "$confirm" = "yes" ]; then
        echo -e "${YELLOW}🗑 清理中...${NC}"
        docker-compose down -v
        echo -e "${GREEN}✓ 清理完成${NC}"
    else
        echo -e "${BLUE}已取消${NC}"
    fi
}

# 备份数据库
backup_database() {
    BACKUP_DIR="./backups"
    mkdir -p "$BACKUP_DIR"

    BACKUP_FILE="$BACKUP_DIR/family-med-$(date +%Y%m%d-%H%M%S).sql"

    echo -e "${BLUE}💾 备份数据库到 $BACKUP_FILE...${NC}"

    docker-compose exec -T mysql mysqldump \
        -u root \
        -p${MYSQL_ROOT_PASSWORD:-root_password_123456} \
        family_medication > "$BACKUP_FILE"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 备份完成: $BACKUP_FILE${NC}"
    else
        echo -e "${RED}✗ 备份失败${NC}"
        rm -f "$BACKUP_FILE"
    fi
}

# 恢复数据库
restore_database() {
    if [ -z "$1" ]; then
        echo -e "${RED}✗ 请指定备份文件${NC}"
        exit 1
    fi

    if [ ! -f "$1" ]; then
        echo -e "${RED}✗ 文件不存在: $1${NC}"
        exit 1
    fi

    echo -e "${YELLOW}⚠ 警告: 恢复数据库将覆盖现有数据！${NC}"
    read -p "确定要继续吗? (yes/NO): " confirm

    if [ "$confirm" = "yes" ]; then
        echo -e "${BLUE}📥 恢复数据库从 $1...${NC}"

        docker-compose exec -T mysql mysql \
            -u root \
            -p${MYSQL_ROOT_PASSWORD:-root_password_123456} \
            family_medication < "$1"

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ 恢复完成${NC}"
        else
            echo -e "${RED}✗ 恢复失败${NC}"
        fi
    else
        echo -e "${BLUE}已取消${NC}"
    fi
}

# 健康检查
check_health() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  服务健康检查${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # 检查 MySQL
    echo -n "MySQL 数据库:     "
    if docker-compose exec -T mysql mysqladmin ping -h localhost -u root -p${MYSQL_ROOT_PASSWORD:-root_password_123456} >/dev/null 2>&1; then
        echo -e "${GREEN}✓ 正常${NC}"
    else
        echo -e "${RED}✗ 异常${NC}"
    fi

    # 检查后端 API
    echo -n "后端 API:         "
    if curl -s http://localhost:3000/api/health >/dev/null 2>&1 || curl -s http://localhost:3000/api/auth/login -X POST -H "Content-Type: application/json" -d '{}' >/dev/null 2>&1; then
        echo -e "${GREEN}✓ 正常${NC}"
    else
        echo -e "${YELLOW}⚠ 可能异常 (请检查后端是否实现 /api/health)${NC}"
    fi

    # 检查前端
    echo -n "前端应用:         "
    if curl -s http://localhost >/dev/null 2>&1; then
        echo -e "${GREEN}✓ 正常${NC}"
    else
        echo -e "${RED}✗ 异常${NC}"
    fi

    # 检查容器状态
    echo ""
    echo "容器状态:"
    docker-compose ps
    echo ""
}

# 主函数
main() {
    case "$1" in
        start)
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs "$2"
            ;;
        migrate)
            run_migrations
            ;;
        studio)
            start_studio
            ;;
        shell)
            enter_shell "$2"
            ;;
        rebuild)
            rebuild_services
            ;;
        clean)
            clean_all
            ;;
        backup)
            backup_database
            ;;
        restore)
            restore_database "$2"
            ;;
        health)
            check_health
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            echo -e "${RED}✗ 未知命令: $1${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# 显示帮助（如果无参数）
if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

# 运行主函数
main "$@"
