export interface CategoryModel {
  id?: number
  name: string
  description?: string
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}

export interface SubCategoryModel {
  id?: number
  name: string
  description?: string
  categoryId: number
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
  category?: CategoryModel
}

export interface QuestionModel {
  id?: number
  qtype: number // 1=单选题, 2=多选题, 3=判断题, 4=填空题
  question: string
  options?: string // JSON formatted string
  answer: string
  ai_analysis: string
  difficulty?: number // 1=简单, 2=中等, 3=困难
  userId?: number
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}

export interface ExamPaperModel {
  id?: number
  name: string
  description?: string
  categoryId: number
  subCategoryId?: number
  userId: number
  isPublic: boolean
  favoriteCount?: number
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
  category?: CategoryModel
  subCategory?: SubCategoryModel
}

export interface ExamQuestionModel {
  examId: number
  questionId: number
  order: number
  score: number
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
  examPaper?: ExamPaperModel
  question?: QuestionModel
}

export interface FrontUserModel {
  id?: number
  username: string
  password?: string
  email: string
  role: string // "JOB_SEEKER" | "INTERVIEWER"
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}

// Recruitment System Models
export interface JobSeekerModel {
  id?: number
  userId: number
  address?: string
  birthday?: Date
  gender?: string
  currentSalary?: number
  expectedSalary?: number
  expectedPosition?: string
  expectedWorkCity?: string
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
  user?: FrontUserModel
}

export interface CompanyModel {
  id?: number
  name: string
  description?: string
  address?: string
  fundingStage?: string
  size?: string
  industry?: string
  foundedYear?: number
  verificationStatus: string // "PENDING" | "VERIFIED" | "REJECTED"
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}

export interface JobPostingModel {
  id?: number
  title: string
  companyId: number
  interviewerId: number
  subCategoryId: number
  description: string
  requirements: string
  city: string
  address?: string
  salaryMin: number
  salaryMax: number
  experienceReq?: number
  educationReq?: string
  isRemote: boolean
  status: string // "ACTIVE" | "FILLED" | "EXPIRED"
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
  company?: CompanyModel
}

// Pagination models
export interface PaginationParams {
  page: number
  size: number
  searchVal?: string
  [key: string]: any
}
