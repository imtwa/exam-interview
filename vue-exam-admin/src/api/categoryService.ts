import { ApiService } from './apiService'

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
    return this.put(`/${id}`, data)
  }

  /**
   * 删除分类
   * @param id 分类 ID
   * @returns Promise 对象
   */
  static async deleteCategory(id: number): Promise<any> {
    return this.delete(`/${id}`)
  }
}
