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
const siteds = ref(0)
const sitews = ref(0)
const centerCoordinate = ref([113.37, 23.14])
const points = ref<any>([])
const tianhejson = ref()

//获取图形图标的DOM节点
const charts = ref()

const tianheData = []
tianhe.features.forEach((item) => {
  const townLevel = item.properties.name
  const permanentPopulation = item.properties.density
  tianheData.push({
    name: townLevel,
    value: permanentPopulation,
  })
})
onMounted(async () => {
  //初始化echarts实例
  const mycharts = echarts.init(charts.value)
  // 设置行政区边界数据
  echarts.registerMap('administrative', tianhe)
  //设置配置项
  mycharts.setOption({
    tooltip: {
      triggerOn: 'click',
      formatter: function (e, t, n) {
        return e.seriesName + '<br />' + e.name + '：' + e.value
      },
    },
    geo: [
      {
        map: 'administrative',
        roam: true,
        scaleLimit: {
          min: 1,
          max: 2,
        },
        zoom: 1.13,
        top: 50,
        label: {
          show: true,
          fontSize: '14',
          color: 'rgba(0,0,0,0.7)',
        },
        itemStyle: {
          borderColor: 'rgba(0, 0, 0, 0.2)',
        },
        emphasis: {
          areaColor: '#f2d5ad',
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          borderWidth: 0,
        },
      },
    ],
    visualMap: {
      show: true,
      top: 'top',
      min: 888.39,
      max: 44372.6,
      seriesIndex: 0,
      text: ['人口数/平方公里'],
      calculable: true,
      inRange: {
        color: ['blue', 'green', 'yellow', 'red'],
      },
    },

    series: [
      {
        name: '人口密度',
        type: 'map',
        coordinateSystem: 'geo',
        geoIndex: 0,
        data: tianheData,
        roam: true,
        map: 'administrative',
        emphasis: {
          label: {
            show: true,
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
