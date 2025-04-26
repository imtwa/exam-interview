import request from '@/utils/request'

/**
 * 获取所有试卷分类
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

/**
 * 获取所有分类（包含子分类）
 * @returns {Promise}
 */
export function getAllCategories() {
  return request({
    url: '/category/list',
    method: 'get'
  })
}
