import axios from 'axios'
import { showToast, showLoadingToast, closeToast } from 'vant'

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 15000,
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const { response } = error

    if (response) {
      switch (response.status) {
        case 401:
          showToast('登录已过期，请重新登录')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          break
        case 403:
          showToast(response.data.error || '没有权限')
          break
        case 404:
          showToast(response.data.error || '请求的资源不存在')
          break
        case 500:
          showToast('服务器错误，请稍后重试')
          break
        default:
          showToast(response.data.error || '请求失败')
      }
    } else {
      showToast('网络错误，请检查网络连接')
    }

    return Promise.reject(error)
  }
)

export default request
