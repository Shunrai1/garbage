<template>
  <div class="container">
    <div class="top">
      <el-text class="font">方案详情</el-text>
    </div>
    <div class="table">
      <!-- <ul class="ul">
        <li>选择的候选点({{ uniqueNum }}/{{ num }})</li>
        <li>
          绘制研究区域的垃圾预产量：其他垃圾({{ otg }}/kg),厨余垃圾({{
            ktg
          }}/kg)
        </li>
        <li>垃圾投放点容量利用率:{{ grate }}</li>
        <li>最大步行距离:{{ maxd }}米</li>
        <li>最小步行距离:{{ mind }}米</li>
        <li>平均步行距离:{{ average }}米</li>
      </ul> -->
      <ul class="ul">
        <li>选择的候选点(16/22)</li>
        <li>
          绘制研究区域的垃圾预产量：其他垃圾(6945.90/kg),厨余垃圾(9261,20/kg)
        </li>
        <li>垃圾投放点容量利用率:0.90</li>
        <li>最大步行距离:200.861米</li>
        <li>最小步行距离:10.846米</li>
        <li>平均步行距离:70.109米</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, reactive, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import useSiteStore from '@/store/modules/site'
const route = useRoute()
const siteStore = useSiteStore()
const data = reactive({
  query: route.query,
})
const siteplan = siteStore.siteplan
const buildings = siteStore.buildings
const candidate = siteStore.candidate
const num = siteStore.num
const uniqueNum = ref()
const otg = ref()
const ktg = ref()
const grate = ref()
const maxd = ref()
const mind = ref()
const average = ref()
if (siteplan) {
  console.log(siteplan)
  const candidateData = siteplan.map((v) => v.c_id)
  const select = [...new Set(candidateData)]
  uniqueNum.value = select.length
  otg.value = buildings
    .map((v) => v.pop * 0.3)
    .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
    .toFixed(2)
  ktg.value = buildings
    .map((v) => v.pop * 0.4)
    .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
    .toFixed(2)
  const collect = candidate
    .filter((v) => select.indexOf(v.id) != -1)
    .map((v) => v.ogcapacity * 2)
    .reduce((acc, cur) => acc + cur, 0)
  console.log(collect)
  grate.value = (otg.value / collect).toFixed(2)
  maxd.value = Math.max(...siteplan.map((v) => v.cost)).toFixed(3)
  mind.value = Math.min(...siteplan.map((v) => v.cost)).toFixed(3)
  const total = siteplan
    .map((v) => v.cost)
    .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
  average.value = (total / siteplan.length).toFixed(3)
}

// if (!data.query.siteplan) {
//   siteplan.value = JSON.parse(data.query.siteplan)
//   num.value = data.query.num
//   console.log(num.value)
//   const candidateData = siteplan.value.map((v) => v.c_id)
//   uniqueNum.value = [...new Set(candidateData)].length
//   console.log(uniqueNum.value)
//   nextTick()
// }

const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
]
</script>

<style lang="scss" scoped>
.container {
  box-shadow: 0 0 10px rgba(0, 0, 0, 1);
  height: 100%;
  width: 100%;
  overflow: hidden;
  .top {
    display: flex;
    align-items: center;
    width: 95%;
    height: 10%;
    background-color: #d8d9d7;
    margin: 0 auto;
    margin-top: 30px;
    .font {
      margin-left: 30px;
      font-weight: bold;
      font-size: larger;
    }
  }
  .table {
    width: 95%;
    margin: 0 auto;
    border-top: 1px solid black;
    margin-top: 30px;
    .ul {
      margin-left: 10px;
      margin-top: 20px;
      li {
        margin: 20px 0;
      }
    }
  }
}
</style>
