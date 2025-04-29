import { Result, Paging } from './model/baseModel'
import {
  ExamPaper,
  ExamPaperListParams,
  ExamQuestion,
  AddQuestionsParams,
  UpdateQuestionParams,
  GenerateExamParams
} from './model/examPaperModel'
import http from '@/utils/http'

/**
 * Exam Paper API Service
 */
export const ExamPaperService = {
  /**
   * 获取试卷列表
   */
  getExamPaperList: (
    params: ExamPaperListParams
  ): Promise<Result<{ list: ExamPaper[]; paging: Paging }>> => {
    return http.get('/exam/paper/list', { params })
  },

  /**
   * 获取试卷详情
   */
  getExamPaperDetail: (id: number): Promise<Result<ExamPaper>> => {
    return http.get('/exam/paper/detail', { params: { id } })
  },

  /**
   * 创建试卷
   */
  createExamPaper: (data: ExamPaper): Promise<Result<number>> => {
    return http.post('/exam/paper/create', data)
  },

  /**
   * 更新试卷
   */
  updateExamPaper: (data: ExamPaper): Promise<Result<boolean>> => {
    return http.put('/exam/paper/update', data)
  },

  /**
   * 删除试卷
   */
  deleteExamPaper: (id: number): Promise<Result<boolean>> => {
    return http.delete('/exam/paper/delete', { params: { id } })
  },

  /**
   * 获取试卷题目
   */
  getExamPaperQuestions: (examPaperId: number): Promise<Result<ExamQuestion[]>> => {
    return http.get('/exam/paper/questions', { params: { examPaperId } })
  },

  /**
   * 添加试卷题目
   */
  addExamPaperQuestions: (data: AddQuestionsParams): Promise<Result<boolean>> => {
    return http.post('/exam/paper/questions/add', data)
  },

  /**
   * 更新试卷题目
   */
  updateExamPaperQuestion: (data: UpdateQuestionParams): Promise<Result<boolean>> => {
    return http.put('/exam/paper/question/update', data)
  },

  /**
   * 删除试卷题目
   */
  deleteExamPaperQuestion: (id: number): Promise<Result<boolean>> => {
    return http.delete('/exam/paper/question/delete', { params: { id } })
  },

  /**
   * 自动生成试卷
   */
  generateExamPaper: (data: GenerateExamParams): Promise<Result<ExamPaper>> => {
    return http.post('/exam/paper/generate', data)
  },

  /**
   * 获取试卷下的题目
   */
  getExamQuestions: (examId: number): Promise<Result<ExamQuestion[]>> => {
    return http.get('/exam/paper/questions', { params: { examPaperId: examId } })
  },

  /**
   * 添加题目到试卷
   */
  addExamQuestions: (
    examId: number,
    questions: Array<{
      questionId: number
      order: number
      score: number
    }>
  ): Promise<Result<boolean>> => {
    return http.post('/exam/paper/questions/add', { examPaperId: examId, questions })
  },

  /**
   * 更新试卷中的题目
   */
  updateExamQuestion: (
    examId: number,
    questionId: number,
    data: {
      order: number
      score: number
    }
  ): Promise<Result<boolean>> => {
    return http.put('/exam/paper/question/update', {
      examPaperId: examId,
      questionId,
      ...data
    })
  },

  /**
   * 从试卷中移除题目
   */
  removeExamQuestion: (examId: number, questionId: number): Promise<Result<boolean>> => {
    return http.delete('/exam/paper/question/delete', {
      params: { examPaperId: examId, questionId }
    })
  },

  /**
   * 添加新的试卷
   */
  addExamPaper: (data: ExamPaper): Promise<Result<number>> => {
    return http.post('/exam/paper/create', data)
  },

  /**
   * 根据ID获取试卷
   */
  getExamPaperById: (id: number): Promise<Result<ExamPaper>> => {
    return http.get('/exam/paper/detail', { params: { id } })
  }
}
