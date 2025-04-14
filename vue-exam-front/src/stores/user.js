import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, getProfile, logout as authLogout } from '@/api/auth'
import router from '@/router'
import { ElMessage } from 'element-plus'

// Token相关常量
const TOKEN_KEY = 'exam_token'
const USER_INFO_KEY = 'exam_user_info'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const userInfo = ref(JSON.parse(localStorage.getItem(USER_INFO_KEY) || 'null') || {})
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)
  
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
    
    // 提取用户名的第一个字符
    const char = username.length > 0 ? username.charAt(0) : '?'
    // const char = username
    
    // 生成随机色彩，但对同一用户名保持一致
    let hash = 0
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    const hue = Math.abs(hash % 360)
    const saturation = 70 + Math.abs((hash % 30))
    const lightness = 45 + Math.abs((hash % 20))
    
    const backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`
    
    // 创建SVG头像
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="${backgroundColor}" />
      <text x="50" y="50" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dominant-baseline="central">${char}</text>
    </svg>
    `
    
    // 转换为Base64
    return `data:image/svg+xml;base64,${btoa(svg)}`
  }

  return {
    token,
    userInfo,
    isLoggedIn,
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