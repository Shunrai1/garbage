<template>
  <div class="container4">
    <div class="charts" ref="myChart"></div>
  </div>
</template>

<script setup lang="ts">
import { getAllTruckAPI } from '@/api/decision/truck'
import * as echarts from 'echarts'
import { onMounted, ref } from 'vue'

const myChart = ref()
const trucksname = ref()
const truckcost = ref()
const getTruck = async () => {
  const res = await getAllTruckAPI(null, null, null)
  if (res.code == 200) {
    trucksname.value = res.data.records.map((v) => v.carnumber)
    truckcost.value = res.data.records.map((v) => v.routeCost)
  }
}
onMounted(async () => {
  await getTruck()
  //初始化echarts实例
  const mycharts = echarts.init(myChart.value)
  mycharts.setOption({
    title: {
      //   text: '车辆运输成本/元',
      subtext: '车辆运输成本/元',
      left: '100',
    },
    tooltip: {
      trigger: 'axis',
    },
    // legend: {
    //   data: ['Rainfall', 'Evaporation'],
    // },
    calculable: true,
    xAxis: [
      {
        type: 'category',
        // prettier-ignore
        data:trucksname.value,
      },
    ],
    yAxis: [
      {
        type: 'value',
      },
    ],
    series: [
      {
        name: '车辆运输成本',
        type: 'bar',
        data: truckcost.value,
        markPoint: {
          data: [
            { type: 'max', name: 'Max' },
            { type: 'min', name: 'Min' },
          ],
        },
        markLine: {
          data: [{ type: 'average', name: 'Avg' }],
        },
      },
    ],
  })
})
</script>

<style scoped lang="scss">
.container4 {
  height: 100%;
  width: 100%;
  .charts {
    height: 100%;
    width: 100%;
  }
}
</style>
