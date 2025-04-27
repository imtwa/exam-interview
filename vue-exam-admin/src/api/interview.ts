import http from '@/utils/http'
import { Result, Paging } from './model/baseModel'
import { Interview } from './model/userModel'

export interface InterviewFeedback {
  rating: number
  strengths?: string
  weaknesses?: string
  summary: string
  recommendation: 'HIRE' | 'REJECT' | 'CONSIDER'
}

export interface InterviewListParams extends Paging {
  jobId?: number
  interviewerId?: number
  applicantId?: number
  status?: 'PENDING' | 'COMPLETED' | 'CANCELED'
  fromDate?: string
  toDate?: string
}

/**
 * 面试相关API
 */
export const InterviewService = {
  /**
   * 获取面试列表
   */
  getInterviewList: (
    params: InterviewListParams
  ): Promise<Result<{ items: Interview[]; total: number }>> => {
    return http.get('/interview/page', { params })
  },

  /**
   * 获取面试详情
   */
  getInterviewDetail: (id: number): Promise<Result<Interview>> => {
    return http.get(`/interview/${id}`)
  },

  /**
   * 创建面试
   */
  createInterview: (data: Partial<Interview>): Promise<Result<Interview>> => {
    return http.post('/interview', data)
  },

  /**
   * 更新面试
   */
  updateInterview: (id: number, data: Partial<Interview>): Promise<Result<Interview>> => {
    return http.put(`/interview/${id}`, data)
  },

  /**
   * 取消面试
   */
  cancelInterview: (id: number, reason: string): Promise<Result<void>> => {
    return http.put(`/interview/${id}/cancel`, { reason })
  },

  /**
   * 提交面试反馈
   */
  submitFeedback: (interviewId: number, feedback: InterviewFeedback): Promise<Result<void>> => {
    return http.post(`/interview/${interviewId}/feedback`, feedback)
  },

  /**
   * 获取面试反馈
   */
  getFeedback: (interviewId: number): Promise<Result<InterviewFeedback>> => {
    return http.get(`/interview/${interviewId}/feedback`)
  },

  /**
   * 更新面试状态
   */
  updateInterviewStatus: (
    id: number,
    status: 'PENDING' | 'COMPLETED' | 'CANCELED'
  ): Promise<Result<void>> => {
    return http.put(`/interview/${id}/status`, { status })
  }
}
