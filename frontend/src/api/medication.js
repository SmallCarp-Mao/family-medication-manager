import request from '../utils/request'

/**
 * 获取药物列表
 */
export function getMedications(params) {
  return request({
    url: '/api/medications',
    method: 'get',
    params
  })
}

/**
 * 获取药物详情
 */
export function getMedicationDetail(id) {
  return request({
    url: `/api/medications/${id}`,
    method: 'get'
  })
}

/**
 * 添加药物
 */
export function addMedication(data) {
  return request({
    url: '/api/medications',
    method: 'post',
    data
  })
}

/**
 * 更新药物
 */
export function updateMedication(id, data) {
  return request({
    url: `/api/medications/${id}`,
    method: 'put',
    data
  })
}

/**
 * 归档药物
 */
export function archiveMedication(id) {
  return request({
    url: `/api/medications/${id}/archive`,
    method: 'post'
  })
}

/**
 * 删除药物
 */
export function deleteMedication(id) {
  return request({
    url: `/api/medications/${id}`,
    method: 'delete'
  })
}

/**
 * 获取过期药物列表
 */
export function getExpiredMedications() {
  return request({
    url: '/api/medications/expired/list',
    method: 'get'
  })
}

/**
 * 检查药物过敏
 */
export function checkAllergy(drugName) {
  return request({
    url: '/api/medications/check-allergy',
    method: 'post',
    data: { drugName }
  })
}
