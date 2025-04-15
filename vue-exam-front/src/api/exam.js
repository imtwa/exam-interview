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

/**
 * 提交试卷答案
 * @param {Object} data 答案数据
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
 * @param {string} examId 试卷ID
 * @returns {Promise}
 */
export function getExamResult(examId) {
  return request({
    url: `/exam/result/${examId}`,
    method: 'get'
  })
}

/**
 * 添加或取消收藏试卷
 * @param {number} examId 试卷ID
 * @returns {Promise}
 */
export function toggleFavorite(examId) {
  return request({
    url: `/exam/favorite/${examId}`,
    method: 'post'
  })
}

/**
 * 检查试卷是否已收藏
 * @param {number} examId 试卷ID
 * @returns {Promise}
 */
export function checkFavorite(examId) {
  return request({
    url: `/exam/favorite/${examId}`,
    method: 'get'
  })
}

/**
 * 获取用户收藏的试卷列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getFavorites(params) {
  return request({
    url: '/exam/favorites',
    method: 'get',
    params
  })
} 