<template>
  <div class="container">
    <div class="charts" ref="charts"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { reqGetRateAPI } from '@/api/decision/gsite'
const siteds = ref(0)
const sitews = ref(0)
const getSiteRate = async () => {
  const res = await reqGetRateAPI()
  if (res.code == 200) {
    siteds.value = res.data.dsCount
    sitews.value = res.data.wsCount
  }
}
//获取图形图标的DOM节点
const charts = ref()
onMounted(async () => {
  await getSiteRate()
  //初始化echarts实例
  const mycharts = echarts.init(charts.value)
  //设置配置项
  mycharts.setOption({
    // tooltip: {
    //   trigger: 'axis',
    //   axisPointer: {
    //     type: 'shadow',
    //   },
    // },
    grid: { left: '20%', right: '20%' },
    xAxis: { type: 'value', show: false },
    yAxis: {
      type: 'category',
      show: false,
      axisTick: {
        show: false,
      },
    },
    series: [
      {
        type: 'bar',
        name: '定时垃圾投放点数',
        data: [siteds.value],
        stack: 'income',
        barWidth: 12,
        itemStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              { offset: 0, color: '#6EB7FF' },
              { offset: 1, color: '#0059FF' },
            ]),
          },
        },
        label: {
          show: true,
          position: 'top',
          offset: [0, 0],
          color: '#000',
          formatter: '{a}   {c}',
        },
      },
      {
        type: 'bar',
        name: '误时垃圾投放点数',
        data: [sitews.value],
        stack: 'income',
        barWidth: 12,
        itemStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              { offset: 0, color: '#FFA300' },
              { offset: 1, color: '#FFD16E' },
            ]),
          },
        },
        label: {
          show: true,
          position: 'top',
          color: '#000',
          offset: [0, 0],
          formatter: '{c}   {a}',
        },
      },
    ],
  })
})
</script>

<style lang="scss" scoped>
.container {
  .charts {
    height: 100px;
    // height: 100%;
  }
}
</style>
