import http from '@/utils/http'
import { Result, Paging, PageResult } from './model/baseModel'
import {
  FrontUser,
  JobSeeker,
  Interviewer,
  Company,
  JobPosting,
  JobApplication,
  Interview,
  UserListParams,
  JobSeekerListParams,
  InterviewerListParams,
  CompanyListParams,
  JobPostingListParams,
  JobApplicationListParams,
  InterviewListParams,
  WorkExperience,
  Education,
  CompanyVerifyParams,
  Industry
} from './model/userModel'

/**
 * 前台用户API服务
 */
export class UserService {
  /**
   * 用户登录
   */
  static async login(options: { body: string }): Promise<Result<any>> {
    return http.post({
      url: '/auth/login',
      data: JSON.parse(options.body)
    })
  }

  /**
   * 获取当前用户信息
   */
  static async getUserInfo(): Promise<Result<any>> {
    return http.get({
      url: '/auth/profile'
    })
  }

  /**
   * 修改密码
   */
  static async changePassword(params: {
    oldPassword: string
    newPassword: string
  }): Promise<Result<any>> {
    return http.put({
      url: '/auth/change-password',
      data: params
    })
  }

  /**
   * 获取用户列表（分页）
   */
  static async getUserList(params: UserListParams): Promise<Result<PageResult<FrontUser>>> {
    return http.get({
      url: '/user/page',
      params
    })
  }

  /**
   * 获取当前用户信息
   */
  static async getCurrentUserProfile(): Promise<Result<FrontUser>> {
    return http.get({
      url: '/user/profile'
    })
  }

  /**
   * 获取用户详情
   */
  static async getUserById(id: number): Promise<Result<FrontUser>> {
    return http.get({
      url: `/user/${id}`
    })
  }

  /**
   * 更新用户信息
   */
  static async updateUser(id: number, data: Partial<FrontUser>): Promise<Result<FrontUser>> {
    return http.patch({
      url: `/user/${id}`,
      data
    })
  }

  /**
   * 删除用户
   */
  static async deleteUser(id: number): Promise<Result<boolean>> {
    return http.del({
      url: `/user/${id}`
    })
  }

  /**
   * 重置用户密码
   */
  static async resetPassword(id: number): Promise<Result<string>> {
    return http.post({
      url: `/user/${id}/reset-password`
    })
  }
}

/**
 * 求职者API服务
 */
export class JobSeekerService {
  /**
   * 获取求职者列表（分页）
   */
  static async getJobSeekerList(
    params: JobSeekerListParams
  ): Promise<Result<PageResult<JobSeeker>>> {
    return http.get({
      url: '/jobseeker/page',
      params
    })
  }

  /**
   * 获取求职者详情
   */
  static async getJobSeekerById(id: number): Promise<Result<JobSeeker>> {
    return http.get({
      url: `/jobseeker/${id}`
    })
  }

  /**
   * 更新求职者信息
   */
  static async updateJobSeeker(id: number, data: Partial<JobSeeker>): Promise<Result<JobSeeker>> {
    return http.patch({
      url: `/jobseeker/profile`,
      data
    })
  }

  /**
   * 一次性同步更新求职者完整资料
   */
  static async syncJobSeekerProfile(data: Partial<JobSeeker>): Promise<Result<JobSeeker>> {
    return http.patch({
      url: `/jobseeker/profile/sync`,
      data
    })
  }

  /**
   * 获取求职者的工作经历
   */
  static async getWorkExperience(jobSeekerId: number): Promise<Result<WorkExperience[]>> {
    return http.get({
      url: `/jobseeker/${jobSeekerId}/work-experience`
    })
  }

  /**
   * 添加工作经验
   */
  static async addWorkExperience(data: Partial<WorkExperience>): Promise<Result<WorkExperience>> {
    return http.post({
      url: `/jobseeker/work-experience`,
      data
    })
  }

  /**
   * 更新工作经验
   */
  static async updateWorkExperience(
    id: number,
    data: Partial<WorkExperience>
  ): Promise<Result<WorkExperience>> {
    return http.patch({
      url: `/jobseeker/work-experience/${id}`,
      data
    })
  }

  /**
   * 删除工作经验
   */
  static async deleteWorkExperience(id: number): Promise<Result<boolean>> {
    return http.del({
      url: `/jobseeker/work-experience/${id}`
    })
  }

  /**
   * 获取求职者的教育经历
   */
  static async getEducation(jobSeekerId: number): Promise<Result<Education[]>> {
    return http.get({
      url: `/jobseeker/${jobSeekerId}/education`
    })
  }

  /**
   * 添加教育经历
   */
  static async addEducation(data: Partial<Education>): Promise<Result<Education>> {
    return http.post({
      url: `/jobseeker/education`,
      data
    })
  }

  /**
   * 更新教育经历
   */
  static async updateEducation(id: number, data: Partial<Education>): Promise<Result<Education>> {
    return http.patch({
      url: `/jobseeker/education/${id}`,
      data
    })
  }

  /**
   * 删除教育经历
   */
  static async deleteEducation(id: number): Promise<Result<boolean>> {
    return http.del({
      url: `/jobseeker/education/${id}`
    })
  }
}

/**
 * 面试官API服务
 */
export class InterviewerService {
  /**
   * 获取面试官列表
   */
  static async getInterviewerList(
    params: InterviewerListParams
  ): Promise<Result<PageResult<Interviewer>>> {
    return http.get({
      url: '/interviewer/page',
      params
    })
  }

  /**
   * 获取面试官详情
   */
  static async getInterviewerById(id: number): Promise<Result<Interviewer>> {
    return http.get({
      url: `/interviewer/${id}`
    })
  }

  /**
   * 获取当前用户的面试官信息
   */
  static async getCurrentInterviewerProfile(): Promise<Result<Interviewer>> {
    return http.get({
      url: '/interviewer/profile'
    })
  }

  /**
   * 创建面试官
   */
  static async createInterviewer(data: Partial<Interviewer>): Promise<Result<Interviewer>> {
    return http.post({
      url: '/interviewer/profile',
      data
    })
  }

  /**
   * 更新面试官信息
   */
  static async updateInterviewer(
    id: number,
    data: Partial<Interviewer>
  ): Promise<Result<Interviewer>> {
    return http.post({
      url: '/interviewer/profile',
      data
    })
  }

  /**
   * 删除面试官
   */
  static async deleteInterviewer(id: number): Promise<Result<boolean>> {
    return http.del({
      url: `/interviewer/${id}`
    })
  }

  /**
   * 更新面试官认证状态
   */
  static async updateVerificationStatus(
    id: number,
    status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  ): Promise<Result<boolean>> {
    return http.patch({
      url: `/interviewer/${id}/verify`,
      data: { status }
    })
  }

  /**
   * 更新面试官状态
   */
  static async updateInterviewerStatus(
    id: number,
    data: { status: string }
  ): Promise<Result<boolean>> {
    return http.patch({
      url: `/interviewer/${id}/status`,
      data
    })
  }

  /**
   * 更新面试官资料（支持同时创建公司）
   */
  static async setupInterviewerProfile(data: Partial<Interviewer>): Promise<Result<Interviewer>> {
    return http.post({
      url: '/interviewer/profile/setup',
      data
    })
  }
}

/**
 * 公司API服务
 */
export const CompanyService = {
  /**
   * 获取公司列表（分页）
   */
  getCompanyList: (params: CompanyListParams): Promise<Result<PageResult<Company>>> => {
    return http.get('/company/page', { params })
  },

  /**
   * 获取公司详情
   */
  getCompanyById: (id: number): Promise<Result<Company>> => {
    return http.get(`/company/${id}`)
  },

  /**
   * 创建公司
   */
  createCompany: (
    data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Result<Company>> => {
    return http.post('/company', data)
  },

  /**
   * 更新公司信息
   */
  updateCompany: (id: number, data: Partial<Company>): Promise<Result<Company>> => {
    return http.put(`/company/${id}`, data)
  },

  /**
   * 删除公司
   */
  deleteCompany: (id: number): Promise<Result<boolean>> => {
    return http.delete(`/company/${id}`)
  },

  /**
   * 验证公司信息
   */
  verifyCompany: (id: number, status: 'VERIFIED' | 'REJECTED'): Promise<Result<Company>> => {
    const params: CompanyVerifyParams = { status }
    return http.put(`/company/${id}/verify`, params)
  }
}

/**
 * 职位API服务
 */
export class JobPostingService {
  /**
   * 获取职位列表（分页）
   */
  static async getJobPostingList(
    params: JobPostingListParams
  ): Promise<Result<PageResult<JobPosting>>> {
    return http.get({
      url: '/job',
      params
    })
  }

  /**
   * 获取职位详情
   */
  static async getJobPostingById(id: number): Promise<Result<JobPosting>> {
    return http.get({
      url: `/job/${id}`
    })
  }

  /**
   * 创建职位
   */
  static async createJobPosting(data: Partial<JobPosting>): Promise<Result<JobPosting>> {
    return http.post({
      url: '/job',
      data
    })
  }

  /**
   * 更新职位信息
   */
  static async updateJobPosting(
    id: number,
    data: Partial<JobPosting>
  ): Promise<Result<JobPosting>> {
    return http.patch({
      url: `/job/${id}`,
      data
    })
  }

  /**
   * 删除职位
   */
  static async deleteJobPosting(id: number): Promise<Result<boolean>> {
    return http.del({
      url: `/job/${id}`
    })
  }

  /**
   * 获取面试官发布的职位列表
   */
  static async getJobsByInterviewer(
    params?: Partial<JobPostingListParams>
  ): Promise<Result<PageResult<JobPosting>>> {
    return http.get({
      url: `/job/interviewer/jobs`,
      params
    })
  }

  /**
   * 获取热门城市列表
   */
  static async getHotCities(): Promise<Result<string[]>> {
    return http.get({
      url: '/job/hot-cities'
    })
  }
}

/**
 * 求职申请API服务
 */
export class JobApplicationService {
  /**
   * 获取求职申请列表
   */
  static async getJobApplicationList(
    params: JobApplicationListParams
  ): Promise<Result<PageResult<JobApplication>>> {
    return http.get({
      url: '/interviewer/applications',
      params
    })
  }

  /**
   * 获取求职申请详情
   */
  static async getJobApplicationById(id: number): Promise<Result<JobApplication>> {
    return http.get({
      url: `/interviewer/applications/${id}`
    })
  }

  /**
   * 更新求职申请状态
   */
  static async updateApplicationStatus(id: number, status: string): Promise<Result<boolean>> {
    return http.put({
      url: `/interviewer/applications/${id}/status`,
      data: { status }
    })
  }

  /**
   * 安排面试
   */
  static async arrangeInterview(
    applicationId: number,
    interviewData: Partial<Interview>
  ): Promise<Result<Interview>> {
    return http.post({
      url: `/interviewer/applications/${applicationId}/interview`,
      data: interviewData
    })
  }
}

/**
 * 面试API服务
 */
export class InterviewService {
  /**
   * 获取面试列表
   */
  static async getInterviewList(
    params: InterviewListParams
  ): Promise<Result<PageResult<Interview>>> {
    return http.get({
      url: '/interview/page',
      params
    })
  }

  /**
   * 获取面试官的面试列表
   */
  static async getInterviewsByInterviewer(
    interviewerId: number,
    params?: Partial<InterviewListParams>
  ): Promise<Result<PageResult<Interview>>> {
    return http.get({
      url: `/interview/interviewer/${interviewerId}`,
      params
    })
  }

  /**
   * 获取面试详情
   */
  static async getInterviewById(id: number): Promise<Result<Interview>> {
    return http.get({
      url: `/interview/${id}`
    })
  }

  /**
   * 创建面试
   */
  static async createInterview(data: Partial<Interview>): Promise<Result<Interview>> {
    return http.post({
      url: '/interview',
      data
    })
  }

  /**
   * 更新面试信息
   */
  static async updateInterview(id: number, data: Partial<Interview>): Promise<Result<Interview>> {
    return http.patch({
      url: `/interview/${id}`,
      data
    })
  }

  /**
   * 更新面试状态
   */
  static async updateInterviewStatus(
    id: number,
    status: string,
    feedback?: string
  ): Promise<Result<boolean>> {
    return http.patch({
      url: `/interview/${id}`,
      data: { status, feedback }
    })
  }

  /**
   * 删除面试
   */
  static async deleteInterview(id: number): Promise<Result<boolean>> {
    return http.del({
      url: `/interview/${id}`
    })
  }
}

/**
 * 行业分类API服务
 */
export const IndustryService = {
  /**
   * 获取行业树
   */
  getIndustryTree: (): Promise<Result<Industry[]>> => {
    return http.get('/industry/tree')
  },

  /**
   * 获取行业列表
   */
  getIndustryList: (): Promise<Result<Industry[]>> => {
    return http.get('/industry/list')
  },

  /**
   * 创建行业
   */
  createIndustry: (data: Omit<Industry, 'id' | 'children'>): Promise<Result<Industry>> => {
    return http.post('/industry', data)
  },

  /**
   * 更新行业
   */
  updateIndustry: (id: number, data: Partial<Industry>): Promise<Result<Industry>> => {
    return http.put(`/industry/${id}`, data)
  },

  /**
   * 删除行业
   */
  deleteIndustry: (id: number): Promise<Result<boolean>> => {
    return http.delete(`/industry/${id}`)
  }
}

/**
 * 考试API服务
 */
export class ExamService {
  /**
   * 获取所有试卷分类
   */
  static async getCategoryList(): Promise<Result<any[]>> {
    return http.get({
      url: '/category/list'
    })
  }

  /**
   * 分页获取试卷列表
   */
  static async getExamList(params: any): Promise<Result<PageResult<any>>> {
    return http.get({
      url: '/exam/list',
      params
    })
  }

  /**
   * 获取试卷详情
   */
  static async getExamById(id: number): Promise<Result<any>> {
    return http.get({
      url: `/exam/${id}`
    })
  }

  /**
   * 上传试卷
   */
  static async uploadExam(data: any): Promise<Result<any>> {
    return http.post({
      url: '/exam/upload',
      data
    })
  }

  /**
   * 检查试卷收藏状态
   */
  static async checkFavoriteStatus(id: number): Promise<Result<boolean>> {
    return http.get({
      url: `/exam/favorite/${id}`
    })
  }

  /**
   * 切换试卷收藏状态
   */
  static async toggleFavorite(id: number): Promise<Result<boolean>> {
    return http.post({
      url: `/exam/favorite/${id}`
    })
  }

  /**
   * 获取用户收藏的试卷列表
   */
  static async getFavoriteList(): Promise<Result<any[]>> {
    return http.get({
      url: '/exam/favorites'
    })
  }

  /**
   * 创建HR专属试卷（从收藏试卷中抽题）
   */
  static async createPrivateExam(data: any): Promise<Result<any>> {
    return http.post({
      url: '/exam/private',
      data
    })
  }

  /**
   * 获取HR的专属试卷列表
   */
  static async getPrivateExamList(): Promise<Result<any[]>> {
    return http.get({
      url: '/exam/private'
    })
  }
}
