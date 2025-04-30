import { RoutesAlias } from './routesAlias'
import { MenuListType } from '@/types/menu'

/**
 * 菜单列表、异步路由
 *
 * 支持两种模式:
 * 1. 前端静态配置 - 直接使用本文件中定义的路由配置
 * 2. 后端动态配置 - 后端返回菜单数据，前端解析生成路由
 *
 * 菜单标题（title）:
 * 可以是 i18n 的 key，也可以是字符串，比如：'用户列表'
 */
export const asyncRoutes: MenuListType[] = [
  {
    id: 1,
    name: 'Dashboard',
    path: '/dashboard',
    component: RoutesAlias.Home,
    meta: {
      title: '首页',
      icon: '&#xe721;',
      keepAlive: false
    },
    children: [
      {
        id: 101,
        path: 'console',
        name: 'Console',
        component: RoutesAlias.Dashboard,
        meta: {
          title: '控制台',
          keepAlive: true
        }
      }
    ]
  },
  {
    id: 2,
    name: 'ExamSystem',
    path: '/exam-system',
    component: RoutesAlias.Home,
    meta: {
      title: '考试系统',
      icon: '&#xe723;',
      keepAlive: false
    },
    children: [
      {
        id: 201,
        path: 'category',
        name: 'CategoryList',
        component: '/category/CategoryList',
        meta: {
          title: '分类管理',
          keepAlive: true
        }
      },
      {
        id: 202,
        path: 'subcategory',
        name: 'SubCategoryList',
        component: '/category/SubCategoryList',
        meta: {
          title: '子分类管理',
          keepAlive: true
        }
      },
      {
        id: 203,
        path: 'question',
        name: 'QuestionList',
        component: '/question/QuestionList',
        meta: {
          title: '题目管理',
          keepAlive: true
        }
      },
      {
        id: 204,
        path: 'exam-paper',
        name: 'ExamPaperList',
        component: '/exam-paper/ExamPaperList',
        meta: {
          title: '试卷管理',
          keepAlive: true
        }
      }
    ]
  },
  {
    id: 3,
    name: 'User',
    path: '/user',
    component: RoutesAlias.Home,
    meta: {
      title: '用户管理',
      icon: '&#xe6b8;',
      keepAlive: false
    },
    children: [
      {
        id: 301,
        path: 'front-users',
        name: 'FrontUserList',
        component: '/user/FrontUserList',
        meta: {
          title: '前台用户',
          keepAlive: true
        }
      },
      {
        id: 302,
        path: 'job-seekers',
        name: 'JobSeekerList',
        component: '/user/JobSeekerList',
        meta: {
          title: '求职者管理',
          keepAlive: true
        }
      }
    ]
  },
  {
    id: 4,
    name: 'RecruitmentSystem',
    path: '/recruitment',
    component: RoutesAlias.Home,
    meta: {
      title: '招聘系统',
      icon: '&#xe6b7;',
      keepAlive: false
    },
    children: [
      {
        id: 401,
        path: 'companies',
        name: 'CompanyList',
        component: '/recruitment/CompanyList',
        meta: {
          title: '公司管理',
          keepAlive: true
        }
      },
      {
        id: 402,
        path: 'jobs',
        name: 'JobList',
        component: '/recruitment/JobList',
        meta: {
          title: '职位管理',
          keepAlive: true
        }
      },
      {
        id: 403,
        path: 'interviewers',
        name: 'InterviewerList',
        component: '/recruitment/InterviewerList',
        meta: {
          title: '面试官管理',
          keepAlive: true
        }
      },
      {
        id: 404,
        path: 'applications',
        name: 'ApplicationList',
        component: '/recruitment/ApplicationList',
        meta: {
          title: '应聘管理',
          keepAlive: true
        }
      },
      {
        id: 405,
        path: 'interviews',
        name: 'InterviewList',
        component: '/recruitment/InterviewList',
        meta: {
          title: '面试管理',
          keepAlive: true
        }
      }
    ]
  },
  {
    id: 5,
    name: 'Industry',
    path: '/industry',
    component: RoutesAlias.Home,
    meta: {
      title: '行业管理',
      icon: '&#xe6b5;',
      keepAlive: false
    },
    children: [
      {
        id: 501,
        path: 'list',
        name: 'IndustryList',
        component: '/industry/IndustryList',
        meta: {
          title: '行业分类',
          keepAlive: true
        }
      }
    ]
  }
]
