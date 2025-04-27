import { Paging } from './baseModel'

/**
 * 前台用户模型
 */
export interface FrontUser {
  id?: number
  username: string
  email: string
  role: 'JOB_SEEKER' | 'INTERVIEWER'
  password?: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

/**
 * 求职者模型
 */
export interface JobSeeker {
  id?: number
  userId: number
  user?: FrontUser
  address?: string
  birthday?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  currentSalary?: number
  expectedSalary?: number
  expectedPosition?: string
  expectedWorkCity?: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  workExperience?: WorkExperience[]
  education?: Education[]
}

/**
 * 工作经验
 */
export interface WorkExperience {
  id?: number
  jobSeekerId: number
  company: string
  position: string
  startDate: string
  endDate?: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * 教育经历
 */
export interface Education {
  id?: number
  jobSeekerId: number
  school: string
  degree: 'HIGH_SCHOOL' | 'ASSOCIATE' | 'BACHELOR' | 'MASTER' | 'DOCTORATE' | 'OTHER'
  major: string
  startDate: string
  endDate?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * 面试官模型
 */
export interface Interviewer {
  id?: number
  userId: number
  user?: FrontUser
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  position: string
  companyId: number
  company?: Company
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

/**
 * 公司模型
 */
export interface Company {
  id?: number
  name: string
  description?: string
  address?: string
  fundingStage?:
    | 'UNFUNDED'
    | 'ANGEL'
    | 'SERIES_A'
    | 'SERIES_B'
    | 'SERIES_C'
    | 'SERIES_D'
    | 'IPO'
    | 'SELF_FUNDED'
  size?: 'TINY' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'XLARGE' | 'XXLARGE'
  industry?: string
  foundedYear?: number
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

/**
 * 职位模型
 */
export interface JobPosting {
  id?: number
  title: string
  companyId: number
  company?: Company
  interviewerId: number
  interviewer?: Interviewer
  subCategoryId: number
  description: string
  requirements: string
  city: string
  address?: string
  salaryMin: number
  salaryMax: number
  experienceReq?: number
  educationReq?: 'HIGH_SCHOOL' | 'ASSOCIATE' | 'BACHELOR' | 'MASTER' | 'DOCTORATE' | 'OTHER'
  isRemote: boolean
  status: 'ACTIVE' | 'FILLED' | 'EXPIRED'
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

/**
 * 求职申请
 */
export interface JobApplication {
  id?: number
  jobSeekerId: number
  jobSeeker?: JobSeeker
  jobId: number
  job?: JobPosting
  status:
    | 'RESUME_SCREENING'
    | 'WRITTEN_TEST'
    | 'FIRST_INTERVIEW'
    | 'SECOND_INTERVIEW'
    | 'HR_INTERVIEW'
    | 'SCHEDULED'
    | 'OFFER'
    | 'REJECTED'
  appliedAt: string
  updatedAt?: string
  resumeUrl?: string
  coverLetterUrl?: string
  notes?: string
  interviews?: Interview[]
}

/**
 * 面试安排
 */
export interface Interview {
  id?: number
  applicationId: number
  application?: JobApplication
  scheduleTime: string
  duration: number
  meetingLink?: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  feedback?: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

/**
 * 用户查询参数
 */
export interface UserListParams extends Partial<Paging> {
  keyword?: string
  role?: 'JOB_SEEKER' | 'INTERVIEWER'
}

/**
 * 求职者查询参数
 */
export interface JobSeekerListParams extends Partial<Paging> {
  keyword?: string
  expectedPosition?: string
  expectedWorkCity?: string
}

/**
 * 面试官查询参数
 */
export interface InterviewerListParams extends Partial<Paging> {
  keyword?: string
  companyId?: number
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED'
}

/**
 * 公司查询参数
 */
export interface CompanyListParams extends Partial<Paging> {
  keyword?: string
  industry?: string
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED'
}

/**
 * 职位查询参数
 */
export interface JobPostingListParams extends Partial<Paging> {
  keyword?: string
  companyId?: number
  city?: string
  salaryMin?: number
  salaryMax?: number
  status?: 'ACTIVE' | 'FILLED' | 'EXPIRED'
}

/**
 * 求职申请查询参数
 */
export interface JobApplicationListParams extends Partial<Paging> {
  keyword?: string
  jobId?: number
  jobSeekerId?: number
  status?:
    | 'RESUME_SCREENING'
    | 'WRITTEN_TEST'
    | 'FIRST_INTERVIEW'
    | 'SECOND_INTERVIEW'
    | 'HR_INTERVIEW'
    | 'SCHEDULED'
    | 'OFFER'
    | 'REJECTED'
}

/**
 * 面试查询参数
 */
export interface InterviewListParams extends Partial<Paging> {
  applicationId?: number
  startDate?: string
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
}

/**
 * 行业模型
 */
export interface Industry {
  id?: number
  name: string
  parentId?: number | null
  children?: Industry[]
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

/**
 * 公司认证参数
 */
export interface CompanyVerifyParams {
  id: number
  verificationStatus: 'VERIFIED' | 'REJECTED'
  reason?: string
}
