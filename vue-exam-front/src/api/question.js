import request from './request'

/**
 * 获取试题列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getQuestionList(params) {
  return request({
    url: '/question/list',
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
    url: `/question/detail/${id}`,
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
    url: '/question/upload',
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
    url: '/question/template',
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
    url: '/category/list',
    method: 'get'
  })
}

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
 * @param {string} id 试卷ID
 * @returns {Promise}
 */
export function getExamDetail(id) {
  return request({
    url: `/exam/detail/${id}`,
    method: 'get'
  })
}

/**
 * 提交考试答案
 * @param {Object} data 考试答案数据
 * @returns {Promise}
 */
export function submitExamAnswer(data) {
  return request({
    url: '/exam/submit',
    method: 'post',
    data
  })
}

/**
 * 获取考试结果
 * @param {string} examId 考试ID
 * @returns {Promise}
 */
export function getExamResult(examId) {
  return request({
    url: `/exam/result/${examId}`,
    method: 'get'
  })
} 