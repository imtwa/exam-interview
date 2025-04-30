import { ApiService } from './apiService'
import { ExamPaper, ExamPaperListParams, ExamQuestion } from './model/examModels'

/**
 * 试卷 API 服务
 * 处理试卷相关的 API 调用
 */
export class ExamPaperService extends ApiService {
  protected static baseUrl: string = '/exam-paper'

  /**
   * 获取试卷列表
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getExamPaperList(params: ExamPaperListParams): Promise<any> {
    return this.getPage('/list', params)
  }

  /**
   * 获取试卷详情
   * @param id 试卷 ID
   * @returns Promise 对象
   */
  static async getExamPaperById(id: number): Promise<any> {
    return this.get(`/${id}`)
  }

  /**
   * 创建试卷
   * @param data 试卷数据
   * @returns Promise 对象
   */
  static async createExamPaper(data: Partial<ExamPaper>): Promise<any> {
    return this.post('', data)
  }

  /**
   * 更新试卷
   * @param id 试卷 ID
   * @param data 试卷数据
   * @returns Promise 对象
   */
  static async updateExamPaper(id: number, data: Partial<ExamPaper>): Promise<any> {
    return this.put(`/${id}`, data)
  }

  /**
   * 删除试卷
   * @param id 试卷 ID
   * @returns Promise 对象
   */
  static async deleteExamPaper(id: number): Promise<any> {
    return this.delete(`/${id}`)
  }

  /**
   * 获取试卷的题目列表
   * @param examId 试卷 ID
   * @returns Promise 对象
   */
  static async getExamQuestions(examId: number): Promise<any> {
    return this.get(`/${examId}/questions`)
  }

  /**
   * 添加题目到试卷
   * @param examId 试卷 ID
   * @param questionId 题目 ID
   * @param order 顺序
   * @param score 分数
   * @returns Promise 对象
   */
  static async addQuestionToExam(
    examId: number,
    questionId: number,
    order: number,
    score: number
  ): Promise<any> {
    return this.post(`/${examId}/questions`, { questionId, order, score })
  }

  /**
   * 更新试卷中的题目
   * @param examId 试卷 ID
   * @param questionId 题目 ID
   * @param data 更新数据
   * @returns Promise 对象
   */
  static async updateExamQuestion(
    examId: number,
    questionId: number,
    data: Partial<ExamQuestion>
  ): Promise<any> {
    return this.put(`/${examId}/questions/${questionId}`, data)
  }

  /**
   * 从试卷中删除题目
   * @param examId 试卷 ID
   * @param questionId 题目 ID
   * @returns Promise 对象
   */
  static async removeQuestionFromExam(examId: number, questionId: number): Promise<any> {
    return this.delete(`/${examId}/questions/${questionId}`)
  }
}
