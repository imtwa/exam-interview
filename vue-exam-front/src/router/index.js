import { createWebHashHistory, createRouter } from 'vue-router'
import Navbar from '../views/Layouts/Navbar/index.vue'
import Home from '../views/Home/index.vue'
import PrivateExams from '@/views/Interviewer/PrivateExams.vue'

const routes = [
  {
    path: '/',
    component: Navbar,
    children: [
      {
        path: '',
        name: 'Home',
        component: Home
      },
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
        path: 'job/:id',
        name: 'RecruitmentJobDetail',
        component: () => import('@/views/Recruitment/JobDetail.vue')
      },
      {
        path: 'company/:id',
        name: 'CompanyDetail',
        component: () => import('@/views/Recruitment/CompanyDetail.vue')
      },
      {
        path: 'practice-exam/:id',
        name: 'PracticeExam',
        component: () => import('../views/Exam/PracticeExam.vue')
      },
      {
        path: 'recruitment',
        name: 'Recruitment',
        component: () => import('@/views/Recruitment/index.vue')
      },
      // {
      //     path: 'online-exam',
      //     name: 'OnlineExam',
      //     component: () => import('../views/OnlineExam/index.vue')
      // },
      {
        path: 'login',
        name: 'Login',
        component: () => import('../views/Auth/Login.vue')
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('../views/Auth/Register.vue')
      },
      {
        path: 'forgot-password',
        name: 'ForgotPassword',
        component: () => import('../views/Auth/ForgotPassword.vue')
      },
      {
        path: 'favorites',
        name: 'Favorites',
        component: () => import('../views/User/Favorites.vue')
      },
      // 用户相关路由
      {
        path: 'applications',
        name: 'Applications',
        component: () => import('../views/User/Applications.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/User/Profile.vue')
      },
      {
        path: 'profile/:id',
        name: 'ProfileWithId',
        component: () => import('../views/User/Profile.vue')
      },
      // HR相关路由
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
      // 求职者相关路由
      {
        path: 'job-seeker/profile-setup',
        name: 'JobSeekerProfileSetup',
        component: () => import('../views/JobSeeker/ProfileSetup.vue')
      },
      // 面试官相关路由
      {
        path: '/job-management',
        name: 'JobManagement',
        component: () => import('../views/Interviewer/Jobs/index.vue'),
        meta: {
          title: '岗位管理',
          requireAuth: true,
          roles: ['INTERVIEWER']
        }
      },
      {
        path: '/candidate-management',
        name: 'CandidateManagement',
        component: () => import('../views/Interviewer/Candidates/index.vue'),
        meta: {
          title: '候选人管理',
          requireAuth: true,
          roles: ['INTERVIEWER']
        }
      },
      {
        path: '/interview-schedule',
        name: 'InterviewSchedule',
        component: () => import('../views/Interviewer/InterviewSchedule/index.vue'),
        meta: {
          title: '面试安排',
          requireAuth: true,
          roles: ['INTERVIEWER']
        }
      },
      {
        path: '/exam-management',
        name: 'ExamManagement',
        component: () => import('../views/Interviewer/ExamManagement/index.vue'),
        meta: {
          title: '考试管理',
          requireAuth: true,
          roles: ['INTERVIEWER']
        }
      },
      {
        path: '/private-exams',
        component: PrivateExams,
        name: 'PrivateExams',
        meta: {
          title: '专属试卷管理',
          requireAuth: true,
          roles: ['INTERVIEWER'] // 只允许面试官/HR访问
        }
      },
      // 在线考试路由
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
        path: 'online-exam/user-exams',
        name: 'UserExams',
        component: () => import('@/views/OnlineExam/UserExams.vue'),
        meta: { title: '我的笔试', requireAuth: true }
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
      },

      // 在线面试路由
      {
        path: 'online-interview',
        name: 'OnlineInterview',
        component: () => import('@/views/OnlineInterview/index.vue'),
        meta: { title: '在线面试' }
      },
      {
        path: 'online-interview/invitation',
        name: 'InterviewInvitation',
        component: () => import('@/views/OnlineInterview/Invitation.vue'),
        meta: { title: '面试邀请码' }
      },
      {
        path: 'online-interview/session/:id',
        name: 'InterviewSession',
        component: () => import('@/views/OnlineInterview/InterviewSession.vue'),
        meta: { title: '在线面试', keepAlive: true }
      },
      {
        path: 'online-interview/feedback/:id',
        name: 'InterviewFeedback',
        component: () => import('@/views/OnlineInterview/InterviewFeedback.vue'),
        meta: { title: '面试反馈' }
      }
    ]
  }
]

// 在线考试路由
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
