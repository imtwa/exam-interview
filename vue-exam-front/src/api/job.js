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
    url: '/job/page',
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
 * 获取公司发布的职位列表
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
 * 申请职位
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
 * 获取求职者的职位申请列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getJobseekerApplications(params = {}) {
  return request({
    url: '/job/applications/jobseeker',
    method: 'get',
    params
  })
}

/**
 * 撤回职位申请
 * @param {number} applicationId 申请ID
 * @returns {Promise}
 */
export function withdrawApplication(applicationId) {
  return request({
    url: `/job/applications/${applicationId}/withdraw`,
    method: 'post'
  })
}
