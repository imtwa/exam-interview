import http from '@/utils/http'
import { Result, Paging } from './model/baseModel'
import { Job, JobApplication, Interview } from './model/userModel'

export interface JobListParams extends Paging {
  keyword?: string
  companyId?: number
  status?: 'ACTIVE' | 'FILLED' | 'EXPIRED'
  city?: string
}

export interface JobApplicationParams extends Paging {
  keyword?: string
  jobId?: number
  status?: 'PENDING' | 'INTERVIEWING' | 'OFFERED' | 'REJECTED' | 'ACCEPTED' | 'DECLINED'
}

export interface InterviewParams extends Paging {
  applicationId?: number
  jobId?: number
  interviewerId?: number
  status?: 'PENDING' | 'COMPLETED' | 'CANCELED'
}

/**
 * 职位相关API
 */
export const JobService = {
  /**
   * 获取职位列表
   */
  getJobList(params: JobListParams): Promise<Result<{ items: Job[]; total: number }>> {
    return http.get('/api/v1/jobs', { params })
  },

  /**
   * 获取职位详情
   */
  getJobDetail(id: number): Promise<Result<Job>> {
    return http.get(`/api/v1/jobs/${id}`)
  },

  /**
   * 创建职位
   */
  createJob(data: Job): Promise<Result<Job>> {
    return http.post('/api/v1/jobs', data)
  },

  /**
   * 更新职位
   */
  updateJob(id: number, data: Partial<Job>): Promise<Result<Job>> {
    return http.put(`/api/v1/jobs/${id}`, data)
  },

  /**
   * 删除职位
   */
  deleteJob(id: number): Promise<Result<void>> {
    return http.delete(`/api/v1/jobs/${id}`)
  },

  /**
   * 更新职位状态
   */
  updateJobStatus(id: number, status: 'ACTIVE' | 'FILLED' | 'EXPIRED'): Promise<Result<void>> {
    return http.put(`/api/v1/jobs/${id}/status`, { status })
  },

  /**
   * 获取职位申请列表
   */
  getJobApplicationList(
    params: JobApplicationParams
  ): Promise<Result<{ items: JobApplication[]; total: number }>> {
    return http.get('/api/v1/job-applications', { params })
  },

  /**
   * 获取职位申请详情
   */
  getJobApplicationDetail(id: number): Promise<Result<JobApplication>> {
    return http.get(`/api/v1/job-applications/${id}`)
  },

  /**
   * 更新职位申请状态
   */
  updateJobApplicationStatus(
    id: number,
    status: 'PENDING' | 'INTERVIEWING' | 'OFFERED' | 'REJECTED' | 'ACCEPTED' | 'DECLINED'
  ): Promise<Result<void>> {
    return http.put(`/api/v1/job-applications/${id}/status`, { status })
  },

  /**
   * 创建面试
   */
  createInterview(data: Interview): Promise<Result<Interview>> {
    return http.post('/api/v1/interviews', data)
  },

  /**
   * 获取面试列表
   */
  getInterviewList(
    params: InterviewParams
  ): Promise<Result<{ items: Interview[]; total: number }>> {
    return http.get('/api/v1/interviews', { params })
  },

  /**
   * 更新面试状态
   */
  updateInterviewStatus(
    id: number,
    status: 'PENDING' | 'COMPLETED' | 'CANCELED'
  ): Promise<Result<void>> {
    return http.put(`/api/v1/interviews/${id}/status`, { status })
  }
}
