import request from '@/utils/request'

/**
 * 获取当前用户的求职者资料
 * @returns {Promise}
 */
export function getJobseekerProfile() {
  return request({
    url: '/jobseeker/profile',
    method: 'get'
  })
}

/**
 * 更新求职者基本资料
 * @param {Object} data 求职者基本资料
 * @returns {Promise}
 */
export function updateJobseekerProfile(data) {
  return request({
    url: '/jobseeker/profile/update',
    method: 'post',
    data
  })
}

/**
 * 同步更新求职者完整资料（包括基本信息、教育经历、工作经历和求职意向）
 * @param {Object} data 求职者完整资料
 * @returns {Promise}
 */
export function syncJobseekerProfile(data) {
  return request({
    url: '/jobseeker/profile/sync',
    method: 'post',
    data
  })
}

/**
 * 分页获取求职者列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getJobseekerList(params) {
  return request({
    url: '/jobseeker/page',
    method: 'get',
    params
  })
}

/**
 * 根据ID获取求职者信息
 * @param {string|number} id 求职者ID
 * @returns {Promise}
 */
export function getJobseeker(id) {
  return request({
    url: `/jobseeker/${id}`,
    method: 'get'
  })
}

/**
 * 添加教育经历
 * @param {Object} data 教育经历
 * @returns {Promise}
 */
export function addEducation(data) {
  return request({
    url: '/jobseeker/education',
    method: 'post',
    data
  })
}

/**
 * 更新教育经历
 * @param {string|number} id 教育经历ID
 * @param {Object} data 教育经历
 * @returns {Promise}
 */
export function updateEducation(id, data) {
  return request({
    url: `/jobseeker/education/update/${id}`,
    method: 'post',
    data
  })
}

/**
 * 删除教育经历
 * @param {string|number} id 教育经历ID
 * @returns {Promise}
 */
export function deleteEducation(id) {
  return request({
    url: `/jobseeker/education/delete/${id}`,
    method: 'post'
  })
}

/**
 * 添加工作经验
 * @param {Object} data 工作经验
 * @returns {Promise}
 */
export function addWorkExperience(data) {
  return request({
    url: '/jobseeker/work-experience',
    method: 'post',
    data
  })
}

/**
 * 更新工作经验
 * @param {string|number} id 工作经验ID
 * @param {Object} data 工作经验
 * @returns {Promise}
 */
export function updateWorkExperience(id, data) {
  return request({
    url: `/jobseeker/work-experience/update/${id}`,
    method: 'post',
    data
  })
}

/**
 * 删除工作经验
 * @param {string|number} id 工作经验ID
 * @returns {Promise}
 */
export function deleteWorkExperience(id) {
  return request({
    url: `/jobseeker/work-experience/delete/${id}`,
    method: 'post'
  })
}

/**
 * 获取求职者的职位申请列表
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
export function getJobseekerApplications(params) {
  return request({
    url: '/jobseeker/applications',
    method: 'get',
    params
  })
}

/**
 * 撤回职位申请
 * @param {number} applicationId 申请ID
 * @returns {Promise} 返回操作结果
 */
export function withdrawJobApplication(applicationId) {
  return request({
    url: `/jobseeker/applications/${applicationId}/withdraw`,
    method: 'post'
  })
}
