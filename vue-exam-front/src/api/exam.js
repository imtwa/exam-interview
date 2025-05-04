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
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
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
 * 切换试卷收藏状态
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
 * 获取用户收藏的试卷列表
 * @param {Object} data 查询参数
 * @returns {Promise}
 */
export function getUserFavorites(data) {
  return request({
    url: '/exam/getUserFavorites',
    method: 'post',
    data
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

/**
 * 创建分类
 * @param {Object} data 分类数据
 * @returns {Promise}
 */
export function createCategory(data) {
  return request({
    url: '/category',
    method: 'post',
    data
  })
}

/**
 * 更新分类
 * @param {number} id 分类ID
 * @param {Object} data 分类数据
 * @returns {Promise}
 */
export function updateCategory(id, data) {
  return request({
    url: `/category/${id}`,
    method: 'post',
    data
  })
}

/**
 * 删除分类
 * @param {number} id 分类ID
 * @returns {Promise}
 */
export function deleteCategory(id) {
  return request({
    url: `/category/delete/${id}`,
    method: 'post'
  })
}

/**
 * 创建子分类
 * @param {Object} data 子分类数据
 * @returns {Promise}
 */
export function createSubCategory(data) {
  return request({
    url: '/subcategory',
    method: 'post',
    data
  })
}

/**
 * 更新子分类
 * @param {number} id 子分类ID
 * @param {Object} data 子分类数据
 * @returns {Promise}
 */
export function updateSubCategory(id, data) {
  return request({
    url: `/subcategory/${id}`,
    method: 'post',
    data
  })
}

/**
 * 删除子分类
 * @param {number} id 子分类ID
 * @returns {Promise}
 */
export function deleteSubCategory(id) {
  return request({
    url: `/subcategory/delete/${id}`,
    method: 'post'
  })
}

/**
 * 获取所有分类
 * @returns {Promise}
 */
export function getAllCategories() {
  return request({
    url: '/category/list',
    method: 'get'
  })
}

/**
 * 获取面试官的专属试卷列表
 * @param {Object} params 包含面试官ID和查询参数
 * @returns {Promise}
 */
export function getInterviewerPrivateExams(data) {
  return request({
    url: '/exam/private/interviewer',
    method: 'post',
    data
  })
}

/**
 * 获取专属试卷详情
 * @param {number} id 试卷ID
 * @returns {Promise}
 */
export function getPrivateExamDetail(id) {
  return request({
    url: `/exam/private/${id}`,
    method: 'get'
  })
}
