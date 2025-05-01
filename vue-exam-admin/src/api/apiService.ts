import http from '@/utils/http'
import { Result, PageResult } from './model/baseModel'

/**
 * API 服务基类
 * 提供统一的 API 调用方法
 */
export class ApiService {
  /**
   * 基础 URL 前缀
   */
  protected static baseUrl: string = ''

  /**
   * 获取完整的 URL
   * @param path API 路径
   * @returns 完整的 URL
   */
  protected static getUrl(path: string): string {
    return `${this.baseUrl}${path}`
  }

  /**
   * 发送 GET 请求
   * @param path API 路径
   * @param params 查询参数
   * @returns Promise 对象
   */
  protected static async get<T>(path: string, params?: any): Promise<Result<T>> {
    return http.get(this.getUrl(path), { params })
  }

  /**
   * 发送分页 GET 请求
   * @param path API 路径
   * @param params 分页参数
   * @returns Promise 对象
   */
  protected static async getPage<T>(path: string, params?: any): Promise<Result<PageResult<T>>> {
    return http.get(this.getUrl(path), { params })
  }

  /**
   * 发送 POST 请求
   * @param path API 路径
   * @param data 请求数据
   * @returns Promise 对象
   */
  protected static async post<T>(path: string, data?: any): Promise<Result<T>> {
    return http.post(this.getUrl(path), data)
  }
}
