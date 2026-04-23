import request from '../utils/request'

/**
 * 上传药物照片
 */
export function uploadImage(file) {
  const formData = new FormData()
  formData.append('photo', file)

  return request({
    url: '/api/upload/image',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
