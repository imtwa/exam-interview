import { ApiService } from './apiService'
import { FrontUser, UserListParams } from './model/userModel'

/**
 * 用户 API 服务
 * 处理用户相关的 API 调用
 */
export class UserService extends ApiService {
  protected static baseUrl: string = '/user'

  /**
   * 用户登录
   * @param username 用户名
   * @param password 密码
   * @returns Promise 对象
   */
  static async login(username: string, password: string): Promise<any> {
    return this.post('/auth/login', { username, password })
  }

  /**
   * 获取当前用户信息
   * @returns Promise 对象
   */
  static async getUserInfo(): Promise<any> {
    return this.get('/auth/profile')
  }

  /**
   * 修改密码
   * @param oldPassword 旧密码
   * @param newPassword 新密码
   * @returns Promise 对象
   */
  static async changePassword(oldPassword: string, newPassword: string): Promise<any> {
    return this.put('/auth/change-password', { oldPassword, newPassword })
  }

  /**
   * 获取用户列表（分页）
   * @param params 查询参数
   * @returns Promise 对象
   */
  static async getUserList(params: UserListParams): Promise<any> {
    return this.getPage('/page', params)
  }

  /**
   * 获取用户详情
   * @param id 用户 ID
   * @returns Promise 对象
   */
  static async getUserById(id: number): Promise<any> {
    return this.get(`/${id}`)
  }

  /**
   * 创建用户
   * @param data 用户数据
   * @returns Promise 对象
   */
  static async createUser(data: Partial<FrontUser>): Promise<any> {
    return this.post('', data)
  }

  /**
   * 更新用户
   * @param id 用户 ID
   * @param data 用户数据
   * @returns Promise 对象
   */
  static async updateUser(id: number, data: Partial<FrontUser>): Promise<any> {
    return this.put(`/${id}`, data)
  }

  /**
   * 删除用户
   * @param id 用户 ID
   * @returns Promise 对象
   */
  static async deleteUser(id: number): Promise<any> {
    return this.delete(`/${id}`)
  }

  /**
   * 重置用户密码
   * @param id 用户 ID
   * @returns Promise 对象
   */
  static async resetPassword(id: number): Promise<any> {
    return this.post(`/${id}/reset-password`)
  }
}
