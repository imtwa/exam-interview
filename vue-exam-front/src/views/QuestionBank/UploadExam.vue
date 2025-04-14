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
        
        <el-form :model="formData" :rules="formRules" ref="uploadFormRef" label-position="top" class="upload-form">
          <!-- 数据集分类 -->
          <el-form-item label="试卷一级分类" prop="categoryId" required>
            <el-select v-model="formData.categoryId" placeholder="请选择试卷一级分类" @change="handleCategoryChange">
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
            <el-select v-model="formData.subCategoryId" placeholder="请选择试卷二级分类" :disabled="!formData.categoryId">
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
              placeholder="请输入试卷名称，最大不超过20字符"
              maxlength="20"
              show-word-limit
            />
          </el-form-item>

          <!-- 数据集简介 -->
          <el-form-item label="试卷简介" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              placeholder="请输入试卷简介，最大不超过50字符"
              maxlength="50"
              show-word-limit
              :rows="3"
            />
          </el-form-item>

          <!-- 上传数据 -->
          <el-form-item label="上传数据" prop="file" required>
            <div class="upload-info">
              <p>试卷量级不限、格式需标准化，同时要考虑有效数据。
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
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                点击上传，或拖放文件到此处
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  仅支持 .xlsx, .xls 格式的Excel文件，大小不超过10MB
                </div>
              </template>
            </el-upload>
          </el-form-item>

          <!-- 按钮区域 -->
          <div class="form-actions">
            <el-button @click="goBack">取消</el-button>
            <el-button type="primary" @click="submitForm" :loading="uploading">确认创建</el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { uploadExamPaper, getCategoryList } from '@/api/question'

const router = useRouter()

// 表单引用
const uploadFormRef = ref(null)

// 上传状态
const uploading = ref(false)

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
  categoryId: [
    { required: true, message: '请选择试卷分类', trigger: 'change' }
  ],
  name: [
    { required: true, message: '请输入试卷名称', trigger: 'blur' },
    { max: 20, message: '长度不能超过20个字符', trigger: 'blur' }
  ],
  description: [
    { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
  ],
  file: [
    { required: true, message: '请上传Excel文件', trigger: 'change' }
  ]
}

// 分类数据
const categories = ref([])
// 加载状态
const loading = ref(false)

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
const handleCategoryChange = (val) => {
  // 重置二级分类
  formData.subCategoryId = ''
}

// 获取分类列表
const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await getCategoryList()
    categories.value = res.data || []
  } catch (error) {
    console.error('获取分类失败', error)
    ElMessage.error('获取分类失败，请刷新页面重试')
  } finally {
    loading.value = false
  }
}

// 文件上传相关
const handleFileChange = (file) => {
  // 检查文件类型
  const isExcel = file.raw.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                  file.raw.type === 'application/vnd.ms-excel'
  
  // 检查文件大小
  const isLt10M = file.raw.size / 1024 / 1024 < 10

  if (!isExcel) {
    ElMessage.error('只能上传Excel文件!')
    return false
  }
  
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB!')
    return false
  }
  
  formData.file = file.raw
  return true
}

const handleFileRemove = () => {
  formData.file = null
}

// 下载模板
const downloadTemplate = async () => {
  try {
    // 直接使用本地文件路径
    const templatePath = '/template/exam-template.xlsx';
    
    // 创建链接直接下载本地文件
    const link = document.createElement('a');
    link.href = templatePath;
    link.download = '试题导入模板.xlsx';
    
    // 触发点击事件下载文件
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    ElMessage.success('模板下载成功');
  } catch (error) {
    console.error('模板下载失败', error);
    ElMessage.error('模板下载失败，请重试');
  }
}

// 提交表单
const submitForm = async () => {
  if (!uploadFormRef.value) return
  
  await uploadFormRef.value.validate(async (valid) => {
    if (valid) {
      uploading.value = true
      
      try {
        // 创建FormData对象
        const formDataToSend = new FormData()
        formDataToSend.append('file', formData.file)
        formDataToSend.append('categoryId', formData.categoryId)
        if (formData.subCategoryId) {
          formDataToSend.append('subCategoryId', formData.subCategoryId)
        }
        formDataToSend.append('name', formData.name)
        if (formData.description) {
          formDataToSend.append('description', formData.description)
        }
        formDataToSend.append('isPublic', formData.isPublic)
        
        // 调用API上传文件
        const res = await uploadExamPaper(formDataToSend)
        
        ElMessage.success('上传成功！')
        router.push('/question-bank')
      } catch (error) {
        console.error('上传失败', error)
        ElMessage.error(error.message || '上传失败，请重试')
      } finally {
        uploading.value = false
      }
    }
  })
}

onMounted(() => {
  // 初始化获取分类列表
  fetchCategories()
})
</script>

<style lang="less" scoped>
.upload-exam-page {
  width: 100%;
  min-height: calc(100vh - 72px);
  background-color: #f5f9ff;
  padding: 20px;
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
  
  .el-button {
    min-width: 100px;
  }
}
</style> 