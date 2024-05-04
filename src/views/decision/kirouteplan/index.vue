<template>
  <div class="container">
    <div class="step">
      <el-steps
        class="left"
        direction="vertical"
        :active="active"
        finish-status="success"
      >
        <el-step title="车辆部署" />
        <el-step title="停靠点" />
        <el-step title="处理站" />
        <el-step title="求解" />
      </el-steps>
      <div class="content" v-if="scene == 0">
        <el-text class="mx-1">输入1个车辆出发点</el-text>
        <br />
        <el-select v-model="c1gid" @change="handler">
          <!-- label:即为展示数据 value:即为select下拉菜单收集的数据 -->
          <el-option
            v-for="(c1, index) in depotRes"
            :key="c1.gid"
            :value="c1.gid"
            :label="c1.name"
          ></el-option>
        </el-select>
        <br />
        <br />
        <el-text class="mx-1">选择部署的厨余垃圾运输车辆</el-text>
        <br />

        <el-select v-model="c2id" multiple :disabled="step">
          <el-option
            v-for="item in rowtrucks"
            :key="item.id"
            :label="item.carnumber + ' / 载重' + item.load + '吨'"
            :value="item.id"
          />
        </el-select>
      </div>
      <div class="content" v-else-if="scene == 1">
        <el-text class="mx-1">输入停靠的垃圾投放点</el-text>
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
          <el-table-column width="80px" prop="description" label="地址" />
          <el-table-column
            prop="ogcapacity"
            label="其他垃圾容量/L"
          ></el-table-column>
        </el-table>
      </div>
      <div class="content" v-else-if="scene == 2">
        <el-text class="mx-1">输入要到达的处理点</el-text>
        <br />
        <el-button size="small" @click="queryVectorLayerByPnt(2)">
          多边形查询
        </el-button>
        <el-button size="small" @click="stopqueryVectorLayerByPnt(2)">
          保存/停止查询
        </el-button>
        <br />
        <el-text v-show="countShow" type="primary" size="small">
          查询到的个数：{{ count }}
        </el-text>
        <br />
        <el-table
          size="small"
          :data="tableData1"
          border
          style="width: 95%; height: 75%"
        >
          <el-table-column width="80px" prop="name" label="名称" />
        </el-table>
      </div>
      <div class="content" v-else-if="scene == 3">
        <el-text class="mx-1">输入运输阻尼</el-text>
        <br />
        <el-select v-model="cost">
          <!-- label:即为展示数据 value:即为select下拉菜单收集的数据 -->
          <el-option :value="0" label="时间"></el-option>
          <el-option :value="1" label="距离"></el-option>
        </el-select>
        <br />
        <br />
        <el-text class="mx-1">求解od代价矩阵</el-text>
        <br />
        <el-button @click="compute" :loading="computeLd">开始</el-button>
        <br />
        <br />
        <el-text class="mx-1">求解规划的线路</el-text>
        <br />
        <el-button @click="routeplan" :disabled="finish">开始</el-button>
        <br />
        <el-table
          size="small"
          :data="tableData2"
          border
          style="width: 95%; height: 50%; margin-top: 10px"
          @row-click="routeRow"
        >
          <el-table-column type="index" width="30px" label="线路" />
          <el-table-column prop="vehicleName" label="车牌号" />
          <el-table-column prop="loadC" label="限重/吨"></el-table-column>
          <el-table-column prop="load" label="已装载/kg"></el-table-column>
          <el-table-column prop="cost" label="长度/米"></el-table-column>
          <el-table-column prop="cost1" label="成本/元"></el-table-column>
          <el-table-column
            prop="routeName"
            label="线路"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column prop="number" label="投放点/个"></el-table-column>
          <el-table-column fixed="right" label="保存线路" align="center">
            <template #="{ row, $index }">
              <el-button type="primary" size="small" @click="updateUser(row)">
                保存
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-button v-show="active > 0" class="preview" @click="preview">
        上一步
      </el-button>
      <el-button class="next" @click="next">
        {{ active != 3 ? '下一步' : '重新求解' }}
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
import MapContainer from '@/components/Map/index.vue'
// import useWaterStore from '@/store/modules/water'
import { nextTick, onMounted, onUnmounted, provide, reactive, ref } from 'vue'
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
const mapcontainer = ref()

const receiveMsgBySon = (val: DepotList, val1: any) => {
  depotRes.value = val
  map.value = val1
  //   console.log(map.value)
}
const next = () => {
  if (active.value++ > 2) {
    active.value = 0
    const arr = map.value!.getAllLayers()
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].getProperties().title == 'routeplan') {
        map.value!.removeLayer(arr[i])
      }
    }
  }
  if (scene.value++ > 2) {
    scene.value = 0
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
  countShow.value = false
  if (draw.value != null) {
    // clearA()
    //移除交互绘制控件
    map.value?.removeInteraction(draw.value)
  }
  if (sceneArg == 1) {
    siteIds.value.length = 0
    selectFeature.value.forEach((element: Feature) => {
      element.setStyle(gSiteStyle)
      siteIds.value.push(element.get('attribute').gid)
    })
    selectFeature.value = []
    if (siteIds.value.length <= 0) {
      tableData.value.length = 0
      return
    }
    await reqSiteByIds(siteIds.value.join(','))
  } else if (sceneArg == 2) {
    stationIds.value.length = 0
    selectStation.value.forEach((element: Feature) => {
      element.setStyle(gProcessStyle)
      stationIds.value.push(element.get('attribute').gid)
    })
    selectStation.value = []
    if (stationIds.value.length <= 0) {
      tableData1.value.length = 0
      return
    }
    await getManyProcessByIds(stationIds.value.join(','))
  }
}
const drawControlback = (event: any, sceneArg: any) => {
  clearA()
  count.value = 0
  // startPressBar()
  loading.value = true
  // 获取绘制的多边形要素
  const polygonFeature = event.feature

  // 创建查询
  const polygonGeometry = polygonFeature.getGeometry()

  // 对点要素进行空间查询
  map.value?.getLayers().forEach(function (layer) {
    if (
      layer instanceof VectorLayer &&
      layer.getProperties().title == '垃圾投放点' &&
      sceneArg == 1
    ) {
      const source = layer.getSource()
      source.forEachFeature((pointFeature: any) => {
        const pointGeometry = pointFeature.getGeometry()
        if (
          polygonGeometry.intersectsCoordinate(pointGeometry.getCoordinates())
        ) {
          // console.log('Point intersects polygon:', pointFeature)
          pointFeature.setStyle(selectStyle)
          selectFeature.value.push(pointFeature)
          count.value++
        }
      })
    } else if (
      layer instanceof VectorLayer &&
      layer.getProperties().title == '垃圾处理站' &&
      sceneArg == 2
    ) {
      const source = layer.getSource()
      source.forEachFeature((pointFeature: any) => {
        const pointGeometry = pointFeature.getGeometry()
        if (
          polygonGeometry.intersectsCoordinate(pointGeometry.getCoordinates())
        ) {
          // console.log('Point intersects polygon:', pointFeature)
          pointFeature.setStyle(selectStyle)
          selectStation.value.push(pointFeature)
          count.value++
        }
      })
    }
  })
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
const reqSiteByIds = async (ids: string) => {
  const res = await reqSiteByIdsAPI(ids)
  if (res.code == 200) {
    tableData.value = res.data
  }
}
const getManyProcessByIds = async (ids: string) => {
  const res = await getManyProcessByIdsAPI(ids)
  if (res.code == 200) {
    tableData1.value = res.data
  }
}

// const reqDepotByIds = async (ids: string) => {
//   const res = await reqDepotByIdsAPI(ids)
//   if (res.code == 200) {
//     tableData.value = res.data
//   }
//   tableShow.value = true
// }
//一级选择
const handler = (gid: any) => {
  if (c1gid.value != '') {
    step.value = false
  }
  rowtrucks.value = []
  c2id.value = []
  depotRes.value.forEach((element: any) => {
    if (element.gid == gid) {
      rowtrucks.value = element.trucks.filter((v: any) => v.type == 2)
    }
  })
}
//计算od代价矩阵
const compute = async () => {
  // console.log(c1gid.value)
  // console.log(c2id.value.length)
  // console.log(siteIds.value.length)
  // console.log(siteIds.value.length)
  // console.log(cost.value)
  if (
    c1gid.value == '' ||
    c2id.value.length == 0 ||
    siteIds.value.length == 0 ||
    stationIds.value.length == 0 ||
    cost.value === ''
  ) {
    ElNotification({
      title: '参数缺少',
      message: '请检查之前步骤，参数是否输入完成',
      type: 'error',
    })
  } else {
    const data = {
      siteids: siteIds.value,
      stationids: stationIds.value,
      processids: c1gid.value,
    }
    reqKITComputeAPI(data)
    mytimer.value = setInterval(reqCheck, 1000)
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
