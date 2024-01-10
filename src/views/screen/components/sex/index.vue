<template>
  <div class="box1">
    <div class="title">
      <p>男女比例</p>
      <img src="../../images/dataScreen-title.png" alt="" />
    </div>
    <div class="sex">
      <div class="man">
        <img src="../../images/man.png" alt="" />
      </div>
      <div class="woman">
        <img src="../../images/woman.png" alt="" />
      </div>
    </div>
    <div class="rate">
      <p>男士58%</p>
      <p>女士42%</p>
    </div>
    <div class="charts" ref="chart"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import 'echarts-liquidfill'

const chart = ref()
onMounted(() => {
  //获取echarts类的实例
  const mycharts = echarts.init(chart.value)

  //设置实例的配置项
  mycharts.setOption({
    /** @type EChartsOption */
    xAxis: { show: false, min: 0, max: 100 },
    yAxis: { type: 'category', show: false },
    //系列:决定你展示什么样的图形图标
    series: [
      {
        type: 'bar',
        data: [58],
        barWidth: 20,
        z: 100,
        itemStyle: {
          color: 'blue',
          borderRadius: 20,
        },
      },
      {
        type: 'bar',
        data: [100],
        barWidth: 20,
        barGap: '-100%',
        itemStyle: {
          color: 'pink',
          borderRadius: 20,
        },
      },
    ],
    //布局组件
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
  })
})
</script>

<style scoped lang="scss">
.box1 {
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

  .sex {
    display: flex;
    justify-content: center;

    .man {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 111px;
      height: 115px;
      margin: 20px;
      background: url('../../images/man-bg.png') no-repeat;
      background-size: cover;
    }

    .woman {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 111px;
      height: 115px;
      margin: 20px;
      background: url('../../images/woman-bg.png') no-repeat;
    }
  }

  .rate {
    display: flex;
    justify-content: space-between;
    color: white;
  }

  .charts {
    width: 100%;
    height: 40px;
  }
}
</style>
