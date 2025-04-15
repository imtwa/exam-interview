import { createWebHashHistory, createRouter } from 'vue-router'
import Navbar from '../views/Layouts/Navbar/index.vue'
import Home from '../views/Home/index.vue'

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
        path: 'practice-exam/:id',
        name: 'PracticeExam',
        component: () => import('../views/Exam/PracticeExam.vue')
      },
      {
        path: 'recruitment',
        name: 'Recruitment',
        component: () => import('../views/Recruitment/index.vue')
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
      }
      // {
      //     path: 'profile',
      //     name: 'Profile',
      //     component: () => import('../views/User/Profile.vue')
      // },
      // {
      //     path: 'my-exams',
      //     name: 'MyExams',
      //     component: () => import('../views/User/MyExams.vue')
      // }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
