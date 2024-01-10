<template>
  <!-- 三级分类全局属性 -->
  <Category :scene="scene" />
  <el-card style="margin: 10px 0">
    <div v-show="scene == 0">
      <el-button
        type="primary"
        size="default"
        icon="Plus"
        :disabled="categoryStore.c3Id ? false : true"
        @click="addAttr"
      >
        添加平台属性
      </el-button>
      <el-table border style="margin: 10px 0" :data="attrArr">
        <el-table-column
          label="序号"
          type="index"
          align="center"
          width="80px"
        ></el-table-column>
        <el-table-column
          label="属性名称"
          align="center"
          width="120px"
          prop="attrName"
        ></el-table-column>
        <el-table-column label="属性值名称" align="center">
          <template v-slot="{ row }">
            <el-tag
              v-for="item in row.attrValueList"
              :key="item.id"
              style="margin: 0 5px"
            >
              {{ item.valueName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120px">
          <template v-slot="{ row }">
            <el-button
              icon="Edit"
              size="small"
              type="primary"
              @click="updateAttr(row)"
            ></el-button>

            <el-popconfirm
              :title="`你确定删除${row.attrName}`"
              @confirm="deleteAttr(row.id)"
            >
              <template #reference>
                <el-button
                  icon="Delete"
                  size="small"
                  type="primary"
                ></el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-show="scene == 1">
      <el-form :inline="true">
        <el-form-item label="属性名称">
          <el-input
            v-model="attrParams.attrName"
            placeholder="请输入属性名称"
          ></el-input>
        </el-form-item>
      </el-form>
      <el-button
        type="primary"
        icon="Plus"
        :disabled="attrParams.attrName ? false : true"
        @click="addAttrValue"
      >
        添加属性值
      </el-button>
      <el-button @click="cancel">取消</el-button>
      <el-table :data="attrParams.attrValueList" border style="margin: 10px 0">
        <el-table-column
          label="序号"
          width="80px"
          type="index"
          align="center"
        ></el-table-column>
        <el-table-column label="属性值名称">
          <template v-slot="{ row, $index }">
            <el-input
              :ref="(vc) => (inputArr[$index] = vc)"
              v-if="row.flag"
              placeholder="请输入属性值名称"
              @blur="toLook(row, $index)"
              v-model="row.valueName"
            ></el-input>
            <div v-else @click="toEdit(row, $index)">{{ row.valueName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="属性值操作">
          <template v-slot="{ $index }">
            <el-button
              type="primary"
              size="small"
              icon="Delete"
              @click="attrParams.attrValueList.splice($index, 1)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button
        type="primary"
        @click="save"
        :disabled="attrParams.attrValueList.length > 0 ? false : true"
      >
        保存
      </el-button>
      <el-button @click="cancel">取消</el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import useCategoryStore from '@/store/modules/category'
import { watch, ref, reactive, onMounted, nextTick } from 'vue'
import type { Attr, AttrValue } from '@/api/product/attr/type.d'
import { reqAttr, reqAddOrUpdateAttr, reqRemoveAttr } from '@/api/product/attr'
import { ElMessage } from 'element-plus'

const categoryStore = useCategoryStore()
const attrArr = ref<Attr[]>([])
const scene = ref<number>(0)
const attrParams = reactive<Attr>({
  attrName: '',
  attrValueList: [],
  categoryId: '',
  categoryLevel: 3,
})
const inputArr = ref<any>([])

watch(
  () => categoryStore.c3Id,
  () => {
    attrArr.value = []
    if (!categoryStore.c3Id) return
    getAttr()
  },
),
  onMounted(() => {
    if (!categoryStore.c3Id) return
    getAttr()
  })
const getAttr = async () => {
  const { c1Id, c2Id, c3Id } = categoryStore
  const result = await reqAttr(c1Id, c2Id, c3Id)
  if (result.code == 200) {
    attrArr.value = result.data
  }
}
const addAttr = () => {
  Object.assign(attrParams, {
    attrName: '',
    attrValueList: [],
    categoryId: '',
    categoryLevel: 3,
  })
  scene.value = 1
  attrParams.categoryId = categoryStore.c3Id
}
const updateAttr = (row: Attr) => {
  scene.value = 1
  Object.assign(attrParams, JSON.parse(JSON.stringify(row)))
}
const cancel = () => {
  scene.value = 0
}
const addAttrValue = () => {
  attrParams.attrValueList.push({
    valueName: '',
    flag: true,
  })
  nextTick(() => {
    inputArr.value[attrParams.attrValueList.length - 1].focus()
  })
}
const save = async () => {
  const result = await reqAddOrUpdateAttr(attrParams)
  if (result.code == 200) {
    scene.value = 0
    ElMessage({
      type: 'success',
      message: attrParams.id ? '修改成功' : '添加成功',
    })
    getAttr()
  } else {
    scene.value = 0
    ElMessage({
      type: 'error',
      message: attrParams.id ? '修改失败' : '添加失败',
    })
  }
}
const toLook = (row: AttrValue, $index: number) => {
  //非法情况判断
  if (row.valueName.trim() == '') {
    console.log($index)
    attrParams.attrValueList.splice($index, 1)
    ElMessage({
      type: 'error',
      message: '属性值不能为空',
    })
    return
  }
  //非法情况2
  const repeat = attrParams.attrValueList.find((item) => {
    if (item != row) {
      return item.valueName === row.valueName
    }
  })
  if (repeat) {
    attrParams.attrValueList.splice($index, 1)
    ElMessage({
      type: 'error',
      message: '属性值不能重复',
    })
    return
  }
  row.flag = false
}
const toEdit = (row: AttrValue, $index: number) => {
  row.flag = true
  nextTick(() => {
    inputArr.value[$index].focus()
  })
}
const deleteAttr = async (attrId: number) => {
  const result = await reqRemoveAttr(attrId)
  if (result.code == 200) {
    ElMessage({
      type: 'success',
      message: '删除成功',
    })
    getAttr()
  } else {
    ElMessage({
      type: 'error',
      message: '删除失败',
    })
  }
}
</script>

<style scoped></style>
