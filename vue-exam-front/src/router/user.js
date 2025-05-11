// 用户相关路由
export default [
  {
    path: 'favorites',
    name: 'Favorites',
    component: () => import('../views/User/Favorites.vue')
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
  }
]
