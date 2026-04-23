<template>
  <div class="admin-layout">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="200px">
        <div class="logo">
          <h2>💊 管理后台</h2>
        </div>
        <el-menu
          :default-active="activeMenu"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409eff"
        >
          <el-menu-item index="/dashboard">
            <el-icon><DataBoard /></el-icon>
            <span>数据概览</span>
          </el-menu-item>
          <el-menu-item index="/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/families">
            <el-icon><House /></el-icon>
            <span>家庭管理</span>
          </el-menu-item>
          <el-menu-item index="/medications">
            <el-icon><FirstAidKit /></el-icon>
            <span>药物管理</span>
          </el-menu-item>
          <el-menu-item index="/admins" v-if="isAdmin">
            <el-icon><UserFilled /></el-icon>
            <span>管理员</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <!-- 顶部栏 -->
        <el-header>
          <div class="header-content">
            <div class="breadcrumb">
              <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
              </el-breadcrumb>
            </div>
            <div class="user-info">
              <el-dropdown>
                <span class="user-name">
                  {{ adminStore.admin?.name || adminStore.admin?.email }}
                  <el-icon><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleLogout">
                      <el-icon><SwitchButton /></el-icon>
                      退出登录
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>

        <!-- 页面内容 -->
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useAdminStore } from '../stores/admin'

const router = useRouter()
const route = useRoute()
const adminStore = useAdminStore()

const activeMenu = computed(() => route.path)
const isAdmin = computed(() => adminStore.admin?.role === 'SUPER_ADMIN')

const menuTitles = {
  '/dashboard': '数据概览',
  '/users': '用户管理',
  '/families': '家庭管理',
  '/medications': '药物管理',
  '/admins': '管理员管理'
}

const currentTitle = computed(() => menuTitles[route.path] || '首页')

const handleLogout = async () => {
  await ElMessageBox.confirm('确定要退出登录吗?', '提示', {
    type: 'warning'
  })
  adminStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.el-container {
  height: 100%;
}

.el-aside {
  background-color: #304156;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2a3c4f;
}

.logo h2 {
  color: #fff;
  font-size: 18px;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-name {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.el-main {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>
