import http from '@/utils/http'
import { Result, Paging, PageResult } from './model/baseModel'
import { Interviewer, JobPosting, JobApplication } from './model/userModel'

/**
 * 面试官API接口参数
 */
export interface InterviewerParams extends Paging {
  keyword?: string
  companyId?: number
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED'
}

/**
 * 面试官API服务
 * 对应Nest.js的interviewer模块
 */
export const InterviewerService = {
  /**
   * 获取面试官列表
   */
  getInterviewerList: (params: InterviewerParams): Promise<Result<PageResult<Interviewer>>> => {
    return http.get('/interviewer/page', { params })
  },

  /**
   * 获取面试官详情
   */
  getInterviewerDetail: (id: number): Promise<Result<Interviewer>> => {
    return http.get(`/interviewer/${id}`)
  },

  /**
   * 获取当前用户的面试官信息
   */
  getCurrentProfile: (): Promise<Result<Interviewer>> => {
    return http.get('/interviewer/profile')
  },

  /**
   * 创建或更新面试官信息
   */
  createOrUpdateProfile: (
    data: Partial<Interviewer>,
    companyId: number
  ): Promise<Result<Interviewer>> => {
    return http.post('/interviewer/profile', data, {
      params: { companyId }
    })
  },

  /**
   * 获取面试官创建的职位列表
   */
  getInterviewerJobs: (params: Paging): Promise<Result<PageResult<JobPosting>>> => {
    return http.get('/interviewer/jobs', { params })
  },

  /**
   * 获取面试官收到的职位申请列表
   */
  getApplications: (
    params: Paging & { status?: string }
  ): Promise<Result<PageResult<JobApplication>>> => {
    return http.get('/interviewer/applications', { params })
  },

  /**
   * 更新职位申请状态
   */
  updateApplicationStatus: (
    id: number,
    status: string,
    feedback?: string
  ): Promise<Result<JobApplication>> => {
    return http.put(`/interviewer/applications/${id}/status`, { status, feedback })
  },

  /**
   * 安排面试
   */
  scheduleInterview: (
    applicationId: number,
    scheduleTime: Date,
    duration: number,
    meetingLink?: string
  ): Promise<Result<any>> => {
    return http.post(`/interviewer/applications/${applicationId}/interview`, {
      scheduleTime,
      duration,
      meetingLink
    })
  },

  /**
   * 更新面试官资料（支持同时创建公司）
   */
  updateProfile: (data: any): Promise<Result<Interviewer>> => {
    return http.post('/interviewer/profile/setup', data)
  }
}
