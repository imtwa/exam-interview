/**
 * 静态路由配置
 * 这个文件包含了所有菜单和路由的定义，以便直接引入组件而不使用动态路由
 */
import type { MenuListType } from '@/types/menu'
import Home from '@views/index/index.vue'

/**
 * 导出静态路由配置
 * 这些路由将直接注册到路由器中
 */
export const asyncRoutes: MenuListType[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Home,
    meta: { title: '首页', icon: '&#xe63e;' },
    children: [
      {
        path: '/dashboard/console',
        name: 'Console',
        component: () => import('@/views/dashboard/console/index.vue'),
        meta: { title: '控制台', keepAlive: false, icon: '&#xe6a1;' }
      }
    ]
  },
  {
    path: '/exam-system',
    name: 'ExamSystem',
    component: Home,
    meta: { title: '考试系统', icon: '&#xe699;', isHideTab: false },
    children: [
      {
        path: '/exam-system/category',
        name: 'CategoryList',
        component: () => import('@/views/category/CategoryList.vue'),
        meta: { title: '分类管理', keepAlive: true, icon: '&#xe664;' }
      },
      {
        path: '/exam-system/subcategory',
        name: 'SubCategoryList',
        component: () => import('@/views/category/SubCategoryList.vue'),
        meta: { title: '子分类管理', keepAlive: true, icon: '&#xe664;', hideInMenu: true }
      },
      {
        path: '/exam-system/question',
        name: 'QuestionList',
        component: () => import('@/views/question/QuestionList.vue'),
        meta: { title: '题目管理', keepAlive: true, icon: '&#xe67a;' }
      },
      {
        path: '/exam-system/exam-paper',
        name: 'ExamPaperList',
        component: () => import('@/views/exam-paper/ExamPaperList.vue'),
        meta: { title: '试卷管理', keepAlive: true, icon: '&#xe636;' }
      },
      {
        path: '/exam-system/exam-paper/questions/:id',
        name: 'ExamPaperQuestions',
        component: () => import('@/views/exam-paper/ExamPaperQuestions.vue'),
        meta: { title: '试卷题目管理', keepAlive: false, hideInMenu: true, icon: '&#xe672;' }
      }
    ]
  },
  {
    path: '/recruitment',
    name: 'RecruitmentSystem',
    component: Home,
    meta: { title: '招聘系统', icon: '&#xe66a;', isHideTab: false },
    children: [
      {
        path: '/recruitment/companies',
        name: 'CompanyList',
        component: () => import('@/views/recruitment/CompanyList.vue'),
        meta: { title: '公司管理', keepAlive: true, icon: '&#xe653;' }
      },
      {
        path: '/recruitment/jobs',
        name: 'JobList',
        component: () => import('@/views/recruitment/JobList.vue'),
        meta: { title: '职位管理', keepAlive: true, icon: '&#xe654;' }
      },
      {
        path: '/recruitment/applications',
        name: 'ApplicationList',
        component: () => import('@/views/recruitment/ApplicationList.vue'),
        meta: { title: '求职申请', keepAlive: true, icon: '&#xe668;' }
      },
      {
        path: '/recruitment/interviews',
        name: 'InterviewList',
        component: () => import('@/views/recruitment/InterviewList.vue'),
        meta: { title: '面试管理', keepAlive: true, icon: '&#xe640;' }
      },
      {
        path: '/recruitment/interviewers',
        name: 'InterviewerList',
        component: () => import('@/views/recruitment/InterviewerList.vue'),
        meta: { title: '面试官管理', keepAlive: true, icon: '&#xe638;' }
      },
      {
        path: '/recruitment/industry',
        name: 'IndustryList',
        component: () => import('@/views/industry/IndustryList.vue'),
        meta: { title: '行业分类', keepAlive: true, icon: '&#xe64e;' }
      }
    ]
  },
  {
    path: '/user',
    name: 'User',
    component: Home,
    meta: { title: '用户管理', icon: '&#xe62c;', isHideTab: false },
    children: [
      {
        path: '/user/front-users',
        name: 'FrontUserList',
        component: () => import('@/views/user/FrontUserList.vue'),
        meta: { title: '前台用户', keepAlive: true, icon: '&#xe65f;' }
      },
      {
        path: '/user/job-seekers',
        name: 'JobSeekerList',
        component: () => import('@/views/user/JobSeekerList.vue'),
        meta: { title: '求职者管理', keepAlive: true, icon: '&#xe671;' }
      }
    ]
  }
]
