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

// 在线考试相关接口
/**
 * 验证考试邀请码
 * @param {Object|string} params 邀请码对象或字符串
 * @returns {Promise}
 */
export function verifyInvitationCode(params) {
  // 确保将参数格式化为对象格式
  const data = typeof params === 'string' ? { invitationCode: params } : params

  return request({
    url: '/invitation/verify',
    method: 'post',
    data
  })
}

/**
 * 获取用户的考试列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getUserExams(params) {
  return request({
    url: '/online-exam/user-exams',
    method: 'post',
    data: params || { page: 1, pageSize: 10 }
  })
}

/**
 * 开始考试并获取试卷内容
 * @param {string} invitationCode 邀请码
 * @returns {Promise}
 */
export function startExam(invitationCode) {
  return request({
    url: `/online-exam/start/${invitationCode}`,
    method: 'get'
  })
}

/**
 * 提交考试答案
 * @param {string} invitationCode 邀请码
 * @param {Object} answers 答案
 * @returns {Promise}
 */
export function submitExamAnswers(invitationCode, answers) {
  return request({
    url: '/online-exam/submit',
    method: 'post',
    data: { invitationCode, answers }
  })
}

/**
 * 分配笔试试卷给应聘者
 * @param {Object} data 分配试卷数据
 * @returns {Promise}
 */
export function assignExam(data) {
  return request({
    url: '/online-exam/assign',
    method: 'post',
    data
  })
}

/**
 * 获取在线考试信息
 * @param {string} examId 试卷ID
 * @returns {Promise}
 */
export function getOnlineExam(examId) {
  return request({
    url: `/exam/online/${examId}`,
    method: 'get'
  })
}

/**
 * 保存考试答案（进行中）
 * @param {string} examId 试卷ID
 * @param {Object} answers 答案
 * @returns {Promise}
 */
export function saveExamAnswers(examId, answers) {
  return request({
    url: `/exam/online/${examId}/save`,
    method: 'post',
    data: { answers }
  })
}

/**
 * 生成考试邀请码（仅限面试官/HR使用）
 * @param {Object} data 生成邀请码所需数据，包含examId, duration等
 * @returns {Promise}
 */
export function generateInvitationCode(data) {
  return request({
    url: '/exam/invitation/generate',
    method: 'post',
    data
  })
}

/**
 * 获取在线考试结果
 * @param {string} invitationCode 考试邀请码
 * @returns {Promise}
 */
export function getOnlineExamResult(invitationCode) {
  return request({
    url: `/online-exam/result/${invitationCode}`,
    method: 'get'
  })
}
