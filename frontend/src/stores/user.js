import { defineStore } from 'pinia'
import { login as loginApi, getCurrentUser } from '../api/auth'
import { getMyFamily } from '../api/family'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    family: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'ADMIN',
    hasFamily: (state) => !!state.user?.familyId,
  },

  actions: {
    /**
     * 用户登录
     */
    async login(openid, nickname, avatar) {
      const res = await loginApi(openid, nickname, avatar)
      this.token = res.token
      this.user = res.user

      // 保存到 localStorage
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))

      return res
    },

    /**
     * 退出登录
     */
    logout() {
      this.token = ''
      this.user = null
      this.family = null

      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    /**
     * 获取用户信息
     */
    async fetchUser() {
      try {
        const res = await getCurrentUser()
        this.user = res
        localStorage.setItem('user', JSON.stringify(res))
        return res
      } catch (error) {
        // 如果获取失败，清除登录状态
        this.logout()
        throw error
      }
    },

    /**
     * 获取家庭信息
     */
    async fetchFamily() {
      try {
        const res = await getMyFamily()
        this.family = res
        return res
      } catch (error) {
        console.error('获取家庭信息失败:', error)
        throw error
      }
    },
  },
})
