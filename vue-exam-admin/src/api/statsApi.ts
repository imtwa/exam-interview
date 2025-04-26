import request from '@/utils/http'
import { BaseResult } from '@/types/axios'

// Statistics API service for dashboard and reports
export class StatsService {
  // Get dashboard statistics
  static getDashboardStats() {
    return request.get<
      BaseResult<{
        totalUsers: number
        totalExamPapers: number
        totalQuestions: number
        totalCompanies: number
        totalJobPostings: number
        recentRegistrations: Array<{ date: string; count: number }>
        categoryDistribution: Array<{ category: string; count: number }>
      }>
    >({
      url: '/api/stats/dashboard'
    })
  }

  // Get category statistics
  static getCategoryStats() {
    return request.get<
      BaseResult<
        Array<{
          id: number
          name: string
          count: number
          subCategories: Array<{ id: number; name: string; count: number }>
        }>
      >
    >({
      url: '/api/stats/categories'
    })
  }

  // Get user activity statistics
  static getUserActivityStats(params: { days?: number }) {
    const { days = 30 } = params
    return request.get<BaseResult<Array<{ date: string; count: number }>>>({
      url: `/api/stats/user-activity?days=${days}`
    })
  }

  // Get recruitment statistics
  static getRecruitmentStats() {
    return request.get<
      BaseResult<{
        totalCompanies: number
        totalJobPostings: number
        totalApplications: number
        applicationStatusDistribution: Array<{ status: string; count: number }>
        jobPostingsByCity: Array<{ city: string; count: number }>
        popularPositions: Array<{ title: string; count: number }>
      }>
    >({
      url: '/api/stats/recruitment'
    })
  }

  // Get monthly user growth
  static getMonthlyUserGrowth(params: { months?: number }) {
    const { months = 12 } = params
    return request.get<BaseResult<Array<{ month: string; count: number }>>>({
      url: `/api/stats/user-growth?months=${months}`
    })
  }

  // Get industry statistics
  static getIndustryStats() {
    return request.get<
      BaseResult<
        Array<{
          industry: string
          jobCount: number
          companyCount: number
        }>
      >
    >({
      url: '/api/stats/industries'
    })
  }
}
