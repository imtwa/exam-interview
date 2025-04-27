import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import EmojiText from '../emojo'
import { useRouter } from 'vue-router'

const axiosInstance = axios.create({
  timeout: 15000, // 请求超时时间(毫秒)
  baseURL: import.meta.env.VITE_API_URL, // API地址
  withCredentials: false, // 异步请求不携带cookie，避免CORS问题
  transformRequest: [(data) => JSON.stringify(data)], // 请求数据转换为 JSON 字符串
  validateStatus: (status) => status >= 200 && status < 300, // 只接受 2xx 的状态码
  headers: {
    get: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    post: { 'Content-Type': 'application/json;charset=utf-8' }
  },
  transformResponse: [
    (data, headers) => {
      const contentType = headers['content-type']
      if (contentType && contentType.includes('application/json')) {
        try {
          return JSON.parse(data)
        } catch {
          return data
        }
      }
      return data
    }
  ]
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const { accessToken } = useUserStore()

    // 如果 token 存在，则设置请求头
    if (accessToken && request.headers) {
      request.headers.set('Content-Type', 'application/json')
      request.headers.set('Authorization', accessToken)
    }

    return request // 返回修改后的配置
  },
  (error) => {
    ElMessage.error(`服务器异常！ ${EmojiText[500]}`) // 显示错误消息
    return Promise.reject(error) // 返回拒绝的 Promise
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    const res = response.data

    // 根据状态码判断请求是否成功
    if (res.code !== 200) {
      ElMessage({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 特殊状态码处理
      if (res.code === 401) {
        // 清除用户信息并跳转到登录页
        const userStore = useUserStore()
        userStore.logOut() // 使用logOut方法替代resetState
        const router = useRouter()
        router.push('/login')
      }

      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  (error) => {
    if (axios.isCancel(error)) {
      console.log('repeated request: ' + error.message)
    } else {
      const errorMessage = error.response?.data.message
      ElMessage.error(
        errorMessage
          ? `${errorMessage} ${EmojiText[500]}`
          : `请求超时或服务器异常！${EmojiText[500]}`
      )
    }
    return Promise.reject(error)
  }
)

// 请求
async function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  // 对 POST | PUT 请求特殊处理
  if (config.method?.toUpperCase() === 'POST' || config.method?.toUpperCase() === 'PUT') {
    // 如果已经有 data，则保留原有的 data
    if (config.params && !config.data) {
      config.data = config.params
      config.params = undefined // 使用 undefined 而不是空对象
    }
  }

  try {
    const res = await axiosInstance.request<any, T>(config)
    return res
  } catch (e) {
    if (axios.isAxiosError(e)) {
      // 可以在这里处理 Axios 错误
    }
    return Promise.reject(e)
  }
}

// API 方法集合
const api = {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return request({ ...config, url, method: 'GET' }) // GET 请求
  },
  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return request({ ...config, url, data, method: 'POST' }) // POST 请求
  },
  put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return request({ ...config, url, data, method: 'PUT' }) // PUT 请求
  },
  patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return request({ ...config, url, data, method: 'PATCH' }) // PATCH 请求
  },
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return request({ ...config, url, method: 'DELETE' }) // DELETE 请求
  }
}

export default api
