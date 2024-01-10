<template>
  <div class="box4" ref="map"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import chinaJSON from './china.json'

const map = ref()
echarts.registerMap('china', chinaJSON as any)

onMounted(() => {
  const mychart = echarts.init(map.value)
  /** @type EChartsOption */
  const option = {
    geo: {
      map: 'china',
      roam: true,
      left: 50,
      top: 100,
      right: 50,
      bottom: 50,
      label: {
        show: true,
        color: 'white',
        fontSize: 12,
      },
      itemStyle: {
        //每一个多边形的样式
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: 'red', // 0% 处的颜色
            },
            {
              offset: 1,
              color: 'blue', // 100% 处的颜色
            },
          ],
          global: false, // 缺省为 false
        },
        opacity: 0.8,
      },
      emphasis: {
        label: {
          fontSize: 40,
        },
      },
    },
    series: [
      {
        type: 'lines',
        data: [
          {
            coords: [
              [116.4062, 39.84923],
              [119.342, 26.0883],
            ],
            lineStyle: {
              color: 'orange',
              width: 10,
            },
          },
          {
            coords: [
              [116.4062, 39.84923],
              [111.29, 30.72],
            ],
            lineStyle: {
              color: 'orange',
              width: 10,
            },
          },
        ],
        effect: {
          show: true,
          symbol: 'arrow',
          color: 'red',
          symbolSize: 30,
        },
      },
    ],
  }
  mychart.setOption(option)
})
</script>

<style scoped lang="scss">
.box4 {
  width: 100%;
  height: 100%;
}
</style>
