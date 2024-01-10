<template>
  <el-card>
    <el-table border :data="skuArr">
      <el-table-column
        label="序号"
        type="index"
        align="center"
        width="80px"
      ></el-table-column>
      <el-table-column
        label="名称"
        show-overflow-tooltip
        width="300px"
        prop="skuName"
      ></el-table-column>
      <el-table-column
        label="描述"
        show-overflow-tooltip
        width="300px"
        prop="skuDesc"
      ></el-table-column>
      <el-table-column label="图片" width="150px">
        <template v-slot="{ row }">
          <img
            :src="row.skuDefaultImg"
            alt=""
            style="width: 100px; height: 100px"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="重量(g)"
        width="150px"
        prop="weight"
      ></el-table-column>
      <el-table-column
        label="价格(元)"
        width="150px"
        prop="price"
      ></el-table-column>
      <el-table-column label="操作" width="300px" fixed="right">
        <template v-slot="{ row }">
          <el-button
            :type="row.isSale == 1 ? 'info' : 'success'"
            :icon="row.isSale == 1 ? 'Bottom' : 'Top'"
            size="small"
            @click="updateSale(row)"
          ></el-button>
          <el-button
            type="primary"
            icon="Edit"
            size="small"
            @click="updateSku"
          ></el-button>
          <el-button
            type="primary"
            icon="InfoFilled"
            size="small"
            @click="findSku(row)"
          ></el-button>
          <el-popconfirm
            :title="`你确定要删除-${row.skuName}-吗?`"
            @confirm="removeSku(row.id)"
          >
            <template #reference>
              <el-button type="primary" icon="Delete" size="small"></el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      style="margin-top: 10px"
      v-model:current-page="pageNo"
      v-model:page-size="pageSize"
      :page-sizes="[10, 15, 30, 40]"
      :background="true"
      layout="prev, pager, next, jumper,->,sizes,total"
      :total="total"
      @current-change="getHasSku"
      @size-change="handler"
    />
    <!-- 抽屉组件 -->
    <el-drawer v-model="drawer" direction="rtl">
      <template #header>
        <h4>查看商品详情</h4>
      </template>
      <template #default>
        <el-row style="margin: 10px 0">
          <el-col :span="6">名称</el-col>
          <el-col :span="18">{{ skuInfo.skuName }}</el-col>
        </el-row>
        <el-row style="margin: 10px 0">
          <el-col :span="6">描述</el-col>
          <el-col :span="18">{{ skuInfo.skuDesc }}</el-col>
        </el-row>
        <el-row style="margin: 10px 0">
          <el-col :span="6">价格</el-col>
          <el-col :span="18">{{ skuInfo.price }}</el-col>
        </el-row>
        <el-row style="margin: 10px 0">
          <el-col :span="6">平台属性</el-col>
          <el-col :span="18">
            <el-tag
              style="margin-right: 10px"
              v-for="item in skuInfo.skuAttrValueList"
              :key="item.id"
            >
              {{ item.valueName }}
            </el-tag>
          </el-col>
        </el-row>
        <el-row style="margin: 10px 0">
          <el-col :span="6">销售属性</el-col>
          <el-col :span="18">
            <el-tag
              type="success"
              style="margin-right: 10px"
              v-for="item in skuInfo.skuSaleAttrValueList"
              :key="item.id"
            >
              {{ item.saleAttrValueName }}
            </el-tag>
          </el-col>
        </el-row>
        <el-row style="margin: 10px 0">
          <el-col :span="6">商品图片</el-col>
          <el-col :span="18">
            <el-carousel :interval="4000" type="card" height="200px">
              <el-carousel-item
                v-for="item in skuInfo.skuImageList"
                :key="item.id"
              >
                <img
                  :src="item.imgUrl"
                  alt=""
                  style="width: 100%; height: 100%"
                />
              </el-carousel-item>
            </el-carousel>
          </el-col>
        </el-row>
      </template>
      <template #footer></template>
    </el-drawer>
  </el-card>
</template>

<script setup lang="ts">
import { reqSkuList } from '@/api/product/sku'
import { SkuData, SkuInfoData } from '@/api/product/sku/type'
import { ref, onMounted } from 'vue'
import {
  reqCancelSale,
  reqSaleSku,
  reqSkuInfo,
  reqRemoveSku,
} from '@/api/product/sku/index'
import { ElMessage } from 'element-plus'

const pageNo = ref(1)
const pageSize = ref(10)
const total = ref(100)
const skuArr = ref<SkuData[]>([])
const drawer = ref<boolean>(false)
const skuInfo = ref<SkuData>({})

const getHasSku = async (pager = 1) => {
  pageNo.value = pager
  const result = await reqSkuList(pageNo.value, pageSize.value)
  if (result.code == 200) {
    total.value = result.data.total
    skuArr.value = result.data.records
  }
}
const handler = () => {
  getHasSku()
}
const updateSale = async (row: SkuData) => {
  if (row.isSale == 1) {
    await reqCancelSale(row.id!)
    ElMessage({
      type: 'success',
      message: '下架成功',
    })
    getHasSku(pageNo.value)
  } else {
    await reqSaleSku(row.id!)
    ElMessage({
      type: 'success',
      message: '上架成功',
    })
    getHasSku(pageNo.value)
  }
}
const updateSku = () => {
  ElMessage({
    type: 'success',
    message: '程序员更新中....',
  })
}
const findSku = async (row: SkuData) => {
  drawer.value = true
  const result: SkuInfoData = await reqSkuInfo(row.id!)
  if (result.code == 200) {
    skuInfo.value = result.data
  }
}
const removeSku = async (id: number) => {
  const result = await reqRemoveSku(id)
  if (result.code == 200) {
    ElMessage({
      type: 'success',
      message: '删除成功',
    })
    getHasSku(skuArr.value.length > 1 ? pageNo.value : pageNo.value - 1)
  } else {
    ElMessage({
      type: 'error',
      message: '删除失败',
    })
  }
}

onMounted(() => {
  getHasSku()
})
</script>

<style scoped>
.el-carousel__item h3 {
  margin: 0;
  line-height: 200px;
  color: #475669;
  text-align: center;
  opacity: 0.75;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
</style>
