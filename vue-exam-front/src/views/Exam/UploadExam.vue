<template>
  <div class="upload-exam-page">
    <div class="upload-exam-container">
      <div class="page-header">
        <el-page-header @back="goBack">
          <template #content>
            <span class="header-content">上传试卷</span>
          </template>
        </el-page-header>
      </div>

      <div class="upload-form-container">
        <div class="form-title">想要更优质的试卷？一键上传，快速创建试卷！</div>

        <el-form
          :model="formData"
          :rules="formRules"
          ref="formRef"
          label-position="top"
          class="upload-form"
        >
          <!-- 数据集分类 -->
          <el-form-item label="试卷一级分类" prop="categoryId" required>
            <el-select
              v-model="formData.categoryId"
              placeholder="请选择试卷一级分类"
              @change="handleCategoryChange"
            >
              <el-option
                v-for="item in categories"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>

          <!-- 二级分类 -->
          <el-form-item label="试卷二级分类" prop="subCategoryId">
            <el-select
              v-model="formData.subCategoryId"
              placeholder="请选择试卷二级分类"
              :disabled="!formData.categoryId"
            >
              <el-option
                v-for="item in subCategories"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>

          <!-- 数据集名称 -->
          <el-form-item label="试卷名称" prop="name" required>
            <el-input
              v-model="formData.name"
              placeholder="请输入试卷名称，最大不超过50字符"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>

          <!-- 数据集简介 -->
          <el-form-item label="试卷简介" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              placeholder="请输入试卷简介，最大不超过500字符"
              maxlength="500"
              show-word-limit
              :rows="3"
            />
          </el-form-item>

          <!-- 上传数据 -->
          <el-form-item label="上传数据" prop="file" required>
            <div class="upload-info">
              <p>
                试卷量级不限、格式需标准化，同时要考虑有效数据。
                <el-link type="primary" @click="downloadTemplate">下载示例文件</el-link>
              </p>
            </div>

            <el-upload
              class="upload-area"
              drag
              action="#"
              :auto-upload="false"
              :limit="1"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              accept=".xlsx,.xls"
              :disabled="uploading"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">点击上传，或拖放文件到此处</div>
              <template #tip>
                <div class="el-upload__tip">仅支持 .xlsx, .xls 格式的Excel文件，大小不超过10MB</div>
              </template>
            </el-upload>
          </el-form-item>

          <!-- 按钮区域 -->
          <div class="form-actions">
            <el-button @click="goBack" :disabled="uploading" plain>取消</el-button>
            <el-button
              @click="submitForm"
              :loading="uploading"
              :disabled="uploading"
              type="primary"
              style="background-color: #0352c9; border-color: #0352c9"
            >
              {{ uploading ? '创建中...' : '确认创建' }}
            </el-button>
          </div>
        </el-form>
      </div>
    </div>

    <!-- 全屏加载指示器 -->
    <div class="full-screen-loading" v-if="uploading">
      <el-loading
        :fullscreen="true"
        text="正在上传试卷，请稍候..."
        background="rgba(255, 255, 255, 0.8)"
      ></el-loading>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { getCategoryList } from '@/api/category'
import { uploadExam } from '@/api/exam'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const fileRef = ref(null)
const fileList = ref([])

// 表单数据
const formData = reactive({
  categoryId: '',
  subCategoryId: '',
  name: '',
  description: '',
  file: null,
  isPublic: true
})

// 表单验证规则
const formRules = {
  categoryId: [{ required: true, message: '请选择试卷分类', trigger: 'change' }],
  name: [
    { required: true, message: '请输入试卷名称', trigger: 'blur' },
    { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
  ],
  description: [{ max: 500, message: '长度不能超过500个字符', trigger: 'blur' }],
  file: [{ required: true, message: '请上传Excel文件', trigger: 'change' }]
}

// 分类数据
const categories = ref([])
// 加载状态
const loading = ref(false)
const uploading = ref(false)

// 二级分类（根据选中的一级分类动态变化）
const subCategories = computed(() => {
  const selectedCategory = categories.value.find(item => item.id === formData.categoryId)
  return selectedCategory?.children || []
})

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 处理一级分类变化
const handleCategoryChange = val => {
  // 重置二级分类
  formData.subCategoryId = ''
}

// 获取分类列表
const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await getCategoryList()
    categories.value = res || []
  } catch (error) {
    console.error('获取分类失败', error)
    ElMessage.error('获取分类失败，请刷新页面重试')
  } finally {
    loading.value = false
  }
}

// 下载模板
const downloadTemplate = () => {
  // 使用本地模板文件路径
  const templatePath = '/template/exam-template.xlsx'

  // 创建下载链接
  const link = document.createElement('a')
  link.href = templatePath
  link.download = '试卷导入模板.xlsx'

  // 触发下载
  document.body.appendChild(link)
  link.click()

  // 清理DOM
  document.body.removeChild(link)
  ElMessage.success('模板下载成功')
}

// 文件上传相关
const handleFileChange = file => {
  // 检查文件类型
  const isExcel =
    file.raw.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.raw.type === 'application/vnd.ms-excel'

  // 检查文件大小
  const isLt10M = file.raw.size / 1024 / 1024 < 10

  if (!isExcel) {
    ElMessage.error('只能上传Excel文件')
    fileList.value = []
    formData.file = null
    return false
  }

  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB')
    fileList.value = []
    formData.file = null
    return false
  }

  formData.file = file.raw
  return true
}

// 移除文件
const handleFileRemove = () => {
  formData.file = null
  fileList.value = []
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  // 如果正在上传中，阻止重复提交
  if (uploading.value) {
    ElMessage.warning('正在上传中，请勿重复提交')
    return
  }

  // 添加调试信息，检查登录状态
  // console.log('用户登录状态:', userStore.isLoggedIn)
  // console.log('用户令牌:', userStore.token)

  formRef.value.validate(async valid => {
    if (valid) {
      if (!formData.file) {
        ElMessage.warning('请上传Excel文件')
        return
      }

      // 检查用户是否登录
      if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录后再上传试卷')
        router.push('/login')
        return
      }

      uploading.value = true

      try {
        // 创建FormData对象
        const data = new FormData()
        data.append('file', formData.file)
        data.append('name', formData.name)
        data.append('categoryId', formData.categoryId)

        if (formData.subCategoryId) {
          data.append('subCategoryId', formData.subCategoryId)
        }

        if (formData.description) {
          data.append('description', formData.description)
        }

        data.append('isPublic', formData.isPublic)

        // 发送请求
        const res = await uploadExam(data)

        ElMessage.success('试卷上传成功')
        // console.log('上传成功返回的数据:', res)

        // 确认是否查看详情
        ElMessageBox.confirm('试卷上传成功，是否查看试卷详情？', '上传成功', {
          confirmButtonText: '查看详情',
          cancelButtonText: '继续上传',
          type: 'success'
        })
          .then(() => {
            // 跳转到试卷详情页
            // API可能直接返回数据，也可能包裹在data属性中
            const examId = res.id
            if (examId) {
              // console.log('跳转到试卷ID:', examId)
              router.push(`/exam/${examId}`)
            } else {
              ElMessage.warning('无法获取试卷ID，无法跳转到详情页')
              console.error('未找到试卷ID:', res)
            }
          })
          .catch(() => {
            // 重置表单，继续上传
            resetForm()
          })
      } catch (error) {
        console.error('上传失败', error)
        // 显示详细错误信息
        if (error.response) {
          // console.log('错误状态:', error.response.status)
          // console.log('错误数据:', error.response.data)
          ElMessage.error(`上传失败: '请求错误'}`)
        } else {
          ElMessage.error('试卷上传失败，请重试')
        }
      } finally {
        uploading.value = false
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
    formData.file = null
    fileList.value = []
  }
}

onMounted(() => {
  // 获取分类列表
  fetchCategories()
})
</script>

<style lang="less" scoped>
.upload-exam-page {
  width: 100%;
  min-height: calc(100vh - 72px);
  background-color: #f5f9ff;
  padding: 20px;
  position: relative;
}

.upload-exam-container {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;

  .header-content {
    font-size: 18px;
    font-weight: 500;
  }
}

.upload-form-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 30px;
}

.form-title {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 30px;
  color: #333;
}

.upload-form {
  .el-form-item {
    margin-bottom: 25px;
  }
}

.upload-info {
  margin-bottom: 15px;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.upload-area {
  width: 100%;

  .el-upload {
    width: 100%;
  }

  .el-upload-dragger {
    width: 100%;
    height: 180px;
  }

  .el-icon--upload {
    font-size: 48px;
    color: #0352c9;
    margin-bottom: 10px;
  }

  .el-upload__text {
    font-size: 16px;
    color: #606266;
    margin-bottom: 10px;
  }

  .el-upload__tip {
    line-height: 1.5;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
  gap: 15px;

  .el-button {
    min-width: 100px;
    border-radius: 4px;
    font-weight: 500;

    &:disabled {
      cursor: not-allowed;
    }

    &:hover {
      opacity: 0.9;
    }
  }
}

// 自定义Element Plus组件样式
:deep(.el-button--primary) {
  background-color: #0352c9;
  border-color: #0352c9;

  &:hover,
  &:focus {
    background-color: #0461e3;
    border-color: #0461e3;
  }

  &:active {
    background-color: #0247b2;
    border-color: #0247b2;
  }

  &.is-disabled,
  &.is-disabled:hover {
    background-color: #a0cfff;
    border-color: #a0cfff;
  }
}

// 上传禁用状态样式
:deep(.is-disabled) {
  cursor: not-allowed !important;

  .el-upload-dragger {
    background-color: #f5f7fa !important;
    border-color: #e4e7ed !important;
  }
}

.full-screen-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
