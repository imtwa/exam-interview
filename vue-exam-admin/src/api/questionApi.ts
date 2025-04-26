import request from '@/utils/http'
import { PaginationResult, BaseResult } from '@/types/axios'
import { QuestionModel, PaginationParams } from './model/examModels'

// Question management API service
export class QuestionService {
  // Get question list with pagination and filters
  static getQuestionList(params: PaginationParams) {
    const { page, size, searchVal = '', qtype, difficulty } = params
    let url = `/api/questions?page=${page}&size=${size}&search=${searchVal}`

    if (qtype !== undefined) {
      url += `&qtype=${qtype}`
    }

    if (difficulty !== undefined) {
      url += `&difficulty=${difficulty}`
    }

    return request.get<PaginationResult<QuestionModel[]>>({
      url
    })
  }

  // Get question detail
  static getQuestionDetail(id: number) {
    return request.get<BaseResult<QuestionModel>>({
      url: `/api/questions/${id}`
    })
  }

  // Add question
  static addQuestion(params: QuestionModel) {
    return request.post<BaseResult>({
      url: '/api/questions',
      data: params
    })
  }

  // Edit question
  static updateQuestion(id: number, params: QuestionModel) {
    return request.put<BaseResult>({
      url: `/api/questions/${id}`,
      data: params
    })
  }

  // Delete question
  static deleteQuestion(id: number) {
    return request.del<BaseResult>({
      url: `/api/questions/${id}`
    })
  }

  // Batch import questions
  static importQuestions(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return request.post<BaseResult>({
      url: '/api/questions/import',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  // AI generate analysis for question
  static generateAnalysis(questionText: string) {
    return request.post<BaseResult<{ analysis: string }>>({
      url: '/api/questions/ai-analysis',
      data: { question: questionText }
    })
  }
}
