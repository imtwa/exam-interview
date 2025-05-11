// 求职者相关路由
export default [
  {
    path: 'job-seeker/profile-setup',
    name: 'JobSeekerProfileSetup',
    component: () => import('../views/JobSeeker/ProfileSetup.vue')
  },
  {
    path: 'job-seeker/user-interview',
    name: 'UserInterview',
    component: () => import('../views/JobSeeker/UserInterview.vue')
  },
  {
    path: 'job-seeker/resume',
    name: 'UserResume',
    component: () => import('../views/JobSeeker/UserResume.vue'),
    meta: {
      title: '我的简历',
      requireAuth: true,
      roles: ['JOB_SEEKER']
    }
  },
  {
    path: 'applications',
    name: 'Applications',
    component: () => import('../views/JobSeeker/Applications.vue')
  },
  {
    path: 'job-seeker/user-exams',
    name: 'UserExams',
    component: () => import('@/views/JobSeeker/UserExams.vue'),
    meta: { title: '我的笔试', requireAuth: true }
  }
]
