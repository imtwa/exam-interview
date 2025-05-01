import request from '@/utils/request'

// 分页获取用户列表
export function getUserList(params) {
  return request({
    url: '/user/page',
    method: 'get',
    params
  })
}

// 获取当前用户信息
export function getUserProfile() {
  return request({
    url: '/user/profile',
    method: 'get'
  })
}

// 根据ID获取用户信息
export function getUser(id) {
  return request({
    url: `/user/${id}`,
    method: 'get'
  })
}

// 更新用户信息
export function updateUser(id, data) {
  return request({
    url: `/user/update/${id}`,
    method: 'post',
    data
  })
}

// 删除用户
export function deleteUser(id) {
  return request({
    url: `/user/delete/${id}`,
    method: 'post'
  })
}

// 检查用户资料完善状态
export function checkUserProfileStatus() {
  return request({
    url: '/user/profile/check',
    method: 'get'
  })
}
