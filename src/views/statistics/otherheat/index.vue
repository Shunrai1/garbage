<template>
  <div class="container3">
    <div class="charts" ref="charts"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { reqAllSiteAPI, reqGetRateAPI } from '@/api/decision/gsite'
import { fromLonLat } from 'ol/proj'
import tianhe from '../../../../public/街道.json'
import axios from 'axios'
import { reqAllBuildingsAPI } from '@/api/decision/buildings'
const siteds = ref(0)
const sitews = ref(0)
const centerCoordinate = ref([113.37, 23.14])
const points = ref<any>([])
const tianhejson = ref()
const reqSite = async () => {
  const res = await reqAllBuildingsAPI()
  if (res.code == 200) {
    const tem = res.data
    tem.forEach((element) => {
      const p = [element.lon + '', element.lat + '', element.pop * 0.4]
      points.value.push(p)
    })
  }
}
const data = [
  ['113', '22', 41334],
  ['113', '22', 7883],
  ['113.2', '22.5', 5598],
  ['114', '22.5', 16346],
  ['115', '22.4', 11346],
  ['98.2', '39.7', 2686],
  ['114.0', '22.6', 2468],
  ['113', '22.62961', 11202],
  ['120', '22.72961', 6202],
  ['130', '24', 1036],
  ['113.90857800000003', '22.478785', 11936],
  ['113.92434300000002', '22.529534', 21713],
  ['113.95341200000007', '22.556386', 702],
  ['114.204648', '22.601526', 702],
]
console.log(data)
// const areaData = []
// data.map((item) => {
//   // 扩大热力图效果
//   areaData.push(...new Array(3).fill(item))
// })
// const mapMax = Math.max(...data.map((item) => item[2]))
// const mapMin = Math.min(...data.map((item) => item[2]))

//获取图形图标的DOM节点
const charts = ref()
onMounted(async () => {
  await reqSite()
  console.log(points.value)
  //初始化echarts实例
  const mycharts = echarts.init(charts.value)
  // 设置行政区边界数据
  echarts.registerMap('administrative', tianhe)
  const areaData = []
  points.value.map((item) => {
    areaData.push(item)
  })
  const mapMax = Math.max(...points.value.map((item) => item[2]))
  const mapMin = Math.min(...points.value.map((item) => item[2]))
  //设置配置项
  mycharts.setOption({
    backgroundColor: '#ccc',
    tooltip: {
      show: false,
      trigger: 'item',
      axisPointer: {
        type: 'shadow',
      },
    },

    visualMap: {
      bottom: 20,
      left: 10,
      show: true,
      color: [
        '#ff4601', // 红紫色
        '#f46d43', // 橙色
        '#fdae6b', // 浅橙色
        '#fee08b', // 黄色
        '#ffffbf', // 淡黄色
        '#d9ef8b', // 浅绿色
        '#a6d96a', // 绿色
        '#66bd63', // 深绿色
        '#1a9850',
      ], // 深蓝色  ],
      min: mapMin,
      max: mapMax,
      calculable: true,
      textStyle: {
        color: '#fff',
        fontSize: 12,
      },
      text: ['日产生量/kg'],
    },

    grid: {
      height: '100%',
      width: '100%',
    },

    geo: {
      map: 'administrative',
      roam: false,
      scaleLimit: {
        min: 1,
        max: 2,
      },
      zoom: 1.13,
      top: 40,
      label: {
        show: true,
        fontSize: '14',
        color: 'rgba(0,0,0,0.7)',
      },
      itemStyle: {
        normal: {
          areaColor: '#76b1ff',
          borderColor: '#eee',
          shadowColor: '#76b1ff',
          shadowBlur: 10,
          borderWidth: 1,
        },
        emphasis: {
          // 鼠标移入颜色
          areaColor: '#409EFF',
          borderWidth: 0,
        },
      },
    },

    series: [
      {
        name: 'AQI',
        type: 'heatmap',
        coordinateSystem: 'geo',
        blurSize: 10,
        pointSize: 7,
        data: areaData,
        // 鼠标移入
        emphasis: {
          show: false,
          itemStyle: {
            areaColor: 'rgb(255,255,0,1)',
          },
        },
      },
    ],
  })
})
</script>

<style lang="scss" scoped>
.container3 {
  .charts {
    height: 100%;
    width: 95%;
    margin: 0 auto;
    padding-top: 2%;
  }
}
</style>
