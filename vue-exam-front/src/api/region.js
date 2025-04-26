import axios from 'axios'

/**
 * 获取地区数据（省市区）
 * @returns {Promise}
 */
export function getRegionData() {
  // 从本地city.json文件获取数据
  return axios.get('/data/city.json')
}
