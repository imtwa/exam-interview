import { Paging } from './baseModel'

/**
 * 题目类型枚举
 */
export enum QuestionType {
  SINGLE_CHOICE = 1,
  MULTIPLE_CHOICE = 2,
  TRUE_FALSE = 3,
  FILL_BLANK = 4
}

/**
 * 难度级别枚举
 */
export enum DifficultyLevel {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3
}

/**
 * 分类模型
 */
export interface Category {
  id?: number
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  subCategories?: SubCategory[]
  children?: SubCategory[] // 用于前端展示
}

/**
 * 子分类模型
 */
export interface SubCategory {
  id?: number
  name: string
  description?: string
  categoryId: number
  category?: Category
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

/**
 * 题目模型
 */
export interface Question {
  id?: number
  qtype: QuestionType
  question: string
  options?: string // JSON 格式的字符串
  answer: string
  ai_analysis: string
  difficulty?: DifficultyLevel
  userId?: number
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

/**
 * 试卷模型
 */
export interface ExamPaper {
  id?: number
  name: string
  description?: string
  categoryId: number
  subCategoryId?: number
  userId: number
  isPublic: boolean
  favoriteCount?: number
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  category?: Category
  subCategory?: SubCategory
  questions?: ExamQuestion[]
}

/**
 * 试卷题目关联模型
 */
export interface ExamQuestion {
  examId: number
  questionId: number
  order: number
  score: number
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  examPaper?: ExamPaper
  question?: Question
}

/**
 * 分类查询参数
 */
export interface CategoryListParams extends Partial<Paging> {
  keyword?: string
}

/**
 * 子分类查询参数
 */
export interface SubCategoryListParams extends Partial<Paging> {
  keyword?: string
  categoryId?: number
}

/**
 * 题目查询参数
 */
export interface QuestionListParams extends Partial<Paging> {
  keyword?: string
  qtype?: QuestionType
  difficulty?: DifficultyLevel
  categoryId?: number
  subCategoryId?: number
}

/**
 * 试卷查询参数
 */
export interface ExamPaperListParams extends Partial<Paging> {
  keyword?: string
  categoryId?: number
  subCategoryId?: number
  isPublic?: boolean
}
