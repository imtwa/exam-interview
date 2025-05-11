// 布局和公共路由
import Navbar from '../views/Layouts/Navbar/index.vue'
import Home from '../views/Home/index.vue'

export default [
  {
    path: '/',
    component: Navbar,
    children: [] // 子路由将在主index.js中添加
  }
]

export const homeRoute = {
  path: '',
  name: 'Home',
  component: Home
}
