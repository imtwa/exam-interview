import { ApiService } from './apiService'
import { Interview, InterviewListParams } from './model/userModel'

/**
 * 面试 API 服务
 * 处理面试相关的 API 调用
 */
export class InterviewService extends ApiService {
  protected static baseUrl: string = '/interview'

  /**
   * 获取面试列表
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getInterviewList(params: InterviewListParams): Promise<any> {
    return this.getPage('/page', params)
  }

  /**
   * 获取面试详情
   * @param id 面试 ID
   * @returns Promise 对象
   */
  static async getInterviewById(id: number): Promise<any> {
    return this.get(`/${id}`)
  }

  /**
   * 创建面试安排
   * @param data 面试数据
   * @returns Promise 对象
   */
  static async createInterview(data: Partial<Interview>): Promise<any> {
    return this.post('', data)
  }

  /**
   * 更新面试信息
   * @param id 面试 ID
   * @param data 面试数据
   * @returns Promise 对象
   */
  static async updateInterview(id: number, data: Partial<Interview>): Promise<any> {
    return this.post(`/update/${id}`, data)
  }

  /**
   * 删除面试
   * @param id 面试 ID
   * @returns Promise 对象
   */
  static async deleteInterview(id: number): Promise<any> {
    return this.post(`/delete/${id}`)
  }

  /**
   * 安排面试
   * @param applicationId 申请ID
   * @param data 面试安排数据
   * @returns Promise 对象
   */
  static async scheduleInterview(data: any): Promise<any> {
    const { applicationId, ...interviewData } = data
    return this.post(`/interviewer/applications/${applicationId}/schedule`, interviewData)
  }

  /**
   * 提交面试评价
   * @param interviewId 面试ID
   * @param data 评价数据
   * @returns Promise 对象
   */
  static async submitFeedback(interviewId: number, data: any): Promise<any> {
    return this.post(`/interviewer/interviews/${interviewId}/feedback`, data)
  }

  /**
   * 获取面试反馈
   * @param interviewId 面试ID
   * @returns Promise 对象
   */
  static async getFeedback(interviewId: number): Promise<any> {
    return this.get(`/${interviewId}/feedback`)
  }

  /**
   * 更新面试状态
   * @param interviewId 面试ID
   * @param status 状态
   * @returns Promise 对象
   */
  static async updateInterviewStatus(interviewId: number, status: string): Promise<any> {
    return this.post(`/update/${interviewId}`, { status })
  }

  /**
   * 取消面试
   * @param interviewId 面试ID
   * @param reason 取消原因
   * @returns Promise 对象
   */
  static async cancelInterview(interviewId: number, reason?: string): Promise<any> {
    return this.post(`/delete/${interviewId}`, { reason })
  }

  /**
   * 验证面试邀请码
   * @param code 邀请码
   * @returns Promise 对象
   */
  static async verifyInvitationCode(code: string): Promise<any> {
    return this.get(`/invitation/verify?code=${code}`)
  }
}
