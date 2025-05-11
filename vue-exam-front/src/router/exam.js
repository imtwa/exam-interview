// 考试和题库相关路由
export default [
  {
    path: 'question-bank',
    name: 'QuestionBank',
    component: () => import('../views/Exam/index.vue')
  },
  {
    path: 'question-bank/upload',
    name: 'UploadExam',
    component: () => import('../views/Exam/UploadExam.vue')
  },
  {
    path: 'exam/:id',
    name: 'ExamDetail',
    component: () => import('../views/Exam/ExamDetail.vue')
  },
  {
    path: 'practice-exam/:id',
    name: 'PracticeExam',
    component: () => import('../views/Exam/PracticeExam.vue')
  },
  {
    path: 'online-exam',
    name: 'OnlineExam',
    component: () => import('@/views/OnlineExam/index.vue'),
    meta: { title: '在线笔试' }
  },
  {
    path: 'online-exam/invitation',
    name: 'ExamInvitation',
    component: () => import('@/views/OnlineExam/Invitation.vue'),
    meta: { title: '考试邀请码' }
  },
  {
    path: 'online-exam/session/:id',
    name: 'ExamSession',
    component: () => import('@/views/OnlineExam/ExamSession.vue'),
    meta: { title: '在线考试', keepAlive: true }
  },
  {
    path: 'online-exam/result/:id',
    name: 'ExamResult',
    component: () => import('@/views/OnlineExam/ExamResult.vue'),
    meta: { title: '考试结果' }
  }
]
