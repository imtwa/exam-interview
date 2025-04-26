import http from '@/utils/http'
import { Result, Paging } from './model/baseModel'
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
  Education
} from './model/userModel'

/**
 * 前台用户API服务
 */
export class UserService {
  /**
   * 获取用户列表（分页）
   */
  static async getUserList(params: UserListParams): Promise<Result<FrontUser[]> & Paging> {
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
  ): Promise<Result<JobSeeker[]> & Paging> {
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
  ): Promise<Result<Interviewer[]> & Paging> {
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
export class CompanyService {
  /**
   * 获取公司列表（分页）
   */
  static async getCompanyList(params: CompanyListParams): Promise<Result<Company[]> & Paging> {
    return http.get({
      url: '/company/page',
      params
    })
  }

  /**
   * 获取公司详情
   */
  static async getCompanyById(id: number): Promise<Result<Company>> {
    return http.get({
      url: `/company/${id}`
    })
  }

  /**
   * 创建公司
   */
  static async createCompany(data: Partial<Company>): Promise<Result<Company>> {
    return http.post({
      url: '/company',
      data
    })
  }

  /**
   * 更新公司信息
   */
  static async updateCompany(id: number, data: Partial<Company>): Promise<Result<Company>> {
    return http.patch({
      url: `/company/${id}`,
      data
    })
  }

  /**
   * 删除公司
   */
  static async deleteCompany(id: number): Promise<Result<boolean>> {
    return http.del({
      url: `/company/${id}`
    })
  }

  /**
   * 验证公司信息
   */
  static async verifyCompany(
    id: number,
    status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  ): Promise<Result<boolean>> {
    return http.patch({
      url: `/company/${id}/verify`,
      data: { status }
    })
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
  ): Promise<Result<JobPosting[]> & Paging> {
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
  ): Promise<Result<JobPosting[]> & Paging> {
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
  ): Promise<Result<JobApplication[]> & Paging> {
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
  ): Promise<Result<Interview[]> & Paging> {
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
  ): Promise<Result<Interview[]> & Paging> {
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
export class IndustryService {
  /**
   * 创建行业一级分类
   */
  static async createCategory(data: any): Promise<Result<any>> {
    return http.post({
      url: '/industry/category',
      data
    })
  }

  /**
   * 获取行业一级分类列表
   */
  static async getCategoryList(): Promise<Result<any[]>> {
    return http.get({
      url: '/industry/category'
    })
  }

  /**
   * 获取行业一级分类详情
   */
  static async getCategoryById(id: number): Promise<Result<any>> {
    return http.get({
      url: `/industry/category/${id}`
    })
  }

  /**
   * 更新行业一级分类
   */
  static async updateCategory(id: number, data: any): Promise<Result<any>> {
    return http.patch({
      url: `/industry/category/${id}`,
      data
    })
  }

  /**
   * 删除行业一级分类
   */
  static async deleteCategory(id: number): Promise<Result<boolean>> {
    return http.del({
      url: `/industry/category/${id}`
    })
  }

  /**
   * 创建行业二级分类
   */
  static async createSubCategory(data: any): Promise<Result<any>> {
    return http.post({
      url: '/industry/subcategory',
      data
    })
  }

  /**
   * 获取行业二级分类列表
   */
  static async getSubCategoryList(categoryId: number): Promise<Result<any[]>> {
    return http.get({
      url: `/industry/category/${categoryId}/subcategories`
    })
  }

  /**
   * 获取行业二级分类详情
   */
  static async getSubCategoryById(id: number): Promise<Result<any>> {
    return http.get({
      url: `/industry/subcategory/${id}`
    })
  }

  /**
   * 更新行业二级分类
   */
  static async updateSubCategory(id: number, data: any): Promise<Result<any>> {
    return http.patch({
      url: `/industry/subcategory/${id}`,
      data
    })
  }

  /**
   * 删除行业二级分类
   */
  static async deleteSubCategory(id: number): Promise<Result<boolean>> {
    return http.del({
      url: `/industry/subcategory/${id}`
    })
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
  static async getExamList(params: any): Promise<Result<any[]> & Paging> {
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
