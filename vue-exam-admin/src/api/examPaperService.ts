import { ApiService } from './apiService'
import { ExamPaperListParams } from './model/examModels'

/**
 * 试卷 API 服务
 * 处理试卷相关的 API 调用
 */
export class ExamPaperService extends ApiService {
  protected static baseUrl: string = '/exam'

  /**
   * 获取试卷列表
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getExamPaperList(params: ExamPaperListParams): Promise<any> {
    return this.get('/list', params)
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
   * 上传试卷文件
   * @param formData 包含试卷文件的表单数据
   * @returns Promise 对象
   */
  static async uploadExamPaper(formData: FormData): Promise<any> {
    return this.post('/upload', formData)
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
   * @param examId 试卷ID
   * @param questions 要添加的题目数组
   * @returns Promise 对象
   */
  static async addExamQuestions(examId: number, questions: any[]): Promise<any> {
    return this.post(`/${examId}/questions`, questions)
  }

  /**
   * 更新试卷中的题目信息
   * @param examId 试卷ID
   * @param questionId 题目ID
   * @param data 更新的数据
   * @returns Promise 对象
   */
  static async updateExamQuestion(examId: number, questionId: number, data: any): Promise<any> {
    return this.post(`/${examId}/questions/${questionId}`, data)
  }

  /**
   * 从试卷中移除题目
   * @param examId 试卷ID
   * @param questionId 题目ID
   * @returns Promise 对象
   */
  static async removeExamQuestion(examId: number, questionId: number): Promise<any> {
    return this.post(`/delete/${examId}/questions/${questionId}`)
  }

  /**
   * 检查用户是否收藏了试卷
   * @param id 试卷 ID
   * @returns Promise 对象
   */
  static async checkFavorite(id: number): Promise<any> {
    return this.get(`/favorite/${id}`)
  }

  /**
   * 收藏或取消收藏试卷
   * @param id 试卷 ID
   * @returns Promise 对象
   */
  static async toggleFavorite(id: number): Promise<any> {
    return this.post(`/favorite/${id}`)
  }

  /**
   * 获取用户的收藏列表
   * @returns Promise 对象
   */
  static async getFavorites(): Promise<any> {
    return this.get('/favorites')
  }

  /**
   * 创建私有试卷
   * @param data 试卷数据
   * @returns Promise 对象
   */
  static async createPrivateExam(data: any): Promise<any> {
    return this.post('/private', data)
  }

  /**
   * 获取私有试卷列表
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getPrivateExams(params?: any): Promise<any> {
    return this.get('/private', params)
  }

  /**
   * 创建新试卷
   * @param data 试卷数据
   * @returns Promise 对象
   */
  static async addExamPaper(data: any): Promise<any> {
    return this.post('', data)
  }

  /**
   * 更新试卷信息
   * @param id 试卷ID
   * @param data 更新的数据
   * @returns Promise 对象
   */
  static async updateExamPaper(id: number, data: any): Promise<any> {
    return this.post(`/${id}`, data)
  }

  /**
   * 删除试卷
   * @param id 试卷ID
   * @returns Promise 对象
   */
  static async deleteExamPaper(id: number): Promise<any> {
    return this.post(`/delete/${id}`)
  }

  /**
   * AI生成试卷
   * @param data 生成参数
   * @returns Promise 对象
   */
  static async generateExamPaper(data: any): Promise<any> {
    return this.post('/generate', data)
  }
}

/**
 * 分类 API 服务
 * 处理分类相关的 API 调用
 */
export class CategoryService extends ApiService {
  protected static baseUrl: string = '/category'

  /**
   * 获取分类列表
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getCategoryList(params?: any): Promise<any> {
    return this.get('/list', params)
  }

  /**
   * 获取所有分类（用于下拉选择）
   * @returns Promise 对象
   */
  static async getAllCategories(): Promise<any> {
    return this.get('/list', { page: 1, size: 999 })
  }

  /**
   * 获取分类详情
   * @param id 分类 ID
   * @returns Promise 对象
   */
  static async getCategoryById(id: number): Promise<any> {
    return this.get(`/${id}`)
  }

  /**
   * 创建分类
   * @param data 分类数据
   * @returns Promise 对象
   */
  static async createCategory(data: any): Promise<any> {
    return this.post('', data)
  }

  /**
   * 更新分类
   * @param id 分类 ID
   * @param data 分类数据
   * @returns Promise 对象
   */
  static async updateCategory(id: number, data: any): Promise<any> {
    return this.post(`/${id}`, data)
  }

  /**
   * 删除分类
   * @param id 分类 ID
   * @returns Promise 对象
   */
  static async deleteCategory(id: number): Promise<any> {
    return this.post(`/delete/${id}`)
  }
}

/**
 * 子分类 API 服务
 * 处理子分类相关的 API 调用
 */
export class SubCategoryService extends ApiService {
  protected static baseUrl: string = '/subcategory'

  /**
   * 创建子分类
   * @param data 子分类数据
   * @returns Promise 对象
   */
  static async createSubCategory(data: any): Promise<any> {
    return this.post('', data)
  }

  /**
   * 更新子分类
   * @param id 子分类 ID
   * @param data 子分类数据
   * @returns Promise 对象
   */
  static async updateSubCategory(id: number, data: any): Promise<any> {
    return this.post(`/${id}`, data)
  }

  /**
   * 删除子分类
   * @param id 子分类 ID
   * @returns Promise 对象
   */
  static async deleteSubCategory(id: number): Promise<any> {
    return this.post(`/delete/${id}`)
  }

  /**
   * 获取指定分类下的子分类列表
   * @param categoryId 父分类ID
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getSubCategoriesByCategoryId(categoryId: number, params?: any): Promise<any> {
    return this.get(`/category/${categoryId}/subcategories`, params)
  }
}
