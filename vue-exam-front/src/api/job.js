import request from '@/utils/request'

/**
 * 获取职位列表
 * @param {Object} params 查询参数
 * @example
 * {
 *   page: 1,
 *   pageSize: 10,
 *   keyword: '前端开发',
 *   city: '北京',
 *   companyId: 1,
 *   subCategoryId: 2,
 *   salaryMin: 10000,
 *   salaryMax: 20000
 * }
 * @returns {Promise} 返回职位列表和分页信息
 */
export function getJobList(params) {
  return request({
    url: '/job',
    method: 'get',
    params
  })
}

/**
 * 获取职位详情
 * @param {number} id 职位ID
 * @returns {Promise} 返回职位详情，包含公司和面试官信息
 */
export function getJobDetail(id) {
  return request({
    url: `/job/${id}`,
    method: 'get'
  })
}

/**
 * 创建职位
 * @param {Object} data 职位数据
 * @example
 * {
 *   title: '前端开发工程师',
 *   description: '负责公司前端开发',
 *   requirements: '熟悉React、Vue等框架',
 *   city: '北京',
 *   salaryMin: 15000,
 *   salaryMax: 25000,
 *   companyId: 1,
 *   interviewerId: 1,
 *   subCategoryId: 2
 * }
 * @returns {Promise} 返回创建的职位信息
 */
export function createJob(data) {
  return request({
    url: '/job',
    method: 'post',
    data
  })
}

/**
 * 更新职位
 * @param {number} id 职位ID
 * @param {Object} data 要更新的职位数据
 * @example
 * {
 *   title: '资深前端开发工程师',
 *   salaryMin: 20000,
 *   salaryMax: 30000
 * }
 * @returns {Promise} 返回更新后的职位信息
 */
export function updateJob(id, data) {
  return request({
    url: `/job/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除职位（软删除）
 * @param {number} id 职位ID
 * @returns {Promise} 返回删除结果
 */
export function deleteJob(id) {
  return request({
    url: `/job/${id}`,
    method: 'delete'
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
 * 面试官获取创建的职位列表
 * @param {Object} params 查询参数
 * @example
 * {
 *   page: 1,
 *   pageSize: 10
 * }
 * @returns {Promise} 返回职位列表
 */
export function getInterviewerJobs(params) {
  return request({
    url: '/interviewer/jobs',
    method: 'get',
    params
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
