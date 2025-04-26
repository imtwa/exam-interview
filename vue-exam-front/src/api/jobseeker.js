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
    url: '/jobseeker/profile',
    method: 'patch',
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
    method: 'patch',
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
    url: `/jobseeker/education/${id}`,
    method: 'patch',
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
    url: `/jobseeker/education/${id}`,
    method: 'delete'
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
    url: `/jobseeker/work-experience/${id}`,
    method: 'patch',
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
    url: `/jobseeker/work-experience/${id}`,
    method: 'delete'
  })
} 