import http from '@/utils/http'
import { Result, Paging } from './model/baseModel'
import { Company } from './model/userModel'

export interface CompanyListParams extends Paging {
  keyword?: string
  status?: 'PENDING' | 'VERIFIED' | 'REJECTED'
}

/**
 * 公司相关API
 */
export const CompanyService = {
  /**
   * 获取公司列表
   */
  getCompanyList(params: CompanyListParams): Promise<Result<{ items: Company[]; total: number }>> {
    return http.get('/api/v1/companies', { params })
  },

  /**
   * 获取公司详情
   */
  getCompanyDetail(id: number): Promise<Result<Company>> {
    return http.get(`/api/v1/companies/${id}`)
  },

  /**
   * 创建公司
   */
  createCompany(data: Company): Promise<Result<Company>> {
    return http.post('/api/v1/companies', data)
  },

  /**
   * 更新公司
   */
  updateCompany(id: number, data: Partial<Company>): Promise<Result<Company>> {
    return http.put(`/api/v1/companies/${id}`, data)
  },

  /**
   * 删除公司
   */
  deleteCompany(id: number): Promise<Result<void>> {
    return http.delete(`/api/v1/companies/${id}`)
  },

  /**
   * 更新公司验证状态
   */
  updateCompanyStatus(
    id: number,
    status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  ): Promise<Result<void>> {
    return http.put(`/api/v1/companies/${id}/status`, { status })
  }
}
