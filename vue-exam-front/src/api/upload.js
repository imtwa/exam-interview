import request from '@/utils/request'

/**
 * 上传简历文件
 * @param {File} file 文件对象
 * @returns {Promise} 请求Promise
 */
export function uploadResume(file) {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: '/upload/resume',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
