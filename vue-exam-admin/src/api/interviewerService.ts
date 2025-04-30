import { ApiService } from './apiService'
import { Interviewer, InterviewerListParams } from './model/userModel'

/**
 * 面试官 API 服务
 * 处理面试官相关的 API 调用
 */
export class InterviewerService extends ApiService {
  protected static baseUrl: string = '/interviewer'

  /**
   * 获取面试官列表
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getInterviewerList(params: InterviewerListParams): Promise<any> {
    return this.getPage('/page', params)
  }

  /**
   * 获取面试官详情
   * @param id 面试官 ID
   * @returns Promise 对象
   */
  static async getInterviewerById(id: number): Promise<any> {
    return this.get(`/${id}`)
  }

  /**
   * 获取当前用户的面试官信息
   * @returns Promise 对象
   */
  static async getCurrentInterviewerProfile(): Promise<any> {
    return this.get('/profile')
  }

  /**
   * 创建面试官
   * @param data 面试官数据
   * @returns Promise 对象
   */
  static async createInterviewer(data: Partial<Interviewer>): Promise<any> {
    return this.post('', data)
  }

  /**
   * 更新面试官信息
   * @param id 面试官 ID
   * @param data 面试官数据
   * @returns Promise 对象
   */
  static async updateInterviewer(id: number, data: Partial<Interviewer>): Promise<any> {
    return this.put(`/${id}`, data)
  }

  /**
   * 删除面试官
   * @param id 面试官 ID
   * @returns Promise 对象
   */
  static async deleteInterviewer(id: number): Promise<any> {
    return this.delete(`/${id}`)
  }

  /**
   * 更新面试官认证状态
   * @param id 面试官 ID
   * @param status 认证状态
   * @returns Promise 对象
   */
  static async updateVerificationStatus(
    id: number,
    status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  ): Promise<any> {
    return this.patch(`/${id}/verify`, { status })
  }
}
