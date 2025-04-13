import request from './request'

// 获取验证码
export function getCaptcha() {
  return request({
    url: '/user/captcha',
    method: 'get',
    responseType: 'json'
  })
}

// 发送邮箱验证码
export function sendEmailCode(email) {
  return request({
    url: '/email/code',
    method: 'get',
    params: { address: email }
  })
}

// 用户注册
export function register(data) {
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}

// 用户登录
export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

// 重置密码
export function resetPassword(data) {
  return request({
    url: '/user/reset-password',
    method: 'post',
    data
  })
} 