<template>
  <div class="container3">
    <div id="mapcontainer" ref="mapRef"></div>
  </div>
</template>

<script setup lang="ts">
import { Feature, Map, View } from 'ol'
import { Heatmap } from 'ol/layer'
import { Zoom, ZoomToExtent, defaults } from 'ol/control'
import TileLayer from 'ol/layer/Tile'
import { fromLonLat } from 'ol/proj'
import XYZ from 'ol/source/XYZ'
import { ref, onMounted } from 'vue'
import { reqAllSiteAPI } from '@/api/decision/gsite'
import { Point } from 'ol/geom'
import { Vector } from 'ol/source'

const mapRef = ref()
const map = ref<Map>()
const centerCoordinate = ref([113.36, 23.16])
const zoom = ref(12)
const view = ref<View>()
const gaode = ref<TileLayer<any>>()
const vectorSign = ref<TileLayer<any>>()
const points = ref<any>([])
const reqSite = async () => {
  const res = await reqAllSiteAPI(null, null, null)
  if (res.code == 200) {
    const tem = res.data.records
    tem.forEach((element) => {
      const lon = element.longitude
      const lat = element.latitude
      const intensity = 1
      const p = {
        lon,
        lat,
        intensity,
      }
      points.value.push(p)
    })
  }
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
    }),
  })

  // 假设您已经获取到数据库中的点坐标数据并存储在名为 points 的数组中

  // 数据预处理
  const heatData = []
  for (let i = 0; i < points.value.length; i++) {
    const point = points.value[i]
    // 将点坐标和强度值添加到热力图数据集
    heatData.push({
      geometry: new Point(fromLonLat([point.lon, point.lat])),
      value: point.intensity,
    })
  }

  // // 创建热力图图层
  const heatLayer = new Heatmap({
    source: new Vector({
      features: heatData.map(function (data) {
        return new Feature({
          geometry: data.geometry,
          weight: data.value,
        })
      }),
    }),
    blur: 15, // 模糊半径
    radius: 5, // 热力图点的半径
  })

  // 添加热力图图层
  map.value.addLayer(heatLayer)
}
onMounted(async () => {
  await reqSite()
  await initMap()
})
</script>

<style lang="scss" scoped>
.container3 {
  #mapcontainer {
    height: 100%;
    width: 95%;
    margin: 0 auto;
    padding-top: 2%;
  }
}
</style>
