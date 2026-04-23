import request from '../utils/request'

/**
 * 用户登录
 */
export function login(openid, nickname, avatar) {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data: { openid, nickname, avatar }
  })
}

/**
 * 刷新 Token
 */
export function refreshToken() {
  return request({
    url: '/api/auth/refresh',
    method: 'post'
  })
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser() {
  return request({
    url: '/api/auth/me',
    method: 'get'
  })
}
