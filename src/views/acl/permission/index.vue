<template>
  <el-table
    :data="PermissionArr"
    row-key="id"
    style="width: 100%; margin-bottom: 20px"
    border
  >
    <el-table-column prop="name" label="名称" />
    <el-table-column prop="code" label="权限值" />
    <el-table-column prop="updateTime" label="修改时间" sortable />
    <el-table-column prop="address" label="操作">
      <template v-slot="{ row }">
        <el-button
          type="primary"
          size="small"
          :disabled="row.level == 4 ? true : false"
          @click="addPermission(row)"
        >
          {{ row.level == 3 ? '添加功能' : '添加菜单' }}
        </el-button>
        <el-button type="primary" size="small" @click="updatePermisson(row)">
          编辑
        </el-button>
        <el-popconfirm title="确定删除吗?" @confirm="removeMenu(row.id)">
          <template #reference>
            <el-button type="primary" size="small">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>
  <!-- 对话框 -->
  <el-dialog
    v-model="dialogVisible"
    :title="menuData.id ? '更新菜单' : '添加菜单'"
  >
    <el-form label-width="80px">
      <el-form-item label="名称">
        <el-input placeholder="请输入菜单名称" v-model="menuData.name" />
      </el-form-item>
      <el-form-item label="权限值">
        <el-input placeholder="请输入权限值" v-model="menuData.code"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {
  reqAllPermission,
  reqAddOrUpdateMenu,
  reqRemoveMenu,
} from '@/api/acl/menu'
import { MenuParams, Permission, PermissionList } from '@/api/acl/menu/type'
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'

const PermissionArr = ref<PermissionList>([])
const dialogVisible = ref<boolean>(false)
const menuData = reactive<MenuParams>({
  code: '',
  level: 0,
  name: '',
  pid: 0,
})

const getHasPermission = async () => {
  const result = await reqAllPermission()
  if (result.code == 200) {
    PermissionArr.value = result.data
  }
}
const addPermission = (row: Permission) => {
  Object.assign(menuData, {
    code: '',
    level: 0,
    name: '',
    pid: 0,
  })
  menuData.id = undefined
  dialogVisible.value = true
  menuData.level = row.level + 1
  menuData.pid = row.id!
}
const updatePermisson = (row: Permission) => {
  Object.assign(menuData, row)
  dialogVisible.value = true
}
const save = async () => {
  const result = await reqAddOrUpdateMenu(menuData)
  if (result.code == 200) {
    dialogVisible.value = false
    ElMessage({
      type: 'success',
      message: menuData.id ? '更新成功' : '添加成功',
    })
    getHasPermission()
  } else {
    ElMessage({
      type: 'error',
      message: menuData.id ? '更新失败' : '添加失败',
    })
  }
}
const removeMenu = async (id: number) => {
  const result = await reqRemoveMenu(id)
  if (result.code == 200) {
    ElMessage({ type: 'success', message: '删除成功' })
    getHasPermission()
  }
}

onMounted(() => {
  getHasPermission()
})
</script>

<style scoped></style>
