// 招聘相关路由
export default [
  {
    path: 'recruitment',
    name: 'Recruitment',
    component: () => import('@/views/Recruitment/index.vue')
  },
  {
    path: 'job/:id',
    name: 'RecruitmentJobDetail',
    component: () => import('@/views/Recruitment/JobDetail.vue')
  },
  {
    path: 'company/:id',
    name: 'CompanyDetail',
    component: () => import('@/views/Recruitment/CompanyDetail.vue')
  }
]
