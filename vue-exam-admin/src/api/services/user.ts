import { http } from '@/utils/http'
import type { Result, Paging } from '../model/baseModel'
import type {
  FrontUser,
  FrontUserListParams,
  JobSeeker,
  JobSeekerListParams,
  Interviewer,
  InterviewerListParams,
  Company,
  CompanyListParams,
  JobPosting,
  JobPostingListParams,
  JobApplication,
  JobApplicationListParams,
  Interview,
  InterviewListParams,
  CompanyVerifyParams,
  Industry
} from '../model/userModel'

const API_PREFIX = '/api'

/**
 * 前台用户API服务
 */
export const frontUserApi = {
  /**
   * 获取前台用户列表
   */
  getList(params: FrontUserListParams): Promise<Result<{ list: FrontUser[]; paging: Paging }>> {
    return http.get(`${API_PREFIX}/front-users`, { params })
  },

  /**
   * 获取前台用户详情
   */
  getById(id: number): Promise<Result<FrontUser>> {
    return http.get(`${API_PREFIX}/front-users/${id}`)
  },

  /**
   * 添加前台用户
   */
  add(data: FrontUser): Promise<Result<FrontUser>> {
    return http.post(`${API_PREFIX}/front-users`, data)
  },

  /**
   * 更新前台用户
   */
  update(id: number, data: Partial<FrontUser>): Promise<Result<FrontUser>> {
    return http.put(`${API_PREFIX}/front-users/${id}`, data)
  },

  /**
   * 删除前台用户
   */
  delete(id: number): Promise<Result<null>> {
    return http.delete(`${API_PREFIX}/front-users/${id}`)
  },

  /**
   * 重置用户密码
   */
  resetPassword(id: number, password: string): Promise<Result<null>> {
    return http.put(`${API_PREFIX}/front-users/${id}/reset-password`, { password })
  }
}

/**
 * 求职者API服务
 */
export const jobSeekerApi = {
  /**
   * 获取求职者列表
   */
  getList(params: JobSeekerListParams): Promise<Result<{ list: JobSeeker[]; paging: Paging }>> {
    return http.get(`${API_PREFIX}/job-seekers`, { params })
  },

  /**
   * 获取求职者详情
   */
  getById(id: number): Promise<Result<JobSeeker>> {
    return http.get(`${API_PREFIX}/job-seekers/${id}`)
  },

  /**
   * 更新求职者信息
   */
  update(id: number, data: Partial<JobSeeker>): Promise<Result<JobSeeker>> {
    return http.put(`${API_PREFIX}/job-seekers/${id}`, data)
  }
}

/**
 * 面试官API服务
 */
export const interviewerApi = {
  /**
   * 获取面试官列表
   */
  getList(params: InterviewerListParams): Promise<Result<{ list: Interviewer[]; paging: Paging }>> {
    return http.get(`${API_PREFIX}/interviewers`, { params })
  },

  /**
   * 获取面试官详情
   */
  getById(id: number): Promise<Result<Interviewer>> {
    return http.get(`${API_PREFIX}/interviewers/${id}`)
  },

  /**
   * 添加面试官
   */
  add(data: Interviewer): Promise<Result<Interviewer>> {
    return http.post(`${API_PREFIX}/interviewers`, data)
  },

  /**
   * 更新面试官
   */
  update(id: number, data: Partial<Interviewer>): Promise<Result<Interviewer>> {
    return http.put(`${API_PREFIX}/interviewers/${id}`, data)
  },

  /**
   * 删除面试官
   */
  delete(id: number): Promise<Result<null>> {
    return http.delete(`${API_PREFIX}/interviewers/${id}`)
  },

  /**
   * 获取公司下的所有面试官
   */
  getByCompany(companyId: number): Promise<Result<Interviewer[]>> {
    return http.get(`${API_PREFIX}/companies/${companyId}/interviewers`)
  }
}

/**
 * 公司API服务
 */
export const companyApi = {
  /**
   * 获取公司列表
   */
  getList(params: CompanyListParams): Promise<Result<{ list: Company[]; paging: Paging }>> {
    return http.get(`${API_PREFIX}/companies`, { params })
  },

  /**
   * 获取公司详情
   */
  getById(id: number): Promise<Result<Company>> {
    return http.get(`${API_PREFIX}/companies/${id}`)
  },

  /**
   * 添加公司
   */
  add(data: Company): Promise<Result<Company>> {
    return http.post(`${API_PREFIX}/companies`, data)
  },

  /**
   * 更新公司
   */
  update(id: number, data: Partial<Company>): Promise<Result<Company>> {
    return http.put(`${API_PREFIX}/companies/${id}`, data)
  },

  /**
   * 删除公司
   */
  delete(id: number): Promise<Result<null>> {
    return http.delete(`${API_PREFIX}/companies/${id}`)
  },

  /**
   * 验证公司
   */
  verify(params: CompanyVerifyParams): Promise<Result<null>> {
    return http.put(`${API_PREFIX}/companies/${params.id}/verify`, params)
  },

  /**
   * 获取行业列表
   */
  getIndustries(): Promise<Result<Industry[]>> {
    return http.get(`${API_PREFIX}/industries`)
  }
}

/**
 * 职位API服务
 */
export const jobPostingApi = {
  /**
   * 获取职位列表
   */
  getList(params: JobPostingListParams): Promise<Result<{ list: JobPosting[]; paging: Paging }>> {
    return http.get(`${API_PREFIX}/jobs`, { params })
  },

  /**
   * 获取职位详情
   */
  getById(id: number): Promise<Result<JobPosting>> {
    return http.get(`${API_PREFIX}/jobs/${id}`)
  },

  /**
   * 添加职位
   */
  add(data: JobPosting): Promise<Result<JobPosting>> {
    return http.post(`${API_PREFIX}/jobs`, data)
  },

  /**
   * 更新职位
   */
  update(id: number, data: Partial<JobPosting>): Promise<Result<JobPosting>> {
    return http.put(`${API_PREFIX}/jobs/${id}`, data)
  },

  /**
   * 删除职位
   */
  delete(id: number): Promise<Result<null>> {
    return http.delete(`${API_PREFIX}/jobs/${id}`)
  },

  /**
   * 更新职位状态
   */
  updateStatus(id: number, status: string): Promise<Result<JobPosting>> {
    return http.put(`${API_PREFIX}/jobs/${id}/status`, { status })
  }
}

/**
 * 求职申请API服务
 */
export const jobApplicationApi = {
  /**
   * 获取求职申请列表
   */
  getList(
    params: JobApplicationListParams
  ): Promise<Result<{ list: JobApplication[]; paging: Paging }>> {
    return http.get(`${API_PREFIX}/applications`, { params })
  },

  /**
   * 获取求职申请详情
   */
  getById(id: number): Promise<Result<JobApplication>> {
    return http.get(`${API_PREFIX}/applications/${id}`)
  },

  /**
   * 更新求职申请
   */
  update(id: number, data: Partial<JobApplication>): Promise<Result<JobApplication>> {
    return http.put(`${API_PREFIX}/applications/${id}`, data)
  },

  /**
   * 更新求职申请状态
   */
  updateStatus(id: number, status: string): Promise<Result<JobApplication>> {
    return http.put(`${API_PREFIX}/applications/${id}/status`, { status })
  }
}

/**
 * 面试API服务
 */
export const interviewApi = {
  /**
   * 获取面试列表
   */
  getList(params: InterviewListParams): Promise<Result<{ list: Interview[]; paging: Paging }>> {
    return http.get(`${API_PREFIX}/interviews`, { params })
  },

  /**
   * 获取面试详情
   */
  getById(id: number): Promise<Result<Interview>> {
    return http.get(`${API_PREFIX}/interviews/${id}`)
  },

  /**
   * 添加面试
   */
  add(data: Interview): Promise<Result<Interview>> {
    return http.post(`${API_PREFIX}/interviews`, data)
  },

  /**
   * 更新面试
   */
  update(id: number, data: Partial<Interview>): Promise<Result<Interview>> {
    return http.put(`${API_PREFIX}/interviews/${id}`, data)
  },

  /**
   * 删除面试
   */
  delete(id: number): Promise<Result<null>> {
    return http.delete(`${API_PREFIX}/interviews/${id}`)
  },

  /**
   * 更新面试状态
   */
  updateStatus(id: number, status: string): Promise<Result<Interview>> {
    return http.put(`${API_PREFIX}/interviews/${id}/status`, { status })
  }
}
