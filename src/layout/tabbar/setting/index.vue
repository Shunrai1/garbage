<template>
  <MapContainer :widthstyle="'0%'" :heightstyle="'0%'" />
  <el-popover placement="bottom" title="测量" :width="300" trigger="click">
    <el-radio-group v-model="selectvalue">
      <el-radio label="area">测量面积</el-radio>
      <el-radio label="length">测量距离</el-radio>
    </el-radio-group>
    <el-button size="small" icon="Delete" @click="updateRefsh">
      清除测量
    </el-button>
    <template #reference>
      <el-button size="small" icon="SemiSelect" circle></el-button>
    </template>
  </el-popover>
  <el-popover placement="bottom" title="地图管理" :width="300" trigger="click">
    <el-checkbox-group v-model="checkList" @change="checkChange">
      <el-checkbox label="垃圾投放点" value="垃圾投放点" />
      <el-checkbox label="垃圾中转站" value="垃圾中转站" />
      <el-checkbox label="垃圾处理站" value="垃圾处理站" />
      <el-checkbox label="车辆出发点" value="车辆出发点" />
      <el-checkbox label="道路路网" value="道路路网" />
      <el-checkbox label="建筑" value="建筑" />
    </el-checkbox-group>
    <template #reference>
      <el-button size="small" icon="Edit" circle></el-button>
    </template>
  </el-popover>
  <el-button
    size="small"
    icon="Refresh"
    circle
    @click="updateRefsh"
  ></el-button>
  <el-button
    size="small"
    icon="FullScreen"
    circle
    @click="fullScreen"
  ></el-button>

  <el-popover placement="bottom" title="主题设置" :width="300" trigger="click">
    <!-- 表单元素 -->
    <el-form>
      <el-form-item label="主题颜色">
        <el-color-picker
          @change="setColor"
          v-model="color"
          size="small"
          show-alpha
          :predefine="predefineColors"
        />
      </el-form-item>
      <el-form-item label="暗黑模式">
        <el-switch
          @change="changeDark"
          v-model="dark"
          class="mt-2"
          style="margin-left: 24px"
          inline-prompt
          active-icon="MoonNight"
          inactive-icon="Sunny"
        />
      </el-form-item>
    </el-form>
    <template #reference>
      <el-button size="small" icon="Setting" circle></el-button>
    </template>
  </el-popover>
  <img
    :src="userStore.avatar"
    style="width: 24px; height: 24px; margin: 0 10px; border-radius: 50%"
  />
  <!-- 下拉菜单 -->
  <el-dropdown>
    <span class="el-dropdown-link">
      {{ userStore.username }}
      <el-icon class="el-icon--right">
        <arrow-down />
      </el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import MapContainer from '@/components/Map/index.vue'
import useGSiteStore from '@/store/modules/gsite'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
//获取用户相关的小仓库
import useUserStore from '@/store/modules/user'
//获取骨架的小仓库
import useLayOutSettingStore from '@/store/modules/setting'
import { getCurrentInstance } from 'vue'
import { Vector } from 'ol/source'
import VectorLayer from 'ol/layer/Vector'
import { Circle, Fill, Stroke, Style } from 'ol/style'
import { LineString, Polygon } from 'ol/geom'
import { Draw } from 'ol/interaction'
import { unByKey } from 'ol/Observable'
import { Overlay } from 'ol'
const cxt = getCurrentInstance() //相当于Vue2中的this
const bus = cxt!.appContext.config.globalProperties.$bus
const checkList = ref([
  '垃圾投放点',
  '垃圾中转站',
  '垃圾处理站',
  '车辆出发点',
  '道路路网',
  '建筑',
])
const selectvalue = ref('')
const map = ref()
const layoutSettingStore = useLayOutSettingStore()
const gSiteStore = useGSiteStore()
bus.on('transfer', (data: any) => {
  map.value = data
})

const userStore = useUserStore()
//获取路由器对象
const $router = useRouter()
//获取路由对向
const $route = useRoute()
//收集开关的数据
const dark = ref<boolean>(false)

watch(
  () => map.value,
  () => {
    if (map.value) {
      console.log('121')
    }
  },
)

//加载测量的绘制矢量层
const source = new Vector() //图层数据源
const vector = new VectorLayer({
  source: source,
  style: new Style({
    //图层样式
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)', //填充颜色
    }),
    stroke: new Stroke({
      color: '#ffcc33', //边框颜色
      width: 2, // 边框宽度
    }),
    image: new Circle({
      radius: 7,
      fill: new Fill({
        color: '#ffcc33',
      }),
    }),
  }),
})
map.value?.addLayer(vector)
// const wgs84Sphere = new Sphere(6378137) //定义一个球对象
/**
 * 当前绘制的要素（Currently drawn feature.）
 * @type {ol.Feature}
 */
let sketch
/**
 * 帮助提示框对象（The help tooltip element.）
 * @type {Element}
 */
let helpTooltipElement: HTMLElement
/**
 *帮助提示框显示的信息（Overlay to show the help messages.）
 * @type {ol.Overlay}
 */
let helpTooltip
/**
 * 测量工具提示框对象（The measure tooltip element. ）
 * @type {Element}
 */
let measureTooltipElement
/**
 *测量工具中显示的测量值（Overlay to show the measurement.）
 * @type {ol.Overlay}
 */
let measureTooltip
/**
 *  当用户正在绘制多边形时的提示信息文本
 * @type {string}
 */
const continuePolygonMsg = 'Click to continue drawing the polygon'
/**
 * 当用户正在绘制线时的提示信息文本
 * @type {string}
 */
const continueLineMsg = 'Click to continue drawing the line'

/**
 * 鼠标移动事件处理函数
 * @param {ol.MapBrowserEvent} evt
 */
const pointerMoveHandler = function (evt) {
  if (evt.dragging) {
    return
  }
  /** @type {string} */
  let helpMsg = 'Click to start drawing' //当前默认提示信息
  //判断绘制几何类型设置相应的帮助提示信息
  if (sketch) {
    const geom = sketch.getGeometry()
    if (geom instanceof Polygon) {
      helpMsg = continuePolygonMsg //绘制多边形时提示相应内容
    } else if (geom instanceof LineString) {
      helpMsg = continueLineMsg //绘制线时提示相应内容
    }
  }
  helpTooltipElement.innerHTML = helpMsg //将提示信息设置到对话框中显示
  helpTooltip.setPosition(evt.coordinate) //设置帮助提示框的位置
  helpTooltipElement.classList.remove('classNameToRemove') //移除帮助提示框的隐藏样式进行显示
}
map.value?.on('pointermove', pointerMoveHandler) //地图容器绑定鼠标移动事件，动态显示帮助提示框内容
//地图绑定鼠标移出事件，鼠标移出时为帮助提示框设置隐藏样式
map.value?.getViewport().on('mouseout', function () {
  helpTooltipElement.classList.add('hidden')
})
//测量类型对象
const draw = ref() // global so we can remove it later
/**
 * 加载交互绘制控件函数
 */
function addInteraction() {
  const type = selectvalue.value == 'area' ? 'Polygon' : 'LineString'
  draw.value = new Draw({
    source: source, //测量绘制层数据源
    type: /** @type {ol.geom.GeometryType} */ type, //几何图形类型
    style: new Style({
      //绘制几何图形的样式
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.5)',
        lineDash: [10, 10],
        width: 2,
      }),
      image: new Circle({
        radius: 5,
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.7)',
        }),
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
      }),
    }),
  })
  map.value?.addInteraction(draw.value)

  createMeasureTooltip() //创建测量工具提示框
  createHelpTooltip() //创建帮助提示框

  let listener
  //绑定交互绘制工具开始绘制的事件
  draw.value.on('drawstart', function (evt) {
    // set sketch
    sketch = evt.feature //绘制的要素

    /** @type {ol.Coordinate|undefined} */
    let tooltipCoord = evt.coordinate // 绘制的坐标
    //绑定change事件，根据绘制几何类型得到测量长度值或面积值，并将其设置到测量工具提示框中显示
    listener = sketch.getGeometry().on('change', function (evt) {
      const geom = evt.target //绘制几何要素
      let output
      if (geom instanceof Polygon) {
        output = formatArea(/** @type {ol.geom.Polygon} */ geom) //面积值
        tooltipCoord = geom.getInteriorPoint().getCoordinates() //坐标
      } else if (geom instanceof LineString) {
        output = formatLength(/** @type {ol.geom.LineString} */ geom) //长度值
        tooltipCoord = geom.getLastCoordinate() //坐标
      }
      measureTooltipElement.innerHTML = output //将测量值设置到测量工具提示框中显示
      measureTooltip.setPosition(tooltipCoord) //设置测量工具提示框的显示位置
    })
  })
  //绑定交互绘制工具结束绘制的事件
  draw.value.on('drawend', function (evt) {
    measureTooltipElement.className = 'tooltip tooltip-static' //设置测量提示框的样式
    measureTooltip.setOffset([0, -7])
    // unset sketch
    sketch = null //置空当前绘制的要素对象
    // unset tooltip so that a new one can be created
    measureTooltipElement = null //置空测量工具提示框对象
    createMeasureTooltip() //重新创建一个测试工具提示框显示结果
    unByKey(listener)
  })
}
/**
 *创建一个新的帮助提示框（tooltip）
 */
function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement)
  }
  helpTooltipElement = document.createElement('div')
  helpTooltipElement.className = 'tooltip hidden'
  helpTooltip = new Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left',
  })
  map.value.addOverlay(helpTooltip)
}
/**
 *创建一个新的测量工具提示框（tooltip）
 */
function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement)
  }
  measureTooltipElement = document.createElement('div')
  measureTooltipElement.className = 'tooltip tooltip-measure'
  measureTooltip = new Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center',
  })
  map.value.addOverlay(measureTooltip)
}

/**
 * 让用户切换选择测量类型（长度/面积）
 * @param {Event} e Change event.
 */
watch(
  () => selectvalue.value,
  (newval, oldval) => {
    map.value.removeInteraction(draw.value)
    map.value?.addLayer(vector) //移除绘制图形
    addInteraction() //添加绘图进行测量
  },
)

/**
 * 测量长度输出
 * @param {ol.geom.LineString} line
 * @return {string}
 */
const formatLength = function (line) {
  let length

  length = Math.round(line.getLength() * 100) / 100 //直接得到线的长度

  let output
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km' //换算成KM单位
  } else {
    output = Math.round(length * 100) / 100 + ' ' + 'm' //m为单位
  }
  return output //返回线的长度
}
/**
 * 测量面积输出
 * @param {ol.geom.Polygon} polygon
 * @return {string}
 */
const formatArea = function (polygon) {
  let area

  area = polygon.getArea() //直接获取多边形的面积

  let output
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>' //换算成KM单位
  } else {
    output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>' //m为单位
  }
  return output //返回多边形的面积
}

// addInteraction() //调用加载绘制交互控件方法，添加绘图进行测量

const handleChange = (val: any) => {
  console.log(val)
}
const checkChange = (val: any) => {
  const layers = map.value.getAllLayers()

  if (val.includes('垃圾投放点')) {
    let rsirFlag = false
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].getProperties().title === '垃圾投放点') {
        rsirFlag = true
        break
      }
    }
    if (!rsirFlag) {
      map.value.addLayer(gSiteStore.gSite)
    }
  } else {
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].getProperties().title === '垃圾投放点') {
        map.value.removeLayer(layers[i])
        break
      }
    }
  }

  if (val.includes('垃圾中转站')) {
    let rsirFlag = false
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].getProperties().title === '垃圾中转站') {
        rsirFlag = true
        break
      }
    }
    if (!rsirFlag) {
      map.value.addLayer(gSiteStore.gStation)
    }
  } else {
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].getProperties().title === '垃圾中转站') {
        map.value.removeLayer(layers[i])
        break
      }
    }
  }
  if (val.includes('垃圾处理站')) {
    const arr = map.value.getAllLayers()
    let rsirFlag = false
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].getProperties().title == '垃圾处理站') {
        rsirFlag = true
      }
    }
    if (!rsirFlag) {
      map.value.addLayer(gSiteStore.gProcess)
    }
  } else {
    const arr = map.value.getAllLayers()
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].getProperties().title == '垃圾处理站') {
        map.value.removeLayer(arr[i])
      }
    }
  }
  if (val.includes('车辆出发点')) {
    const arr = map.value.getAllLayers()
    let rsirFlag = false
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].getProperties().title == '车辆出发点') {
        rsirFlag = true
      }
    }
    if (!rsirFlag) {
      map.value.addLayer(gSiteStore.depot)
    }
  } else {
    const arr = map.value.getAllLayers()
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].getProperties().title == '车辆出发点') {
        map.value.removeLayer(arr[i])
      }
    }
  }
  if (val.includes('道路路网')) {
    const arr = map.value.getAllLayers()
    let rsirFlag = false
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].getProperties().title == '道路路网') {
        rsirFlag = true
      }
    }
    if (!rsirFlag) {
      map.value.addLayer(gSiteStore.roadLayer)
    }
  } else {
    const arr = map.value.getAllLayers()
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].getProperties().title == '道路路网') {
        map.value.removeLayer(arr[i])
      }
    }
  }
  if (val.includes('建筑')) {
    const arr = map.value.getAllLayers()
    let rsirFlag = false
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].getProperties().title == '建筑') {
        rsirFlag = true
      }
    }
    if (!rsirFlag) {
      map.value.addLayer(gSiteStore.roadLayer)
    }
  } else {
    const arr = map.value.getAllLayers()
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].getProperties().title == '建筑') {
        map.value.removeLayer(arr[i])
      }
    }
  }
}
//刷新按钮点击回调
const updateRefsh = () => {
  selectvalue.value = ''
  layoutSettingStore.refsh = !layoutSettingStore.refsh
}
//全屏按钮点击的回调
const fullScreen = () => {
  //DOM对象的一个属性:可以用来判断当前是不是全屏模式[全屏:true,不是全屏:false]
  const full = document.fullscreenElement
  //切换为全屏模式
  if (!full) {
    //文档根节点的方法requestFullscreen,实现全屏模式
    document.documentElement.requestFullscreen()
  } else {
    //变为不是全屏模式->退出全屏模式
    document.exitFullscreen()
  }
}
//退出登录点击回调
const logout = async () => {
  //第一件事情:需要向服务器发请求[退出登录接口]******
  //第二件事情:仓库当中关于用于相关的数据清空[token|username|avatar]
  //第三件事情:跳转到登录页面
  await userStore.userLogout()
  //跳转到登录页面
  $router.push({ path: '/login', query: { redirect: $route.path } })
}

//颜色组件组件的数据
const color = ref('rgba(255, 69, 0, 0.68)')
const predefineColors = ref([
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  'rgba(255, 69, 0, 0.68)',
  'rgb(255, 120, 0)',
  'hsv(51, 100, 98)',
  'hsva(120, 40, 94, 0.5)',
  'hsl(181, 100%, 37%)',
  'hsla(209, 100%, 56%, 0.73)',
  '#c7158577',
])

//switch开关的chang事件进行暗黑模式的切换
const changeDark = () => {
  //获取HTML根节点
  const html = document.documentElement
  //判断HTML标签是否有类名dark
  dark.value ? (html.className = 'dark') : (html.className = '')
}

//主题颜色的设置
const setColor = () => {
  //通知js修改根节点的样式对象的属性与属性值
  const html = document.documentElement
  html.style.setProperty('--el-color-primary', color.value)
}

// onMounted(() => {
//   console.log(gSiteStore.map)
// })
// onUnmounted(unsubscribe)
</script>

<script lang="ts">
export default {
  name: 'Setting',
}
</script>
<style scoped lang="scss">
/**
* 提示框的样式信息
*/
.tooltip {
  position: relative;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  color: white;
  padding: 4px 8px;
  opacity: 0.7;
  white-space: nowrap;
}

.tooltip-measure {
  opacity: 1;
  font-weight: bold;
}

.tooltip-static {
  background-color: #ffcc33;
  color: black;
  border: 1px solid white;
}

.tooltip-measure:before,
.tooltip-static:before {
  border-top: 6px solid rgba(0, 0, 0, 0.5);
  border-right: 6px solid transparent;
  border-left: 6px solid transparent;
  content: '';
  position: absolute;
  bottom: -6px;
  margin-left: -7px;
  left: 50%;
}

.tooltip-static:before {
  border-top-color: #ffcc33;
}
</style>
