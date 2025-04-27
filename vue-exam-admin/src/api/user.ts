import http from '@/utils/http'
import { Result } from './model/baseModel'
import { FrontUser, JobSeeker, Interviewer, UserListParams } from './model/userModel'

/**
 * 前台用户相关API
 */
export const UserService = {
  /**
   * 获取前台用户列表
   */
  getFrontUserList(params: UserListParams): Promise<Result<{ items: FrontUser[]; total: number }>> {
    return http.get('/api/v1/users', { params })
  },

  /**
   * 获取用户详情
   */
  getFrontUserDetail(id: number): Promise<Result<FrontUser>> {
    return http.get(`/api/v1/users/${id}`)
  },

  /**
   * 创建前台用户
   */
  createFrontUser(data: FrontUser): Promise<Result<FrontUser>> {
    return http.post('/api/v1/users', data)
  },

  /**
   * 更新前台用户
   */
  updateFrontUser(id: number, data: Partial<FrontUser>): Promise<Result<FrontUser>> {
    return http.put(`/api/v1/users/${id}`, data)
  },

  /**
   * 删除前台用户
   */
  deleteFrontUser(id: number): Promise<Result<void>> {
    return http.delete(`/api/v1/users/${id}`)
  },

  /**
   * 重置用户密码
   */
  resetUserPassword(id: number, newPassword: string): Promise<Result<void>> {
    return http.post(`/api/v1/users/${id}/reset-password`, { newPassword })
  },

  /**
   * 获取求职者列表
   */
  getJobSeekerList(params: UserListParams): Promise<Result<{ items: JobSeeker[]; total: number }>> {
    return http.get('/api/v1/job-seekers', { params })
  },

  /**
   * 获取求职者详情
   */
  getJobSeekerDetail(id: number): Promise<Result<JobSeeker>> {
    return http.get(`/api/v1/job-seekers/${id}`)
  },

  /**
   * 获取面试官列表
   */
  getInterviewerList(
    params: UserListParams
  ): Promise<Result<{ items: Interviewer[]; total: number }>> {
    return http.get('/api/v1/interviewers', { params })
  },

  /**
   * 获取面试官详情
   */
  getInterviewerDetail(id: number): Promise<Result<Interviewer>> {
    return http.get(`/api/v1/interviewers/${id}`)
  },

  /**
   * 更新面试官验证状态
   */
  updateInterviewerStatus(
    id: number,
    status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  ): Promise<Result<void>> {
    return http.put(`/api/v1/interviewers/${id}/status`, { status })
  }
}
