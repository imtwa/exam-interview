import request from '@/utils/request'

/**
 * 获取面试官个人资料
 * @returns {Promise} 返回面试官资料
 */
export function getInterviewerProfile() {
  return request({
    url: '/interviewer/profile',
    method: 'get'
  })
}

/**
 * 更新面试官个人资料
 * @param {Object} data 面试官资料
 * @returns {Promise}
 */
export function updateInterviewerProfile(data) {
  return request({
    url: '/interviewer/profile',
    method: 'post',
    data
  })
}

/**
 * 面试官获取收到的职位申请列表
 * @param {Object} params 查询参数
 * @returns {Promise} 返回申请列表
 */
export function getInterviewerApplications(params) {
  return request({
    url: '/interviewer/applications',
    method: 'get',
    params
  })
}

/**
 * 更新职位申请状态
 * @param {number} applicationId 申请ID
 * @param {Object} data 状态更新数据
 * @returns {Promise} 返回更新结果
 */
export function updateApplicationStatus(applicationId, data) {
  return request({
    url: `/interviewer/applications/${applicationId}/status`,
    method: 'post',
    data
  })
}

/**
 * 安排面试
 * @param {number} applicationId 申请ID
 * @param {Object} data 面试安排数据
 * @returns {Promise} 返回面试安排结果
 */
export function scheduleInterview(applicationId, data) {
  return request({
    url: `/interviewer/applications/${applicationId}/schedule`,
    method: 'post',
    data
  })
}

/**
 * 面试官设置个人资料和公司信息
 * @param {Object} data 设置数据
 * @returns {Promise}
 */
export function setupInterviewerProfile(data) {
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
 * 获取面试官列表
 * @param {Object} params 查询参数
 * @returns {Promise} 返回面试官列表
 */
export function getInterviewers(params) {
  return request({
    url: '/api/interviewer/interviewers',
    method: 'get',
    params
  })
}
