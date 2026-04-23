import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // Token 过期，清除登录信息
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_info')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || { error: '请求失败' })
  }
)

// 管理员登录
export const login = (email, password) => {
  return api.post('/admin/login', { email, password })
}

// 获取统计数据
export const getStats = () => {
  return api.get('/admin/stats')
}

// 获取用户列表
export const getUsers = (params) => {
  return api.get('/admin/users', { params })
}

// 获取家庭列表
export const getFamilies = (params) => {
  return api.get('/admin/families', { params })
}

// 获取药物列表
export const getMedications = (params) => {
  return api.get('/admin/medications', { params })
}

// 获取管理员列表
export const getAdmins = () => {
  return api.get('/admin/admins')
}

// 创建管理员
export const createAdmin = (data) => {
  return api.post('/admin/admins', data)
}

// 更新管理员状态
export const updateAdminStatus = (id, isActive) => {
  return api.put(`/admin/admins/${id}/status`, { isActive })
}

export default api
