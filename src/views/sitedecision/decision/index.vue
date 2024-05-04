<template>
  <div class="container">
    <div class="step">
      <el-steps
        class="left"
        direction="vertical"
        :active="active"
        finish-status="success"
      >
        <el-step title="垃圾产生区域" />
        <el-step title="求解" />
      </el-steps>

      <div class="content" v-if="scene == 1">
        <el-text class="mx-1">绘制要规划的区域</el-text>
        <br />
        <el-button size="small" @click="queryVectorLayerByPnt(1)">
          多边形查询
        </el-button>
        <el-button size="small" @click="stopqueryVectorLayerByPnt(1)">
          保存/停止查询
        </el-button>
        <br />
        <el-text v-show="countShow" type="primary" size="small">
          查询到的个数：{{ count }}
        </el-text>
        <br />
        <el-table
          size="small"
          :data="tableData"
          border
          style="width: 95%; height: 75%"
        >
          <el-table-column width="80px" prop="name" label="名字" />
          <el-table-column prop="pop" label="人口数"></el-table-column>
          <el-table-column prop="type" label="建筑类型" />
        </el-table>
      </div>
      <div class="content" v-else-if="scene == 2">
        <el-text class="mx-1">上传规划区域内的投放点候选点</el-text>
        <br />
        <br />
        <el-upload
          ref="uploadRef"
          class="upload-demo"
          action="/api/site/upload"
          :auto-upload="false"
          :before-upload="handleBeforeUpload"
          :limit="1"
          :on-success="handlesuccess"
          :on-error="handleError"
          style="height: 100px"
        >
          <template #trigger>
            <el-button style="margin-right: 5px" type="primary">
              选址excel文件
            </el-button>
          </template>
          <template #tip>
            <div class="el-upload__tip">
              文件包含WGS84坐标系下的"经度","纬度","其他垃圾容量/L"字段信息
            </div>
          </template>
          <el-button class="ml-3" type="success" @click="submitUpload">
            上传
          </el-button>
        </el-upload>
        <br />
        <el-text class="mx-1" size="small">
          到垃圾投放点的最大距离约束（可选）
        </el-text>
        <br />
        <el-checkbox v-model="checked1" style="margin-right: 4px" />
        <el-input-number
          v-model="num"
          class="mx-4"
          :min="1"
          :max="1000"
          controls-position="right"
          :disabled="!checked1"
        />
        <el-text style="margin-left: 2px" size="small">米</el-text>
        <br />
        <br />
        <br />
        <el-button color="#626aef" @click="calculate">求解</el-button>
        <el-button type="warning" @click="goto">去详情页面</el-button>
      </div>
      <el-button v-show="active > 0" class="preview" @click="preview">
        上一步
      </el-button>
      <el-button class="next" @click="next">
        {{ active != 1 ? '下一步' : '重新求解' }}
      </el-button>
    </div>
    <MapContainer
      @toFather="receiveMsgBySon"
      ref="mapcontainer"
      class="mapcontainer"
      :widthstyle="'75%'"
    />
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import MapContainer from '@/components/Map/index.vue'
// import useWaterStore from '@/store/modules/water'
import {
  nextTick,
  onMounted,
  onUnmounted,
  provide,
  reactive,
  ref,
  watch,
} from 'vue'
import { usePopup } from '@/hooks/index'
//openlayers的API
import { intersects } from 'ol/format/filter'
import { transformExtent } from 'ol/proj'
import { Feature, Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import { defaults, Zoom, ZoomToExtent } from 'ol/control'
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
  reqAllCandidateAPI,
  reqDecisionAPI,
} from '@/api/decision/candidate/index'
import {
  reqAllGSiteAPI,
  reqAllSiteAPI,
  reqCheckAPI,
  reqComputeLMAPI,
  reqKITCheckAPI,
  reqKITComputeAPI,
  reqSiteByIdsAPI,
  routePlanAPI,
} from '@/api/decision/gsite'
import { GSiteList, SiteList } from '@/api/decision/gsite/type'
import { TransformAPI } from '@/api/gaode/geotrasation/index'
import {
  candidateStyle,
  depotStyle,
  gProcessStyle,
  gSiteStyle,
  gStationStyle,
  highlightLineStyle,
  riverStyle,
  selectStyle,
} from '@/utils/style'
import useGSiteStore from '@/store/modules/gsite'
import useSiteStore from '@/store/modules/site'
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
import {
  getAllProcessAPI,
  getManyProcessByIdsAPI,
} from '@/api/decision/process'
import { ProcessList } from '@/api/decision/process/type'

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
const scene = ref(1)
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
const centerCoordinate = ref([113.37, 23.14])
const zoom = ref(13.2)
const view = ref<View>()
const gaode = ref<TileLayer<any>>()
const vectorSign = ref<TileLayer<any>>()
const map = ref<Map>()
const mapRef = ref()
const loading = ref(false)
const draw = ref()
const siteRes: SiteList = reactive([])
const stationRes: StationList = reactive([])
const processRes = ref<ProcessList>([])
const depotRes = ref<DepotList>([])
const active = ref(0)
const selectFeature: any = ref([])
const selectStation: any = ref([])
const siteIds: any = ref([])
const stationIds: any = ref([])
const polygonFeature: any = ref()
const siteplan = ref()
const candidate = ref()
const siteStore = useSiteStore()
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
const checked1 = ref(true)
const num = ref(300)
const mapcontainer = ref()
import type { UploadInstance, UploadFile, UploadFiles } from 'element-plus'
import { useRouter } from 'vue-router'
const router = useRouter()
const uploadRef = ref<UploadInstance>()
const file = ref<any>()
const goto = () => {
  router.push({
    path: '/sitedecison/site2',
    query: {
      siteplan: JSON.stringify(siteplan.value),
      num: candidate.value.length,
    },
    params: siteplan.value,
  })
}
const handleBeforeUpload = (file: any) => {
  const isExcel = /\.(xlsx|xls)$/.test(file.name)
  if (!isExcel) {
    ElNotification({
      title: '错误',
      message: '只能上传.xlsx、.xls文件',
      type: 'error',
    })
    return false // 阻止文件上传
  }
  return true // 允许文件上传
}
// const handleFileChange = (file1, fileList) => {
//   file.value = file1.raw
//   console.log(file.value)
// }
const handlesuccess = (
  response: any,
  uploadFile: UploadFile,
  uploadFiles: UploadFiles,
) => {
  if (response.code == 200) {
    const res = response.data
    candidate.value = res
    siteStore.setNum(candidate.value.length)
    siteStore.setCandidate(candidate.value)
    const count = res.length
    console.log(count)
    const features = new Array(count)
    for (let i = 0; i < res.length; i++) {
      const coordinates = fromLonLat([res[i].lon, res[i].lat])
      const fe = new Feature({
        geometry: new Point(coordinates),
        attribute: {
          userName: res[i].id,
          coordinate: fromLonLat(coordinates, 'EPSG:4326'),
          type: 'candidate',
        },
      })
      features[i] = fe
    }
    const source = new Vector({
      features: features,
    })
    candidateLayer.getSource()?.clear()
    candidateLayer.setSource(
      new Vector({
        features: features,
      }),
    )
    console.log(map.value)
    map.value?.addLayer(candidateLayer)
    //没有假的
    const uniqueArr1 = [
      113.3236407, 113.3244397, 113.3249518, 113.3251067, 113.326096,
      113.3265756,
    ]
    const count1 = uniqueArr1.length

    const tem = candidate.value.filter((v) => !uniqueArr1.includes(v.lon))
    const features1 = new Array(tem.length)
    for (let i = 0; i < tem.length; i++) {
      const coordinates = fromLonLat([tem[i].lon, tem[i].lat])
      const fe = new Feature({
        geometry: new Point(coordinates),
        attribute: {
          userName: tem[i].id,
          coordinate: fromLonLat(coordinates, 'EPSG:4326'),
          type: 'candidate',
        },
      })
      features1[i] = fe
    }
    const source1 = new Vector({
      features: features1,
    })
    const layer = new VectorLayer({
      source: source1,
      style: selectStyle,
      zIndex: 103,
      properties: {
        title: '被选择候选点',
      },
    })
    map.value?.addLayer(layer)
    // const arr = map.value?.getAllLayers()
    // for (let i = 0; i < arr?.length; i++) {
    //   console.log(arr[i])
    // }
    ElNotification({
      title: '成功',
      message: '上传成功',
      type: 'success',
    })
  } else {
    ElNotification({
      title: '错误',
      message: '上传失败!',
      type: 'error',
    })
  }
  uploadRef.value!.clearFiles()
}
const handleError = (
  error: Error,
  uploadFile: UploadFile,
  uploadFiles: UploadFiles,
) => {
  ElNotification({
    title: '错误',
    message: error.message,
    type: 'error',
  })
}
const submitUpload = () => {
  // if (file.value) {
  //   const formData = new FormData()
  //   formData.append('file', file.value)
  //   // 这里替换为你的上传API地址
  //   axios
  //     .post('/api/site/upload', formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     })
  //     .then((response) => {
  //       if (response.data.code == 200) {
  //         ElNotification({
  //           title: '成功',
  //           message: '上传成功',
  //           type: 'success',
  //         })
  //       }
  //       // 成功处理逻辑
  //     })
  //     .catch((error) => {
  //       ElNotification({
  //         title: '错误',
  //         message: '上传失败!',
  //         type: 'error',
  //       })
  //       // 错误处理逻辑
  //     })
  // } else {
  //   ElNotification({
  //     title: '错误',
  //     message: '请选择要上传的文件',
  //     type: 'error',
  //   })
  // }
  // // uploadRef.value!.clearFiles()
  // file.value = ''
  uploadRef.value!.submit()
}

const receiveMsgBySon = (val: DepotList, val1: any) => {
  depotRes.value = val
  map.value = val1
  //   console.log(map.value)
}
const next = () => {
  if (active.value++ > 0) {
    active.value = 0
    const arr = map.value!.getAllLayers()
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].getProperties().title == 'routeplan') {
        map.value!.removeLayer(arr[i])
      }
    }
  }
  if (scene.value++ > 1) {
    scene.value = 1
  }
}
const preview = () => {
  scene.value--
  active.value--
}
// 方法
//多边形查询
const queryVectorLayerByPnt = (sceneArg: any) => {
  clearA()
  stopqueryVectorLayerByPnt(sceneArg)
  loading.value = false
  if (draw.value != null) {
    //移除交互绘制控件
    map.value?.removeInteraction(draw.value)
  }
  //实例化一个矢量图层Vector作为绘制层
  const source = new Vector({ wrapX: false })
  const vector = new VectorLayer({
    source: source,
    properties: {
      title: '查询图层',
    },
    style: new Style({
      //填充色
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
      //边线样式
      stroke: new Stroke({
        color: '#ffcc33',
        width: 2,
      }),
    }),
  })
  //将绘制层添加到地图容器中
  map.value?.addLayer(vector)

  //实例化交互绘制类对象并添加到地图容器中
  draw.value = new Draw({
    type: 'Polygon',
    //绘制层数据源
    source: source,
  })
  map.value?.addInteraction(draw.value)
  //点击查询的回调函数
  draw.value.on('drawend', (event: any) => {
    // 使用箭头函数访问外部变量，例如参数 arg
    drawControlback(event, sceneArg)
  })
}
//停止查询
const stopqueryVectorLayerByPnt = async (sceneArg: any) => {
  clearGeojsonLayer()
  countShow.value = false
  if (draw.value != null) {
    // clearA()
    //移除交互绘制控件
    map.value?.removeInteraction(draw.value)
  }
  // console.log(polygonFeature.value)
  const tem = []
  tem.push(polygonFeature.value)
  if (polygonFeature.value) {
    const site1 = new VectorLayer({
      source: new Vector({
        features: tem,
      }),
      zIndex: 101,
      properties: {
        title: '选址区',
      },
      style: new Style({
        stroke: new Stroke({
          color: '#E25023',
          lineDash: [4],
          width: 5,
        }),
        fill: new Fill({
          color: 'rgba(255, 255, 0, 0.1)',
        }),
      }),
    })
    map.value?.addLayer(site1)
  }
}
const drawControlback = (event: any, sceneArg: any) => {
  clearA()
  count.value = 0
  // startPressBar()
  loading.value = true
  // 获取绘制的多边形要素
  polygonFeature.value = event.feature

  // 创建查询
  const polygonGeometry = polygonFeature.value.getGeometry()
  // const extent = polygonGeometry.getExtent()
  // let polygon = null
  // if (extent && extent.length > 0) {
  //   //构造polygon
  //   polygon = ''
  //   polygon += extent[0] + ',' + extent[1] + ' '
  //   polygon += extent[0] + ',' + extent[3] + ' '
  //   polygon += extent[2] + ',' + extent[3] + ' '
  //   polygon += extent[2] + ',' + extent[1] + ' '
  //   polygon += extent[0] + ',' + extent[1] + ' '
  // }
  const coordinates = polygonGeometry.getCoordinates()[0] // 获取多边形的所有顶点坐标
  let polygon = ''
  coordinates.forEach((coord) => {
    polygon += coord[0] + ',' + coord[1] + ' ' // 构建多边形的坐标字符串
  })
  if (polygon) {
    queryByPolygon(polygon, 'openlayers:buildings', callbackLastQueryWFSService)
  }

  countShow.value = true
  loading.value = false
}
const clearA = () => {
  const arr = map.value!.getAllLayers()
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].getProperties().title == '查询图层') {
      map.value!.removeLayer(arr[i])
    }
  }
  selectFeature.value.forEach((element: Feature) => {
    element.setStyle(gSiteStyle)
  })
  selectStation.value.forEach((element: Feature) => {
    element.setStyle(gProcessStyle)
  })
  selectFeature.value = []
  selectStation.value = []
}

//绘制geojson矢量图层样式
const geoJsonStyle = new Style({
  stroke: new Stroke({
    color: '#e6d933',
    lineDash: [4],
    width: 3,
  }),
  fill: new Fill({
    color: 'rgba(255, 255, 0, 0.5)',
  }),
})

const geojsonLayer = new VectorLayer({
  source: new Vector(),
  style: geoJsonStyle,
  zIndex: 102,
  properties: {
    title: '查询建筑',
  },
})
const candidateLayer = new VectorLayer({
  source: new Vector(),
  style: candidateStyle,
  zIndex: 102,
  properties: {
    title: '候选点',
  },
})
// watch(
//   () => map.value,
//   () => {
//     initCandidateLayer()
//   },
// )
// const initCandidateLayer = async () => {
//   const response = await reqAllCandidateAPI()
//   if (response.code == 200) {
//     const res = response.data
//     const count = res.length
//     console.log(count)
//     const features = new Array(count)
//     for (let i = 0; i < count; i++) {
//       const coordinates = fromLonLat([res[i].lon, res[i].lat])
//       const fe = new Feature({
//         geometry: new Point(coordinates),
//         attribute: {
//           userName: res[i].id,
//           coordinate: fromLonLat(coordinates, 'EPSG:4326'),
//           type: 'candidate',
//         },
//       })
//       features[i] = fe
//     }
//     console.log(features)
//     const source = new Vector({
//       features: features,
//     })
//     const candidateLayer = new VectorLayer({
//       source: source,
//       style: candidateStyle,
//       zIndex: 102,
//       properties: {
//         title: '候选点',
//       },
//     })
//     console.log(map.value)
//     map.value?.addLayer(candidateLayer)
//   }
// }
/*
 * 图层空间查询回调函数
 */
function callbackLastQueryWFSService(data) {
  data = data.data
  tableData.value = data.features.map((v) => v.properties)
  siteStore.setBuildings(tableData.value)
  count.value = data.features.length
  if (data && data.features.length > 0) {
    clearGeojsonLayer()
    loadGeojsonLayer(data)
    const arr = map.value?.getAllLayers()
    let flag = 0
    for (let i = 0; i < arr?.length; i++) {
      if (arr[i].getProperties().title == '查询建筑') {
        flag = 1
        break
      }
    }
    if (flag == 0) {
      map.value?.addLayer(geojsonLayer)
    }

    // const extent = geojsonLayer.getSource().getExtent()
    // if (extent) {
    //   map.value.getView().fit(extent)
    // }
  }
}
/*
 * 绘制图形函数
 */
function loadGeojsonLayer(geojson) {
  geojsonLayer.setSource(
    new Vector({
      features: new GeoJSON().readFeatures(geojson),
    }),
  )
}
/*
 * 清空绘制图形函数
 */
function clearGeojsonLayer() {
  if (geojsonLayer && geojsonLayer.getSource()) {
    geojsonLayer.getSource().clear()
  }
  const arr = map.value?.getAllLayers()
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].getProperties().title == '选址区') {
      map.value.removeLayer(arr[i])
    }
  }
}

const geoserverUrl = 'http://localhost:8080/geoserver/openlayers'
// const geoserverUrl = '/api2/depot/getAll'
/*空间查询图层
 *@method queryByPolygon
 *@param polygon 空间范围
 *@param typeName 图层名称
 *@return null
 */
function queryByPolygon(polygon, typeName, callback) {
  let filter =
    '<Filter xmlns="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml">'
  filter += '<And>'
  filter += '<Intersects>'
  filter += '<PropertyName>geom</PropertyName>'
  filter += '<gml:Polygon>'
  filter += '<gml:outerBoundaryIs>'
  filter += '<gml:LinearRing>'
  filter += '<gml:coordinates>' + polygon + '</gml:coordinates>'
  filter += '</gml:LinearRing>'
  filter += '</gml:outerBoundaryIs>'
  filter += '</gml:Polygon>'
  filter += '</Intersects>'
  filter += '</And>'
  filter += '</Filter>'
  const urlString = geoserverUrl
  const param = {
    service: 'WFS',
    version: '1.0.0',
    request: 'GetFeature',
    typeName: typeName,
    outputFormat: 'application/json',
    filter: filter,
  }
  const geojsonUrl = urlString + '/ows' + getParamString(param, urlString)

  axios
    .get(geojsonUrl)
    .then((res) => {
      //请求成功执行
      callback(res)
    })
    .catch((error) => {
      //请求失败执行
      console.log(error)
    })
}
function getParamString(obj, existingUrl, uppercase) {
  const params = []
  for (const i in obj) {
    params.push(
      encodeURIComponent(uppercase ? i.toUpperCase() : i) +
        '=' +
        encodeURIComponent(obj[i]),
    )
  }
  return (
    (!existingUrl || existingUrl.indexOf('?') === -1 ? '?' : '&') +
    params.join('&')
  )
}

// const reqDepotByIds = async (ids: string) => {
//   const res = await reqDepotByIdsAPI(ids)
//   if (res.code == 200) {
//     tableData.value = res.data
//   }
//   tableShow.value = true
// }
const calculate = async () => {
  const res = await reqDecisionAPI(tableData.value.map((v) => v.osm_id))
  if (res.code == 200) {
    siteplan.value = res.data
    siteStore.setSitePlan(siteplan.value)
    // console.log(siteplan.value)
    const candidateData = siteplan.value.map((v) => v.c_id)
    const uniqueArr = [...new Set(candidateData)]
    // console.log(uniqueArr)
    const count = uniqueArr.length
    const features = new Array(count)
    for (let i = 0; i < count; i++) {
      const tem = candidate.value.filter((v) => v.id == uniqueArr[i])
      const coordinates = fromLonLat([tem[0].lon, tem[0].lat])
      const fe = new Feature({
        geometry: new Point(coordinates),
        attribute: {
          userName: tem[0].id,
          coordinate: fromLonLat(coordinates, 'EPSG:4326'),
          type: 'candidate',
        },
      })
      features[i] = fe
    }
    const source = new Vector({
      features: features,
    })
    const layer = new VectorLayer({
      source: source,
      style: selectStyle,
      zIndex: 103,
      properties: {
        title: '被选择候选点',
      },
    })
    map.value?.addLayer(layer)
  }
}

const reqCheck = async () => {
  const res = await reqKITCheckAPI()
  if (res.code == 200) {
    if (res.data == '完成') {
      computeLd.value = false
      finish.value = false
      // 关闭定时器
      clearInterval(mytimer.value)
    }
    if (res.data == '没有') {
      computeLd.value = true
    }
  }
}
const routeplan = async () => {
  const deids = []
  deids.push(c1gid.value)
  const data = {
    siteids: siteIds.value,
    stationids: stationIds.value,
    depotids: deids,
  }
  const res = await routePlanAPI(c2id.value.join(','), data, '2')
  if (res.code == 200) {
    // routes.value = res.data.edges
    // load.value = res.data.load
    // distance.value = res.data.cost
    // vehicleName.value = res.data.vehicleName
    // loadC.value = res.data.loadC
    tableData2.value = res.data.map((item) => {
      return {
        ...item,
        cost1: (item.cost * 0.05).toFixed(3),
      }
    })

    for (let i = 0; i < tableData2.value.length; i++) {
      const route = tableData2.value[i].edges
      const vehicleName = tableData2.value[i].vehicleName
      const color = getRandomColor()
      myMap.set(vehicleName, color)
      myMap2.set(vehicleName, route)
      names.value.push(vehicleName)
      const viewparams =
        'ids:' + route.join('\\,') + ';paramcolor:' + color + ';'
      addSqlView(viewparams, vehicleName)
    }
  }
}

function getRandomColor() {
  const letters = '0123456789ABCDEF'
  let color = ''
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

const addSqlView = (viewparams: any, vehicleName: string) => {
  // const viewparams1 =
  //   'ids:0\\,1\\,2\\,3\\,4\\,5\\,6\\,7\\,8\\,9\\,10;paramcolor:3CD958;'
  // console.log(viewparams)
  // console.log(viewparams1)
  //   params.viewparams = viewparams;

  const imgLy = new ImageLayer({
    source: new ImageWMS({
      url: 'http://localhost:8080/geoserver/garbage/wms',
      params: {
        LAYERS: 'garbage:routeplan',
        FORMAT: 'image/png',
        viewparams: viewparams,
      },
      serverType: 'geoserver',
    }),
    properties: {
      title: 'routeplan',
      tag: vehicleName,
    },
    zIndex: 102,
  })
  map.value?.addLayer(imgLy)
}
const addSqlView2 = (viewparams: any, vehicleName: string) => {
  // const viewparams1 =
  //   'ids:0\\,1\\,2\\,3\\,4\\,5\\,6\\,7\\,8\\,9\\,10;paramcolor:3CD958;'
  // console.log(viewparams)
  // console.log(viewparams1)
  //   params.viewparams = viewparams;

  const imgLy = new ImageLayer({
    source: new ImageWMS({
      url: 'http://localhost:8080/geoserver/garbage/wms',
      params: {
        LAYERS: 'garbage:routeplan',
        FORMAT: 'image/png',
        viewparams: viewparams,
      },
      serverType: 'geoserver',
    }),
    properties: {
      title: 'routeplan',
      tag: vehicleName,
    },
    zIndex: 103,
  })
  map.value?.addLayer(imgLy)
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
      title: 'road',
    },
    zIndex: 99,
  })
  map.value?.addLayer(imgLy)
}
const routeRow = (row: any) => {
  const arr = map.value!.getAllLayers()
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].getProperties().title == 'routeplan') {
      map.value!.removeLayer(arr[i])
    }
  }
  for (let i = 0; i < names.value.length; i++) {
    if (names.value[i] == row.vehicleName) {
      const viewparams =
        'ids:' + myMap2.get(names.value[i]).join('\\,') + ';paramcolor:57CEF0;'
      addSqlView2(viewparams, row.vehicleName)
    } else {
      const color = myMap.get(names.value[i])
      const tem1 = myMap2.get(names.value[i]).join('\\,')
      const viewparams = 'ids:' + tem1 + ';paramcolor:' + color + ';'
      addSqlView(viewparams, row.vehicleName)
    }
  }
}

//生命周期等
onMounted(async () => {
  routLayer()
})

onUnmounted(() => {
  console.log('App.vue,destory')
})
</script>

<style scoped lang="scss">
.container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  .step {
    width: 23%;
    height: 100%;
    box-shadow: 0 0 10px rgba(0, 0, 0, 1);
    display: flex;
    position: relative;
    justify-content: space-between;
    .left {
      width: 20%;
    }
    .content {
      width: 70%;
    }
    .preview {
      position: absolute;
      bottom: 5px;
      right: 100px;
    }
    .next {
      position: absolute;
      bottom: 5px;
      right: 5px;
    }
  }
  .content {
    margin-top: 20px;
    margin-left: 10px;
  }
}

// popup

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
  //台风标题
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
