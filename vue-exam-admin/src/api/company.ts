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
  getCompanyList: (
    params: CompanyListParams
  ): Promise<Result<{ items: Company[]; total: number }>> => {
    return http.get('/company/page', { params })
  },

  /**
   * 获取公司详情
   */
  getCompanyDetail: (id: number): Promise<Result<Company>> => {
    return http.get(`/company/${id}`)
  },

  /**
   * 创建公司
   */
  createCompany: (data: Company): Promise<Result<Company>> => {
    return http.post('/company', data)
  },

  /**
   * 更新公司
   */
  updateCompany: (id: number, data: Partial<Company>): Promise<Result<Company>> => {
    return http.put(`/company/${id}`, data)
  },

  /**
   * 删除公司
   */
  deleteCompany: (id: number): Promise<Result<void>> => {
    return http.delete(`/company/${id}`)
  },

  /**
   * 更新公司验证状态
   */
  updateCompanyStatus: (
    id: number,
    status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  ): Promise<Result<void>> => {
    return http.put(`/company/${id}/verify`, { status })
  }
}
