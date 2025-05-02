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
 * 获取行业分类列表（包含一级分类及其下的二级分类）
 * @param {Object} params 查询参数，如 {page: 1, pageSize: 10}
 * @returns {Promise}
 */
export function getIndustryCategories(params) {
  return request({
    url: '/industry/category',
    method: 'get',
    params
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
    url: `/industry/category/update/${id}`,
    method: 'post',
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
    url: `/industry/category/delete/${id}`,
    method: 'post'
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
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getIndustrySubCategories(params) {
  return request({
    url: '/industry/subcategory',
    method: 'get',
    params
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
    url: `/industry/subcategory/update/${id}`,
    method: 'post',
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
    url: `/industry/subcategory/delete/${id}`,
    method: 'post'
  })
}

/**
 * 根据一级分类ID获取其下的二级分类
 * @param {number} categoryId 一级分类ID
 * @returns {Promise}
 */
export function getSubCategoriesByCategoryId(categoryId) {
  return request({
    url: `/industry/category/${categoryId}/subcategories`,
    method: 'get'
  })
}
