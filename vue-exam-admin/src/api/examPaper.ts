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
 * Exam Paper API endpoints
 */

const API = {
  LIST: '/exam/paper/list',
  DETAIL: '/exam/paper/detail',
  CREATE: '/exam/paper/create',
  UPDATE: '/exam/paper/update',
  DELETE: '/exam/paper/delete',
  QUESTIONS: '/exam/paper/questions',
  ADD_QUESTIONS: '/exam/paper/questions/add',
  UPDATE_QUESTION: '/exam/paper/question/update',
  DELETE_QUESTION: '/exam/paper/question/delete',
  GENERATE: '/exam/paper/generate'
}

/**
 * Get exam paper list
 */
export function getExamPaperList(params: ExamPaperListParams) {
  return http.get<Result<{ list: ExamPaper[]; paging: Paging }>>(API.LIST, { params })
}

/**
 * Get exam paper detail
 */
export function getExamPaperDetail(id: number) {
  return http.get<Result<ExamPaper>>(API.DETAIL, { params: { id } })
}

/**
 * Create new exam paper
 */
export function createExamPaper(data: ExamPaper) {
  return http.post<Result<number>>(API.CREATE, data)
}

/**
 * Update exam paper
 */
export function updateExamPaper(data: ExamPaper) {
  return http.put<Result<boolean>>(API.UPDATE, data)
}

/**
 * Delete exam paper
 */
export function deleteExamPaper(id: number) {
  return http.delete<Result<boolean>>(API.DELETE, { params: { id } })
}

/**
 * Get exam paper questions
 */
export function getExamPaperQuestions(examPaperId: number) {
  return http.get<Result<ExamQuestion[]>>(API.QUESTIONS, { params: { examPaperId } })
}

/**
 * Add questions to exam paper
 */
export function addExamPaperQuestions(data: AddQuestionsParams) {
  return http.post<Result<boolean>>(API.ADD_QUESTIONS, data)
}

/**
 * Update exam paper question
 */
export function updateExamPaperQuestion(data: UpdateQuestionParams) {
  return http.put<Result<boolean>>(API.UPDATE_QUESTION, data)
}

/**
 * Delete exam paper question
 */
export function deleteExamPaperQuestion(id: number) {
  return http.delete<Result<boolean>>(API.DELETE_QUESTION, { params: { id } })
}

/**
 * Generate exam paper automatically
 */
export function generateExamPaper(data: GenerateExamParams) {
  return http.post<Result<ExamPaper>>(API.GENERATE, data)
}
