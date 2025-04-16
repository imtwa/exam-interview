import request from '@/utils/request'

/**
 * 获取分类列表（包含二级分类）
 * @returns {Promise}
 */
export function getCategoryList() {
  return request({
    url: '/category/list',
    method: 'get'
  })
}

/**
 * 获取一级分类详情
 * @param {number} id 分类ID
 * @returns {Promise}
 */
export function getCategoryById(id) {
  return request({
    url: `/category/${id}`,
    method: 'get'
  })
}

/**
 * 获取二级分类详情
 * @param {number} id 二级分类ID
 * @returns {Promise}
 */
export function getSubCategoryById(id) {
  return request({
    url: `/category/sub/${id}`,
    method: 'get'
  })
}
