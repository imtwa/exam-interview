import { ApiService } from './apiService'
import { JobPosting, JobPostingListParams } from './model/userModel'

/**
 * 职位 API 服务
 * 处理职位相关的 API 调用
 */
export class JobPostingService extends ApiService {
  protected static baseUrl: string = '/job'

  /**
   * 获取职位列表（分页）
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getJobPostingList(params: JobPostingListParams): Promise<any> {
    return this.getPage('/page', params)
  }

  /**
   * 获取职位详情
   * @param id 职位 ID
   * @returns Promise 对象
   */
  static async getJobPostingById(id: number): Promise<any> {
    return this.get(`/${id}`)
  }

  /**
   * 创建职位
   * @param data 职位数据
   * @returns Promise 对象
   */
  static async createJobPosting(data: Partial<JobPosting>): Promise<any> {
    return this.post('', data)
  }

  /**
   * 更新职位信息
   * @param id 职位 ID
   * @param data 职位数据
   * @returns Promise 对象
   */
  static async updateJobPosting(id: number, data: Partial<JobPosting>): Promise<any> {
    return this.post(`/update/${id}`, data)
  }

  /**
   * 删除职位
   * @param id 职位 ID
   * @returns Promise 对象
   */
  static async deleteJobPosting(id: number): Promise<any> {
    return this.post(`/delete/${id}`)
  }

  /**
   * 获取面试官发布的职位列表
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getJobsByInterviewer(params?: Partial<JobPostingListParams>): Promise<any> {
    return this.get('/interviewer/jobs', params)
  }

  /**
   * 获取面试官发布的职位列表(带筛选)
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async searchJobsByInterviewer(params?: Partial<JobPostingListParams>): Promise<any> {
    return this.get('/interviewer/jobs/search', params)
  }

  /**
   * 获取公司发布的职位列表
   * @param companyId 公司ID
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getCompanyJobs(companyId: number, params = {}): Promise<any> {
    return this.get(`/company/${companyId}`, params)
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
   * 获取求职者的职位申请列表
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getJobseekerApplications(params = {}): Promise<any> {
    return this.get('/applications/jobseeker', params)
  }

  /**
   * 撤回职位申请
   * @param applicationId 申请ID
   * @returns Promise 对象
   */
  static async withdrawApplication(applicationId: number): Promise<any> {
    return this.post(`/applications/${applicationId}/withdraw`)
  }

  /**
   * 获取热门城市列表
   * @returns Promise 对象
   */
  static async getHotCities(): Promise<any> {
    return this.get('/hot-cities')
  }
}
