import request from '@/utils/request'

/**
 * 创建行业一级分类
 * @param {Object} data 一级分类信息
 * @returns {Promise}
 */
export function createIndustryCategory(data) {
  return request({
    url: '/industry/category',
    method: 'post',
    data
  })
}

/**
 * 获取行业一级分类列表
 * @returns {Promise}
 */
export function getIndustryCategoryList() {
  return request({
    url: '/industry/category',
    method: 'get'
  })
}

/**
 * 获取行业一级分类详情
 * @param {string|number} id 分类ID
 * @returns {Promise}
 */
export function getIndustryCategory(id) {
  return request({
    url: `/industry/category/${id}`,
    method: 'get'
  })
}

/**
 * 更新行业一级分类
 * @param {string|number} id 分类ID
 * @param {Object} data 分类信息
 * @returns {Promise}
 */
export function updateIndustryCategory(id, data) {
  return request({
    url: `/industry/category/${id}`,
    method: 'patch',
    data
  })
}

/**
 * 删除行业一级分类
 * @param {string|number} id 分类ID
 * @returns {Promise}
 */
export function deleteIndustryCategory(id) {
  return request({
    url: `/industry/category/${id}`,
    method: 'delete'
  })
}

/**
 * 创建行业二级分类
 * @param {Object} data 二级分类信息
 * @returns {Promise}
 */
export function createIndustrySubcategory(data) {
  return request({
    url: '/industry/subcategory',
    method: 'post',
    data
  })
}

/**
 * 获取行业二级分类列表
 * @param {string|number} categoryId 一级分类ID
 * @returns {Promise}
 */
export function getIndustrySubcategoryList(categoryId) {
  return request({
    url: `/industry/category/${categoryId}/subcategories`,
    method: 'get'
  })
}

/**
 * 获取单个行业二级分类详情
 * @param {string|number} id 二级分类ID
 * @returns {Promise}
 */
export function getIndustrySubcategory(id) {
  return request({
    url: `/industry/subcategory/${id}`,
    method: 'get'
  })
}

/**
 * 更新行业二级分类
 * @param {string|number} id 二级分类ID
 * @param {Object} data 分类信息
 * @returns {Promise}
 */
export function updateIndustrySubcategory(id, data) {
  return request({
    url: `/industry/subcategory/${id}`,
    method: 'patch',
    data
  })
}

/**
 * 删除行业二级分类
 * @param {string|number} id 二级分类ID
 * @returns {Promise}
 */
export function deleteIndustrySubcategory(id) {
  return request({
    url: `/industry/subcategory/${id}`,
    method: 'delete'
  })
} 