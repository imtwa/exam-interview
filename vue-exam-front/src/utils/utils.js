/**
 * 生成头像
 * @param {*} username
 * @returns
 */
export const generateAvatar = username => {
  if (!username) return ''

  // 根据用户名生成一个hash值
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }

  // 根据hash值生成颜色
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    color += ('00' + value.toString(16)).slice(-2)
  }

  // 使用用户名的第一个字符作为头像显示
  const char = username.charAt(0).toUpperCase()

  // 创建SVG
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="${color}" />
      <text x="50" y="50" font-family="Arial" font-size="50" fill="white" text-anchor="middle" dominant-baseline="central">
        ${char}
      </text>
    </svg>`

  // 转换为Base64 - 使用encodeURIComponent处理非ASCII字符
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}

/**
 * 格式化薪资
 * @param {number} min - 最低薪资(K)
 * @param {number} max - 最高薪资(K)
 * @returns {string} - 格式化后的薪资字符串
 */
export const formatSalary = (min, max) => {
  if (!min && !max) return '薪资面议'
  if (min && !max) return `${min.toFixed(0)}K以上`
  if (!min && max) return `${max.toFixed(0)}K以下`
  return `${min.toFixed(0)}K-${max.toFixed(0)}K`
}

/**
 * 格式化日期 YYYY-MM-DD
 * @param {string} dateStr - 日期字符串
 * @returns {string} - 格式化后的日期字符串
 */
export const formatDate = dateStr => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * 格式化日期和时间 YYYY-MM-DD HH:MM
 * @param {string} dateString - 日期字符串
 * @returns {string} - 格式化后的日期时间字符串
 */
export const formatDateTime = dateString => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}`
  } catch (error) {
    console.error('日期格式化错误:', error)
    return dateString
  }
}

/**
 * 格式化工作经验
 * @param {string} exp - 经验代码
 * @returns {string} - 格式化后的工作经验描述
 */
export const formatExperience = exp => {
  if (!exp) return '经验不限'

  const experienceMap = {
    STUDENT: '在校生',
    FRESH_GRADUATE: '应届生',
    LESS_THAN_ONE: '1年以内',
    ONE_TO_THREE: '1-3年',
    THREE_TO_FIVE: '3-5年',
    FIVE_TO_TEN: '5-10年',
    MORE_THAN_TEN: '10年以上'
  }

  return experienceMap[exp] || '经验不限'
}

/**
 * 格式化学历要求
 * @param {string} edu - 学历代码
 * @returns {string} - 格式化后的学历要求描述
 */
export const formatEducation = edu => {
  if (!edu) return '学历不限'

  const educationMap = {
    HIGH_SCHOOL: '高中学历',
    ASSOCIATE: '大专学历',
    BACHELOR: '本科学历',
    MASTER: '硕士学历',
    DOCTORATE: '博士学历',
    OTHER: '其他学历'
  }

  return educationMap[edu] || '学历不限'
}

/**
 * 格式化融资阶段
 * @param {string} stage - 融资阶段代码
 * @returns {string} - 格式化后的融资阶段描述
 */
export const formatFundingStage = stage => {
  if (!stage) return '未知'

  const stageMap = {
    UNFUNDED: '未融资',
    ANGEL: '天使轮',
    SERIES_A: 'A轮',
    SERIES_B: 'B轮',
    SERIES_C: 'C轮',
    SERIES_D: 'D轮及以上',
    IPO: '已上市',
    SELF_FUNDED: '不需要融资'
  }

  return stageMap[stage] || '未知'
}

/**
 * 格式化公司规模
 * @param {string} size - 公司规模代码
 * @returns {string} - 格式化后的公司规模描述
 */
export const formatCompanySize = size => {
  if (!size) return '未知'

  const sizeMap = {
    TINY: '0-20人',
    SMALL: '20-99人',
    MEDIUM: '100-499人',
    LARGE: '500-999人',
    XLARGE: '1000-9999人',
    XXLARGE: '10000+人'
  }

  return sizeMap[size] || '未知'
}

/**
 * 获取职位状态的类型（用于Element UI的标签类型）
 * @param {string} status - 职位状态代码
 * @returns {string} - Element UI的标签类型
 */
export const getStatusType = status => {
  switch (status) {
    case 'ACTIVE':
      return 'success'
    case 'FILLED':
      return 'warning'
    case 'EXPIRED':
      return 'info'
    default:
      return ''
  }
}

/**
 * 获取职位状态的文本描述
 * @param {string} status - 职位状态代码
 * @returns {string} - 状态文本描述
 */
export const getStatusLabel = status => {
  switch (status) {
    case 'ACTIVE':
      return '招聘中'
    case 'FILLED':
      return '已招满'
    case 'EXPIRED':
      return '已过期'
    default:
      return '未知'
  }
}
