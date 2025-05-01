import { ApiService } from './apiService'
import { JobSeeker, JobSeekerListParams, Education, WorkExperience } from './model/userModel'

/**
 * 求职者 API 服务
 * 处理求职者相关的 API 调用
 */
export class JobSeekerService extends ApiService {
  protected static baseUrl: string = '/jobseeker'

  /**
   * 获取求职者列表（分页）
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getJobSeekerList(params: JobSeekerListParams): Promise<any> {
    return this.getPage('/page', params)
  }

  /**
   * 获取求职者详情
   * @param id 求职者 ID
   * @returns Promise 对象
   */
  static async getJobSeekerById(id: number): Promise<any> {
    return this.get(`/${id}`)
  }

  /**
   * 更新求职者信息
   * @param id 求职者 ID
   * @param data 求职者数据
   * @returns Promise 对象
   */
  static async updateJobSeeker(id: number, data: Partial<JobSeeker>): Promise<any> {
    return this.post(`/update/${id}`, data)
  }

  /**
   * 获取求职者的工作经历
   * @param jobSeekerId 求职者 ID
   * @returns Promise 对象
   */
  static async getWorkExperience(jobSeekerId: number): Promise<any> {
    return this.get(`/${jobSeekerId}/work-experience`)
  }

  /**
   * 添加工作经验
   * @param data 工作经验数据
   * @returns Promise 对象
   */
  static async addWorkExperience(data: Partial<WorkExperience>): Promise<any> {
    return this.post('/work-experience', data)
  }

  /**
   * 更新工作经验
   * @param id 工作经验 ID
   * @param data 工作经验数据
   * @returns Promise 对象
   */
  static async updateWorkExperience(id: number, data: Partial<WorkExperience>): Promise<any> {
    return this.post(`/work-experience/update/${id}`, data)
  }

  /**
   * 删除工作经验
   * @param id 工作经验 ID
   * @returns Promise 对象
   */
  static async deleteWorkExperience(id: number): Promise<any> {
    return this.post(`/work-experience/delete/${id}`)
  }

  /**
   * 获取求职者的教育经历
   * @param jobSeekerId 求职者 ID
   * @returns Promise 对象
   */
  static async getEducation(jobSeekerId: number): Promise<any> {
    return this.get(`/${jobSeekerId}/education`)
  }

  /**
   * 添加教育经历
   * @param data 教育经历数据
   * @returns Promise 对象
   */
  static async addEducation(data: Partial<Education>): Promise<any> {
    return this.post('/education', data)
  }

  /**
   * 更新教育经历
   * @param id 教育经历 ID
   * @param data 教育经历数据
   * @returns Promise 对象
   */
  static async updateEducation(id: number, data: Partial<Education>): Promise<any> {
    return this.post(`/education/update/${id}`, data)
  }

  /**
   * 删除教育经历
   * @param id 教育经历 ID
   * @returns Promise 对象
   */
  static async deleteEducation(id: number): Promise<any> {
    return this.post(`/education/delete/${id}`)
  }
}
