<template>
  <div class="box">
    <div class="topleft">
      <Siterate class="s1" />
      <Truckrate class="s2" />
      <Sortrate class="s3" />
    </div>
    <div class="topright">
      <Heatmap class="headmap" v-if="radio2 == '1'" />
      <Streetmap class="headmap" v-if="radio2 == '2'" />
      <Otherheat class="headmap" v-if="radio2 == '3'"></Otherheat>
      <Kitchenmap class="headmap" v-if="radio2 == '4'" />
      <div class="btns">
        <el-radio-group v-model="radio2">
          <el-radio-button label="1">垃圾投放点热力图</el-radio-button>
          <el-radio-button label="2">街道人口密度</el-radio-button>
          <el-radio-button label="3">其他垃圾预产量</el-radio-button>
          <el-radio-button label="4">厨余垃圾预产量</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <div class="buttom">
      <Truckcost />
    </div>
  </div>
</template>
r

<script setup lang="ts">
import { ref } from 'vue'
import Siterate from './siterate/index.vue'
import Sortrate from './sortrate/index.vue'
import Heatmap from './heatmap/index.vue'
import Truckcost from './truckcost/index.vue'
import Truckrate from './truckrate/index.vue'
import Otherheat from './otherheat/index.vue'
import Streetmap from './streetmap/index.vue'
import Kitchenmap from './kitchenheat/index.vue'
const radio2 = ref('1')
</script>

<style lang="scss" scoped>
.box {
  box-shadow: 0 0 10px rgba(0, 0, 0, 1);
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  height: 100%;
  width: 100%;
  .topleft {
    width: 50%;
    height: 45%;
    .s1 {
      height: 10%;
    }
    .s2 {
      height: 10%;
    }
    .s3 {
      height: 80%;
    }
  }
  .topright {
    width: 50%;
    height: 45%;
    display: flex;
    flex-direction: column;
    // overflow: hidden;
    .headmap {
      height: 95%;
    }
    .btns {
      // height: 5%;
      margin-top: 3px;
      text-align: center;
    }
  }
  .buttom {
    background-color: aqua;
    padding-top: 5%;
    height: 50%;
    width: 100%;
  }
}
</style>
