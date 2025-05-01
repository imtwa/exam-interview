import type { App } from 'vue'
import {
  createRouter,
  createWebHashHistory,
  RouteLocationNormalized,
  RouteRecordRaw,
  type RouteComponent
} from 'vue-router'
import { ref } from 'vue'
import Home from '@views/index/index.vue'
import AppConfig from '@/config'
import { useUserStore } from '@/store/modules/user'
// 使用静态菜单数据
import { asyncRoutes } from './modules/asyncRoutes'
import { useMenuStore } from '@/store/modules/menu'
import { useSettingStore } from '@/store/modules/setting'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useTheme } from '@/composables/useTheme'
import { RoutesAlias } from './modules/routesAlias'
import { setWorktab } from '@/utils/worktab'
import { formatMenuTitle } from '@/utils/menu'
import type { MenuListType } from '@/types/menu'

/** 顶部进度条配置 */
NProgress.configure({
  easing: 'ease',
  speed: 600,
  showSpinner: false,
  trickleSpeed: 200,
  parent: 'body'
})

/** 扩展的路由配置类型 */
export type AppRouteRecordRaw = RouteRecordRaw & {
  hidden?: boolean
}

/** 首页路径常量 */
export const HOME_PAGE = '/dashboard/console'

/** 静态路由配置 */
const staticRoutes: AppRouteRecordRaw[] = [
  { path: '/', redirect: HOME_PAGE },
  {
    path: '/dashboard',
    component: Home,
    name: 'Dashboard',
    meta: { title: '首页' },
    children: [
      {
        path: RoutesAlias.Dashboard,
        name: 'Console',
        component: () => import('@views/dashboard/console/index.vue'),
        meta: { title: '控制台', keepAlive: false }
      }
    ]
  },
  {
    path: RoutesAlias.Login,
    name: 'Login',
    component: () => import('@views/login/index.vue'),
    meta: { title: '登录', isHideTab: true, setTheme: true }
  },
  {
    path: '/exception',
    component: Home,
    name: 'Exception',
    meta: { title: '异常页面' },
    children: [
      {
        path: RoutesAlias.Exception403,
        name: 'Exception403',
        component: () => import('@/views/exception/403.vue'),
        meta: { title: '403' }
      },
      {
        path: '/:catchAll(.*)',
        name: 'Exception404',
        component: () => import('@views/exception/404.vue'),
        meta: { title: '404' }
      },
      {
        path: RoutesAlias.Exception500,
        name: 'Exception500',
        component: () => import('@views/exception/500.vue'),
        meta: { title: '500' }
      }
    ]
  }
]

// 将asyncRoutes中的路由配置添加到路由
const asyncRoutesConfig: AppRouteRecordRaw[] = []

// 将字符串组件转换为实际组件
const getComponent = (component: any): RouteComponent => {
  // 如果已经是函数或组件对象，直接返回
  if (typeof component === 'function' || typeof component === 'object') {
    return component
  }
  // 根据路径动态导入组件
  return Home
}

// 转换菜单到路由配置
asyncRoutes.forEach((route: MenuListType) => {
  // 跳过已存在于静态路由中的路由
  if (staticRoutes.some((sr) => sr.path === route.path)) {
    return
  }

  // 创建一级路由
  const mainRoute: AppRouteRecordRaw = {
    path: route.path,
    component: getComponent(route.component),
    name: route.name,
    meta: route.meta,
    children: []
  }

  // 添加子路由
  if (route.children && route.children.length > 0) {
    route.children.forEach((child: MenuListType) => {
      // 获取子路由路径的最后一部分作为相对路径
      const childPath = child.path.split('/').pop() || ''

      mainRoute.children?.push({
        path: childPath,
        component: getComponent(child.component),
        name: child.name,
        meta: child.meta
      })
    })
  }

  asyncRoutesConfig.push(mainRoute)
})

// 合并静态路由和动态路由
const allRoutes = [...staticRoutes, ...asyncRoutesConfig]

/** 创建路由实例 */
export const router = createRouter({
  history: createWebHashHistory(),
  routes: allRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 })
})

// 标记菜单是否已设置
const isMenuSet = ref(false)

/**
 * 路由全局前置守卫
 * 处理进度条、获取菜单列表、404 检查、工作标签页及页面标题设置
 */
router.beforeEach(async (to, from, next) => {
  const settingStore = useSettingStore()
  if (settingStore.showNprogress) NProgress.start()

  // 设置登录注册页面主题
  setSystemTheme(to)

  // 检查登录状态，如果未登录则跳转到登录页
  const userStore = useUserStore()
  if (!userStore.isLogin && to.path !== '/login' && !to.meta.noLogin) {
    userStore.logOut()
    return next('/login')
  }

  // 如果用户已登录且菜单未设置，则设置菜单
  if (!isMenuSet.value && userStore.isLogin) {
    try {
      // 设置菜单列表
      useMenuStore().setMenuList(asyncRoutes as any)
      isMenuSet.value = true
    } catch (error) {
      console.error('Failed to set menu:', error)
      return next('/exception/500')
    }
  }

  // 设置工作标签页和页面标题
  setWorktab(to)
  setPageTitle(to)

  next()
})

/* ============================
   路由守卫辅助函数
============================ */

/**
 * 根据路由元信息设置系统主题
 * @param to 当前路由对象
 */
const setSystemTheme = (to: RouteLocationNormalized): void => {
  if (to.meta.setTheme) {
    useTheme().switchThemeStyles(useSettingStore().systemThemeType)
  }
}

/**
 * 设置页面标题，根据路由元信息和系统信息拼接标题
 * @param to 当前路由对象
 */
export const setPageTitle = (to: RouteLocationNormalized): void => {
  const { title } = to.meta
  if (title) {
    setTimeout(() => {
      document.title = `${formatMenuTitle(String(title))} - ${AppConfig.systemInfo.name}`
    }, 150)
  }
}

/** 路由全局后置守卫 */
router.afterEach(() => {
  if (useSettingStore().showNprogress) NProgress.done()
})

/**
 * 初始化路由，将 Vue Router 实例挂载到 Vue 应用中
 * @param app Vue 应用实例
 */
export function initRouter(app: App<Element>): void {
  app.use(router)
}
