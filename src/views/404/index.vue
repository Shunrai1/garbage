<template>
  <div class="box">
    <img src="../../assets/images/error_images/404.png" alt="" />
    <button @click="goHome">首页</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const $router = useRouter()

const goHome = () => {
  $router.replace('/home')
}
</script>

<style scoped lang="scss">
.box {
  width: 100%;
  height: 100%;
  color: skyblue;
  display: flex;
  justify-content: center;
  img {
    width: 800px;
    height: 800px;
  }
  button {
    width: 50%;
    height: 50%;
  }
}
</style>
