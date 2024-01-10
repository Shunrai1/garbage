<template>
  <div class="login_container">
    <el-row>
      <el-col :span="12" :xs="0" :offset="0"></el-col>
      <el-col :span="12" :xs="24" :offset="0">
        <el-form
          class="login_form"
          :model="loginForm"
          :rules="rules"
          ref="loginForms"
        >
          <h1>Hello</h1>
          <h2>欢迎来到尚谷甄选</h2>
          <el-form-item prop="username">
            <el-input
              prefix-icon="User"
              v-model="loginForm.username"
            ></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              prefix-icon="Lock"
              type="password"
              v-model="loginForm.password"
              show-password
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              class="login_btn"
              type="primary"
              size="default"
              @click="login"
              :loading="loading"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import useUserStore from '@/store/modules/user'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import { getTime } from '@/utils/time'
import { useRoute } from 'vue-router'
const $route = useRoute()
//引入用户相关的小仓库
const useStore = useUserStore()
//收集账号与密码的数据
const loginForm = reactive({ username: 'admin', password: 'atguigu123' })
const loginForms = ref()
const rules = {
  username: [
    {
      required: true,
      min: 5,
      max: 10,
      message: '账号长度在5-10位之间',
      trigger: 'blur',
    },
  ],
  password: [
    {
      required: true,
      min: 6,
      max: 10,
      message: '密码长度在6-10位之间',
      trigger: 'blur',
    },
  ],
}
//获取路由器
const $router = useRouter()
//路由对象
// const $route = useRoute()
const loading = ref(false) //按钮加载效果
//登录按钮回调
const login = async () => {
  //保存全部表单校验通过后再发请求
  await loginForms.value.validate()
  loading.value = true
  //这里可以使用.then
  try {
    await useStore.userLogin(loginForm)
    const redirect: any = $route.query.redirect
    $router.push({ path: redirect || '/' })
    ElNotification({
      type: 'success',
      message: '登录成功',
      title: `HI,${getTime()}好！`,
    })
    loading.value = false
  } catch (error) {
    loading.value = false
    ElNotification({
      type: 'error',
      message: (error as Error).message,
    })
  }
}
</script>

<style scoped lang="scss">
.login_container {
  width: 100%;
  height: 100vh;
  background: url('@/assets/images/background.jpg') no-repeat;
  background-size: cover;

  .login_form {
    position: relative;
    top: 30vh;
    width: 80%;
    padding: 40px;
    background: url('@/assets/images/login_form.png');
    background-size: cover;

    h1 {
      font-size: 40px;
      color: white;
    }

    h2 {
      margin: 20px 0;
      font-size: 20px;
      color: white;
    }

    .login_btn {
      width: 100%;
    }
  }
}
</style>
