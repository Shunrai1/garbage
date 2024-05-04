import { createApp } from 'vue'
import mitt from 'mitt'
import App from '@/App.vue'
// 引入element-plus插件
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 国际化
//@ts-expect-error忽略当前文件ts类型的检测否则有红色提示(打包会失败)
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
//全局引用element-plus/icon
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
//引入svg
import 'virtual:svg-icons-register'
//引入路由
import router from './router'
//引入仓库
import pinia from './store'
import './permission'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { isHasButton } from './directive/has'

// 获取应用实例对象
const app = createApp(App)

const bus = mitt()
app.config.globalProperties.$bus = bus //相当于Vue2中的:Vue.prototype.$bus = bus
app.use(router)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(ElementPlus, {
  locale: zhCn,
})
app.use(ElementPlus)
app.use(pinia)
//引入自定义插件对象：注册整个项目全局组件
import globalComponent from '@/components'
//安装自定义插件
app.use(globalComponent)
//引入模板的全局样式
import '@/styles/index.scss'
app.mount('#app')
isHasButton(app)
