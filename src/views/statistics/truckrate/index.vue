<template>
  <div class="container5">
    <div class="charts" ref="charts"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { reqGetRateAPI } from '@/api/decision/gsite'
const siteds = ref(50)
const sitews = ref(8)
// const getSiteRate = async () => {
//   const res = await reqGetRateAPI()
//   if (res.code == 200) {
//     siteds.value = res.data.dsCount
//     sitews.value = res.data.wsCount
//   }
// }
//获取图形图标的DOM节点
const charts = ref()
onMounted(async () => {
  //   await getSiteRate()
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
    grid: { left: '20%', right: '29%' },
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
        name: '其他垃圾运输车数',
        data: [siteds.value],
        stack: 'income',
        barWidth: 12,
        itemStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              { offset: 1, color: '#7B817A' },
              { offset: 0, color: '#ABAEAA' },
            ]),
          },
        },
        label: {
          show: true,
          position: 'top',
          offset: [-60, 0],
          color: '#000',
          formatter: '{a}   {c}',
        },
      },
      {
        type: 'bar',
        name: '厨余垃圾运输车数',
        data: [sitews.value],
        stack: 'income',
        barWidth: 12,
        itemStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              { offset: 1, color: '#80DD69' },
              { offset: 0, color: '#64BA4F' },
            ]),
          },
        },
        label: {
          show: true,
          position: 'top',
          color: '#000',
          offset: [-60, 0],
          formatter: '{c}   {a}',
        },
      },
    ],
  })
})
</script>

<style scoped lang="scss">
.container5 {
  .charts {
    height: 100px;
    // height: 100%;
  }
}
</style>
