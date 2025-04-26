import { Paging } from './baseModel'

/**
 * Exam paper model
 */
export interface ExamPaper {
  id?: number
  title: string
  description?: string
  totalScore: number
  passingScore: number
  duration: number
  subjectId: number
  subjectName?: string
  gradeId: number
  gradeName?: string
  questionCount?: number
  createTime?: string
  updateTime?: string
}

/**
 * Exam paper list request params
 */
export interface ExamPaperListParams extends Partial<Paging> {
  keyword?: string
  subjectId?: number
  gradeId?: number
}

/**
 * Exam question item
 */
export interface ExamQuestion {
  id: number
  questionId: number
  examPaperId: number
  score: number
  orderNum: number
  questionType?: number
  questionContent?: string
  questionOptions?: string[]
  answer?: string | string[]
}

/**
 * Add questions params
 */
export interface AddQuestionsParams {
  examPaperId: number
  questionIds: number[]
  score?: number
}

/**
 * Update question params
 */
export interface UpdateQuestionParams {
  id: number
  score?: number
  orderNum?: number
}

/**
 * Generate exam paper params
 */
export interface GenerateExamParams {
  subjectId: number
  gradeId: number
  difficulty?: number
  questionCount: number
  totalScore: number
  title?: string
  description?: string
  duration?: number
}
