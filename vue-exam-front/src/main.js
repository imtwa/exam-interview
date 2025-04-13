import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'

// 样式
import 'element-plus/theme-chalk/dark/css-vars.css'
import './assets/css/reset.less'
import './assets/css/common.less'
import './assets/icon/iconfont.css'
import './style.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
