import { ApiService } from './apiService'
import { Industry } from './model/userModel'

/**
 * 行业 API 服务
 * 处理行业相关的 API 调用
 */
export class IndustryService extends ApiService {
  protected static baseUrl: string = '/industry'

  /**
   * 获取行业分类列表（包含二级分类）
   * @param params 查询参数 {page, pageSize, keyword}
   * @returns Promise 对象
   */
  static async getIndustryCategoryList(params = {}): Promise<any> {
    return this.get('/category', params)
  }

  /**
   * 获取行业树形结构
   * @returns Promise 对象
   */
  static async getIndustryTree(): Promise<any> {
    return this.get('/category', { page: 1, pageSize: 100 })
  }

  /**
   * 获取所有行业（包括一级和二级）
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getAllIndustries(params = {}): Promise<any> {
    return this.get('/category', params)
  }

  /**
   * 获取单个行业详情
   * @param id 行业ID
   * @returns Promise 对象
   */
  static async getIndustryById(id: number): Promise<any> {
    return this.get(`/category/${id}`)
  }

  /**
   * 创建一级行业
   * @param data 行业数据
   * @returns Promise 对象
   */
  static async createIndustryCategory(data: Omit<Industry, 'id' | 'children'>): Promise<any> {
    return this.post('/category', data)
  }

  /**
   * 更新一级行业
   * @param id 行业 ID
   * @param data 行业数据
   * @returns Promise 对象
   */
  static async updateIndustryCategory(id: number, data: Partial<Industry>): Promise<any> {
    return this.post(`/category/update/${id}`, data)
  }

  /**
   * 删除一级行业
   * @param id 行业 ID
   * @returns Promise 对象
   */
  static async deleteIndustryCategory(id: number): Promise<any> {
    return this.post(`/category/delete/${id}`)
  }

  /**
   * 获取二级行业列表（按一级行业ID）
   * @param categoryId 一级行业ID
   * @returns Promise 对象
   */
  static async getIndustrySubCategories(categoryId: number): Promise<any> {
    return this.get(`/category/${categoryId}/subcategories`)
  }

  /**
   * 获取单个二级行业详情
   * @param id 二级行业ID
   * @returns Promise 对象
   */
  static async getIndustrySubCategoryById(id: number): Promise<any> {
    return this.get(`/subcategory/${id}`)
  }

  /**
   * 创建二级行业
   * @param data 二级行业数据
   * @returns Promise 对象
   */
  static async createIndustrySubCategory(data: {
    name: string
    description?: string
    categoryId: number
  }): Promise<any> {
    return this.post('/subcategory', data)
  }

  /**
   * 更新二级行业
   * @param id 二级行业 ID
   * @param data 二级行业数据
   * @returns Promise 对象
   */
  static async updateIndustrySubCategory(
    id: number,
    data: {
      name: string
      description?: string
      categoryId: number
    }
  ): Promise<any> {
    return this.post(`/subcategory/update/${id}`, data)
  }

  /**
   * 删除二级行业
   * @param id 二级行业 ID
   * @returns Promise 对象
   */
  static async deleteIndustrySubCategory(id: number): Promise<any> {
    return this.post(`/subcategory/delete/${id}`)
  }
}
