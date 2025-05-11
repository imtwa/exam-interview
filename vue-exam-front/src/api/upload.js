import request from '@/utils/request'

/**
 * 更新&上传求职者简历
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
