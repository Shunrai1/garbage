<template>
  <div
    v-loading="loading"
    element-loading-text="正在查询，请稍后"
    id="mapcontainer"
    ref="mapRef"
    :style="{ width: widthstyle, height: heightstyle }"
  ></div>

  <!-- popup -->
  <div v-show="popupVisible" ref="popupRef" id="popup" class="ol-popup">
    <a
      href="#"
      ref="popupCloserRef"
      id="popup-closer"
      class="ol-popup-closer"
    ></a>
    <!-- 标题 -->
    <div v-show="titleVisible" id="popup-content" ref="popupContentRef"></div>
    <!-- 内容 -->
    <!-- 垃圾投放点 -->
    <div v-show="gSiteVisible">
      <el-form label-width="70px" class="form">
        <el-form-item label="地&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;区">
          {{ area }}
        </el-form-item>
        <el-form-item label="标&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;签">
          {{ label }}
        </el-form-item>
        <el-form-item label="地&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;址">
          {{ address }}
        </el-form-item>
        <el-form-item label="描&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;述">
          {{ description }}
        </el-form-item>
        <el-form-item label="所属街道">
          {{ street }}
        </el-form-item>
      </el-form>
    </div>
    <!-- 垃圾中转点 -->
    <div v-show="gStationVisible">
      <el-form label-width="120px" class="form">
        <el-form-item label="地&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;区">
          {{ area }}
        </el-form-item>
        <el-form-item label="名&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;称">
          {{ name }}
        </el-form-item>
        <el-form-item label="地&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;址">
          {{ address }}
        </el-form-item>
        <el-form-item label="所属街道">
          {{ street }}
        </el-form-item>
        <el-form-item label="箱数">
          {{ number }}
        </el-form-item>
        <el-form-item label="日处理量（吨）">
          {{ deal }}
        </el-form-item>
        <el-form-item label="压缩站类型">
          {{ gstype }}
        </el-form-item>
        <el-form-item label="建筑面积（m²）">
          {{ buildarea }}
        </el-form-item>
        <el-form-item label="政府管理部门">
          {{ department }}
        </el-form-item>
        <el-form-item label="管养单位">
          {{ unit }}
        </el-form-item>
        <el-form-item label="使用状态">
          {{ station }}
        </el-form-item>
        <el-form-item label="压缩方式">
          {{ cmethod }}
        </el-form-item>
        <el-form-item label="除臭方式">
          {{ dmethod }}
        </el-form-item>
      </el-form>
    </div>
    <div v-show="gProcessVisible">
      <el-form label-width="70px" class="form">
        <el-form-item label="名&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;称">
          {{ name }}
        </el-form-item>
        <el-form-item label="描&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;述">
          {{ description }}
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
// import useWaterStore from '@/store/modules/water'
import {
  defineExpose,
  nextTick,
  onMounted,
  onUnmounted,
  provide,
  reactive,
  ref,
} from 'vue'
import { usePopup } from '@/hooks/index'
//openlayers的API
import { intersects } from 'ol/format/filter'
import { transformExtent } from 'ol/proj'
import { Feature, Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import { defaults, ScaleLine, Zoom, ZoomToExtent } from 'ol/control'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import VectorLayer from 'ol/layer/Vector'
import { fromExtent } from 'ol/geom/Polygon'
import { Projection, fromLonLat } from 'ol/proj'
import { LineString, Point, Polygon } from 'ol/geom'
import { Draw } from 'ol/interaction'
import Vector from 'ol/source/Vector'
import { ImageStatic, ImageWMS } from 'ol/source'
import { Image } from 'ol/layer'
import { getCenter } from 'ol/extent'
import { Style, Fill, Stroke, Circle } from 'ol/style'
import { StyleLike } from 'ol/style/Style'
import {
  reqAllGSiteAPI,
  reqAllSiteAPI,
  reqCheckAPI,
  reqComputeLMAPI,
  reqSiteByIdsAPI,
  routePlanAPI,
} from '@/api/decision/gsite'
import { GSiteList, SiteList } from '@/api/decision/gsite/type'
import { TransformAPI } from '@/api/gaode/geotrasation/index'
import {
  depotStyle,
  gProcessStyle,
  gSiteStyle,
  gStationStyle,
  highlightLineStyle,
  riverStyle,
  selectStyle,
} from '@/utils/style'
import useGSiteStore from '@/store/modules/gsite'
import {
  reqAllGProcessAPI,
  reqAllGStationAPI,
  reqAllStationAPI,
  reqStationByIdsAPI,
} from '@/api/decision/gstaion'
import {
  GProcessList,
  GStationList,
  StationList,
} from '@/api/decision/gstaion/type'
import { reqAllDepotAPI, reqDepotByIdsAPI } from '@/api/decision/depot'
import { DepotList } from '@/api/decision/depot/type'
import { tabsEmits } from 'element-plus'
import { ElNotification } from 'element-plus'
import ImageLayer from 'ol/layer/Image'
import { getAllProcessAPI } from '@/api/decision/process'
import { ProcessList } from '@/api/decision/process/type'
import { getCurrentInstance } from 'vue'
const cxt = getCurrentInstance() //相当于Vue2中的this
const bus = cxt!.appContext.config.globalProperties.$bus

const myMap = new Map()
const myMap2 = new Map()
const names = ref<any>([])
const vehicleName = ref<any>()
const loadC = ref<any>()
const routes = ref<any>()
const load = ref<any>()
const distance = ref<any>()
const finish = ref(true)
const mytimer = ref()
const computeLd = ref(false)
const cost = ref('')
const scene = ref(0)
const step = ref(true)
const rowtrucks = ref<any>([])
const c2id = ref([])
const c1gid = ref('')
const tableShow = ref(false)
const tableData: any = ref([])
const tableData1: any = ref([])
const tableData2: any = ref([])
const countShow = ref(false)
const count = ref(0)
const gSiteStore = useGSiteStore()
const centerCoordinate = ref([113.37, 23.16])
const zoom = ref(13.2)
const view = ref<View>()
const gaode = ref<TileLayer<any>>()
const vectorSign = ref<TileLayer<any>>()
const map = ref<Map>()
const mapRef = ref()
const loading = ref(false)
const draw = ref()
let siteRes: SiteList = reactive([])
let stationRes: StationList = reactive([])
const processRes = ref<ProcessList>([])
const depotRes = ref<DepotList>([])
const active = ref(0)
const selectFeature: any = ref([])
const selectStation: any = ref([])
const siteIds: any = ref([])
const stationIds: any = ref([])
// 实现popup的html元素
const popupVisible = ref<boolean>(false)
const popupRef = ref()
const popupContentRef = ref()
const popupCloserRef = ref()
const titleVisible = ref(true)
const gSiteVisible = ref<boolean>(false)
const gStationVisible = ref<boolean>(false)
const gProcessVisible = ref<boolean>(false)
const area = ref()
const description = ref()
const label = ref()
const street = ref()
const address = ref()
const name = ref()
const number = ref() //箱数
const deal = ref() //日处理量（吨）
const gstype = ref() //压缩站类型
const buildarea = ref() //建筑面积（m²）
const department = ref() //政府管理部门
const unit = ref() //管养单位
const station = ref() //使用状态
const cmethod = ref() //压缩方式
const dmethod = ref() //除臭方式
const props = defineProps({
  widthstyle: {
    type: String,
    default: '100%',
  },
  heightstyle: {
    type: String,
    default: '100%',
  },
  map: {
    type: Map,
  },
})
const invisibelGaode = () => {
  gaode.value?.setVisible(true)
}
// 初始化地图
const initMap = async () => {
  //视图
  view.value = new View({
    center: fromLonLat(centerCoordinate.value),
    zoom: zoom.value,
  })
  //(天地图)
  gaode.value = new TileLayer({
    source: new XYZ({
      url: 'http://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=0359705082220de297c5777e18eddd44',
      wrapX: true,
    }),
  })
  //矢量标注
  vectorSign.value = new TileLayer({
    source: new XYZ({
      url: 'http://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=0359705082220de297c5777e18eddd44',
      wrapX: true,
    }),
  })
  //实例化比例尺控件（ScaleLine）
  const scaleLineControl = new ScaleLine({})

  //地图对象
  map.value = new Map({
    target: mapRef.value,
    layers: [gaode.value, vectorSign.value],
    view: view.value,
    //清除默认控件
    controls: defaults({
      zoom: false,
      rotate: false,
      attribution: false,
    }).extend([
      new Zoom({
        className: 'zoom',
      }),
      scaleLineControl,
    ]),
  })

  //获取当前地图范围(extent:返回的值是一个由最小经度、最小纬度、最大经度和最大纬度组成的数组，)
  const extent = view.value.calculateExtent(map.value.getSize())
  map.value.addControl(
    new ZoomToExtent({
      extent: extent,
      className: 'extent',
    }),
  )
}
const reqAllSite = async () => {
  const res = await reqAllSiteAPI(null, null, null)
  if (res.code == 200) {
    siteRes = res.data.records
  }
}
//初始化图层
const initGSiteLayer = async () => {
  //此示例创建多个要素
  const count = siteRes.length
  const features = new Array(count)

  for (let i = 0; i < count; ++i) {
    const coordinates = fromLonLat([siteRes[i].longitude, siteRes[i].latitude])
    // const res = await TransformAPI(gsiteRes[i].lon, gsiteRes[i].lat)
    // if (res.status == 200) {
    //   coordinates = fromLonLat(res.data.locations.split(','))
    // }

    const attr = {
      gid: `${siteRes[i].gid}`,
      userName: `垃圾投放点`,
      area: `${siteRes[i].area}`,
      label: `${siteRes[i].label}`,
      address: `${siteRes[i].address}`,
      description: `${siteRes[i].description}`,
      street: `${siteRes[i].street}`,
      coordinate: coordinates,
      type: 'gSite',
    }
    features[i] = new Feature({
      geometry: new Point(coordinates),
      attribute: attr,
    })
  }

  //矢量要素数据源
  const source = new Vector({
    features: features,
  })

  //加载矢量图层
  const gSiteLayer = new VectorLayer({
    zIndex: 100,
    properties: {
      title: '垃圾投放点',
    },
    source: source,
    style: gSiteStyle,
  })

  //存储图层
  gSiteStore.setGSiteLayer(gSiteLayer)
}
const reqAllStation = async () => {
  const res = await reqAllStationAPI()
  if (res.code == 200) {
    stationRes = res.data
  }
}
const initGStationLayer = async () => {
  //此示例创建多个要素
  const count = stationRes.length
  const features = new Array(count)

  for (let i = 0; i < count; ++i) {
    const coordinates = fromLonLat([stationRes[i].lon, stationRes[i].lat])
    const attr = {
      gid: `${stationRes[i].gid}`,
      userName: `垃圾中转站`,
      area: `${stationRes[i].area}`,
      name: `${stationRes[i].name}`,
      address: `${stationRes[i].address}`,
      street: `${stationRes[i].street}`,
      number: `${stationRes[i].number}`,
      deal: `${stationRes[i].deal}`,
      gstype: `${stationRes[i].type}`,
      buildarea: `${stationRes[i].buildarea}`,
      department: `${stationRes[i].department}`,
      unit: `${stationRes[i].unit}`,
      station: `${stationRes[i].station}`,
      cmethod: `${stationRes[i].cmethod}`,
      dmethod: `${stationRes[i].dmethod}`,
      coordinate: coordinates,
      type: 'gStation',
    }
    features[i] = new Feature({
      geometry: new Point(coordinates),
      attribute: attr,
    })
  }

  //矢量要素数据源
  const source = new Vector({
    features: features,
  })

  //加载矢量图层
  const gStationLayer = new VectorLayer({
    zIndex: 100,
    properties: {
      title: '垃圾中转站',
    },
    source: source,
    style: gStationStyle,
  })

  //存储图层
  gSiteStore.setGStationLayer(gStationLayer)
}
const reqAllProcess = async () => {
  const res = await getAllProcessAPI()
  if (res.code == 200) {
    processRes.value = res.data
  }
}
const initProcessLayer = async () => {
  //此示例创建多个要素
  const count = processRes.value.length
  const features = new Array(count)
  for (let i = 0; i < count; ++i) {
    const coordinates = fromLonLat([
      processRes.value[i].lon,
      processRes.value[i].lat,
    ])
    const attr = {
      gid: `${processRes.value[i].gid}`,
      userName: `垃圾处理站`,
      name: `${processRes.value[i].name}`,
      coordinate: coordinates,
      type: 'gProcess',
    }
    features[i] = new Feature({
      geometry: new Point(coordinates),
      attribute: attr,
    })
  }

  //矢量要素数据源
  const source = new Vector({
    features: features,
  })

  //加载矢量图层
  const gProcessLayer = new VectorLayer({
    zIndex: 100,
    properties: {
      title: '垃圾处理站',
    },
    source: source,
    style: gProcessStyle,
  })

  //存储图层
  gSiteStore.setGProcessLayer(gProcessLayer)
}

const reqAllDepot = async () => {
  const res = await reqAllDepotAPI()
  if (res.code == 200) {
    depotRes.value = res.data
  }
}

const initDepotLayer = async () => {
  //此示例创建多个要素
  const count = depotRes.value.length
  const features = new Array(count)

  for (let i = 0; i < count; ++i) {
    const coordinates = fromLonLat([
      depotRes.value[i].lon,
      depotRes.value[i].lat,
    ])
    const attr = {
      userName: `车辆出发点`,
      gid: `${depotRes.value[i].gid}`,
      name: `${depotRes.value[i].name}`,
      coordinate: coordinates,

      type: 'Depot',
    }
    features[i] = new Feature({
      geometry: new Point(coordinates),
      attribute: attr,
    })
  }

  //矢量要素数据源
  const source = new Vector({
    features: features,
  })

  //加载矢量图层
  const depotLayer = new VectorLayer({
    zIndex: 100,
    properties: {
      title: '车辆出发点',
    },
    source: source,
    style: depotStyle,
  })

  //存储图层
  gSiteStore.setDepotLayer(depotLayer)
}
const add = () => {
  const params: any = {
    FORMAT: 'image/png',
    LAYERS: 'garbage:func_routeplan',
  }

  const viewparams = ["ids:'5643,5690,307,3393,8926,8923,8934'"]

  params.viewparams = viewparams

  const imgLy = new Image({
    source: new ImageWMS({
      url: 'http://localhost:8080/geoserver/garbage/wms',

      params: params,

      serverType: 'geoserver',
    }),
  })

  map.value?.addLayer(imgLy)
}

//地图弹出框
const mapPopup = () => {
  /**
   * 为map添加点击事件监听，渲染弹出popup
   */
  map.value?.on('click', function (evt: any) {
    //判断当前单击处是否有要素，捕获到要素时弹出popup.
    //forEachFeatureAtPixel用于在指定像素位置检索地图上的要素
    //该方法接受两个参数：
    // pixel：要素的像素位置，通常是通过事件对象（如鼠标点击事件）的 evt.pixel 属性获得的。
    // callback：一个回调函数，用于处理检索到的要素。
    const feature = map.value?.forEachFeatureAtPixel(
      evt.pixel,
      function (feature: any) {
        return feature
      },
    )
    if (feature) {
      const refs = {
        popupRef,
        popupContentRef,
        popupCloserRef,
        area,
        label,
        address,
        description,
        street,
        popupVisible,
        titleVisible,
        name,
        number,
        deal,
        gstype,
        buildarea,
        department,
        unit,
        station,
        cmethod,
        dmethod,
      }
      const pixel = map.value?.getEventPixel(evt.originalEvent)
      let attribute
      //得到feature的属性
      if (!feature.getProperties().features) {
        attribute = feature.getProperties().attribute
      } else {
        //聚合要素
        attribute = feature.getProperties().features[0].values_.attribute
      }
      if (!attribute) return
      if (attribute.type == 'gSite') {
        const pLen = 1
        gSiteVisible.value = true
        gStationVisible.value = false
        gProcessVisible.value = false
        usePopup(pLen, map.value!, pixel!, attribute, refs, 'gSite')
      } else if (attribute.type == 'gStation') {
        const pLen = 1
        gSiteVisible.value = false
        gStationVisible.value = true
        gProcessVisible.value = false
        usePopup(pLen, map.value!, pixel!, attribute, refs, 'gStation')
      } else if (attribute.type == 'gProcess') {
        const pLen = 1
        gSiteVisible.value = false
        gStationVisible.value = false
        gProcessVisible.value = true
        usePopup(pLen, map.value!, pixel!, attribute, refs, 'gProcess')
      }
    } else {
      // 当前点击位置没有要素
      return false
    }
  })
  /**
   * 为map添加鼠标移动事件监听，当指向标注时改变鼠标光标状态
   */
  map.value?.on('pointermove', function (e: any) {
    const pixel = map.value?.getEventPixel(e.originalEvent)
    const hit = map.value?.hasFeatureAtPixel(pixel!)
    map.value!.getTargetElement().style.cursor = hit ? 'pointer' : ''
  })
}
const routLayer = () => {
  const imgLy = new ImageLayer({
    source: new ImageWMS({
      url: 'http://localhost:8080/geoserver/garbage/wms',
      params: {
        LAYERS: 'garbage:tianheroad',
        FORMAT: 'image/png',
      },
      serverType: 'geoserver',
    }),
    properties: {
      title: '道路路网',
    },
    zIndex: 99,
  })
  map.value?.addLayer(imgLy)
  gSiteStore.setRoadLayer(imgLy)
}
const buildingsLayer = () => {
  const imgLy = new ImageLayer({
    source: new ImageWMS({
      url: 'http://localhost:8080/geoserver/openlayers/wms',
      params: {
        LAYERS: 'openlayers:buildings',
        FORMAT: 'image/png',
      },
      serverType: 'geoserver',
    }),
    properties: {
      title: '建筑',
    },
    zIndex: 99,
  })
  map.value?.addLayer(imgLy)
  gSiteStore.setRoadLayer(imgLy)
}
const emit = defineEmits<{ (e: 'toFather', val: DepotList, val1: any): void }>()
const toFather = () => {
  emit('toFather', depotRes.value, map.value)
}
//生命周期等
onMounted(async () => {
  await initMap()
  invisibelGaode()
  await reqAllSite()
  await initGSiteLayer()
  await reqAllStation()
  await initGStationLayer()
  await reqAllProcess()
  await initProcessLayer()
  await reqAllDepot()
  await initDepotLayer()
  toFather()
  routLayer()
  buildingsLayer()
  add()
  mapPopup()
  map.value?.addLayer(gSiteStore.gSite)
  map.value?.addLayer(gSiteStore.gStation)
  map.value?.addLayer(gSiteStore.gProcess)
  map.value?.addLayer(gSiteStore.depot)
  gSiteStore.setMapLayer(map.value)

  bus.emit('transfer', map.value)
})

onUnmounted(() => {
  console.log('App.vue,destory')
})
</script>

<style scoped lang="scss">
#mapcontainer {
  height: 100%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 1);
  :deep(.zoom) {
    display: flex;
    flex-direction: column;
    width: 27px;
    height: 27px;
    margin-top: 3px;
    margin-left: 3px;
  }
  :deep(.extent) {
    margin-top: 40px;
    margin-left: 3px;
  }
  :deep(.ol-scale-line-inner) {
    position: absolute;
    bottom: 5px;
    left: 5px;
    border: 1px solid black;
    border-top: 0; /* 去掉上边框 */
  }
}

.ol-popup {
  position: absolute;
  background-color: white;
  -webkit-filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
  filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #cccccc;
  bottom: 45px;
  left: -50px;
  width: 400px;
  .form {
    margin-top: 5px;
    max-height: 200px;
    overflow: auto;
    div {
      margin: 0;
    }
  }
  .typhoonTitle {
    background-color: rgb(142, 142, 232);
    height: 25px;
    width: 90px;
    color: white;
    border-radius: 5%;
    text-align: center;
    font-size: 16px;
    line-height: 25px;
    margin-bottom: 10px;
  }
}

.ol-popup::after,
.ol-popup::before {
  top: 100%;
  border: solid transparent;
  content: ' ';
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}

.ol-popup::after {
  border-top-color: white;
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}

.ol-popup::before {
  border-top-color: #cccccc;
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
}

.ol-popup-closer {
  text-decoration: none;
  position: absolute;
  top: 2px;
  right: 8px;
}

.ol-popup-closer::after {
  content: '✖';
}

#popup-content {
  font-size: 14px;
  font-family: '微软雅黑';
  font-weight: bold;
}
</style>
