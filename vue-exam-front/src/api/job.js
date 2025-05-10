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
 * 获取分页招聘信息列表(支持更多筛选条件)
 * @param {Object} params 查询参数
 * @example
 * {
 *   page: 1,                // 页码
 *   pageSize: 10,           // 每页条数
 *   keyword: "前端",        // 关键词
 *   city: "北京",           // 城市（支持模糊查询）
 *   salaryMin: 5000,        // 薪资下限
 *   salaryMax: 10000,       // 薪资上限
 *   experienceReq: "STUDENT", // 工作经验要求
 *   educationReq: "BACHELOR"  // 学历要求
 * }
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
    url: `/job/update/${id}`,
    method: 'post',
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
    url: `/job/delete/${id}`,
    method: 'post'
  })
}

/**
 * 获取面试官发布的职位列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getInterviewerJobs(params = {}) {
  return request({
    url: '/job/interviewer/jobs',
    method: 'get',
    params
  })
}

/**
 * 获取面试官发布的职位列表(带筛选)
 * @param {Object} params 查询参数
 * @example
 * {
 *   page: 1,             // 页码
 *   pageSize: 10,        // 每页条数
 *   keyword: "开发",     // 关键词
 *   status: "ACTIVE"     // 职位状态: "ACTIVE"(招聘中),"FILLED"(已招满),"EXPIRED"(已过期)
 * }
 * @returns {Promise}
 */
export function searchInterviewerJobs(params = {}) {
  return request({
    url: '/job/interviewer/jobs/search',
    method: 'get',
    params
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
 * 申请职位（一键投递）
 * @param {number} jobId 职位ID
 * @returns {Promise} 返回申请结果
 */
export function applyForJob(jobId) {
  return request({
    url: `/job/${jobId}/apply`,
    method: 'post'
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
    url: `/interviewer/applications/${applicationId}/status/update`,
    method: 'post',
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

/**
 * 获取职位详情
 * @param {number} id 职位ID
 * @returns {Promise}
 */
export function getJobById(id) {
  return request({
    url: `/job/${id}`,
    method: 'get'
  })
}

/**
 * 获取面试官发布的职位
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getJobsByInterviewer(params) {
  // 确保params.page是数字类型
  const queryParams = { ...params }
  if (queryParams.page) {
    queryParams.page = Number(queryParams.page)
  }
  if (queryParams.pageSize) {
    queryParams.pageSize = Number(queryParams.pageSize)
  }

  return request({
    url: '/job/interviewer/jobs',
    method: 'get',
    params: queryParams
  })
}

/**
 * 获取公司的所有职位
 * @param {number} companyId 公司ID
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getCompanyJobs(companyId, params = {}) {
  return request({
    url: `/job/company/${companyId}`,
    method: 'get',
    params
  })
}

/**
 * 获取用户的职位申请列表
 * @param {Object} params 查询参数
 * @example
 * {
 *   page: 1,
 *   pageSize: 10,
 *   status: 'pending', // 可选，筛选申请状态
 *   keyword: '', // 可选，关键词搜索
 *   startDate: '', // 可选，开始日期
 *   endDate: '' // 可选，结束日期
 * }
 * @returns {Promise} 返回申请列表
 */
export function getUserApplications(params) {
  return request({
    url: '/job/applications/jobseeker',
    method: 'get',
    params
  })
}

/**
 * 撤回职位申请
 * @param {number} applicationId 申请ID
 * @returns {Promise} 返回操作结果
 */
export function withdrawApplication(applicationId) {
  return request({
    url: `/job/applications/${applicationId}/withdraw`,
    method: 'post'
  })
}
