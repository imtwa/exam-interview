import { ApiService } from './apiService'

/**
 * 认证服务
 * 处理登录、注册、验证码等认证相关的 API 调用
 */
export class AuthService extends ApiService {
  protected static baseUrl: string = '/auth'

  /**
   * 管理员登录
   * @param username 用户名
   * @param password 密码
   * @returns Promise 对象
   */
  static async adminLogin(username: string, password: string): Promise<any> {
    return this.post('/admin/login', { username, password })
  }

  /**
   * 获取管理员个人信息
   * @returns Promise 对象
   */
  static async getAdminProfile(): Promise<any> {
    return this.get('/admin/profile')
  }

  /**
   * 获取图片验证码
   * @returns Promise 对象
   */
  static async getImageCaptcha(): Promise<any> {
    return this.get('/captcha/image')
  }

  /**
   * 发送邮箱验证码
   * @param email 邮箱地址
   * @returns Promise 对象
   */
  static async sendEmailCode(email: string): Promise<any> {
    return this.get('/captcha/email', { address: email })
  }

  /**
   * 普通用户登录
   * @param email 邮箱
   * @param password 密码
   * @param captchaId 验证码ID
   * @param captcha 验证码
   * @returns Promise 对象
   */
  static async login(
    email: string,
    password: string,
    captchaId: string,
    captcha: string
  ): Promise<any> {
    return this.post('/login', { email, password, captchaId, captcha })
  }

  /**
   * 用户注册
   * @param data 注册数据
   * @returns Promise 对象
   */
  static async register(data: any): Promise<any> {
    return this.post('/register', data)
  }

  /**
   * 重置密码
   * @param data 重置密码数据
   * @returns Promise 对象
   */
  static async resetPassword(data: any): Promise<any> {
    return this.post('/reset-password', data)
  }

  /**
   * 获取用户个人信息
   * @returns Promise 对象
   */
  static async getProfile(): Promise<any> {
    return this.get('/profile')
  }

  /**
   * 检查用户资料完成状态
   * @returns Promise 对象
   */
  static async checkProfileStatus(): Promise<any> {
    return this.get('/check-profile-status')
  }
}
