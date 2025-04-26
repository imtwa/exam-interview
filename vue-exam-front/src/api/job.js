import request from '@/utils/request'

/**
 * 创建招聘信息
 * @param {Object} data 招聘信息
 * @returns {Promise}
 */
export function createJob(data) {
  return request({
    url: '/job',
    method: 'post',
    data
  })
}

/**
 * 获取分页招聘信息列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getJobList(params) {
  return request({
    url: '/job',
    method: 'get',
    params
  })
}

/**
 * 获取招聘信息详情
 * @param {string|number} id 招聘信息ID
 * @returns {Promise}
 */
export function getJob(id) {
  return request({
    url: `/job/${id}`,
    method: 'get'
  })
}

/**
 * 更新招聘信息
 * @param {string|number} id 招聘信息ID
 * @param {Object} data 招聘信息
 * @returns {Promise}
 */
export function updateJob(id, data) {
  return request({
    url: `/job/${id}`,
    method: 'patch',
    data
  })
}

/**
 * 删除招聘信息
 * @param {string|number} id 招聘信息ID
 * @returns {Promise}
 */
export function deleteJob(id) {
  return request({
    url: `/job/${id}`,
    method: 'delete'
  })
}

/**
 * 获取热门城市列表
 * @returns {Promise}
 */
export function getHotCities() {
  return request({
    url: '/job/hot-cities',
    method: 'get'
  })
}

/**
 * 获取面试官发布的职位列表
 * @returns {Promise}
 */
export function getInterviewerJobs() {
  return request({
    url: '/job/interviewer/jobs',
    method: 'get'
  })
}

/**
 * 检查用户资料
 * 检查当前登录用户的资料是否完善
 * @returns {Promise} 返回用户资料信息
 */
export function checkUserProfile() {
  return request({
    url: '/job/profile/check',
    method: 'get'
  })
}

/**
 * 申请职位
 * @param {number} jobId 职位ID
 * @param {Object} data 申请数据
 * @example
 * {
 *   coverLetter: '我对贵公司的职位非常感兴趣...',
 *   resumeUrl: 'https://example.com/resume.pdf'
 * }
 * @returns {Promise} 返回申请结果
 */
export function applyForJob(jobId, data) {
  return request({
    url: `/job/${jobId}/apply`,
    method: 'post',
    data
  })
}

/**
 * 获取用户的职位申请列表
 * @param {Object} params 查询参数
 * @example
 * {
 *   page: 1,
 *   pageSize: 10,
 *   status: 'pending' // 可选，筛选申请状态
 * }
 * @returns {Promise} 返回申请列表
 */
export function getUserApplications(params) {
  return request({
    url: '/applications',
    method: 'get',
    params
  })
}

/**
 * 面试官获取收到的职位申请列表
 * @param {Object} params 查询参数
 * @example
 * {
 *   page: 1,
 *   pageSize: 10,
 *   status: 'pending' // 可选，筛选申请状态
 * }
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
 * @example
 * {
 *   status: 'interview', // 'pending','interview','offer','rejected'
 *   feedback: '希望能够安排一次面试' // 可选
 * }
 * @returns {Promise} 返回更新结果
 */
export function updateApplicationStatus(applicationId, data) {
  return request({
    url: `/interviewer/applications/${applicationId}/status`,
    method: 'put',
    data
  })
}

/**
 * 安排面试
 * @param {number} applicationId 申请ID
 * @param {Object} data 面试安排数据
 * @example
 * {
 *   scheduleTime: '2023-12-25T14:00:00', // ISO8601格式的日期时间
 *   duration: 60, // 面试时长（分钟）
 *   meetingLink: 'https://meeting.example.com/123456' // 可选，面试链接
 * }
 * @returns {Promise} 返回面试安排结果
 */
export function scheduleInterview(applicationId, data) {
  return request({
    url: `/interviewer/applications/${applicationId}/interview`,
    method: 'post',
    data
  })
}

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
