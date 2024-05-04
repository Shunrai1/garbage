<template>
  <el-card>
    <div class="box">
      <img :src="userStore.avatar" alt="" class="avatar" />
      <div class="bottom">
        <h3 class="title">{{ getTime() }}好呀 {{ userStore.username }}</h3>
        <p>生活垃圾分类规划平台</p>
      </div>
    </div>
  </el-card>
  <div class="bottoms">
    <svg-icon name="welcome" width="500px" height="500px"></svg-icon>
  </div>
</template>

<script setup lang="ts">
import useUserStore from '@/store/modules/user'
import { onMounted } from 'vue'
import { getTime } from '@/utils/time'
const userStore = useUserStore()
//首页挂载完毕发请求获取用户信息
onMounted(() => {
  userStore.userInfo()
})
</script>

<style scoped lang="scss">
.box {
  display: flex;

  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
  }

  .bottom {
    margin-left: 20px;

    .title {
      margin-bottom: 20px;
      font-size: 40px;
      font-weight: 900;
    }

    p {
      font-style: italic;
      color: skyblue;
    }
  }
}

.bottoms {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
</style>
