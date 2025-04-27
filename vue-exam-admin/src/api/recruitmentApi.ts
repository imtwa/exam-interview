import http from '@/utils/http'
import { PaginationResult, BaseResult } from '@/types/axios'
import {
  CompanyModel,
  JobPostingModel,
  PaginationParams,
  FrontUserModel,
  JobSeekerModel
} from './model/examModels'

// User management API service for the recruitment system
export class RecruitmentUserService {
  // Get user list with pagination and filters
  static getUserList = (params: PaginationParams) => {
    const { page, size, searchVal = '', role } = params
    let url = `/user/page?page=${page}&size=${size}&search=${searchVal}`

    if (role !== undefined) {
      url += `&role=${role}`
    }

    return http.get(url)
  }

  // Get user detail
  static getUserDetail = (id: number) => {
    return http.get(`/user/${id}`)
  }

  // Add user
  static addUser = (params: FrontUserModel) => {
    return http.post('/user', params)
  }

  // Edit user
  static updateUser = (id: number, params: FrontUserModel) => {
    return http.put(`/user/${id}`, params)
  }

  // Delete user
  static deleteUser = (id: number) => {
    return http.delete(`/user/${id}`)
  }
}

// Company management API service
export class CompanyService {
  // Get company list with pagination
  static getCompanyList = (params: PaginationParams) => {
    const { page, size, searchVal = '', verificationStatus } = params
    let url = `/company/page?page=${page}&size=${size}&search=${searchVal}`

    if (verificationStatus !== undefined) {
      url += `&verificationStatus=${verificationStatus}`
    }

    return http.get(url)
  }

  // Get company detail
  static getCompanyDetail = (id: number) => {
    return http.get(`/company/${id}`)
  }

  // Add company
  static addCompany = (params: CompanyModel) => {
    return http.post('/company', params)
  }

  // Edit company
  static updateCompany = (id: number, params: CompanyModel) => {
    return http.put(`/company/${id}`, params)
  }

  // Delete company
  static deleteCompany = (id: number) => {
    return http.delete(`/company/${id}`)
  }

  // Verify company
  static verifyCompany = (id: number, status: 'VERIFIED' | 'REJECTED', reason?: string) => {
    return http.put(`/company/${id}/verify`, { status, reason })
  }
}

// Job posting management API service
export class JobPostingService {
  // Get job posting list with pagination and filters
  static getJobPostingList = (params: PaginationParams) => {
    const { page, size, searchVal = '', companyId, status } = params
    let url = `/job?page=${page}&size=${size}&search=${searchVal}`

    if (companyId !== undefined) {
      url += `&companyId=${companyId}`
    }

    if (status !== undefined) {
      url += `&status=${status}`
    }

    return http.get(url)
  }

  // Get job posting detail
  static getJobPostingDetail = (id: number) => {
    return http.get(`/job/${id}`)
  }

  // Add job posting
  static addJobPosting = (params: JobPostingModel) => {
    return http.post('/job', params)
  }

  // Edit job posting
  static updateJobPosting = (id: number, params: JobPostingModel) => {
    return http.put(`/job/${id}`, params)
  }

  // Delete job posting
  static deleteJobPosting = (id: number) => {
    return http.delete(`/job/${id}`)
  }

  // Get job applications for a job posting
  static getJobApplications = (jobId: number, params: PaginationParams) => {
    const { page, size, status } = params
    let url = `/job/${jobId}/applications?page=${page}&size=${size}`

    if (status !== undefined) {
      url += `&status=${status}`
    }

    return http.get(url)
  }
}

// Job seeker management API service
export class JobSeekerService {
  // Get job seeker list with pagination
  static getJobSeekerList = (params: PaginationParams) => {
    const { page, size, searchVal = '' } = params
    return http.get(`/jobseeker/page?page=${page}&size=${size}&search=${searchVal}`)
  }

  // Get job seeker detail
  static getJobSeekerDetail = (id: number) => {
    return http.get(`/jobseeker/${id}`)
  }

  // Get job seeker by user ID
  static getJobSeekerByUserId = (userId: number) => {
    return http.get(`/jobseeker/by-user/${userId}`)
  }
}
