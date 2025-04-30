/**
 * 动态路由处理
 * 根据接口返回的菜单列表注册动态路由
 */
import type { MenuListType } from '@/types/menu'
import type { AppRouteRecordRaw } from '../index'
import Home from '@views/index/index.vue'
import { formatMenuTitle } from '@/utils/menu'
import { router } from '@/router'

// 路由映射集合
type RouteMap = Record<string, AppRouteRecordRaw>

/** 用于存储中后台路由模块的动态路由配置 */
let routeMap: RouteMap = {}

/** 默认使用动态路由载入 */
const USE_DYNAMIC_ROUTES = true

/**
 * 获取路由映射对象
 * 在路由配置中使用 key 作为映射的 key，route 作为路由配置
 */
const getRouteMap = (): RouteMap => {
  // 如果已加载，直接返回
  if (Object.keys(routeMap).length) {
    return routeMap
  }

  // 考试系统路由
  const examSystem: AppRouteRecordRaw = {
    path: '/exam-system',
    component: Home,
    name: 'ExamSystem',
    meta: { title: '考试系统', isHideTab: false },
    children: [
      {
        path: 'category',
        name: 'CategoryList',
        component: () => import('@/views/category/CategoryList.vue'),
        meta: { title: '分类管理', keepAlive: true }
      },
      {
        path: 'subcategory',
        name: 'SubCategoryList',
        component: () => import('@/views/category/SubCategoryList.vue'),
        meta: { title: '子分类管理', keepAlive: true }
      },
      {
        path: 'question',
        name: 'QuestionList',
        component: () => import('@/views/question/QuestionList.vue'),
        meta: { title: '题目管理', keepAlive: true }
      },
      {
        path: 'exam-paper',
        name: 'ExamPaperList',
        component: () => import('@/views/exam-paper/ExamPaperList.vue'),
        meta: { title: '试卷管理', keepAlive: true }
      },
      {
        path: 'exam-paper/questions/:id',
        name: 'ExamPaperQuestions',
        component: () => import('@/views/exam-paper/ExamPaperQuestions.vue'),
        meta: { title: '试卷题目管理', keepAlive: false, hideInMenu: true }
      }
    ]
  }

  // 招聘系统路由
  const recruitmentSystem: AppRouteRecordRaw = {
    path: '/recruitment',
    component: Home,
    name: 'RecruitmentSystem',
    meta: { title: '招聘系统', isHideTab: false },
    children: [
      {
        path: 'companies',
        name: 'CompanyList',
        component: () => import('@/views/recruitment/CompanyList.vue'),
        meta: { title: '公司管理', keepAlive: true }
      },
      {
        path: 'jobs',
        name: 'JobList',
        component: () => import('@/views/recruitment/JobList.vue'),
        meta: { title: '职位管理', keepAlive: true }
      },
      {
        path: 'applications',
        name: 'ApplicationList',
        component: () => import('@/views/recruitment/ApplicationList.vue'),
        meta: { title: '求职申请', keepAlive: true }
      },
      {
        path: 'interviews',
        name: 'InterviewList',
        component: () => import('@/views/recruitment/InterviewList.vue'),
        meta: { title: '面试管理', keepAlive: true }
      },
      {
        path: 'interviewers',
        name: 'InterviewerList',
        component: () => import('@/views/recruitment/InterviewerList.vue'),
        meta: { title: '面试官管理', keepAlive: true }
      }
    ]
  }

  // 用户管理系统
  const userSystem: AppRouteRecordRaw = {
    path: '/user',
    component: Home,
    name: 'User',
    meta: { title: '用户管理', isHideTab: false },
    children: [
      {
        path: 'front-users',
        name: 'FrontUserList',
        component: () => import('@/views/user/FrontUserList.vue'),
        meta: { title: '前台用户', keepAlive: true }
      },
      {
        path: 'job-seekers',
        name: 'JobSeekerList',
        component: () => import('@/views/user/JobSeekerList.vue'),
        meta: { title: '求职者管理', keepAlive: true }
      }
    ]
  }

  // 行业管理系统
  const industrySystem: AppRouteRecordRaw = {
    path: '/industry',
    component: Home,
    name: 'Industry',
    meta: { title: '行业管理', isHideTab: false },
    children: [
      {
        path: 'list',
        name: 'IndustryList',
        component: () => import('@/views/industry/IndustryList.vue'),
        meta: { title: '行业分类', keepAlive: true }
      }
    ]
  }

  // 注册所有路由模块
  routeMap = {
    examSystem,
    recruitmentSystem,
    userSystem,
    industrySystem
  }

  return routeMap
}

/**
 * 递归构建路由配置
 * @param menuList - 菜单列表
 * @returns 路由配置数组
 */
const buildRoutesByMenu = (menuList: MenuListType[]): AppRouteRecordRaw[] => {
  // 处理空数组的情况
  if (!Array.isArray(menuList) || menuList.length === 0) {
    return []
  }

  const routes: AppRouteRecordRaw[] = []
  const routeMap = getRouteMap()

  const recursiveBuildRoutes = (menuItems: MenuListType[], currentRoutes: AppRouteRecordRaw[]) => {
    // 确保menuItems是数组
    if (!Array.isArray(menuItems)) {
      return
    }

    menuItems.forEach((menu) => {
      // 确保menu对象存在且有meta属性
      if (!menu || !menu.meta) {
        return
      }

      const { path, name, children, meta } = menu
      const title = meta.title || ''
      const hidden = meta.isHide || false

      console.log('Processing menu item:', path, name)

      // 直接检查"/exam-system"这样的完整路径
      if (path === '/exam-system') {
        console.log('Found exam-system path, using examSystem route')
        const route = { ...routeMap.examSystem }
        // 设置路由标题和隐藏状态
        route.meta = { ...route.meta, title: formatMenuTitle(title) }
        if (hidden) {
          route.hidden = hidden
        }
        currentRoutes.push(route)
      }
      // 检查招聘系统路径
      else if (path === '/recruitment') {
        console.log('Found recruitment path, using recruitmentSystem route')
        const route = { ...routeMap.recruitmentSystem }
        // 设置路由标题和隐藏状态
        route.meta = { ...route.meta, title: formatMenuTitle(title) }
        if (hidden) {
          route.hidden = hidden
        }
        currentRoutes.push(route)
      }
      // 检查用户管理路径
      else if (path === '/user') {
        console.log('Found user path, using userSystem route')
        const route = { ...routeMap.userSystem }
        // 设置路由标题和隐藏状态
        route.meta = { ...route.meta, title: formatMenuTitle(title) }
        if (hidden) {
          route.hidden = hidden
        }
        currentRoutes.push(route)
      }
      // 检查行业管理路径
      else if (path === '/industry') {
        console.log('Found industry path, using industrySystem route')
        const route = { ...routeMap.industrySystem }
        // 设置路由标题和隐藏状态
        route.meta = { ...route.meta, title: formatMenuTitle(title) }
        if (hidden) {
          route.hidden = hidden
        }
        currentRoutes.push(route)
      }
      // 处理仪表盘路径
      else if (path === '/dashboard') {
        console.log('Processing dashboard path')
        // 创建新的路由配置
        const route: AppRouteRecordRaw = {
          path: '/dashboard',
          component: Home,
          name: 'Dashboard',
          meta: { title: formatMenuTitle(title), isHideTab: false },
          children: [
            {
              path: 'console',
              name: 'Console',
              component: () => import('@/views/dashboard/console/index.vue'),
              meta: { title: '控制台', keepAlive: true }
            }
          ]
        }
        if (hidden) {
          route.hidden = hidden
        }
        currentRoutes.push(route)
      }

      // 如果存在子菜单，递归处理
      if (children?.length) {
        // 检查lastRoute是否存在，避免undefined错误
        const lastRoute = currentRoutes[currentRoutes.length - 1]
        if (lastRoute) {
          lastRoute.children = lastRoute.children || []
          recursiveBuildRoutes(children, lastRoute.children)
        }
      }
    })
  }

  recursiveBuildRoutes(menuList, routes)
  console.log('Final routes:', routes)
  return routes
}

/**
 * 注册异步路由
 * @param menus - 菜单列表
 */
export const registerMenuRoutes = (menus: MenuListType[] = []): void => {
  // 根据配置决定是否使用动态路由
  if (USE_DYNAMIC_ROUTES) {
    // 动态路由模式：根据菜单构建路由
    const asyncRoutes = buildRoutesByMenu(menus)
    asyncRoutes.forEach((route) => {
      router.addRoute(route)
    })
  } else {
    // 静态路由模式：直接加载所有路由
    const routeMap = getRouteMap()
    Object.values(routeMap).forEach((route) => {
      router.addRoute(route)
    })
  }
}
