import request from './request'

/**
 * 获取试题列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getQuestionList(params) {
  return request({
    url: '/api/question-bank',
    method: 'get',
    params
  })
}

/**
 * 获取试题详情
 * @param {string} id 试题ID
 * @returns {Promise}
 */
export function getQuestionDetail(id) {
  return request({
    url: `/api/question-bank/${id}`,
    method: 'get'
  })
}

/**
 * 上传试卷Excel文件
 * @param {FormData} data 包含文件和试卷信息的FormData对象
 * @returns {Promise}
 */
export function uploadExamPaper(data) {
  return request({
    url: '/api/question-bank/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取试题库模板
 * @returns {Promise}
 */
export function getQuestionTemplate() {
  return request({
    url: '/api/question-bank/template',
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 获取分类列表
 * @returns {Promise}
 */
export function getCategoryList() {
  return request({
    url: '/api/category/list',
    method: 'get'
  })
}

/**
 * 获取试卷模板
 * @returns {Promise}
 */
export function getExamTemplate() {
  return request({
    url: '/api/exam/template',
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 获取试卷列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getExamList(params) {
  return request({
    url: '/api/exam/list',
    method: 'get',
    params
  })
}

/**
 * 获取试卷详情
 * @param {string} id 试卷ID
 * @returns {Promise}
 */
export function getExamDetail(id) {
  return request({
    url: `/api/exam/${id}`,
    method: 'get'
  })
} 