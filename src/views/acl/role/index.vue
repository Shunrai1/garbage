<template>
  <el-card style="height: 80px">
    <el-form :inline="true" class="form">
      <el-form-item label="职位搜索">
        <el-input placeholder="请你输入职位名称" v-model="keyword"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="search"
          :disabled="keyword ? false : true"
        >
          搜索
        </el-button>
        <el-button type="primary" @click="reset">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
  <el-card style="margin-top: 10px">
    <el-button type="primary" @click="addRole" icon="Plus">添加职位</el-button>
    <el-table style="margin: 10px 0" border :data="allRole">
      <el-table-column label="#" type="index" align="center"></el-table-column>
      <el-table-column label="ID" align="center" prop="id"></el-table-column>
      <el-table-column
        label="职位名称"
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
            @click="setPermission(row)"
          >
            分配权限
          </el-button>
          <el-button
            type="primary"
            icon="Edit"
            size="small"
            @click="updateRole(row)"
          >
            编辑
          </el-button>
          <el-popconfirm
            :title="`确定删除-${row.roleName}-吗?`"
            width="260px"
            @confirm="deleteRole(row.id)"
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
      @current-change="getHasRole"
      @size-change="handler"
    />
  </el-card>

  <el-dialog
    v-model="dialogVisble"
    :title="RoleParams.id ? '更新职位' : '添加职位'"
  >
    <el-form :model="RoleParams" :rules="rules" ref="formRef">
      <el-form-item label="职位名称" prop="roleName">
        <el-input placeholder="请输入职位名称" v-model="RoleParams.roleName" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisble = false">取消</el-button>
        <el-button type="primary" @click="save">确定</el-button>
      </span>
    </template>
  </el-dialog>
  <!-- 抽屉结构 -->
  <el-drawer v-model="drawer">
    <template #header>
      <h4>分配菜单与按钮权限</h4>
    </template>
    <template #default>
      <el-tree
        ref="tree"
        :data="menuArr"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="selectArr"
        :props="defaultProps"
      />
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="drawer = false">取消</el-button>
        <el-button type="primary" @click="confirmClick">确定</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from 'vue'
import {
  reqAllRoleList,
  reqAddOrUpdateRole,
  reqAllMenuList,
  reqSetPermission,
  reqRemoveRole,
} from '@/api/acl/role/index'
import { MenuList, Records, RoleData } from '@/api/acl/role/type'
import useLayOutSettingStore from '@/store/modules/setting'
import { ElMessage } from 'element-plus'

const settingStore = useLayOutSettingStore()
const pageNo = ref<number>(1)
const pageSize = ref<number>(5)
const total = ref<number>(0)
const keyword = ref<string>('')
const allRole = ref<Records>([])
const dialogVisble = ref<boolean>(false)
const RoleParams = reactive<RoleData>({
  roleName: '',
})
const formRef = ref()
const drawer = ref<boolean>(false)
const selectArr = ref<[]>([])
const menuArr = ref<MenuList>([])
const tree = ref()
const defaultProps = {
  children: 'children',
  label: 'name',
}

const validatorRoleName = (_rule: any, value: any, callBack: any) => {
  if (value.trim().length >= 2) {
    callBack()
  } else {
    callBack(new Error('职位名称必须大于等于两位'))
  }
}
const rules = {
  roleName: [{ required: true, trigger: 'blur', validator: validatorRoleName }],
}

const getHasRole = async (pager = 1) => {
  pageNo.value = pager
  const result = await reqAllRoleList(
    pageNo.value,
    pageSize.value,
    keyword.value,
  )
  console.log(result)
  if (result.code == 200) {
    allRole.value = result.data.records
    total.value = result.data.total
  }
}
const handler = () => {
  getHasRole()
}
const search = () => {
  getHasRole()
}
const reset = () => {
  settingStore.refsh = !settingStore.refsh
}
const addRole = () => {
  Object.assign(RoleParams, {
    roleName: '',
  })
  RoleParams.id = undefined
  nextTick(() => {
    formRef.value.clearValidate('roleName')
  })
  dialogVisble.value = true
}
const updateRole = (row: RoleData) => {
  Object.assign(RoleParams, row)
  nextTick(() => {
    formRef.value.clearValidate('roleName')
  })
  dialogVisble.value = true
}
const save = async () => {
  await formRef.value.validate()
  const result = await reqAddOrUpdateRole(RoleParams)
  if (result.code == 200) {
    ElMessage({
      type: 'success',
      message: RoleParams.id ? '更新成功' : '添加成功',
    })
    dialogVisble.value = false
    getHasRole(RoleParams.id ? pageNo.value : 1)
  } else {
    ElMessage({
      type: 'error',
      message: RoleParams.id ? '更新失败' : '添加失败',
    })
  }
}
const setPermission = async (row: RoleData) => {
  drawer.value = true
  Object.assign(RoleParams, row)
  const result = await reqAllMenuList(RoleParams.id!)
  if (result.code == 200) {
    menuArr.value = result.data
    selectArr.value = filterSelectArr(menuArr.value, [])
  }
}
const filterSelectArr = (allData: any, initArr: any) => {
  allData.forEach((item: any) => {
    if (item.select && (!item.children || item.children.length == 0)) {
      initArr.push(item.id)
    }
    if (item.children && item.children.length > 0) {
      filterSelectArr(item.children, initArr)
    }
  })
  return initArr
}
const confirmClick = async () => {
  const roleId = RoleParams.id
  const arr = tree.value.getCheckedKeys()
  const arr1 = tree.value.getHalfCheckedKeys()
  const permissionId = arr.concat(arr1)
  const result = await reqSetPermission(roleId!, permissionId)
  if (result.code == 200) {
    ElMessage({
      type: 'success',
      message: '分配权限成功',
    })
    drawer.value = false
    setTimeout(() => {
      window.location.reload()
    }, 300)
  } else {
    ElMessage({
      type: 'error',
      message: '分配权限失败',
    })
  }
}
const deleteRole = async (id: number) => {
  const result = await reqRemoveRole(id)
  if (result.code == 200) {
    ElMessage({
      type: 'success',
      message: '删除成功',
    })
    getHasRole(pageNo.value)
  }
}

onMounted(() => {
  getHasRole()
})
</script>

<style scoped>
.form {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
