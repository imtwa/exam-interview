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
   * 创建或更新面试官信息
   * @param data 面试官数据
   * @returns Promise 对象
   */
  static async updateInterviewerProfile(data: Partial<Interviewer>): Promise<any> {
    return this.post('/profile', data)
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

  /**
   * 获取面试官创建的职位列表
   * @returns Promise 对象
   */
  static async getInterviewerJobs(): Promise<any> {
    return this.get('/jobs')
  }

  /**
   * 获取面试官收到的职位申请列表
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getInterviewerApplications(params = {}): Promise<any> {
    return this.get('/applications', params)
  }

  /**
   * 更新候选申请状态
   * @param applicationId 申请ID
   * @param data 状态更新数据
   * @returns Promise 对象
   */
  static async updateApplicationStatus(applicationId: number, data: any): Promise<any> {
    return this.post(`/applications/${applicationId}/status`, data)
  }

  /**
   * 安排面试
   * @param applicationId 申请ID
   * @param data 面试安排数据
   * @returns Promise 对象
   */
  static async scheduleInterview(applicationId: number, data: any): Promise<any> {
    return this.post(`/applications/${applicationId}/schedule`, data)
  }

  /**
   * 更新面试官资料（支持同时设置公司）
   * @param data 设置数据
   * @returns Promise 对象
   */
  static async setupInterviewerProfile(data: any): Promise<any> {
    return this.post('/profile/setup', data)
  }

  /**
   * 分配考试给候选求职者
   * @param data 包含试卷ID和笔试说明的数据
   * @returns Promise 对象
   */
  static async assignExam(data: any): Promise<any> {
    return this.post('/applications/assign-exam', data)
  }

  /**
   * 获取面试官管理的考试列表
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getInterviewerExams(params: any): Promise<any> {
    return this.post('/exams', params)
  }

  /**
   * 延长考试截止时间
   * @param data 包含考试ID和新截止时间的数据
   * @returns Promise 对象
   */
  static async extendExamDeadline(data: any): Promise<any> {
    return this.post('/exams/extend-deadline', data)
  }

  /**
   * 发送考试提醒邮件
   * @param data 包含考试分配ID的数据
   * @returns Promise 对象
   */
  static async sendExamReminder(data: any): Promise<any> {
    return this.post('/exams/send-reminder', data)
  }

  /**
   * 取消考试
   * @param data 包含考试分配ID的数据
   * @returns Promise 对象
   */
  static async cancelExam(data: any): Promise<any> {
    return this.post('/exams/cancel', data)
  }

  /**
   * 提交面试评价
   * @param interviewId 面试ID
   * @param data 评价数据
   * @returns Promise 对象
   */
  static async submitInterviewFeedback(interviewId: number, data: any): Promise<any> {
    return this.post(`/interviews/${interviewId}/feedback`, data)
  }
}
