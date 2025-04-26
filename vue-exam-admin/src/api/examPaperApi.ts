import http from '@/utils/http'
import { Paging, Result } from './model/baseModel'
import { ExamPaperModel, ExamQuestionModel } from './model/examModels'

// Exam Paper management API service
export class ExamPaperService {
  /**
   * Get exam paper list with pagination
   */
  static async getExamPaperList(params: {
    page: number
    size: number
    searchVal?: string
    categoryId?: number | null
    subcategoryId?: number | null
  }): Promise<Result<ExamPaperModel[]> & Paging> {
    return http.get('/api/exam-paper', { params })
  }

  /**
   * Get exam paper by ID
   */
  static async getExamPaperById(id: number): Promise<Result<ExamPaperModel>> {
    return http.get(`/api/exam-paper/${id}`)
  }

  /**
   * Create new exam paper
   */
  static async createExamPaper(
    examPaper: Partial<ExamPaperModel>
  ): Promise<Result<ExamPaperModel>> {
    return http.post('/api/exam-paper', examPaper)
  }

  /**
   * Update exam paper
   */
  static async updateExamPaper(
    id: number,
    examPaper: Partial<ExamPaperModel>
  ): Promise<Result<ExamPaperModel>> {
    return http.put(`/api/exam-paper/${id}`, examPaper)
  }

  /**
   * Delete exam paper
   */
  static async deleteExamPaper(id: number): Promise<Result<boolean>> {
    return http.delete(`/api/exam-paper/${id}`)
  }

  /**
   * Get questions in exam paper
   */
  static async getExamQuestions(examId: number): Promise<Result<ExamQuestionModel[]>> {
    return http.get(`/api/exam-paper/${examId}/questions`)
  }

  /**
   * Add questions to exam paper
   */
  static async addExamQuestions(
    examId: number,
    questions: Array<{
      questionId: number
      order: number
      score: number
    }>
  ): Promise<Result<boolean>> {
    return http.post(`/api/exam-paper/${examId}/questions`, questions)
  }

  /**
   * Update exam question (order, score)
   */
  static async updateExamQuestion(
    examId: number,
    questionId: number,
    data: {
      order: number
      score: number
    }
  ): Promise<Result<boolean>> {
    return http.put(`/api/exam-paper/${examId}/questions/${questionId}`, data)
  }

  /**
   * Remove question from exam paper
   */
  static async removeExamQuestion(examId: number, questionId: number): Promise<Result<boolean>> {
    return http.delete(`/api/exam-paper/${examId}/questions/${questionId}`)
  }

  /**
   * Generate exam paper with AI
   */
  static async generateExamPaper(params: {
    categoryId: number
    subcategoryId?: number
    title: string
    description: string
    totalScore: number
    difficulty: number
    questionCount: number
  }): Promise<Result<ExamPaperModel>> {
    return http.post('/api/exam-paper/generate', params)
  }
}
