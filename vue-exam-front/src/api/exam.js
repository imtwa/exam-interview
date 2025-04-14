import request from './request'

/**
 * 获取试卷列表
 * @param {Object} params 查询参数 
 * @returns {Promise}
 */
export function getExamList(params) {
  return request({
    url: '/exam/list',
    method: 'get',
    params
  })
}

/**
 * 获取试卷详情
 * @param {number} id 试卷ID
 * @returns {Promise}
 */
export function getExamDetail(id) {
  return request({
    url: `/exam/${id}`,
    method: 'get'
  })
}

/**
 * 上传试卷
 * @param {FormData} data 包含试卷信息和Excel文件的FormData对象
 * @returns {Promise}
 */
export function uploadExam(data) {
  return request({
    url: '/exam/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
} 