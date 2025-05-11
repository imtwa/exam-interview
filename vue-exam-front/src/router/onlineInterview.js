// 在线面试相关路由
export const navbarChildren = [
  {
    path: 'online-interview',
    name: 'OnlineInterview',
    component: () => import('@/views/OnlineInterview/index.vue'),
    meta: { title: '在线面试' }
  },
  {
    path: 'online-interview/feedback/:id',
    name: 'InterviewFeedback',
    component: () => import('@/views/OnlineInterview/InterviewFeedback.vue'),
    meta: { title: '面试反馈' }
  }
]

export const standaloneRoutes = [
  {
    path: '/online-interview/session/:id',
    name: 'InterviewSession',
    component: () => import('@/views/OnlineInterview/InterviewSession.vue'),
    meta: { title: '在线面试', keepAlive: true }
  }
]

export default {
  navbarChildren,
  standaloneRoutes
}
