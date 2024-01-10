<template>
  <div class="container">
    <div class="screen" ref="screen">
      <Top />
      <div class="bottom">
        <div class="left">
          <Tourist class="tourist" />
          <Sex class="sex" />
          <Age class="age" />
        </div>
        <div class="center">
          <Map class="map" />
          <Line class="line" />
        </div>
        <div class="right">
          <Rank class="rank" />
          <Year class="year" />
          <Counter class="counter" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Top from './components/top/index.vue'
import Age from './components/age/index.vue'
import Sex from './components/sex/index.vue'
import Tourist from './components/tourist/index.vue'
import Map from './components/map/index.vue'
import Line from './components/line/index.vue'
import Rank from './components/rank/index.vue'
import Year from './components/year/index.vue'
import Counter from './components/counter/index.vue'

const screen = ref()

onMounted(() => {
  screen.value.style.transform = `scale(${getScale()}) translate(-50%,-50%)`
})
//定义大屏缩放比例
function getScale(w = 1920, h = 1080) {
  const ww = window.innerWidth / w
  const wh = window.innerHeight / h
  return ww < wh ? ww : wh
}
window.onresize = () => {
  screen.value.style.transform = `scale(${getScale()}) translate(-50%,-50%)`
}
</script>

<style scoped lang="scss">
.container {
  width: 100vw;
  height: 100vh;
  background: url('./images/bg.png') no-repeat;
  background-size: cover;

  .screen {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 1920px;
    height: 1080px;
    transform-origin: left top;

    .bottom {
      display: flex;

      .right {
        display: flex;
        flex: 1;
        flex-direction: column;

        .rank {
          flex: 1.3;
        }

        .year {
          flex: 1;
        }

        .counter {
          flex: 1;
        }
      }

      .center {
        display: flex;
        flex: 2;
        flex-direction: column;

        .map {
          flex: 4;
        }

        .line {
          flex: 1;
        }
      }

      .left {
        display: flex;
        flex: 1;
        flex-direction: column;
        height: 1040px;

        .tourist {
          flex: 1.3;
        }

        .sex {
          flex: 1;
        }

        .age {
          flex: 1;
        }
      }
    }
  }
}
</style>
