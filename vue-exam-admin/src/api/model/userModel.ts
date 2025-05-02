import { Paging } from './baseModel'

/**
 * 用户角色枚举
 */
export enum UserRole {
  JOB_SEEKER = 'JOB_SEEKER',
  INTERVIEWER = 'INTERVIEWER'
}

/**
 * 性别枚举
 */
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

/**
 * 学历枚举
 */
export enum Degree {
  HIGH_SCHOOL = 'HIGH_SCHOOL',
  ASSOCIATE = 'ASSOCIATE',
  BACHELOR = 'BACHELOR',
  MASTER = 'MASTER',
  DOCTORATE = 'DOCTORATE',
  OTHER = 'OTHER'
}

/**
 * 验证状态枚举
 */
export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

/**
 * 融资阶段枚举
 */
export enum FundingStage {
  UNFUNDED = 'UNFUNDED',
  ANGEL = 'ANGEL',
  SERIES_A = 'SERIES_A',
  SERIES_B = 'SERIES_B',
  SERIES_C = 'SERIES_C',
  SERIES_D = 'SERIES_D',
  IPO = 'IPO',
  SELF_FUNDED = 'SELF_FUNDED'
}

/**
 * 公司规模枚举
 */
export enum CompanySize {
  TINY = 'TINY',
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  XLARGE = 'XLARGE',
  XXLARGE = 'XXLARGE'
}

/**
 * 职位状态枚举
 */
export enum JobStatus {
  ACTIVE = 'ACTIVE',
  FILLED = 'FILLED',
  EXPIRED = 'EXPIRED'
}

/**
 * 申请状态枚举
 */
export enum ApplicationStatus {
  RESUME_SCREENING = 'RESUME_SCREENING',
  WRITTEN_TEST = 'WRITTEN_TEST',
  FIRST_INTERVIEW = 'FIRST_INTERVIEW',
  SECOND_INTERVIEW = 'SECOND_INTERVIEW',
  HR_INTERVIEW = 'HR_INTERVIEW',
  SCHEDULED = 'SCHEDULED',
  OFFER = 'OFFER',
  REJECTED = 'REJECTED'
}

/**
 * 面试状态枚举
 */
export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

/**
 * 前台用户模型
 */
export interface FrontUser {
  id?: number
  username: string
  email: string
  role: UserRole
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
  gender?: Gender
  currentSalary?: number
  expectedSalary?: number
  expectedPosition?: string
  expectedWorkCity?: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  workExperience?: WorkExperience[]
  education?: Education[]
  applications?: JobApplication[]
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
  degree: Degree
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
  gender?: Gender
  position: string
  companyId: number
  company?: Company
  verificationStatus: VerificationStatus
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
  fundingStage?: FundingStage
  size?: CompanySize
  industryId?: number
  industry?: string
  foundedYear?: number
  verificationStatus: VerificationStatus
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  interviewers?: Interviewer[]
  jobPostings?: JobPosting[]
  website?: string
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
  educationReq?: Degree
  isRemote: boolean
  status: JobStatus
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  applications?: JobApplication[]
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
  status: ApplicationStatus
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
  status: InterviewStatus
  feedback?: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

/**
 * 行业模型
 */
export interface Industry {
  id?: number
  name: string
  parentId?: number | null
  description?: string
  children?: Industry[]
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  subCategories?: any[]
}

/**
 * 用户查询参数
 */
export interface UserListParams extends Partial<Paging> {
  keyword?: string
  role?: UserRole
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
  verificationStatus?: VerificationStatus
}

/**
 * 公司查询参数
 */
export interface CompanyListParams extends Partial<Paging> {
  keyword?: string
  industryId?: number
  verificationStatus?: VerificationStatus
  fundingStage?: string
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
  status?: JobStatus
}

/**
 * 求职申请查询参数
 */
export interface JobApplicationListParams extends Partial<Paging> {
  keyword?: string
  jobId?: number
  jobSeekerId?: number
  status?: ApplicationStatus
}

/**
 * 面试查询参数
 */
export interface InterviewListParams extends Partial<Paging> {
  applicationId?: number
  startDate?: string
  status?: InterviewStatus
}

/**
 * 公司认证参数
 */
export interface CompanyVerifyParams {
  status: VerificationStatus
  reason?: string
}
