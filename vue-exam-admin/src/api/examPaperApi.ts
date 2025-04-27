import http from '@/utils/http'
import { Paging, Result } from './model/baseModel'
import { ExamPaperModel, ExamQuestionModel } from './model/examModels'

// Exam Paper management API service
export class ExamPaperService {
  /**
   * Get exam paper list with pagination
   */
  static getExamPaperList = (params: {
    page: number
    size: number
    searchVal?: string
    categoryId?: number | null
    subcategoryId?: number | null
  }): Promise<Result<ExamPaperModel[]> & Paging> => {
    return http.get('/exam/paper/list', { params })
  }

  /**
   * Get exam paper by ID
   */
  static getExamPaperById = (id: number): Promise<Result<ExamPaperModel>> => {
    return http.get(`/exam/paper/detail`, { params: { id } })
  }

  /**
   * Create new exam paper
   */
  static createExamPaper = (
    examPaper: Partial<ExamPaperModel>
  ): Promise<Result<ExamPaperModel>> => {
    return http.post('/exam/paper/create', examPaper)
  }

  /**
   * Update exam paper
   */
  static updateExamPaper = (
    id: number,
    examPaper: Partial<ExamPaperModel>
  ): Promise<Result<ExamPaperModel>> => {
    return http.put(`/exam/paper/update`, { id, ...examPaper })
  }

  /**
   * Delete exam paper
   */
  static deleteExamPaper = (id: number): Promise<Result<boolean>> => {
    return http.delete(`/exam/paper/delete`, { params: { id } })
  }

  /**
   * Get questions in exam paper
   */
  static getExamQuestions = (examId: number): Promise<Result<ExamQuestionModel[]>> => {
    return http.get(`/exam/paper/questions`, { params: { examPaperId: examId } })
  }

  /**
   * Add questions to exam paper
   */
  static addExamQuestions = (
    examId: number,
    questions: Array<{
      questionId: number
      order: number
      score: number
    }>
  ): Promise<Result<boolean>> => {
    return http.post(`/exam/paper/questions/add`, { examPaperId: examId, questions })
  }

  /**
   * Update exam question (order, score)
   */
  static updateExamQuestion = (
    examId: number,
    questionId: number,
    data: {
      order: number
      score: number
    }
  ): Promise<Result<boolean>> => {
    return http.put(`/exam/paper/question/update`, { 
      examPaperId: examId, 
      questionId, 
      ...data 
    })
  }

  /**
   * Remove question from exam paper
   */
  static removeExamQuestion = (examId: number, questionId: number): Promise<Result<boolean>> => {
    return http.delete(`/exam/paper/question/delete`, { 
      params: { examPaperId: examId, questionId } 
    })
  }

  /**
   * Generate exam paper with AI
   */
  static generateExamPaper = (params: {
    categoryId: number
    subcategoryId?: number
    title: string
    description: string
    totalScore: number
    difficulty: number
    questionCount: number
  }): Promise<Result<ExamPaperModel>> => {
    return http.post('/exam/paper/generate', params)
  }
}
