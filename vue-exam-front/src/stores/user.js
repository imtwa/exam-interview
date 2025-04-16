import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, logout as authLogout, getProfile } from '@/api/auth'
import router from '@/router'
import { ElMessage } from 'element-plus'

// Token存储的键名
const TOKEN_KEY = 'exam_token'
// 用户信息存储的键名
const USER_INFO_KEY = 'exam_user_info'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const userInfo = ref(JSON.parse(localStorage.getItem(USER_INFO_KEY) || 'null') || {})
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)

  // 用户角色相关的计算属性
  const userRole = computed(() => userInfo.value?.role || '')
  const isJobSeeker = computed(() => userInfo.value?.role === 'JOB_SEEKER')
  const isInterviewer = computed(() => userInfo.value?.role === 'INTERVIEWER')

  // 生成默认头像 - 纯前端实现，无需后端存储
  // 根据用户名生成唯一的颜色和显示用户名最后一个字符
  const avatarUrl = computed(() => {
    return generateAvatar(userInfo.value?.username || '')
  })

  // 设置Token
  function setToken(value) {
    token.value = value
    localStorage.setItem(TOKEN_KEY, value)
  }

  // 设置用户信息
  function setUserInfo(info) {
    userInfo.value = info
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(info))
  }

  // 清除Token
  function clearToken() {
    token.value = ''
    localStorage.removeItem(TOKEN_KEY)
  }

  // 清除用户信息
  function clearUserInfo() {
    userInfo.value = {}
    localStorage.removeItem(USER_INFO_KEY)
  }

  // 用户登录
  async function userLogin(loginData) {
    try {
      const res = await login(loginData)
      const { user, access_token } = res

      // 保存Token和用户信息
      setToken(access_token)
      setUserInfo(user)

      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  // 获取用户信息
  async function getInfo() {
    try {
      const res = await getProfile()
      setUserInfo(res)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  // 退出登录
  function logout() {
    // 调用后端登出接口（如果需要）
    authLogout().finally(() => {
      clearToken()
      clearUserInfo()
      ElMessage.success('退出登录成功')
      router.push('/')
    })
  }

  // 生成默认头像（根据用户名生成）
  // 纯前端实现，不需要后端存储图片
  function generateAvatar(username) {
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

  return {
    token,
    userInfo,
    isLoggedIn,
    userRole,
    isJobSeeker,
    isInterviewer,
    avatarUrl,
    setToken,
    setUserInfo,
    clearToken,
    clearUserInfo,
    userLogin,
    getInfo,
    logout,
    generateAvatar
  }
})
