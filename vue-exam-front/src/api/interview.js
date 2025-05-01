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
 * 分页获取面试列表
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
 * 根据ID获取面试信息
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
