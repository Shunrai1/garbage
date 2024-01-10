<template>
  <el-card style="height: 80px">
    <el-form :inline="true" class="form">
      <el-form-item label="用户名">
        <el-input placeholder="请你输入用户名" v-model="keyword"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :disabled="keyword ? false : true"
          @click="search"
        >
          搜索
        </el-button>
        <el-button type="primary" @click="reset">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
  <el-card style="margin-top: 10px">
    <el-button type="primary" @click="addUser">添加用户</el-button>
    <el-button
      type="danger"
      :disabled="selectIdArr.length ? false : true"
      @click="deleteSelectUser"
    >
      批量删除
    </el-button>
    <el-table
      style="margin: 10px 0"
      border
      :data="userArr"
      @selection-change="selectChange"
    >
      <el-table-column
        label=""
        type="selection"
        align="center"
      ></el-table-column>
      <el-table-column label="#" type="index" align="center"></el-table-column>
      <el-table-column label="ID" align="center" prop="id"></el-table-column>
      <el-table-column
        label="用户名字"
        align="center"
        prop="username"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="用户名称"
        align="center"
        prop="name"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="用户角色"
        align="center"
        prop="roleName"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="更新时间"
        align="center"
        prop="updateTime"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column label="操作" width="300px" align="center">
        <template v-slot="{ row }">
          <el-button
            type="primary"
            icon="User"
            size="small"
            @click="setRole(row)"
          >
            分配角色
          </el-button>
          <el-button
            type="primary"
            icon="Edit"
            size="small"
            @click="updateUser(row)"
          >
            编辑
          </el-button>
          <el-popconfirm
            :title="`确定删除-${row.username}-吗?`"
            width="260px"
            @confirm="deleteUser(row.id)"
          >
            <template #reference>
              <el-button type="primary" icon="Delete" size="small">
                删除
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="pageNo"
      v-model:page-size="pageSize"
      :page-sizes="[5, 7, 9, 11]"
      :background="true"
      layout="prev, pager, next, jumper,->,sizes,total"
      :total="total"
      @current-change="getHasUser"
      @size-change="handler"
    />
  </el-card>
  <!-- 抽屉结构 -->
  <el-drawer v-model="drawer">
    <template #header>
      <h4>{{ userParams.id ? '编辑用户' : '添加用户' }}</h4>
    </template>
    <template #default>
      <el-form :model="userParams" :rules="rules" ref="formRef">
        <el-form-item label="用户姓名" prop="username">
          <el-input
            placeholder="请输入用户姓名"
            v-model="userParams.username"
          ></el-input>
        </el-form-item>
        <el-form-item label="用户昵称" prop="name">
          <el-input
            placeholder="请输入用户昵称"
            v-model="userParams.name"
          ></el-input>
        </el-form-item>
        <el-form-item v-if="!userParams.id" label="用户密码" prop="password">
          <el-input
            placeholder="请输入用户密码"
            v-model="userParams.password"
          ></el-input>
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <div>
        <el-button type="" @click="cancel">取消</el-button>
        <el-button type="primary" @click="save">确定</el-button>
      </div>
    </template>
  </el-drawer>
  <!-- 分配角色抽屉 -->
  <el-drawer v-model="drawer1">
    <template #header>
      <h4>分配角色</h4>
    </template>
    <template #default>
      <el-form>
        <el-form-item label="用户姓名">
          <el-input v-model="userParams.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="职位列表">
          <el-checkbox
            v-model="checkAll"
            :indeterminate="isIndeterminate"
            @change="handleCheckAllChange"
          >
            全选
          </el-checkbox>
          <!-- eslint-disable-next-line @typescript-eslint/ban-ts-comment  -->
          <!-- @ts-ignore -->
          <el-checkbox-group v-model="userRole" @change="handlerCheckedChange">
            <el-checkbox
              v-for="(role, index) in allRole"
              :key="index"
              :label="role"
            >
              {{ role.roleName }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="cancelClick">取消</el-button>
        <el-button type="primary" @click="confirmClick">确定</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from 'vue'
import {
  reqAddOrUpdateUser,
  reqUserInfo,
  reqAllRole,
  reqSetUserRole,
  reqRemoveUser,
  reqSelectUser,
} from '@/api/acl/user/index'
import type { AllRole, Records, SetRoleData, User } from '@/api/acl/user/type'
import useLayOutSettingStore from '@/store/modules/setting'
import { ElMessage } from 'element-plus'

const settingStore = useLayOutSettingStore()
const pageNo = ref<number>(1)
const pageSize = ref<number>(5)
const total = ref(0)
const userArr = ref<Records>([])
const drawer = ref<boolean>(false)
const userParams = reactive<User>({
  username: '',
  name: '',
  password: '',
})
const formRef = ref()
const drawer1 = ref<boolean>(false)
const checkAll = ref(false)
const isIndeterminate = ref(true)
const allRole = ref<AllRole>([])
const userRole = ref<any>([])
const selectIdArr = ref<number[]>([])
const keyword = ref<string>('')

const validatorUsername = (_rule: any, value: any, callBack: any) => {
  if (value.trim().length >= 5) {
    callBack()
  } else {
    callBack(new Error('用户名称至少5位'))
  }
}
const validatorname = (_rule: any, value: any, callBack: any) => {
  if (value.trim().length >= 5) {
    callBack()
  } else {
    callBack(new Error('用户昵称至少5位'))
  }
}
const validatorpassword = (_rule: any, value: any, callBack: any) => {
  if (value.trim().length >= 6) {
    callBack()
  } else {
    callBack(new Error('密码至少6位'))
  }
}
const rules = {
  username: [{ required: true, trigger: 'blur', validator: validatorUsername }],
  name: [{ required: true, trigger: 'blur', validator: validatorname }],
  password: [{ required: true, trigger: 'blur', validator: validatorpassword }],
}

const getHasUser = async (pager = 1) => {
  pageNo.value = pager
  const result = await reqUserInfo(pageNo.value, pageSize.value, keyword.value)
  if (result.code == 200) {
    total.value = result.data.total
    userArr.value = result.data.records
  }
}
const handler = () => {
  getHasUser()
}
const addUser = () => {
  nextTick(() => {
    formRef.value.resetFields()
  })
  userParams.id = undefined
  Object.assign(userParams, {
    username: '',
    name: '',
    password: '',
  })
  drawer.value = true
}
const updateUser = (row: User) => {
  drawer.value = true
  Object.assign(userParams, row)
  nextTick(() => {
    formRef.value.clearValidate('username')
    formRef.value.clearValidate('name')
  })
}
const save = async () => {
  await formRef.value.validate()
  const result = await reqAddOrUpdateUser(userParams)
  if (result.code == 200) {
    drawer.value = false
    ElMessage({
      type: 'success',
      message: userParams.id ? '更新成功' : '添加成功',
    })
    getHasUser(userParams.id ? pageNo.value : 1)
    //浏览器自动刷新一次
    window.location.reload()
  } else {
    ElMessage({
      type: 'error',
      message: userParams.id ? '更新失败' : '添加失败',
    })
  }
}
const cancel = () => {
  drawer.value = false
}
const setRole = async (row: User) => {
  Object.assign(userParams, row)
  const result = await reqAllRole(userParams.id!)
  if (result.code == 200) {
    allRole.value = result.data.allRolesList
    userRole.value = result.data.assignRoles
    isIndeterminate.value = userRole.value.length > 0
    drawer1.value = true
  }
}
const handleCheckAllChange = (val: any) => {
  userRole.value = val ? allRole.value : []
  isIndeterminate.value = false
}
const handlerCheckedChange = (value: any) => {
  const checkedCount = value.length
  checkAll.value = checkedCount === allRole.value.length
  isIndeterminate.value =
    checkedCount > 0 && checkedCount < allRole.value.length
}
const cancelClick = () => [(drawer1.value = false)]
const confirmClick = async () => {
  const data: SetRoleData = {
    userId: userParams.id!,
    roleIdList: userRole.value.map((i: any) => i.id!),
  }
  const result = await reqSetUserRole(data)
  if (result.code == 200) {
    ElMessage({
      type: 'success',
      message: '分配职务成功',
    })
    drawer1.value = false
    getHasUser(pageNo.value)
  }
}
const deleteUser = async (userId: number) => {
  const result = await reqRemoveUser(userId)
  if (result.code == 200) {
    ElMessage({
      type: 'success',
      message: '删除成功',
    })
    getHasUser(pageNo.value)
  } else {
    ElMessage({
      type: 'error',
      message: '删除失败',
    })
  }
}
const selectChange = (val: any) => {
  selectIdArr.value = val.map((v: any) => v.id)
}
const deleteSelectUser = async () => {
  const result: any = await reqSelectUser(selectIdArr.value)
  if (result.code == 200) {
    ElMessage({
      type: 'success',
      message: '删除成功',
    })
    getHasUser(pageNo.value)
  } else {
    ElMessage({
      type: 'error',
      message: '删除失败',
    })
  }
}
const search = async () => {
  getHasUser()
}
const reset = () => {
  settingStore.refsh = !settingStore.refsh
}

onMounted(() => {
  getHasUser()
})
</script>

<style scoped>
.form {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
