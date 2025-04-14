import request from './request'

// 获取图片验证码
export function getCaptcha() {
  return request({
    url: '/auth/captcha/image',
    method: 'get',
    responseType: 'json',
    headers: {
      'Cache-Control': 'no-cache'
    }
  })
}

// 发送邮箱验证码
export function sendEmailCode(email) {
  return request({
    url: `/auth/captcha/email?address=${email}`,
    method: 'get'
  })
}

// 用户注册
export function register(data) {
  return request({
    url: '/auth/register',
    method: 'post',
    data
  })
}

// 用户登录
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

// 重置密码
export function resetPassword(data) {
  return request({
    url: '/auth/reset-password',
    method: 'post',
    data
  })
}

// 获取当前用户信息
export function getProfile() {
  return request({
    url: '/auth/profile',
    method: 'get'
  })
}

// 退出登录
export function logout() {
  // 前端仅清除本地存储的token，后端无需特殊处理
  return Promise.resolve()
} 