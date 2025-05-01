import request from '@/utils/request'

/**
 * 获取当前用户的面试官信息
 * @returns {Promise}
 */
export function getInterviewerProfile() {
  return request({
    url: '/interviewer/profile',
    method: 'get'
  })
}

/**
 * 创建或更新面试官信息（旧接口，需要传递companyId作为查询参数）
 * @param {Object} data 面试官信息
 * @param {number} companyId 公司ID
 * @returns {Promise}
 */
export function createOrUpdateInterviewer(data, companyId) {
  return request({
    url: `/interviewer/profile?companyId=${companyId}`,
    method: 'post',
    data
  })
}

/**
 * 创建或更新面试官信息（新接口，支持同时创建公司）
 * @param {Object} data 包含面试官信息和公司信息的对象
 * @returns {Promise}
 */
export function updateInterviewerProfile(data) {
  return request({
    url: '/interviewer/profile/setup',
    method: 'post',
    data
  })
}

/**
 * 获取面试官创建的职位列表
 * @returns {Promise}
 */
export function getInterviewerJobs() {
  return request({
    url: '/interviewer/jobs',
    method: 'get'
  })
}

/**
 * 获取面试官收到的职位申请列表
 * @returns {Promise}
 */
export function getInterviewerApplications() {
  return request({
    url: '/interviewer/applications',
    method: 'get'
  })
}

/**
 * 更新职位申请状态
 * @param {string|number} id 申请ID
 * @param {Object} data 状态信息
 * @returns {Promise}
 */
export function updateApplicationStatus(id, data) {
  return request({
    url: `/interviewer/applications/${id}/status`,
    method: 'put',
    data
  })
}

/**
 * 安排面试
 * @param {string|number} id 申请ID
 * @param {Object} data 面试信息
 * @returns {Promise}
 */
export function arrangeInterview(id, data) {
  return request({
    url: `/interviewer/applications/${id}/interview`,
    method: 'post',
    data
  })
}
