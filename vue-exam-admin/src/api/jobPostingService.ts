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
    return this.getPage('', params)
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
    return this.patch(`/${id}`, data)
  }

  /**
   * 删除职位
   * @param id 职位 ID
   * @returns Promise 对象
   */
  static async deleteJobPosting(id: number): Promise<any> {
    return this.delete(`/${id}`)
  }

  /**
   * 获取面试官发布的职位列表
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getJobsByInterviewer(params?: Partial<JobPostingListParams>): Promise<any> {
    return this.getPage('/interviewer/jobs', params)
  }

  /**
   * 获取热门城市列表
   * @returns Promise 对象
   */
  static async getHotCities(): Promise<any> {
    return this.get('/hot-cities')
  }
}
