<template>
  <el-form label-width="100px">
    <el-form-item label="SPU名称">
      <el-input
        placeholder="请输入SPU名称"
        v-model="SpuParams.spuName"
      ></el-input>
    </el-form-item>
    <el-form-item label="SPU品牌">
      <el-select v-model="SpuParams.tmId" placeholder="">
        <el-option
          v-for="item in AllTradeMark"
          :key="item.id"
          :label="item.tmName"
          :value="item.id!"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="SPU描述">
      <el-input
        type="textarea"
        placeholder="请输入描述"
        v-model="SpuParams.description"
      ></el-input>
    </el-form-item>
    <el-form-item label="SPU照片">
      <el-upload
        v-model:file-list="imgList"
        action="api/admin/product/fileUpload"
        list-type="picture-card"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove"
      >
        <el-icon><Plus /></el-icon>
      </el-upload>

      <el-dialog v-model="dialogVisible">
        <img
          w-full
          :src="dialogImageUrl"
          alt="Preview Image"
          style="width: 100%; height: 100%"
        />
      </el-dialog>
    </el-form-item>
    <el-form-item label="SPU销售属性">
      <el-select
        v-model="saleAttrIdAndValueName"
        :placeholder="
          unSelectSaleAttr.length
            ? `还未选择${unSelectSaleAttr.length}个`
            : '无选择了'
        "
      >
        <el-option
          v-for="item in unSelectSaleAttr"
          :key="item.id"
          :label="item.name"
          :value="`${item.id}:${item.name}`"
        ></el-option>
      </el-select>
      <el-button
        style="margin-left: 10px"
        type="primary"
        size="default"
        icon="Plus"
        :disabled="saleAttrIdAndValueName ? false : true"
        @click="addSaleAttr"
      >
        添加属性
      </el-button>
      <el-table border style="margin: 10px 0" :data="saleAttr">
        <el-table-column
          label="序号"
          type="index"
          align="center"
          width="80px"
        ></el-table-column>
        <el-table-column
          label="销售属性名字"
          prop="saleAttrName"
          width="120px"
        ></el-table-column>
        <el-table-column label="销售属性值">
          <template v-slot="{ row, $index }">
            <el-tag
              v-for="item in row.spuSaleAttrValueList"
              :key="item.id"
              class="mx-1"
              closable
              style="margin: 0 5px"
              @close="row.spuSaleAttrValueList.splice($index, 1)"
            >
              {{ item.saleAttrValueName }}
            </el-tag>
            <el-input
              v-model="row.saleAttrValue"
              @blur="toLook(row)"
              v-if="row.flag == true"
              placeholder="请输入属性值"
              size="small"
              style="width: 100px"
            ></el-input>
            <el-button
              v-else
              @click="toEdit(row)"
              type="primary"
              size="small"
              icon="Plus"
            ></el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template v-slot="{ $index }">
            <el-button
              type="primary"
              size="small"
              icon="Delete"
              @click="saleAttr.splice($index, 1)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        @click="save"
        :disabled="saleAttr.length > 0 ? false : true"
      >
        保存
      </el-button>
      <el-button type="primary" @click="cancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { HasSaleAttr, SaleAttr, SpuData } from '@/api/product/spu/type'
import {
  reqAllTradeMark,
  reqSpuImageList,
  reqSpuHasSaleAttr,
  reqAllSaleAttr,
  reqAddOrUpdateSpu,
} from '@/api/product/spu'

import { computed, ref } from 'vue'
import { TradeMark } from '@/api/product/trademark/type'
import { ElMessage } from 'element-plus'

const $emit = defineEmits(['changeScene'])
const AllTradeMark = ref<TradeMark[]>([])
const imgList = ref<any>([])
const saleAttr = ref<SaleAttr[]>([])
const allSaleAttr = ref<HasSaleAttr[]>([])
const SpuParams = ref<SpuData>({
  category3Id: '',
  spuName: '',
  description: '',
  tmId: '',
  spuImageList: [],
  spuSaleAttrList: [],
})
const dialogVisible = ref<boolean>(false)
const dialogImageUrl = ref('')
const saleAttrIdAndValueName = ref<string>('')

const unSelectSaleAttr = computed(() => {
  const unSelectArr = allSaleAttr.value.filter((item) => {
    return saleAttr.value.every((item1) => {
      return item.name != item1.saleAttrName
    })
  })
  return unSelectArr
})

const cancel = () => {
  saleAttrIdAndValueName.value = ''
  $emit('changeScene', { flag: 0, params: 'update' })
}
const initHasSpuData = async (spu: SpuData) => {
  SpuParams.value = spu
  const result = await reqAllTradeMark()
  const result1 = await reqSpuImageList(spu.id!)
  const result2 = await reqSpuHasSaleAttr(spu.id!)
  const result3 = await reqAllSaleAttr()

  AllTradeMark.value = result.data
  imgList.value = result1.data.map((item) => {
    return {
      name: item.imgName,
      url: item.imgUrl,
    }
  })
  saleAttr.value = result2.data
  allSaleAttr.value = result3.data
}

const handlePictureCardPreview = (file: any) => {
  dialogImageUrl.value = file.url
  dialogVisible.value = true
}

const handleRemove = () => {}

const addSaleAttr = () => {
  const [baseSaleAttrId, saleAttrName] = saleAttrIdAndValueName.value.split(':')
  const newSaleAttr: SaleAttr = {
    baseSaleAttrId,
    saleAttrName,
    spuSaleAttrValueList: [],
  }
  saleAttr.value.push(newSaleAttr)
  saleAttrIdAndValueName.value = ''
}
const toEdit = (row: any) => {
  row.flag = true
  row.saleAttrValue
}
const toLook = (row: any) => {
  const { baseSaleAttrId, saleAttrValue } = row
  const newSaleAttrValue = {
    baseSaleAttrId,
    saleAttrValueName: saleAttrValue,
  }
  //非法情况
  if (saleAttrValue.trim() == '') {
    ElMessage({
      type: 'error',
      message: '属性值不能为空',
    })
    row.flag = false
    return
  }
  const repeat = row.spuSaleAttrValueList.find((item: any) => {
    return item.saleAttrValueName == saleAttrValue
  })
  if (repeat) {
    ElMessage({
      type: 'error',
      message: '属性值重复',
    })
    row.flag = false
    return
  }
  row.spuSaleAttrValueList.push(newSaleAttrValue)
  row.flag = false
}

const save = async () => {
  SpuParams.value.spuImageList = imgList.value.map((item: any) => {
    return {
      imgName: item.name,
      imgUrl: (item.response && item.response.data) || item.url,
    }
  })
  SpuParams.value.spuSaleAttrList = saleAttr.value
  const result = await reqAddOrUpdateSpu(SpuParams.value)
  if (result.code == 200) {
    ElMessage({
      type: 'success',
      message: SpuParams.value.id ? '更新成功' : '添加成功',
    })
    $emit('changeScene', {
      flag: 0,
      params: SpuParams.value.id ? 'update' : 'add',
    })
  } else {
    ElMessage({
      type: 'error',
      message: SpuParams.value.id ? '更新失败' : '添加失败',
    })
  }
}
const initAddSpu = async (c3Id: number) => {
  Object.assign(SpuParams.value, {
    category3Id: '',
    spuName: '',
    description: '',
    tmId: '',
    spuImageList: [],
    spuSaleAttrList: [],
  })
  SpuParams.value.id = undefined
  imgList.value = []
  saleAttr.value = []
  SpuParams.value.category3Id = c3Id
  const result = await reqAllTradeMark()
  const result1 = await reqAllSaleAttr()
  AllTradeMark.value = result.data
  allSaleAttr.value = result1.data
}

defineExpose({ initHasSpuData, initAddSpu })
</script>

<style lang="scss" scoped></style>
