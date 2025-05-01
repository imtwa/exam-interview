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
    return this.getPage('', params)
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
   * 创建面试
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
   * 取消面试
   * @param id 面试 ID
   * @returns Promise 对象
   */
  static async cancelInterview(id: number): Promise<any> {
    return this.post(`/${id}/cancel`)
  }

  /**
   * 完成面试
   * @param id 面试 ID
   * @param result 面试结果
   * @param feedback 面试反馈
   * @returns Promise 对象
   */
  static async completeInterview(
    id: number,
    result: 'PASS' | 'FAIL',
    feedback: string
  ): Promise<any> {
    return this.post(`/${id}/complete`, { result, feedback })
  }

  /**
   * 获取面试官的面试列表
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getInterviewerInterviews(params: InterviewListParams): Promise<any> {
    return this.getPage('/interviewer', params)
  }

  /**
   * 获取求职者的面试列表
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getJobSeekerInterviews(params: InterviewListParams): Promise<any> {
    return this.getPage('/jobseeker', params)
  }
}
