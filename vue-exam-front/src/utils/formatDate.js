/**
 * 格式化日期为 YYYY-MM-DD HH:MM:SS 格式
 * @param {string|Date} dateString - 日期字符串或Date对象
 * @param {boolean} includeTime - 是否包含时间部分，默认为true
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(dateString, includeTime = true) {
  if (!dateString) return '-'

  try {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    if (!includeTime) {
      return `${year}-${month}-${day}`
    }

    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch (error) {
    console.error('日期格式化错误:', error)
    return dateString || '-'
  }
}

/**
 * 格式化日期为相对时间（如：3天前，2小时前）
 * @param {string|Date} dateString - 日期字符串或Date对象
 * @returns {string} 相对时间字符串
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return '-'

  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffSec = Math.floor(diffMs / 1000)

    if (diffSec < 60) return '刚刚'
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}分钟前`
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}小时前`
    if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}天前`
    if (diffSec < 31536000) return `${Math.floor(diffSec / 2592000)}个月前`

    return `${Math.floor(diffSec / 31536000)}年前`
  } catch (error) {
    console.error('相对时间格式化错误:', error)
    return dateString || '-'
  }
}

/**
 * 格式化日期时间为较为友好的显示格式
 * @param {string|Date} dateString - 日期字符串或Date对象
 * @returns {string} 格式化后的日期字符串，今天的显示为"今天 HH:MM"，昨天的显示为"昨天 HH:MM"，其他显示为"YYYY-MM-DD"
 */
export function formatFriendlyDate(dateString) {
  if (!dateString) return '-'

  try {
    const date = new Date(dateString)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    if (date >= today) {
      return `今天 ${hours}:${minutes}`
    }

    if (date >= yesterday && date < today) {
      return `昨天 ${hours}:${minutes}`
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('友好日期格式化错误:', error)
    return dateString || '-'
  }
}
