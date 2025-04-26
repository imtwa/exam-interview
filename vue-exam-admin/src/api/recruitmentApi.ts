import request from '@/utils/http'
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
  static getUserList(params: PaginationParams) {
    const { page, size, searchVal = '', role } = params
    let url = `/api/users?page=${page}&size=${size}&search=${searchVal}`

    if (role !== undefined) {
      url += `&role=${role}`
    }

    return request.get<PaginationResult<FrontUserModel[]>>({
      url
    })
  }

  // Get user detail
  static getUserDetail(id: number) {
    return request.get<BaseResult<FrontUserModel>>({
      url: `/api/users/${id}`
    })
  }

  // Add user
  static addUser(params: FrontUserModel) {
    return request.post<BaseResult>({
      url: '/api/users',
      data: params
    })
  }

  // Edit user
  static updateUser(id: number, params: FrontUserModel) {
    return request.put<BaseResult>({
      url: `/api/users/${id}`,
      data: params
    })
  }

  // Delete user
  static deleteUser(id: number) {
    return request.del<BaseResult>({
      url: `/api/users/${id}`
    })
  }
}

// Company management API service
export class CompanyService {
  // Get company list with pagination
  static getCompanyList(params: PaginationParams) {
    const { page, size, searchVal = '', verificationStatus } = params
    let url = `/api/companies?page=${page}&size=${size}&search=${searchVal}`

    if (verificationStatus !== undefined) {
      url += `&verificationStatus=${verificationStatus}`
    }

    return request.get<PaginationResult<CompanyModel[]>>({
      url
    })
  }

  // Get company detail
  static getCompanyDetail(id: number) {
    return request.get<BaseResult<CompanyModel>>({
      url: `/api/companies/${id}`
    })
  }

  // Add company
  static addCompany(params: CompanyModel) {
    return request.post<BaseResult>({
      url: '/api/companies',
      data: params
    })
  }

  // Edit company
  static updateCompany(id: number, params: CompanyModel) {
    return request.put<BaseResult>({
      url: `/api/companies/${id}`,
      data: params
    })
  }

  // Delete company
  static deleteCompany(id: number) {
    return request.del<BaseResult>({
      url: `/api/companies/${id}`
    })
  }

  // Verify company
  static verifyCompany(id: number, status: 'VERIFIED' | 'REJECTED', reason?: string) {
    return request.put<BaseResult>({
      url: `/api/companies/${id}/verify`,
      data: { status, reason }
    })
  }
}

// Job posting management API service
export class JobPostingService {
  // Get job posting list with pagination and filters
  static getJobPostingList(params: PaginationParams) {
    const { page, size, searchVal = '', companyId, status } = params
    let url = `/api/job-postings?page=${page}&size=${size}&search=${searchVal}`

    if (companyId !== undefined) {
      url += `&companyId=${companyId}`
    }

    if (status !== undefined) {
      url += `&status=${status}`
    }

    return request.get<PaginationResult<JobPostingModel[]>>({
      url
    })
  }

  // Get job posting detail
  static getJobPostingDetail(id: number) {
    return request.get<BaseResult<JobPostingModel>>({
      url: `/api/job-postings/${id}`
    })
  }

  // Add job posting
  static addJobPosting(params: JobPostingModel) {
    return request.post<BaseResult>({
      url: '/api/job-postings',
      data: params
    })
  }

  // Edit job posting
  static updateJobPosting(id: number, params: JobPostingModel) {
    return request.put<BaseResult>({
      url: `/api/job-postings/${id}`,
      data: params
    })
  }

  // Delete job posting
  static deleteJobPosting(id: number) {
    return request.del<BaseResult>({
      url: `/api/job-postings/${id}`
    })
  }

  // Get job applications for a job posting
  static getJobApplications(jobId: number, params: PaginationParams) {
    const { page, size, status } = params
    let url = `/api/job-postings/${jobId}/applications?page=${page}&size=${size}`

    if (status !== undefined) {
      url += `&status=${status}`
    }

    return request.get<PaginationResult<any[]>>({
      url
    })
  }
}

// Job seeker management API service
export class JobSeekerService {
  // Get job seeker list with pagination
  static getJobSeekerList(params: PaginationParams) {
    const { page, size, searchVal = '' } = params
    return request.get<PaginationResult<JobSeekerModel[]>>({
      url: `/api/job-seekers?page=${page}&size=${size}&search=${searchVal}`
    })
  }

  // Get job seeker detail
  static getJobSeekerDetail(id: number) {
    return request.get<BaseResult<JobSeekerModel>>({
      url: `/api/job-seekers/${id}`
    })
  }

  // Get job seeker by user ID
  static getJobSeekerByUserId(userId: number) {
    return request.get<BaseResult<JobSeekerModel>>({
      url: `/api/job-seekers/by-user/${userId}`
    })
  }
}
