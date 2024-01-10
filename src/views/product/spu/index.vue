<template>
  <Category :scene="scene" />
  <el-card style="margin: 10px 0">
    <div v-show="scene == 0">
      <el-button
        type="primary"
        size="default"
        icon="Plus"
        :disabled="categoryStore.c3Id ? false : true"
        @click="addSpu"
      >
        添加SPU
      </el-button>
      <el-table style="margin: 10px 0" border :data="records">
        <el-table-column
          label="序号"
          width="80px"
          type="index"
          align="center"
        ></el-table-column>
        <el-table-column label="SPU名称" prop="spuName"></el-table-column>
        <el-table-column
          label="SPU描述"
          prop="description"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column label="SPU操作">
          <template v-slot="{ row }">
            <el-button
              type="primary"
              size="small"
              icon="Plus"
              title="添加SKU"
              @click="addSku(row)"
            ></el-button>
            <el-button
              type="primary"
              size="small"
              icon="Edit"
              @click="updateSpu(row)"
              title="修改SPU"
            ></el-button>
            <el-button
              type="primary"
              size="small"
              icon="View"
              title="查看SKU列表"
              @click="findSku(row)"
            ></el-button>
            <el-popconfirm
              :title="`你确定删除-${row.spuName}-吗?`"
              @confirm="deleteSpu(row)"
              width="200px"
            >
              <template #reference>
                <el-button
                  type="primary"
                  size="small"
                  icon="Delete"
                  title="删除SKU"
                ></el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="pageNo"
        v-model:page-size="pageSize"
        :page-sizes="[3, 5, 7, 9]"
        :background="true"
        :total="total"
        @current-change="getHasSpu"
        @size-change="getHasSpu"
        layout="prev, pager, next, jumper,->,sizes,total"
      />
    </div>
    <spuForm ref="spu" v-show="scene == 1" @changeScene="changeScene"></spuForm>
    <skuForm ref="sku" v-show="scene == 2" @changeScene="changeScene"></skuForm>
    <!-- 对话框 -->
    <el-dialog title="SKU列表" v-model="show">
      <el-table :data="skuArr" border>
        <el-table-column label="sku名字" prop="skuName"></el-table-column>
        <el-table-column label="sku价格" prop="price"></el-table-column>
        <el-table-column label="sku重量" prop="weight"></el-table-column>
        <el-table-column label="sku图片">
          <template v-slot="{ row }">
            <img :src="row.skuDefaultImg" style="width: 100px; height: 100px" />
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import useCategoryStore from '@/store/modules/category'
import { reqHasSpu, reqRemoveSpu, reqSkuList } from '@/api/product/spu'
import { Records, SkuData, SpuData } from '@/api/product/spu/type'
import skuForm from './skuForm.vue'
import spuForm from './spuForm.vue'
import { ElMessage } from 'element-plus'

const categoryStore = useCategoryStore()

const scene = ref<number>(0) //0 显示已用
const pageNo = ref<number>(1)
const pageSize = ref<number>(3)
const records = ref<Records>([])
const total = ref<number>(0)
const spu = ref()
const sku = ref()
const skuArr = ref<SkuData[]>([])
const show = ref<boolean>(false)
watch(
  () => categoryStore.c3Id,
  () => {
    if (!categoryStore.c3Id) return
    getHasSpu()
  },
)

const getHasSpu = async (pager = 1) => {
  pageNo.value = pager
  const result = await reqHasSpu(
    pageNo.value,
    pageSize.value,
    categoryStore.c3Id,
  )
  if (result.code == 200) {
    records.value = result.data.records
    total.value = result.data.total
  }
}

const addSpu = () => {
  scene.value = 1
  spu.value.initAddSpu(categoryStore.c3Id)
}

const changeScene = (obj: any) => {
  scene.value = obj.flag
  if (obj.params == 'update') {
    getHasSpu(pageNo.value)
  } else {
    getHasSpu()
  }
}

const updateSpu = (row: SpuData) => {
  scene.value = 1
  spu.value.initHasSpuData(row)
}

const addSku = (row: SpuData) => {
  scene.value = 2
  sku.value.initSkuData(categoryStore.c1Id, categoryStore.c2Id, row)
}
const findSku = async (row: SpuData) => {
  const result = await reqSkuList(row.id!)
  if (result.code == 200) {
    skuArr.value = result.data
    show.value = true
  }
}
const deleteSpu = async (row: SpuData) => {
  const result = await reqRemoveSpu(row.id!)
  if (result.code == 200) {
    ElMessage({
      type: 'success',
      message: '删除成功',
    })
    getHasSpu(records.value.length > 1 ? pageNo.value : pageNo.value - 1)
  } else {
    ElMessage({
      type: 'error',
      message: '删除失败',
    })
  }
}
onMounted(() => {
  if (!categoryStore.c3Id) return
  getHasSpu()
})
</script>

<style scoped></style>
