// 面试官/HR相关路由
import PrivateExams from '@/views/Interviewer/PrivateExams.vue'

export default [
  {
    path: 'interviewer/profile-setup',
    name: 'InterviewerProfileSetup',
    component: () => import('../views/Interviewer/ProfileSetup.vue')
  },
  {
    path: 'interviewer/jobs',
    name: 'InterviewerJobs',
    component: () => import('../views/Interviewer/Jobs/index.vue')
  },
  {
    path: 'job-management',
    name: 'JobManagement',
    component: () => import('../views/Interviewer/Jobs/index.vue'),
    meta: {
      title: '岗位管理',
      requireAuth: true,
      roles: ['INTERVIEWER']
    }
  },
  {
    path: 'candidate',
    name: 'CandidateManagement',
    component: () => import('../views/Interviewer/Candidates/index.vue'),
    meta: {
      title: '候选人管理',
      requireAuth: true,
      roles: ['INTERVIEWER']
    }
  },
  {
    path: 'interview',
    name: 'InterviewSchedule',
    component: () => import('../views/Interviewer/InterviewSchedule/index.vue'),
    meta: {
      title: '面试管理',
      requireAuth: true,
      roles: ['INTERVIEWER']
    }
  },
  {
    path: 'exam-management',
    name: 'ExamManagement',
    component: () => import('../views/Interviewer/ExamManagement/index.vue'),
    meta: {
      title: '考试管理',
      requireAuth: true,
      roles: ['INTERVIEWER']
    }
  },
  {
    path: 'private-exams',
    component: PrivateExams,
    name: 'PrivateExams',
    meta: {
      title: '专属试卷管理',
      requireAuth: true,
      roles: ['INTERVIEWER'] // 只允许面试官/HR访问
    }
  }
]
