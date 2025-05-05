import request from '@/utils/request'

/**
 * 创建面试
 * @param {Object} data 面试信息
 * @returns {Promise}
 */
export function createInterview(data) {
  return request({
    url: '/interview',
    method: 'post',
    data
  })
}

/**
 * 获取面试列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getInterviewList(params) {
  return request({
    url: '/interview/page',
    method: 'get',
    params
  })
}

/**
 * 获取面试详情
 * @param {string|number} id 面试ID
 * @returns {Promise}
 */
export function getInterview(id) {
  return request({
    url: `/interview/${id}`,
    method: 'get'
  })
}

/**
 * 更新面试信息
 * @param {string|number} id 面试ID
 * @param {Object} data 面试信息
 * @returns {Promise}
 */
export function updateInterview(id, data) {
  return request({
    url: `/interview/update/${id}`,
    method: 'post',
    data
  })
}

/**
 * 删除面试
 * @param {string|number} id 面试ID
 * @returns {Promise}
 */
export function deleteInterview(id) {
  return request({
    url: `/interview/delete/${id}`,
    method: 'post'
  })
}

/**
 * 验证面试邀请码
 * @param {Object|string} params 邀请码对象或字符串
 * @returns {Promise}
 */
export function verifyInterviewInvitationCode(params) {
  // 确保将参数格式化为对象格式
  const data = typeof params === 'string' ? { invitationCode: params } : params

  return request({
    url: '/interview/invitation/verify',
    method: 'post',
    data
  })
}

/**
 * 开始面试并获取面试内容
 * @param {string} invitationCode 邀请码
 * @returns {Promise}
 */
export function startInterview(invitationCode) {
  return request({
    url: `/interview/start/${invitationCode}`,
    method: 'get'
  })
}

/**
 * 结束面试
 * @param {string} invitationCode 邀请码
 * @returns {Promise}
 */
export function completeInterview(invitationCode) {
  return request({
    url: `/interview/complete/${invitationCode}`,
    method: 'post'
  })
}

/**
 * 提交面试反馈
 * @param {string} invitationCode 邀请码
 * @param {Object} feedback 反馈内容
 * @returns {Promise}
 */
export function submitInterviewFeedback(invitationCode, feedback) {
  return request({
    url: '/interview/feedback',
    method: 'post',
    data: { invitationCode, feedback }
  })
}
