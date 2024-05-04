<template>
  <div class="container1">
    <div class="charts" ref="charts"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
//引入echarts
import * as echarts from 'echarts'
import { reqAllSiteAPI } from '@/api/decision/gsite'
import { reqAllStationAPI } from '@/api/decision/gstaion'
import { reqAllDepotAPI } from '@/api/decision/depot'
import { getAllProcessAPI } from '@/api/decision/process'
const siteCount = ref(0)
const stationCount = ref(0)
const depotCount = ref(30)
const processCount = ref(40)
const reqSite = async () => {
  const res = await reqAllSiteAPI(null, null, null)
  if (res.code == 200) {
    siteCount.value = res.data.total
  }
  const res1 = await reqAllStationAPI()
  if (res1.code == 200) {
    stationCount.value = res1.data.length
  }
  //   const res2 = await reqAllDepotAPI()
  //   if (res2.code == 200) {
  //     depotCount.value = res2.data.length
  //   }
  //   const res3 = await getAllProcessAPI()
  //   if (res3.code == 200) {
  //     processCount.value = res3.data.length
  //   }
}
const charts = ref()
//组件挂载完毕初始化图形图标
onMounted(async () => {
  await reqSite()
  const mychart = echarts.init(charts.value)
  //设置配置项
  const option = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      right: 50,
      top: 50,
      orient: 'vertical', //图例组件方向的设置
      textStyle: {
        color: 'black',
        fontSize: 14,
      },
    },
    series: [
      {
        name: '个数',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 20,
          borderColor: '#fff',
          borderWidth: 8,
        },
        label: {
          show: true,
          position: 'inside',
          color: 'black',
        },

        labelLine: {
          show: false,
        },
        data: [
          { value: siteCount.value, name: '垃圾投放点' },
          { value: stationCount.value, name: '其他垃圾中转站' },
          { value: processCount.value, name: '厨余垃圾处理站' },
          { value: depotCount.value, name: '车辆出发点' },
        ],
      },
    ],
    //调整图形图标的位置
    grid: {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    },
  }
  mychart.setOption(option)
})
</script>

<style scoped lang="scss">
.container1 {
  .charts {
    height: 260px;
    // height: 100%;
  }
}
</style>
