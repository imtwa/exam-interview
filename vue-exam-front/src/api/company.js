import request from '@/utils/request'

/**
 * 创建公司
 * @param {Object} data 公司信息
 * @returns {Promise}
 */
export function createCompany(data) {
  return request({
    url: '/company',
    method: 'post',
    data
  })
}

/**
 * 分页获取公司列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getCompanyList(params) {
  return request({
    url: '/company/page',
    method: 'get',
    params
  })
}

/**
 * 根据ID获取公司信息
 * @param {string|number} id 公司ID
 * @returns {Promise}
 */
export function getCompany(id) {
  return request({
    url: `/company/${id}`,
    method: 'get'
  })
}

/**
 * 更新公司信息
 * @param {string|number} id 公司ID
 * @param {Object} data 公司信息
 * @returns {Promise}
 */
export function updateCompany(id, data) {
  return request({
    url: `/company/${id}`,
    method: 'patch',
    data
  })
}

/**
 * 删除公司
 * @param {string|number} id 公司ID
 * @returns {Promise}
 */
export function deleteCompany(id) {
  return request({
    url: `/company/${id}`,
    method: 'delete'
  })
}

/**
 * 验证公司信息
 * @param {string|number} id 公司ID
 * @param {Object} data 验证信息
 * @returns {Promise}
 */
export function verifyCompany(id, data) {
  return request({
    url: `/company/${id}/verify`,
    method: 'patch',
    data
  })
}
