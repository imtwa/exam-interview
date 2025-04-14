import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'

// 样式
import 'element-plus/theme-chalk/dark/css-vars.css'
import './assets/css/reset.less'
import './assets/css/common.less'
import './assets/icon/iconfont.css'
import './style.css'

const app = createApp(App)

// 使用 Pinia
app.use(createPinia())
app.use(ElementPlus)
app.use(router)

app.mount('#app')
