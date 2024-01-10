<template>
  <div class="box2">
    <div class="title">
      <p>年龄比例</p>
      <img src="../../images/dataScreen-title.png" alt="" />
    </div>
    <div class="charts" ref="charts"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as echarts from 'echarts'

const charts = ref()

onMounted(() => {
  const mycharts = echarts.init(charts.value)
  /** @type EChartsOption */
  const option = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      top: 40,
      right: 20,
      orient: 'vertical',
      textStyle: {
        color: 'white',
        fontSize: 14,
      },
    },
    series: [
      {
        name: 'Access From',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          position: 'inside',
          color: 'white',
        },

        labelLine: {
          show: false,
        },
        data: [
          { value: 1048, name: '军事' },
          { value: 735, name: '新闻' },
          { value: 580, name: '财经' },
          { value: 484, name: '娱乐' },
          { value: 300, name: '教育' },
        ],
      },
    ],
    grid: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
  }
  mycharts.setOption(option)
})
</script>

<style scoped lang="scss">
.box2 {
  width: 100%;
  height: 100%;
  margin-top: 20px;
  background: url('../../images/dataScreen-main-cb.png') no-repeat;
  background-size: 100% 100%;

  .title {
    margin-left: 20px;

    p {
      font-size: 20px;
      color: white;
    }
  }

  .charts {
    width: 100%;
    height: 200px;
  }
}
</style>
