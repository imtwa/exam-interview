import { createWebHashHistory, createRouter } from 'vue-router'
import layoutRoutes, { homeRoute } from './layout'
import authRoutes from './auth'
import userRoutes from './user'
import jobSeekerRoutes from './jobSeeker'
import interviewerRoutes from './interviewer'
import examRoutes from './exam'
import recruitmentRoutes from './recruitment'
import onlineInterviewRoutes from './onlineInterview'

// 获取主布局路由
const mainLayoutRoute = layoutRoutes[0]

// 将所有子路由添加到主布局
mainLayoutRoute.children = [
  homeRoute,
  ...authRoutes,
  ...userRoutes,
  ...jobSeekerRoutes,
  ...interviewerRoutes,
  ...examRoutes,
  ...recruitmentRoutes,
  ...onlineInterviewRoutes.navbarChildren
]

// 合并所有路由
const routes = [mainLayoutRoute, ...onlineInterviewRoutes.standaloneRoutes]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
