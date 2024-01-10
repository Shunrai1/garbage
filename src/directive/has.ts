import pinia from '@/store'
import useUserStore from '@/store/modules/user'

const userStore = useUserStore(pinia)
export const isHasButton = (app: any) => {
  app.directive('has', {
    //代表使用这个全局自定义指令的DOM|组件挂载完毕的时候执行一次
    //el为Dom对象，options为指令右侧值
    mounted(el: any, options: any) {
      if (!userStore.buttons?.includes(options.value)) {
        el.parentNode.removeChild(el)
      }
    },
  })
}
