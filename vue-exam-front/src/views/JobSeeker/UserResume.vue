<template>
  <div class="resume-management-page">
    <div class="resume-management-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>我的简历</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton animated :rows="6" :loading="loading" />
      </div>

      <!-- 简历管理卡片 -->
      <div v-else class="resume-card-container">
        <el-card class="resume-card">
          <template #header>
            <div class="resume-card-header">
              <h2>简历管理</h2>
              <div class="header-actions">
                <el-button type="primary" @click="showUploadDialog" :disabled="isUploading">
                  {{ resumeInfo ? '更新简历' : '上传简历' }}
                </el-button>
              </div>
            </div>
          </template>

          <!-- 暂无简历 -->
          <div v-if="!resumeInfo" class="empty-resume">
            <el-empty description="您尚未上传简历">
              <template #description>
                <p>上传一份精美的简历，让招聘人员更好地了解您</p>
              </template>
              <el-button type="primary" @click="showUploadDialog">立即上传</el-button>
            </el-empty>
          </div>

          <!-- 已有简历 -->
          <div v-else class="resume-info-container">
            <div class="resume-preview-container">
              <div class="resume-info">
                <div class="resume-icon">
                  <el-icon size="30"><Document /></el-icon>
                </div>
                <div class="resume-details">
                  <h3 class="resume-name">{{ resumeInfo.resumeFileName }}</h3>
                  <div class="resume-meta">
                    <span class="upload-time"
                      >上传时间: {{ formatDate(resumeInfo.updatedAt) }}</span
                    >
                  </div>
                </div>
              </div>
              <!-- <div class="resume-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ jobApplicationsCount }}</span>
                  <span class="stat-label">投递数</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ interviewsCount }}</span>
                  <span class="stat-label">面试数</span>
                </div>
              </div> -->
            </div>

            <div class="resume-actions">
              <el-button type="primary" @click="previewResume">
                <el-icon><View /></el-icon>
                预览简历
              </el-button>
              <el-button type="success" @click="downloadResume">
                <el-icon><Download /></el-icon>
                下载简历
              </el-button>
              <el-button type="danger" @click="confirmDeleteResume">
                <el-icon><Delete /></el-icon>
                删除简历
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- 简历使用指南 -->
        <el-card class="resume-tips-card">
          <template #header>
            <div class="resume-tips-header">
              <h3>简历使用小贴士</h3>
            </div>
          </template>
          <div class="resume-tips-content">
            <el-timeline>
              <el-timeline-item
                timestamp="上传简历"
                placement="top"
                :type="resumeInfo ? 'success' : 'primary'"
                :hollow="!resumeInfo"
              >
                <h4>上传一份专业的PDF格式简历</h4>
                <p>简历是求职过程中的第一印象，确保您的简历专业且内容丰富</p>
              </el-timeline-item>
              <el-timeline-item
                timestamp="投递简历"
                placement="top"
                :type="jobApplicationsCount > 0 ? 'success' : ''"
              >
                <h4>向心仪的职位投递简历</h4>
                <p>找到合适的职位后，一键投递您的简历</p>
              </el-timeline-item>
              <el-timeline-item
                timestamp="获得面试"
                placement="top"
                :type="interviewsCount > 0 ? 'success' : ''"
              >
                <h4>收到面试邀请</h4>
                <p>简历通过筛选后，您将收到面试邀请</p>
              </el-timeline-item>
              <el-timeline-item timestamp="获得Offer" placement="top">
                <h4>接收录用通知</h4>
                <p>面试通过后，恭喜您获得理想的工作机会！</p>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 上传简历对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传简历"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="!isUploading"
    >
      <div class="upload-dialog-content">
        <el-alert
          title="请上传PDF格式的简历文件"
          type="info"
          description="简历是招聘方了解您的重要途径，建议使用专业排版的PDF格式简历，大小不超过3MB"
          :closable="false"
          show-icon
          style="margin-bottom: 20px"
        />

        <el-upload
          class="resume-uploader"
          drag
          :action="''"
          :auto-upload="false"
          :on-change="handleResumeChange"
          :on-remove="handleResumeRemove"
          :limit="1"
          :file-list="resumeFileList"
          accept=".pdf"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">拖拽文件到此处或 <em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">请上传PDF格式的简历文件，大小不超过3MB</div>
          </template>
        </el-upload>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeUploadDialog" :disabled="isUploading">取消</el-button>
          <el-button type="primary" @click="uploadResumeFile" :loading="isUploading">
            {{ resumeInfo ? '更新简历' : '上传简历' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 简历预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="简历预览"
      width="60%"
      :destroy-on-close="true"
      custom-class="preview-dialog"
    >
      <div class="preview-container">
        <iframe v-if="resumeUrl" :src="resumeUrl" class="resume-iframe" frameborder="0"></iframe>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="previewDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="downloadResume">下载简历</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, View, Download, Delete, UploadFilled } from '@element-plus/icons-vue'
import { getJobseekerProfile, updateJobseekerProfile } from '@/api/jobseeker'
import { uploadResume } from '@/api/upload'

// 状态变量
const loading = ref(true)
const resumeInfo = ref(null)
const resumeUrl = ref('')
const resumeFileList = ref([])
const uploadDialogVisible = ref(false)
const previewDialogVisible = ref(false)
const isUploading = ref(false)
const jobApplicationsCount = ref(0)
const interviewsCount = ref(0)

// 获取求职者资料
const fetchJobseekerProfile = async () => {
  loading.value = true
  try {
    const response = await getJobseekerProfile()
    const profileData = response.data || response

    if (profileData) {
      // 如果有简历信息
      if (profileData.resumeUrl && profileData.resumeFileName) {
        resumeInfo.value = profileData

        // 构建完整URL (后端返回的可能是相对路径)
        const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
        resumeUrl.value = profileData.resumeUrl.startsWith('http')
          ? profileData.resumeUrl
          : `${baseUrl}/${profileData.resumeUrl}`
      } else {
        resumeInfo.value = null
      }

      // 获取申请和面试数量
      jobApplicationsCount.value = profileData.applications?.length || 0
      interviewsCount.value = profileData.interviews?.length || 0
    }
  } catch (error) {
    console.error('获取求职者资料失败:', error)
    ElMessage.error('获取求职者资料失败，请刷新页面重试')
  } finally {
    loading.value = false
  }
}

// 显示上传对话框
const showUploadDialog = () => {
  resumeFileList.value = []
  uploadDialogVisible.value = true
}

// 关闭上传对话框
const closeUploadDialog = () => {
  if (isUploading.value) return
  resumeFileList.value = []
  uploadDialogVisible.value = false
}

// 处理简历文件选择
const handleResumeChange = file => {
  // 限制文件类型
  if (file.raw.type !== 'application/pdf') {
    ElMessage.warning('只能上传PDF格式的文件')
    resumeFileList.value = []
    return false
  }

  // 限制文件大小
  if (file.raw.size / 1024 / 1024 > 3) {
    ElMessage.warning('文件大小不能超过3MB')
    resumeFileList.value = []
    return false
  }

  resumeFileList.value = [file]
}

// 处理简历文件移除
const handleResumeRemove = () => {
  resumeFileList.value = []
}

// 上传简历文件
const uploadResumeFile = async () => {
  if (resumeFileList.value.length === 0) {
    ElMessage.warning('请先选择一个PDF文件')
    return
  }

  try {
    isUploading.value = true
    const file = resumeFileList.value[0].raw
    const response = await uploadResume(file)

    if (response) {
      const { url, resumePath, filename } = response.data || response

      // 更新本地状态
      resumeUrl.value = url
      resumeInfo.value = {
        ...resumeInfo.value,
        resumeUrl: resumePath,
        resumeFileName: filename
      }

      ElMessage.success('简历上传成功')
      uploadDialogVisible.value = false

      // 重新获取最新资料
      await fetchJobseekerProfile()
    }
  } catch (error) {
    console.error('简历上传失败:', error)
    ElMessage.error('简历上传失败，请重试')
  } finally {
    isUploading.value = false
  }
}

// 预览简历
const previewResume = () => {
  if (!resumeUrl.value) {
    ElMessage.warning('无法预览简历，请先上传')
    return
  }

  previewDialogVisible.value = true
}

// 下载简历
const downloadResume = () => {
  if (!resumeUrl.value) {
    ElMessage.warning('无法下载简历，请先上传')
    return
  }

  // 创建下载链接并模拟点击
  const a = document.createElement('a')
  a.href = resumeUrl.value
  a.target = '_blank' // 添加这一行来在新标签页中打开链接
  a.rel = 'noopener noreferrer' // 为了安全考虑，添加rel属性
  a.download = resumeInfo.value.resumeFileName || '我的简历.pdf'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// 确认删除简历
const confirmDeleteResume = () => {
  ElMessageBox.confirm('删除简历后，需要重新上传才能投递职位。确定要删除吗？', '删除简历', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      deleteResume()
    })
    .catch(() => {})
}

// 删除简历
const deleteResume = async () => {
  try {
    loading.value = true

    // 调用API更新简历信息为空
    await updateJobseekerProfile({
      resumeUrl: null,
      resumeFileName: null
    })

    // 清空本地状态
    resumeInfo.value = null
    resumeUrl.value = ''

    ElMessage.success('简历已删除')
  } catch (error) {
    console.error('删除简历失败:', error)
    ElMessage.error('删除简历失败，请重试')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = dateString => {
  if (!dateString) return '-'

  try {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}`
  } catch (error) {
    console.error('日期格式化错误:', error)
    return dateString
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchJobseekerProfile()
})
</script>

<style lang="less" scoped>
.resume-management-page {
  width: 100%;
  background-color: #f5f9ff;
  min-height: calc(100vh - 72px);
}

.resume-management-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.breadcrumb-container {
  margin-bottom: 20px;
  font-size: 14px;
}

.loading-container {
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.resume-card-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.resume-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  height: fit-content;

  .resume-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      font-size: 20px;
      margin: 0;
      font-weight: 600;
      color: #303133;
    }
  }
}

.empty-resume {
  padding: 40px 20px;
  text-align: center;

  p {
    color: #909399;
    margin-bottom: 20px;
  }
}

.resume-info-container {
  padding: 20px 0;
}

.resume-preview-container {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.resume-info {
  display: flex;
  align-items: center;
  gap: 15px;

  .resume-icon {
    width: 60px;
    height: 60px;
    background-color: #ecf5ff;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #409eff;
  }

  .resume-details {
    .resume-name {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 8px 0;
    }

    .resume-meta {
      font-size: 13px;
      color: #909399;
    }
  }
}

.resume-stats {
  display: flex;
  gap: 15px;

  .stat-item {
    text-align: center;
    min-width: 80px;

    .stat-value {
      display: block;
      font-size: 24px;
      font-weight: 600;
      color: #409eff;
    }

    .stat-label {
      font-size: 13px;
      color: #606266;
    }
  }
}

.resume-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.resume-tips-card {
  border-radius: 8px;

  .resume-tips-header {
    h3 {
      font-size: 18px;
      margin: 0;
      font-weight: 600;
      color: #303133;
    }
  }
}

.resume-tips-content {
  padding: 10px 0;

  h4 {
    font-size: 16px;
    font-weight: 500;
    margin: 0 0 8px 0;
    color: #303133;
  }

  p {
    font-size: 14px;
    color: #606266;
    margin: 0;
    line-height: 1.6;
  }
}

.upload-dialog-content {
  .resume-uploader {
    width: 100%;
  }
}

.preview-container {
  height: calc(100vh - 200px);
  width: 100%;

  .resume-iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
}

/* 响应式布局 */
@media (max-width: 768px) {
  .resume-card-container {
    grid-template-columns: 1fr;
  }

  .resume-preview-container {
    flex-direction: column;
    gap: 20px;
  }

  .resume-actions {
    flex-wrap: wrap;
  }
}

:deep(.preview-dialog) {
  display: flex;
  flex-direction: column;

  .el-dialog__body {
    flex: 1;
    overflow: auto;
    padding: 0;
  }
}
</style>
