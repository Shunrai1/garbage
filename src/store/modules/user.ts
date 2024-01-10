//创建用户相关的小仓库 ,
import { defineStore } from 'pinia'
import { reqLogin, reqUserInfo, reqLogout } from '@/api/user'
import type {
  loginFormData,
  loginResponseData,
  userInfoResponseData,
} from '@/api/user/type'
import type { UserState } from './types/type'
import { SET_TOKEN, GET_TOKEN, REMOVE_TOKEN } from '@/utils/token'
//引入路由（常量路由)
import { constantRoute, asyncRoute, anyRoute } from '@/router/routes'
import router from '@/router'
// @ts-expect-error
import cloneDeep from 'lodash/cloneDeep'

function filterAsyncRoute(asyncRoute: any, routes: any) {
  return asyncRoute.filter((item: any) => {
    if (routes.includes(item.name)) {
      if (item.children && item.children.length > 0) {
        item.children = filterAsyncRoute(item.children, routes)
      }
      return true
    }
  })
}

//创建用户小仓库
const useUserStore = defineStore('User', {
  //小仓库存储数据地方
  state: (): UserState => {
    return {
      token: GET_TOKEN(), //用户唯一标识
      menuRoutes: constantRoute, //仓库存储生成菜单需要路由
      username: '',
      avatar: '',
      buttons: [],
    }
  },
  //异步|逻辑的地方 (相当于vuex的muttation，pinia没有actions)
  actions: {
    /**
     *  用户登录方法
     * @param data
     */
    async userLogin(data: loginFormData) {
      const result: loginResponseData = await reqLogin(data)
      if (result.code == 200) {
        //pinia存储一下token
        this.token = result.data!
        //本地存储持久化一份token
        SET_TOKEN(result.data)

        //保存async函数，返回一个成功的promise
        return 'ok'
      } else {
        return Promise.reject(new Error(result.data))
      }
    },

    /**
     * 获取用户信息方法
     */
    async userInfo() {
      //获取用户信息存储仓库中
      const result: userInfoResponseData = await reqUserInfo()
      if (result.code == 200) {
        this.username = result.data.name
        this.avatar = result.data.avatar
        this.buttons = result.data.buttons
        const userAsyncRoute: any = filterAsyncRoute(
          cloneDeep(asyncRoute),
          result.data.routes,
        )
        this.menuRoutes = [...constantRoute, ...userAsyncRoute, anyRoute]
        ;[anyRoute, ...userAsyncRoute].forEach((route: any) => {
          router.addRoute(route)
        })
        return 'ok'
      } else {
        return Promise.reject(new Error(result.message))
      }
    },
    /**
     * 退出登录
     */
    async userLogout() {
      //退出登录请求
      const result = await reqLogout()
      console.log(result)
      if (result.code == 200) {
        this.token = ''
        this.username = ''
        this.avatar = ''
        REMOVE_TOKEN()
        return 'ok'
      } else {
        return Promise.reject(new Error(result.message))
      }
    },
  },
  getters: {},
})
//对外暴露获取小仓库的方法
export default useUserStore
