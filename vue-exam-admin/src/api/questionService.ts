import { ApiService } from './apiService'
import { Question, QuestionListParams, QuestionType, DifficultyLevel } from './model/examModels'

/**
 * 题目 API 服务
 * 处理题目相关的 API 调用
 */
export class QuestionService extends ApiService {
  protected static baseUrl: string = '/question'

  /**
   * 获取题目列表
   * @param params 查询参数，可包含分页、关键词、题目类型、难度等级等
   * @returns Promise 对象
   */
  static async getQuestionList(params: QuestionListParams): Promise<any> {
    // 如果包含examId参数，使用专门的API路径获取试卷题目
    if (params.examId) {
      // 从参数中提取examId并删除，避免URL参数重复
      const examId = params.examId
      const newParams = { ...params }
      delete newParams.examId

      // 使用/exam/{id}接口获取试卷题目
      return ApiService.get(`/exam/${examId}`, newParams)
    }

    // 题目列表使用模拟数据
    return new Promise((resolve) => {
      resolve({
        code: 200,
        message: '获取题目列表成功',
        data: {
          items: [],
          total: 0
        }
      })
    })
  }

  /**
   * 获取题目详情
   * @param id 题目 ID
   * @returns Promise 对象
   */
  static async getQuestionById(id: number): Promise<any> {
    return this.get(`/${id}`)
  }

  /**
   * 创建题目
   * @param data 题目数据
   * @returns Promise 对象
   */
  static async createQuestion(data: Partial<Question>): Promise<any> {
    return this.post('', data)
  }

  /**
   * 更新题目
   * @param id 题目 ID
   * @param data 题目数据
   * @returns Promise 对象
   */
  static async updateQuestion(id: number, data: Partial<Question>): Promise<any> {
    return this.post(`/update/${id}`, data)
  }

  /**
   * 删除题目
   * @param id 题目 ID
   * @returns Promise 对象
   */
  static async deleteQuestion(id: number): Promise<any> {
    return this.post(`/delete/${id}`)
  }

  /**
   * 批量导入题目
   * @param file 题目文件
   * @returns Promise 对象
   */
  static async importQuestions(file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    return this.post('/import', formData)
  }

  /**
   * 导出题目
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async exportQuestions(params: QuestionListParams): Promise<any> {
    return this.get('/export', { params, responseType: 'blob' })
  }

  /**
   * 获取题目类型列表
   * @returns Promise 对象
   */
  static async getQuestionTypes(): Promise<any> {
    return this.get('/types')
  }

  /**
   * 获取题目难度级别列表
   * @returns Promise 对象
   */
  static async getDifficultyLevels(): Promise<any> {
    return this.get('/difficulty-levels')
  }

  /**
   * 获取题目类型名称
   * @param type 题目类型
   * @returns 题目类型名称
   */
  static getQuestionTypeName(type: QuestionType): string {
    switch (type) {
      case QuestionType.SINGLE_CHOICE:
        return '单选题'
      case QuestionType.MULTIPLE_CHOICE:
        return '多选题'
      case QuestionType.TRUE_FALSE:
        return '判断题'
      case QuestionType.FILL_BLANK:
        return '填空题'
      default:
        return '未知类型'
    }
  }

  /**
   * 获取难度级别名称
   * @param level 难度级别
   * @returns 难度级别名称
   */
  static getDifficultyLevelName(level: DifficultyLevel): string {
    switch (level) {
      case DifficultyLevel.EASY:
        return '简单'
      case DifficultyLevel.MEDIUM:
        return '中等'
      case DifficultyLevel.HARD:
        return '困难'
      default:
        return '未知难度'
    }
  }

  /**
   * 使用AI生成题目解析
   * @param question 题目内容
   * @returns Promise 对象
   */
  static async generateAnalysis(question: string): Promise<any> {
    return this.post('/generate-analysis', { question })
  }

  /**
   * 添加题目
   * @param data 题目数据
   * @returns Promise 对象
   */
  static async addQuestion(data: Partial<Question>): Promise<any> {
    return this.createQuestion(data)
  }
}
