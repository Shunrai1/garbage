<template>
  <div class="top">
    <div class="left">
      fdhi
      <div class="lbtn" @click="goHome">首页</div>
    </div>
    <div class="center">
      <div class="title">智慧旅游可视化大数据展示平台</div>
    </div>
    <div class="right">
      <span class="rbtn">统计报告</span>
      <span class="time">当前时间: {{ time }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import moment from 'moment'

const $router = useRouter()
const time = ref(moment().format('YYYY-MM-DD hh:mm:ss'))
const timer = ref()

const goHome = () => {
  $router.push('/home')
}

onMounted(() => {
  timer.value = setInterval(() => {
    time.value = moment().format('YYYY-MM-DD hh:mm:ss')
  }, 1000)
})
onUnmounted(() => {
  clearInterval(timer.value)
})
</script>

<style scoped lang="scss">
.top {
  display: flex;
  width: 100%;
  height: 40px;

  .left {
    flex: 1;
    background: url('../../images//dataScreen-header-left-bg.png') no-repeat;
    background-size: cover;

    .lbtn {
      float: right;
      width: 150px;
      height: 40px;
      font-size: 20px;
      line-height: 40px;
      color: #28fcff;
      text-align: center;
      background: url('../../images/dataScreen-header-btn-bg-l.png') no-repeat;
    }
  }

  .center {
    flex: 2;

    .title {
      width: 100%;
      height: 74px;
      font-size: 30px;
      line-height: 74px;
      color: #28fcff;
      text-align: center;
      background: url('../../images/dataScreen-header-center-bg.png') no-repeat;
      background-size: cover;
    }
  }

  .right {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: space-between;
    background: url('../../images/dataScreen-header-left-bg.png') no-repeat;
    background-size: cover;

    .rbtn {
      width: 150px;
      height: 40px;
      font-size: 20px;
      line-height: 40px;
      color: #28fcff;
      text-align: center;
      background: url('../../images/dataScreen-header-btn-bg-r.png') no-repeat;
    }

    .time {
      margin-right: 30px;
      font-size: 20px;
      color: #28fcff;
    }
  }
}
</style>
