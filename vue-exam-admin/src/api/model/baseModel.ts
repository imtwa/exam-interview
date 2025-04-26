/**
 * Base API response model
 */
export interface Result<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

/**
 * Pagination information
 */
export interface Paging {
  total: number
  page: number
  size: number
}
