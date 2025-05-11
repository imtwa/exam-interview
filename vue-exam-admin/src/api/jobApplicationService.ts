import { ApiService } from './apiService'
import { JobApplication, JobApplicationListParams } from './model/userModel'

/**
 * 求职申请 API 服务
 * 处理求职申请相关的 API 调用
 */
export class JobApplicationService extends ApiService {
  protected static baseUrl: string = '/job'

  /**
   * 获取求职申请列表
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getJobApplicationList(params: JobApplicationListParams): Promise<any> {
    return this.getPage('/applications', params)
  }

  /**
   * 获取求职申请详情
   * @param id 求职申请 ID
   * @returns Promise 对象
   */
  static async getJobApplicationById(id: number): Promise<any> {
    return this.get(`/applications/${id}`)
  }

  /**
   * 更新求职申请状态
   * @param id 求职申请 ID
   * @param status 申请状态
   * @returns Promise 对象
   */
  static async updateApplicationStatus(id: number, data: any): Promise<any> {
    return this.post(`/applications/${id}/status`, data)
  }

  /**
   * 获取面试官收到的职位申请列表
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getInterviewerApplications(params: JobApplicationListParams = {}): Promise<any> {
    return this.get('/interviewer/applications', params)
  }

  /**
   * 获取求职者的职位申请列表
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getJobseekerApplications(params: JobApplicationListParams = {}): Promise<any> {
    return this.get('/applications/jobseeker', params)
  }

  /**
   * 申请职位
   * @param jobId 职位ID
   * @returns Promise 对象
   */
  static async applyForJob(jobId: number): Promise<any> {
    return this.post(`/${jobId}/apply`)
  }

  /**
   * 撤回职位申请
   * @param applicationId 申请ID
   * @returns Promise 对象
   */
  static async withdrawApplication(applicationId: number): Promise<any> {
    return this.post(`/applications/${applicationId}/withdraw`)
  }
}
