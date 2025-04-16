import axios from 'axios'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API, // API 请求的默认前缀
  timeout: 10000, // 请求超时时间
  withCredentials: true // 允许跨域携带cookie
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 在请求发送前做一些处理
    // 从 Pinia store 获取 token
    const userStore = useUserStore()
    const { token } = storeToRefs(userStore)

    if (token.value) {
      config.headers['Authorization'] = `Bearer ${token.value}` // 添加JWT令牌
    }
    return config
  },
  error => {
    // 请求错误处理
    // console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 如果响应是下载文件类型，直接返回
    if (response.config.responseType === 'blob') {
      return response
    }

    const res = response.data

    // 检查是否是双层嵌套的响应格式
    if (res.code === 200 && res.data && typeof res.data === 'object' && 'code' in res.data) {
      // 双层嵌套的格式，直接提取内层data
      if (res.data.code === 200) {
        return res.data.data
      } else {
        // 内层有错误码
        ElMessage.error(res.data.message || '请求失败')
        return Promise.reject(new Error(res.data.message || '请求失败'))
      }
    }

    // 单层格式
    if (res.code === 0 || res.code === 200) {
      return res.data
    }

    // 处理特定错误代码
    if (res.code === 401) {
      // 未授权，清除登录信息并重定向到登录页
      const userStore = useUserStore()
      userStore.clearToken()
      userStore.clearUserInfo()

      ElMessage.error('登录已过期，请重新登录')
      setTimeout(() => {
        window.location.href = '/login'
      }, 1500)
      return Promise.reject(new Error(res.message || '未授权'))
    }

    // 其他错误显示错误消息
    // ElMessage.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  error => {
    // 处理HTTP错误
    // console.error('Response error:', error)
    const { response } = error

    if (response) {
      // 根据HTTP状态码处理错误
      switch (response.status) {
        case 400:
          ElMessage.error(response.data.message || '请求参数错误')
          break
        case 401:
          ElMessage.error(response.data.message || '登录已过期，请重新登录')
          // 清除用户登录信息
          const userStore = useUserStore()
          userStore.clearToken()
          userStore.clearUserInfo()
          break
        case 403:
          ElMessage.error(response.data.message || '没有权限访问该资源')
          break
        case 404:
          ElMessage.error(response.data.message || '请求的资源不存在')
          break
        case 500:
          ElMessage.error(response.data.message || '服务器内部错误')
          break
        default:
          ElMessage.error(`请求失败: ${response.status}`)
      }
    } else {
      // 网络错误或请求被取消
      ElMessage.error('网络异常，请检查您的网络连接')
    }

    return Promise.reject(error)
  }
)

export default request
