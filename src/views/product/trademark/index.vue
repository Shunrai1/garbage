<template>
  <el-card class="box-card">
    <el-button
      type="primary"
      size="default"
      icon="Plus"
      @click="addTradeMark"
      v-has="`btn.Trademark.add`"
    >
      添加品牌
    </el-button>
    <el-table style="margin: 10px 0" border :data="trademarkArr">
      <el-table-column
        label="序号"
        width="80px"
        align="center"
        type="index"
      ></el-table-column>
      <el-table-column
        label="品牌名称"
        align="center"
        prop="tmName"
      ></el-table-column>
      <el-table-column label="品牌LOGO" align="center">
        <template v-slot="{ row }">
          <img
            :src="row.logoUrl"
            alt="图片"
            style="width: 100px; height: 100px"
          />
        </template>
      </el-table-column>
      <el-table-column label="品牌操作" align="center">
        <template v-slot="{ row }">
          <el-button
            type="primary"
            size="small"
            icon="Edit"
            @click="updateTrademark(row)"
          ></el-button>

          <el-popconfirm
            :title="`你确定删除${row.tmName}?`"
            width="250px"
            icon="Delete"
            @confirm="removeTradeMaik(row.id)"
          >
            <template #reference>
              <el-button size="small" icon="Delete"></el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="pageNo"
      v-model:page-size="limit"
      :page-sizes="[3, 5, 7, 9]"
      :background="true"
      layout="prev, pager, next, jumper,->,sizes,total"
      :total="total"
      @current-change="getHasTrademark"
      @size-change="sizeChange"
    />
  </el-card>
  <!-- 对话框 -->
  <el-dialog
    v-model="dialogFormVisible"
    :title="trademarkParams.id ? '修改品牌' : '添加品牌'"
  >
    <el-form
      style="width: 80%"
      label-width="100px"
      :model="trademarkParams"
      :rules="rules"
      ref="formRef"
    >
      <el-form-item label="品牌名称" prop="tmName">
        <el-input
          placeholder="请输入品牌名称"
          v-model="trademarkParams.tmName"
        ></el-input>
      </el-form-item>
      <el-form-item label="品牌LOGO" prop="logoUrl">
        <el-upload
          class="avatar-uploader"
          action="/api/admin/product/fileUpload"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <img
            v-if="trademarkParams.logoUrl"
            :src="trademarkParams.logoUrl"
            class="avatar"
          />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
    </el-form>
    <!-- 具名插槽 -->
    <template #footer>
      <el-button size="default" @click="cancel">取消</el-button>
      <el-button type="primary" @click="confirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from 'vue'
import {
  reqHasTrademark,
  reqAddOrUpdateTrademark,
  reqDeleteTrademark,
} from '@/api/product/trademark'
import type { Records, TradeMark } from '@/api/product/trademark/type'
import { ElMessage, type UploadProps } from 'element-plus'

const dialogFormVisible = ref(false)
const pageNo = ref<number>(1)
const limit = ref<number>(3)
const total = ref<number>(0)
const trademarkArr = ref<Records>([])
const trademarkParams = reactive<TradeMark>({
  tmName: '',
  logoUrl: '',
})
const formRef = ref()
const getHasTrademark = async (pager = 1) => {
  pageNo.value = pager
  const result = await reqHasTrademark(pageNo.value, limit.value)
  if (result.code == 200) {
    total.value = result.data.total
    trademarkArr.value = result.data.records
  }
}
// const changePageNo = () => {
//   getHasTrademark()
// }
const sizeChange = () => {
  getHasTrademark()
}

const addTradeMark = () => {
  trademarkParams.tmName = ''
  trademarkParams.logoUrl = ''
  trademarkParams.id = null!
  dialogFormVisible.value = true
  nextTick(() => {
    formRef.value.clearValidate('tmName')
    formRef.value.clearValidate('logoUrl')
  })
}

const validatorName = (_rule: any, value: any, callBack: any) => {
  if (value.trim().length >= 2) {
    callBack()
  } else {
    callBack(new Error('品牌名称位数大于等于两位'))
  }
}

const validatorLogoUrl = (_rule: any, value: any, callBack: any) => {
  if (value) {
    callBack()
  } else {
    callBack(new Error('LOGO照片要上传'))
  }
}

const rules = {
  tmName: [{ required: true, trigger: 'blur', validator: validatorName }],
  logoUrl: [{ required: true, validator: validatorLogoUrl }],
}
const updateTrademark = (row: TradeMark) => {
  nextTick(() => {
    formRef.value.clearValidate('tmName')
    formRef.value.clearValidate('logoUrl')
  })
  Object.assign(trademarkParams, row)
  // trademarkParams.id = row.id
  // trademarkParams.tmName = row.tmName
  // trademarkParams.logoUrl = row.logoUrl
  dialogFormVisible.value = true
}
const cancel = () => {
  dialogFormVisible.value = false
}
const confirm = async () => {
  console.log(formRef.value)
  //调用这个方法进行全部表单的校验，
  await formRef.value.validate()
  const result = await reqAddOrUpdateTrademark(trademarkParams)
  //添加品牌成功
  if (result.code == 200) {
    dialogFormVisible.value = false
    ElMessage({
      type: 'success',
      message: trademarkParams.id ? '修改品牌成功' : '添加品牌成功',
    })
    getHasTrademark(pageNo.value)
  } else {
    dialogFormVisible.value = false
    ElMessage({
      type: 'error',
      message: trademarkParams.id ? '修改品牌失败' : '添加品牌失败',
    })
  }
}
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (
    rawFile.type == 'image/jpeg' ||
    rawFile.type == 'image/png' ||
    rawFile.type == 'image/gif'
  ) {
    if (rawFile.size / 1024 / 1024 < 4) {
      return true
    } else {
      ElMessage({
        type: 'error',
        message: '上传文件大小小于4M',
      })
    }
  } else {
    ElMessage({
      type: 'error',
      message: '上传文件格式务必PNG|JPG|GIF',
    })
    return false
  }
}
const handleAvatarSuccess: UploadProps['onSuccess'] = (response) => {
  trademarkParams.logoUrl = response.data
  //清除对应图片校验结果
  formRef.value.clearValidate('logoUrl')
}
const removeTradeMaik = async (id: number) => {
  const result = await reqDeleteTrademark(id)
  if (result.code == 200) {
    ElMessage({
      type: 'success',
      message: '删除品牌成功',
    })
    getHasTrademark(
      trademarkArr.value.length > 1 ? pageNo.value : pageNo.value - 1,
    )
  } else {
    ElMessage({
      type: 'error',
      message: '删除品牌失败',
    })
  }
}
onMounted(() => {
  getHasTrademark()
})
</script>

<style scoped>
.avatar-uploader .avatar {
  display: block;
  width: 178px;
  height: 178px;
}
</style>

<style>
.avatar-uploader .el-upload {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  width: 178px;
  height: 178px;
  font-size: 28px;
  color: #8c939d;
  text-align: center;
}
</style>
