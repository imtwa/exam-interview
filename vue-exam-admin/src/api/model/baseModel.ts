/**
 * Base API response model
 */
export interface Result<T = any> {
  code: number
  message: string
  data: T
  success?: boolean
}

/**
 * Pagination information
 */
export interface Paging {
  page: number
  pageSize: number
}

/**
 * Paginated data structure
 */
export interface PageResult<T = any> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
