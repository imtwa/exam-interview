/**
 * 权限控制
 *
 * 此文件为Vue Router设置导航守卫，用于保护需要身份验证的路由。
 * 在访问受保护路由前，会检查用户是否在localStorage中存有有效的token。
 *
 * 主要功能：
 * - publicRoutes数组中的路由可以无需身份验证即可访问
 * - 所有其他路由都需要有效的token才能访问
 * - 未持有token的用户尝试访问受保护路由时会被重定向到登录页面
 * - 当需要身份验证时会显示警告信息
 */

import router from './index'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

// 从localStorage获取token
const getToken = () => {
  return localStorage.getItem('exam_token')
}

// 定义无需身份验证即可访问的公共路由
const publicRoutes = ['Login', 'Register', 'ForgotPassword', 'Home']

// 导航守卫
router.beforeEach((to, from, next) => {
  const hasToken = getToken()

  // 检查路由是否需要身份验证
  const requiresAuth = !publicRoutes.includes(to.name)

  if (requiresAuth && !hasToken) {
    ElMessage({
      message: '请先登录后再访问此页面',
      type: 'warning'
    })
    next({ name: 'Login' })
  } else {
    // 对于需要特定角色的路由进行额外检查
    if (to.name === 'HRProfileSetup' || to.name === 'JobSeekerProfileSetup') {
      const userStore = useUserStore()

      // 检查用户角色
      if (to.name === 'HRProfileSetup' && !userStore.isInterviewer) {
        ElMessage({
          message: '此页面仅供HR访问',
          type: 'warning'
        })
        next({ name: 'Home' })
        return
      }

      if (to.name === 'JobSeekerProfileSetup' && !userStore.isJobSeeker) {
        ElMessage({
          message: '此页面仅供求职者访问',
          type: 'warning'
        })
        next({ name: 'Home' })
        return
      }
    }

    next()
  }
})

export default router
