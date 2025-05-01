import { ApiService } from './apiService'

/**
 * 子分类 API 服务
 * 处理子分类相关的 API 调用
 */
export class SubCategoryService extends ApiService {
  protected static baseUrl: string = '/subcategory'

  /**
   * 获取子分类列表
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getSubCategoryList(params?: any): Promise<any> {
    return this.get('/list', params)
  }

  /**
   * 获取子分类详情
   * @param id 子分类 ID
   * @returns Promise 对象
   */
  static async getSubCategoryById(id: number): Promise<any> {
    return this.get(`/${id}`)
  }

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
   * 根据分类 ID 获取子分类列表
   * @param categoryId 分类 ID
   * @returns Promise 对象
   */
  static async getSubCategoriesByCategoryId(categoryId: number): Promise<any> {
    return this.get(`/by-category/${categoryId}`)
  }
}
