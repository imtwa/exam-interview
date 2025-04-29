/**
 * Nest.js模块与Vue路由映射配置
 * 根据后端Nest.js模块结构设计前端路由
 */
import type { AppRouteRecordRaw } from '../index'
import Home from '@views/index/index.vue'

/**
 * 招聘系统路由配置
 * 对应Nest.js的company, job, interview, interviewer等模块
 */
export const recruitmentRoutes: AppRouteRecordRaw = {
  path: '/recruitment',
  component: Home,
  name: 'RecruitmentSystem',
  meta: { title: '招聘系统', isHideTab: false },
  children: [
    // 公司管理 - 对应Nest.js的company模块
    {
      path: 'companies',
      name: 'CompanyList',
      component: () => import('@/views/recruitment/CompanyList.vue'),
      meta: { title: '公司管理', keepAlive: true }
    },
    // 职位管理 - 对应Nest.js的job模块
    {
      path: 'jobs',
      name: 'JobList',
      component: () => import('@/views/recruitment/JobList.vue'),
      meta: { title: '职位管理', keepAlive: true }
    },
    // 求职申请 - 对应Nest.js的job模块中的application相关API
    {
      path: 'applications',
      name: 'ApplicationList',
      component: () => import('@/views/recruitment/ApplicationList.vue'),
      meta: { title: '求职申请', keepAlive: true }
    },
    // 面试管理 - 对应Nest.js的interview模块
    {
      path: 'interviews',
      name: 'InterviewList',
      component: () => import('@/views/recruitment/InterviewList.vue'),
      meta: { title: '面试管理', keepAlive: true }
    },
    // 面试官管理 - 对应Nest.js的interviewer模块
    {
      path: 'interviewers',
      name: 'InterviewerManagement',
      component: () => import('@/views/recruitment/InterviewerManagement.vue'),
      meta: { title: '面试官管理', keepAlive: true }
    },
    // 面试官详情 - 对应Nest.js的interviewer模块的详情API
    {
      path: 'interviewer/:id',
      name: 'InterviewerDetail',
      component: () => import('@/views/recruitment/InterviewerDetail.vue'),
      meta: { title: '面试官详情', keepAlive: false, hideInMenu: true }
    }
  ]
}

/**
 * 用户管理路由配置
 * 对应Nest.js的user, jobseeker等模块
 */
export const userRoutes: AppRouteRecordRaw = {
  path: '/user',
  component: Home,
  name: 'User',
  meta: { title: '用户管理', isHideTab: false },
  children: [
    // 前台用户 - 对应Nest.js的user模块
    {
      path: 'front-users',
      name: 'FrontUserList',
      component: () => import('@/views/user/FrontUserList.vue'),
      meta: { title: '前台用户', keepAlive: true }
    },
    // 求职者管理 - 对应Nest.js的jobseeker模块
    {
      path: 'job-seekers',
      name: 'JobSeekerList',
      component: () => import('@/views/user/JobSeekerList.vue'),
      meta: { title: '求职者管理', keepAlive: true }
    },
    // 求职者管理（新） - 对应Nest.js的jobseeker模块
    {
      path: 'job-seekers-new',
      name: 'JobSeekerListNew',
      component: () => import('@/views/recruitment/JobSeekerList.vue'),
      meta: { title: '求职者管理（新）', keepAlive: true }
    },
    // 求职者详情 - 对应Nest.js的jobseeker模块的详情API
    {
      path: 'job-seeker-detail/:id',
      name: 'JobSeekerDetail',
      component: () => import('@/views/user/JobSeekerDetail.vue'),
      meta: { title: '求职者详情', keepAlive: false, hideInMenu: true }
    }
  ]
}

/**
 * 考试系统路由配置
 * 对应Nest.js的exam, category等模块
 */
export const examRoutes: AppRouteRecordRaw = {
  path: '/exam-system',
  component: Home,
  name: 'ExamSystem',
  meta: { title: '考试系统', isHideTab: false },
  children: [
    // 分类管理 - 对应Nest.js的category模块
    {
      path: 'category',
      name: 'CategoryList',
      component: () => import('@/views/category/CategoryList.vue'),
      meta: { title: '分类管理', keepAlive: true }
    },
    // 子分类管理 - 对应Nest.js的category模块的子分类API
    {
      path: 'subcategory',
      name: 'SubCategoryList',
      component: () => import('@/views/category/SubCategoryList.vue'),
      meta: { title: '子分类管理', keepAlive: true }
    },
    // 分类管理（组合视图）- 将分类和子分类放在一起展示
    {
      path: 'category-management',
      name: 'CategoryManagement',
      component: () => import('@/views/category/CategoryManagement.vue'),
      meta: { title: '分类管理（新）', keepAlive: true }
    },
    // 题目管理 - 对应Nest.js的exam模块的question相关API
    {
      path: 'question',
      name: 'QuestionList',
      component: () => import('@/views/question/QuestionList.vue'),
      meta: { title: '题目管理', keepAlive: true }
    },
    // 试卷管理 - 对应Nest.js的exam模块的paper相关API
    {
      path: 'exam-paper',
      name: 'ExamPaperList',
      component: () => import('@/views/exam-paper/ExamPaperList.vue'),
      meta: { title: '试卷管理', keepAlive: true }
    },
    // 试卷题目管理 - 对应Nest.js的exam模块的paper-question相关API
    {
      path: 'exam-paper/questions/:id',
      name: 'ExamPaperQuestions',
      component: () => import('@/views/exam-paper/ExamPaperQuestions.vue'),
      meta: { title: '试卷题目管理', keepAlive: false, hideInMenu: true }
    }
  ]
}

/**
 * 行业管理路由配置
 * 对应Nest.js的industry模块
 */
export const industryRoutes: AppRouteRecordRaw = {
  path: '/industry',
  component: Home,
  name: 'Industry',
  meta: { title: '行业管理', isHideTab: false },
  children: [
    // 行业分类管理 - 对应Nest.js的industry模块
    {
      path: 'list',
      name: 'IndustryList',
      component: () => import('@/views/industry/IndustryList.vue'),
      meta: { title: '行业分类', keepAlive: true }
    },
    // 行业树形管理 - 对应Nest.js的industry模块的树形结构
    {
      path: 'tree',
      name: 'IndustryTree',
      component: () => import('@/views/industry/IndustryTree.vue'),
      meta: { title: '行业树形管理', keepAlive: true }
    }
  ]
}

/**
 * 获取所有基于Nest.js模块的路由配置
 */
export const getNestModuleRoutes = (): AppRouteRecordRaw[] => {
  return [recruitmentRoutes, userRoutes, examRoutes, industryRoutes]
}
