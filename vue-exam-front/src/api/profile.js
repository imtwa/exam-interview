import request from '@/utils/request'
import axios from 'axios'

/**
 * 检查用户是否需要完善个人资料
 * @returns {Promise} 返回用户配置信息和可用公司列表
 */
export function profileCheck() {
  return request({
    url: '/job/profile/check',
    method: 'get'
  })
}

/**
 * 完善HR个人资料和公司信息
 * @param {Object} data 包含HR信息和公司信息的数据
 * @returns {Promise} 返回设置结果
 */
export function setupProfile(data) {
  return request({
    url: '/job/profile/setup',
    method: 'post',
    data
  })
}

/**
 * 创建新公司
 * @param {Object} data 公司信息
 * @returns {Promise} 返回创建结果
 */
export function createCompany(data) {
  return request({
    url: '/job/company',
    method: 'post',
    data
  })
}

/**
 * 获取行业分类数据
 * @returns {Promise} 返回行业分类数据
 */
export function getIndustryCategories() {
  return request({
    url: '/job/industry-categories',
    method: 'get'
  })
}

/**
 * 更新HR个人信息
 * @param {Object} data 个人信息数据
 * @returns {Promise} 返回更新结果
 */
export function updateInterviewerInfo(data) {
  return request({
    url: '/job/interviewer',
    method: 'put',
    data
  })
}

/**
 * 获取HR个人信息
 * @returns {Promise} 返回HR个人信息
 */
export function getInterviewerInfo() {
  return request({
    url: '/job/interviewer',
    method: 'get'
  })
}

/**
 * 获取当前HR所属公司信息
 * @returns {Promise} 返回公司信息
 */
export function getCompanyInfo() {
  return request({
    url: '/job/company/mine',
    method: 'get'
  })
}

/**
 * 更新公司信息
 * @param {Object} data 公司信息
 * @returns {Promise} 返回更新结果
 */
export function updateCompanyInfo(data) {
  return request({
    url: '/job/company',
    method: 'put',
    data
  })
}

/**
 * 获取地区数据（省市区）
 * @returns {Promise}
 */
export function getRegionData() {
  // 从本地city.json文件获取数据
  return axios.get('/data/city.json')
}

/**
 * 搜索公司列表
 * @param {Object} params 搜索参数 { keyword, page, pageSize, industry }
 * @returns {Promise} 返回搜索结果
 */
export function searchCompanies(params) {
  return request({
    url: '/job/companies',
    method: 'get',
    params
  })
}

/**
 * 创建求职者详情资料
 * @param {Object} data 求职者详情资料数据
 * @returns {Promise} 返回创建结果
 * */
export function createJobseekerProfile(data) {
  return request({
    url: '/jobseeker/profile',
    method: 'post',
    data
  })
}