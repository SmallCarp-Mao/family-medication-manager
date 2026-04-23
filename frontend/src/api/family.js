import request from '../utils/request'

/**
 * 创建家庭
 */
export function createFamily(name) {
  return request({
    url: '/api/family',
    method: 'post',
    data: { name }
  })
}

/**
 * 获取我的家庭信息
 */
export function getMyFamily() {
  return request({
    url: '/api/family/mine',
    method: 'get'
  })
}

/**
 * 获取家庭成员列表
 */
export function getFamilyMembers() {
  return request({
    url: '/api/family/members',
    method: 'get'
  })
}

/**
 * 获取成员详情
 */
export function getMemberDetail(id) {
  return request({
    url: `/api/family/members/${id}`,
    method: 'get'
  })
}

/**
 * 更新成员信息
 */
export function updateMember(id, data) {
  return request({
    url: `/api/family/members/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除成员
 */
export function deleteMember(id) {
  return request({
    url: `/api/family/members/${id}`,
    method: 'delete'
  })
}

/**
 * 生成邀请链接
 */
export function generateInvite() {
  return request({
    url: '/api/family/invite',
    method: 'post'
  })
}

/**
 * 通过邀请码加入家庭
 */
export function joinFamily(inviteCode) {
  return request({
    url: '/api/family/join',
    method: 'post',
    data: { inviteCode }
  })
}
