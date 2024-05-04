import type { RouteRecordRaw } from 'vue-router'
import type { CategoryObj } from '@/api/product/attr/type'
import { vector } from 'echarts'
import { DepotList } from '@/api/decision/depot/type'
//定义小仓库数据state类型
export type UserState = {
  token: string | null
  menuRoutes: RouteRecordRaw[]
  username: string
  avatar: string
  buttons?: string[]
}

//定义分类仓库state对象类型
export interface CategoryState {
  c1Id: string | number
  c1Arr: CategoryObj[]
  c2Arr: CategoryObj[]
  c2Id: string | number
  c3Arr: CategoryObj[]
  c3Id: string | number
}

export interface gSiteState {
  gSite: Vector
  gStation: Vector
  gProcess: Vector
  depot: Vector
  reservoirSign: null
  popup: null
  depots: DepotList
  map: null
  roadLayer
}
