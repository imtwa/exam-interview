// 认证相关路由
export default [
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
  }
]
