import { ApiService } from './apiService'
import { Company, CompanyListParams } from './model/userModel'

/**
 * 公司 API 服务
 * 处理公司相关的 API 调用
 */
export class CompanyService extends ApiService {
  protected static baseUrl: string = '/company'

  /**
   * 获取公司列表（分页）
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getCompanyList(params: CompanyListParams): Promise<any> {
    return this.getPage('/page', params)
  }

  /**
   * 获取公司详情
   * @param id 公司 ID
   * @returns Promise 对象
   */
  static async getCompanyById(id: number): Promise<any> {
    return this.get(`/${id}`)
  }

  /**
   * 创建公司
   * @param data 公司数据
   * @returns Promise 对象
   */
  static async createCompany(data: Partial<Company>): Promise<any> {
    return this.post('', data)
  }

  /**
   * 更新公司信息
   * @param id 公司 ID
   * @param data 公司数据
   * @returns Promise 对象
   */
  static async updateCompany(id: number, data: Partial<Company>): Promise<any> {
    return this.post(`/update/${id}`, data)
  }

  /**
   * 删除公司
   * @param id 公司 ID
   * @returns Promise 对象
   */
  static async deleteCompany(id: number): Promise<any> {
    return this.post(`/delete/${id}`)
  }

  /**
   * 验证公司信息
   * @param id 公司 ID
   * @param status 验证状态
   * @returns Promise 对象
   */
  static async verifyCompany(id: number, status: 'VERIFIED' | 'REJECTED'): Promise<any> {
    return this.post(`/verify/${id}`, { status })
  }
}
