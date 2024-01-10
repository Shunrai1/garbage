//路由鉴权，某个路由什么条件下可以访问，什么条件下不可以访问
import router from '@/router'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import nprogress from 'nprogress'
//引入进度条css
import 'nprogress/nprogress.css'
nprogress.configure({ showSpinner: false })
import pinia from './store'
import useUserStore from './store/modules/user'
import setting from './setting'
const userStore = useUserStore(pinia)
//全局前置守卫
router.beforeEach(async (to: any, _from: any, next: any) => {
  document.title = setting.title + '-' + to.meta.title
  nprogress.start()
  //判断是否登录
  const token = userStore.token
  const username = userStore.username
  if (token) {
    //登录成功，指向首页
    if (to.path == '/login') {
      next({ path: '/' })
    } else {
      //有用户信息放行
      if (username) {
        next()
      } else {
        //如果没有用户信息，在守卫这里发请求获取到了用户信息再放行
        try {
          await userStore.userInfo()
          next({ ...to })
        } catch (error) {
          //token过期
          await userStore.userLogout()
          next({ path: '/login', query: { redirect: to.path } })
        }
      }
    }
  } else {
    if (to.path == '/login') {
      next()
    } else {
      next({ path: '/login', query: { redirect: to.path } })
    }
  }
})

//全局后置守卫
router.afterEach(() => {
  nprogress.done()
})

//第一个问题：任意路由切换实现进度条业务 ---nprogress
//第二个问题：路由组件访问权限的设置,用户未登录，不能访问其他路由（指向login）。登录成功后，不可以访问login(指向首页)
