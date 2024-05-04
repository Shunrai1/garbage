//垃圾投放点等的小仓库
import { Vector } from 'ol/layer'
import { Cluster } from 'ol/source'
import { defineStore } from 'pinia'
import { gSiteState } from './types/type'
import { Overlay } from 'ol'
import { DepotList } from '@/api/decision/depot/type'

const useGSiteStore = defineStore('gSite', {
  state: (): gSiteState => {
    return {
      gSite: null,
      gStation: null,
      gProcess: null,
      depot: null,
      reservoirSign: null,
      popup: null,
      depots: [],
      map: null,
      roadLayer: null,
    }
  },
  actions: {
    /**
     * 存储垃圾投放点图层数据
     * @param gSiteLayer
     */
    setGSiteLayer(gSiteLayer: Vector<any>) {
      this.gSite = gSiteLayer
    },
    /**
     * 存储垃圾投放点图层数据
     * @param gStationLayer
     */
    setGStationLayer(gStationLayer: Vector<any>) {
      this.gStation = gStationLayer
    },
    /**
     * 存储垃圾处理站图层数据
     * @param gProcessLayer
     */
    setGProcessLayer(gProcessLayer: Vector<any>) {
      this.gProcess = gProcessLayer
    },
    /**
     * 存储车辆出发点图层数据
     * @param depotLayer
     */
    setDepotLayer(depotLayer: Vector<any>) {
      this.depot = depotLayer
    },
    /**
     * 存储道路路网
     * @param depots
     */
    setRoadLayer(roadLayer: any) {
      this.roadLayer = roadLayer
    },
    setDepots(depots: DepotList) {
      this.depots = depots
    },
    /**
     * 存储map数据
     */
    setMapLayer(map: any) {
      this.map = map
    },
  },
  getters: {},
})

export default useGSiteStore
