import { ApiService } from './apiService'
import { Industry } from './model/userModel'

/**
 * 行业 API 服务
 * 处理行业相关的 API 调用
 */
export class IndustryService extends ApiService {
  protected static baseUrl: string = '/industry'

  /**
   * 获取行业树
   * @returns Promise 对象
   */
  static async getIndustryTree(): Promise<any> {
    return this.get('/tree')
  }

  /**
   * 获取行业列表
   * @returns Promise 对象
   */
  static async getIndustryList(): Promise<any> {
    return this.get('/list')
  }

  /**
   * 创建行业
   * @param data 行业数据
   * @returns Promise 对象
   */
  static async createIndustry(data: Omit<Industry, 'id' | 'children'>): Promise<any> {
    return this.post('', data)
  }

  /**
   * 更新行业
   * @param id 行业 ID
   * @param data 行业数据
   * @returns Promise 对象
   */
  static async updateIndustry(id: number, data: Partial<Industry>): Promise<any> {
    return this.post(`/update/${id}`, data)
  }

  /**
   * 删除行业
   * @param id 行业 ID
   * @returns Promise 对象
   */
  static async deleteIndustry(id: number): Promise<any> {
    return this.post(`/delete/${id}`)
  }
}
