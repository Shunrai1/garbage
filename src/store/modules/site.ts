//垃圾投放点等的小仓库
import { Vector } from 'ol/layer'
import { Cluster } from 'ol/source'
import { defineStore } from 'pinia'
import { gSiteState } from './types/type'
import { Overlay } from 'ol'
import { DepotList } from '@/api/decision/depot/type'

const useSiteStore = defineStore('Site', {
  state: (): any => {
    return {
      siteplan: null,
      num: null,
      cadidate: null,
      buildings: null,
    }
  },
  actions: {
    setSitePlan(siteplan: any) {
      this.siteplan = siteplan
    },
    setNum(num: any) {
      this.num = num
    },
    setCandidate(candidate: any) {
      this.candidate = candidate
    },
    setBuildings(buildings: any) {
      this.buildings = buildings
    },
  },
  getters: {},
})

export default useSiteStore
