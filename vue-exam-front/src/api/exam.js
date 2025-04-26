import request from '@/utils/request'

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
 * 检查试卷是否已收藏
 * @param {number} id 试卷ID
 * @returns {Promise}
 */
export function checkFavorite(id) {
  return request({
    url: `/exam/favorite/${id}`,
    method: 'get'
  })
}

/**
 * 切换试卷收藏状态
 * @param {number} id 试卷ID
 * @returns {Promise}
 */
export function toggleFavorite(id) {
  return request({
    url: `/exam/favorite/${id}`,
    method: 'post'
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

/**
 * 创建HR专属试卷（从收藏试卷中抽题）
 * @param {Object} data 专属试卷数据
 * @returns {Promise}
 */
export function createPrivateExam(data) {
  return request({
    url: '/exam/private',
    method: 'post',
    data
  })
}

/**
 * 获取HR的专属试卷列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getPrivateExams(params) {
  return request({
    url: '/exam/private',
    method: 'get',
    params
  })
}
