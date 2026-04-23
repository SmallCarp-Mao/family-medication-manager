import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, getProfile } from '../api/admin'

export const useAdminStore = defineStore('admin', () => {
  const token = ref(localStorage.getItem('admin_token') || '')
  const admin = ref(JSON.parse(localStorage.getItem('admin_info') || 'null'))

  const isLoggedIn = computed(() => !!token.value)

  // 登录
  const loginAction = async (email, password) => {
    try {
      const data = await login(email, password)
      token.value = data.token
      admin.value = data.admin
      localStorage.setItem('admin_token', data.token)
      localStorage.setItem('admin_info', JSON.stringify(data.admin))
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // 退出登录
  const logout = () => {
    token.value = ''
    admin.value = null
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_info')
  }

  // 检查登录状态
  const checkLogin = () => {
    const savedToken = localStorage.getItem('admin_token')
    const savedAdmin = localStorage.getItem('admin_info')
    if (savedToken && savedAdmin) {
      token.value = savedToken
      admin.value = JSON.parse(savedAdmin)
    }
  }

  return {
    token,
    admin,
    isLoggedIn,
    loginAction,
    logout,
    checkLogin
  }
})
