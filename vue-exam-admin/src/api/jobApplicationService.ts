import { ApiService } from './apiService'
import { JobApplication, JobApplicationListParams } from './model/userModel'

/**
 * 求职申请 API 服务
 * 处理求职申请相关的 API 调用
 */
export class JobApplicationService extends ApiService {
  protected static baseUrl: string = '/job-application'

  /**
   * 获取求职申请列表
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getJobApplicationList(params: JobApplicationListParams): Promise<any> {
    return this.getPage('', params)
  }

  /**
   * 获取求职申请详情
   * @param id 求职申请 ID
   * @returns Promise 对象
   */
  static async getJobApplicationById(id: number): Promise<any> {
    return this.get(`/${id}`)
  }

  /**
   * 更新求职申请状态
   * @param id 求职申请 ID
   * @param status 申请状态
   * @returns Promise 对象
   */
  static async updateJobApplicationStatus(
    id: number,
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'INTERVIEW'
  ): Promise<any> {
    return this.patch(`/${id}/status`, { status })
  }

  /**
   * 获取面试官收到的求职申请列表
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getInterviewerApplications(params: JobApplicationListParams): Promise<any> {
    return this.getPage('/interviewer/applications', params)
  }

  /**
   * 获取求职者发送的求职申请列表
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getJobSeekerApplications(params: JobApplicationListParams): Promise<any> {
    return this.getPage('/jobseeker/applications', params)
  }

  /**
   * 创建求职申请
   * @param data 求职申请数据
   * @returns Promise 对象
   */
  static async createJobApplication(data: Partial<JobApplication>): Promise<any> {
    return this.post('', data)
  }

  /**
   * 取消求职申请
   * @param id 求职申请 ID
   * @returns Promise 对象
   */
  static async cancelJobApplication(id: number): Promise<any> {
    return this.patch(`/${id}/cancel`)
  }
}
