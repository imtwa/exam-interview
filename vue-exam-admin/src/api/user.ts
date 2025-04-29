import http from '@/utils/http'
import { Result } from './model/baseModel'
import {
  FrontUser,
  JobSeeker,
  Interviewer,
  UserListParams,
  Education,
  WorkExperience
} from './model/userModel'

/**
 * 前台用户相关API
 */
export const UserService = {
  /**
   * 用户登录
   */
  login: (params: { body: string }): Promise<Result<any>> => {
    return http.post('/auth/login', JSON.parse(params.body))
  },

  /**
   * 获取当前用户信息
   */
  getUserInfo: (): Promise<Result<any>> => {
    return http.get('/auth/profile')
  },

  /**
   * 创建用户
   */
  createUser: (data: FrontUser): Promise<Result<FrontUser>> => {
    return http.post('/user', data)
  },

  /**
   * 更新用户
   */
  updateUser: (id: number, data: Partial<FrontUser>): Promise<Result<FrontUser>> => {
    return http.put(`/user/${id}`, data)
  },

  /**
   * 重置用户密码
   */
  resetPassword: (id: number): Promise<Result<string>> => {
    return http.post(`/user/${id}/reset-password`)
  },

  /**
   * 获取前台用户列表
   */
  getFrontUserList: (
    params: UserListParams
  ): Promise<Result<{ items: FrontUser[]; total: number }>> => {
    return http.get('/user/page', { params })
  },

  /**
   * 获取用户详情
   */
  getFrontUserDetail: (id: number): Promise<Result<FrontUser>> => {
    return http.get(`/user/${id}`)
  },

  /**
   * 创建前台用户
   */
  createFrontUser: (data: FrontUser): Promise<Result<FrontUser>> => {
    return http.post('/user', data)
  },

  /**
   * 更新前台用户
   */
  updateFrontUser: (id: number, data: Partial<FrontUser>): Promise<Result<FrontUser>> => {
    return http.put(`/user/${id}`, data)
  },

  /**
   * 删除前台用户
   */
  deleteFrontUser: (id: number): Promise<Result<void>> => {
    return http.delete(`/user/${id}`)
  },

  /**
   * 重置用户密码
   */
  resetUserPassword: (id: number, newPassword: string): Promise<Result<void>> => {
    return http.post(`/user/${id}/reset-password`, { newPassword })
  },

  /**
   * 获取求职者列表
   */
  getJobSeekerList: (
    params: UserListParams
  ): Promise<Result<{ items: JobSeeker[]; total: number }>> => {
    return http.get('/jobseeker/page', { params })
  },

  /**
   * 获取求职者详情
   */
  getJobSeekerDetail: (id: number): Promise<Result<JobSeeker>> => {
    return http.get(`/jobseeker/${id}`)
  },

  /**
   * 获取面试官列表
   */
  getInterviewerList: (
    params: UserListParams
  ): Promise<Result<{ items: Interviewer[]; total: number }>> => {
    return http.get('/interviewer/page', { params })
  },

  /**
   * 获取面试官详情
   */
  getInterviewerDetail: (id: number): Promise<Result<Interviewer>> => {
    return http.get(`/interviewer/${id}`)
  },

  /**
   * 更新面试官验证状态
   */
  updateInterviewerStatus: (
    id: number,
    status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  ): Promise<Result<void>> => {
    return http.put(`/interviewer/${id}/verify`, { status })
  },

  /**
   * 根据ID获取用户
   */
  getUserById: (id: number): Promise<Result<FrontUser>> => {
    return http.get(`/user/${id}`)
  },

  /**
   * 删除用户
   */
  deleteUser: (id: number): Promise<Result<boolean>> => {
    return http.delete(`/user/${id}`)
  },

  /**
   * 获取用户列表
   */
  getUserList: (params: UserListParams): Promise<Result<{ items: FrontUser[]; total: number }>> => {
    return http.get('/user/page', { params })
  }
}

/**
 * 求职者API服务
 */
export const JobSeekerService = {
  /**
   * 获取求职者列表
   */
  getJobSeekerList: (
    params: UserListParams
  ): Promise<Result<{ items: JobSeeker[]; total: number }>> => {
    return http.get('/jobseeker/page', { params })
  },

  /**
   * 获取求职者详情
   */
  getJobSeekerDetail: (id: number): Promise<Result<JobSeeker>> => {
    return http.get(`/jobseeker/${id}`)
  },

  /**
   * 更新求职者信息
   */
  updateJobSeeker: (id: number, data: Partial<JobSeeker>): Promise<Result<JobSeeker>> => {
    return http.patch(`/jobseeker/profile`, data)
  },

  /**
   * 同步求职者资料
   */
  syncJobSeekerProfile: (data: Partial<JobSeeker>): Promise<Result<JobSeeker>> => {
    return http.patch(`/jobseeker/profile/sync`, data)
  },

  /**
   * 获取工作经历
   */
  getWorkExperience: (jobSeekerId: number): Promise<Result<WorkExperience[]>> => {
    return http.get(`/jobseeker/${jobSeekerId}/work-experience`)
  },

  /**
   * 添加工作经历
   */
  addWorkExperience: (data: Partial<WorkExperience>): Promise<Result<WorkExperience>> => {
    return http.post(`/jobseeker/work-experience`, data)
  },

  /**
   * 更新工作经历
   */
  updateWorkExperience: (
    id: number,
    data: Partial<WorkExperience>
  ): Promise<Result<WorkExperience>> => {
    return http.patch(`/jobseeker/work-experience/${id}`, data)
  },

  /**
   * 删除工作经历
   */
  deleteWorkExperience: (id: number): Promise<Result<boolean>> => {
    return http.delete(`/jobseeker/work-experience/${id}`)
  },

  /**
   * 获取教育经历
   */
  getEducation: (jobSeekerId: number): Promise<Result<Education[]>> => {
    return http.get(`/jobseeker/${jobSeekerId}/education`)
  },

  /**
   * 添加教育经历
   */
  addEducation: (data: Partial<Education>): Promise<Result<Education>> => {
    return http.post(`/jobseeker/education`, data)
  },

  /**
   * 更新教育经历
   */
  updateEducation: (id: number, data: Partial<Education>): Promise<Result<Education>> => {
    return http.patch(`/jobseeker/education/${id}`, data)
  },

  /**
   * 删除教育经历
   */
  deleteEducation: (id: number): Promise<Result<boolean>> => {
    return http.delete(`/jobseeker/education/${id}`)
  },

  /**
   * 创建求职者
   */
  createJobSeeker: (data: Partial<JobSeeker>): Promise<Result<JobSeeker>> => {
    return http.post('/jobseeker', data)
  }
}
