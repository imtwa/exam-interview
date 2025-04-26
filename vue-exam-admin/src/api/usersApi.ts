import request from '@/utils/http'
import { BaseResult } from '@/types/axios'
import { UserInfo } from '@/types/store'
import AppConfig from '@/config'
import avatar from '@imgs/user/avatar.png'

export class UserService {
  // Login API
  static login(options: { body: string }): Promise<BaseResult> {
    // Keeping the mock implementation for now
    // In production, this would be replaced with a real API call
    return new Promise((resolve) => {
      const { username, password } = JSON.parse(options.body)

      if (
        username === AppConfig.systemInfo.login.username &&
        password === AppConfig.systemInfo.login.password
      ) {
        resolve({
          code: 200,
          message: '登录成功',
          data: {
            accessToken:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkpvaG4gU25vdyIsImlhdCI6MTcwNjg2NTYwMCwiZXhwIjoxNzA2OTUyMDAwfQ.8f9D4kJ2m3XlH5Q0y6Z1r2Y3n4X5pL6q8K9v2W3n4X5'
          }
        })
      } else {
        resolve({
          code: 401,
          message: '用户名或密码错误',
          data: null
        })
      }
    })

    // Real API implementation would be:
    // return request.post<BaseResult>({
    //   url: '/api/admin/login',
    //   data: JSON.parse(options.body)
    // })
  }

  // Get user info API
  static getUserInfo(): Promise<BaseResult<UserInfo>> {
    // Keeping the mock implementation for now
    return new Promise((resolve) => {
      resolve({
        code: 200,
        message: '获取用户信息成功',
        data: {
          id: 1,
          name: '张三',
          username: 'John Snow',
          avatar: avatar,
          email: 'art.design@gmail.com'
        }
      })
    })

    // Real API implementation would be:
    // return request.get<BaseResult<UserInfo>>({
    //   url: '/api/admin/userinfo'
    // })
  }

  // Get admin user list
  static getAdminUserList(params: { page: number; size: number; searchVal?: string }) {
    return request.get<BaseResult>({
      url: `/api/admin/users?page=${params.page}&size=${params.size}&search=${params.searchVal || ''}`
    })
  }

  // Add admin user
  static addAdminUser(params: {
    username: string
    password: string
    name: string
    email: string
    roleIds: number[]
  }) {
    return request.post<BaseResult>({
      url: '/api/admin/users',
      data: params
    })
  }

  // Update admin user
  static updateAdminUser(
    id: number,
    params: {
      name?: string
      email?: string
      roleIds?: number[]
    }
  ) {
    return request.put<BaseResult>({
      url: `/api/admin/users/${id}`,
      data: params
    })
  }

  // Delete admin user
  static deleteAdminUser(id: number) {
    return request.del<BaseResult>({
      url: `/api/admin/users/${id}`
    })
  }

  // Change password
  static changePassword(params: { oldPassword: string; newPassword: string }) {
    return request.put<BaseResult>({
      url: '/api/admin/change-password',
      data: params
    })
  }
}
