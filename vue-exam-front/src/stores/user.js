import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, logout as authLogout, getProfile, checkProfileStatus } from '@/api/auth'
import router from '@/router'
import { ElMessage } from 'element-plus'
import { generateAvatar } from '@/utils/utils'
// Token存储的键名
const TOKEN_KEY = 'exam_token'
// 用户信息存储的键名
const USER_INFO_KEY = 'exam_user_info'
// 面试官信息存储的键名
const INTERVIEWER_INFO_KEY = 'exam_interviewer_info'
// 资料完善状态存储键名
const PROFILE_STATUS_KEY = 'exam_profile_status'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const userInfo = ref(JSON.parse(localStorage.getItem(USER_INFO_KEY) || 'null') || {})
  const interviewerInfo = ref(
    JSON.parse(localStorage.getItem(INTERVIEWER_INFO_KEY) || 'null') || {}
  )
  const profileCompleted = ref(localStorage.getItem(PROFILE_STATUS_KEY) === 'true')
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)

  // 用户角色相关的计算属性
  const userRole = computed(() => userInfo.value?.role || '')
  const isJobSeeker = computed(() => userInfo.value?.role === 'JOB_SEEKER')
  const isInterviewer = computed(() => userInfo.value?.role === 'INTERVIEWER')

  // 面试官信息的计算属性
  const interviewerId = computed(() => interviewerInfo.value?.id || 0)
  const companyId = computed(() => interviewerInfo.value?.companyId || 0)

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

  // 设置面试官信息
  function setInterviewerInfo(info) {
    interviewerInfo.value = info
    localStorage.setItem(INTERVIEWER_INFO_KEY, JSON.stringify(info))
  }

  // 设置资料完善状态
  function setProfileStatus(status) {
    profileCompleted.value = status
    localStorage.setItem(PROFILE_STATUS_KEY, status)
  }

  // 设置求职者信息
  function setJobSeekerInfo(info) {
    localStorage.setItem('exam_jobseeker_info', JSON.stringify(info))
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
    interviewerInfo.value = {}
    localStorage.removeItem(INTERVIEWER_INFO_KEY)
    profileCompleted.value = false
    localStorage.removeItem(PROFILE_STATUS_KEY)
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

  // 检查用户个人信息状态并获取面试官信息（合并两个功能为一个请求）
  async function checkUserProfile() {
    try {
      // 如果已经缓存了信息且面试官ID存在，直接返回缓存信息
      if (
        profileCompleted.value &&
        (isJobSeeker.value || (isInterviewer.value && interviewerId.value > 0))
      ) {
        return Promise.resolve({
          profileCompleted: profileCompleted.value,
          profileData: interviewerInfo.value
        })
      }

      // 否则发送请求获取最新信息
      const res = await checkProfileStatus()

      // 保存资料完善状态
      setProfileStatus(!!res.profileCompleted)

      // 如果是面试官且资料已完善，保存面试官信息
      if (isInterviewer.value && res.profileCompleted && res.profileData) {
        setInterviewerInfo(res.profileData)
      }

      return Promise.resolve(res)
    } catch (error) {
      console.error('检查用户个人信息状态失败:', error)
      return Promise.reject(error)
    }
  }

  // 专门用于获取面试官详细资料的函数
  async function fetchInterviewerProfile() {
    try {
      // 仅当用户是面试官角色时获取面试官资料
      if (!isInterviewer.value) {
        return Promise.resolve(null)
      }

      // 使用checkProfile API获取面试官详细信息
      const response = await checkProfileStatus()

      // 如果获取成功，更新面试官信息
      if (response.profileCompleted && response.profileData) {
        setInterviewerInfo(response.profileData)
        setProfileStatus(true)
      } else {
        setProfileStatus(false)
      }

      return Promise.resolve(response)
    } catch (error) {
      console.error('获取面试官资料失败:', error)
      setProfileStatus(false)
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

  return {
    token,
    userInfo,
    interviewerInfo,
    profileCompleted,
    isLoggedIn,
    userRole,
    isJobSeeker,
    isInterviewer,
    interviewerId,
    companyId,
    avatarUrl,
    setToken,
    setUserInfo,
    setInterviewerInfo,
    setJobSeekerInfo,
    clearToken,
    clearUserInfo,
    userLogin,
    getInfo,
    checkUserProfile,
    fetchInterviewerProfile,
    logout
  }
})
