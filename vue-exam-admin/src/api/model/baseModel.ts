/**
 * API 响应基础模型
 */
export interface Result<T = any> {
  code: number
  message: string
  data: T
  success?: boolean
}

/**
 * 分页信息
 */
export interface Paging {
  page: number
  pageSize: number
}

/**
 * 分页数据结构
 */
export interface PageResult<T = any> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
