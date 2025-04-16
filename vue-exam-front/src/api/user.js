import request from '@/utils/request'

// 获取用户列表
export function getUserList(params) {
  return request({
    url: '/user/page',
    method: 'get',
    params
  })
}

// 获取单个用户
export function getUser(id) {
  return request({
    url: `/user/${id}`,
    method: 'get'
  })
}

// 更新用户
export function updateUser(id, data) {
  return request({
    url: `/user/${id}`,
    method: 'patch',
    data
  })
}

// 删除用户
export function deleteUser(id) {
  return request({
    url: `/user/${id}`,
    method: 'delete'
  })
}
