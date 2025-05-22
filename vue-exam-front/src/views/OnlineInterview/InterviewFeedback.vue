<template>
  <div class="feedback-page">
    <div class="feedback-container">
      <el-card class="feedback-card">
        <template #header>
          <div class="card-header">
            <h2>面试反馈</h2>
          </div>
        </template>

        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="6" animated />
        </div>
        <div v-else class="card-content">
          <div class="interview-info">
            <h3>面试信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">公司：</span>
                <span class="value">{{ interviewData.company?.name || '未知公司' }}</span>
              </div>
              <div class="info-item">
                <span class="label">职位：</span>
                <span class="value">{{ interviewData.job?.title || '未知职位' }}</span>
              </div>
              <div class="info-item">
                <span class="label">面试官：</span>
                <span class="value">{{ interviewData.interviewer?.username || '未知面试官' }}</span>
              </div>
              <div class="info-item">
                <span class="label">求职者：</span>
                <span class="value">{{ interviewData.jobSeeker?.username || '未知求职者' }}</span>
              </div>
              <div class="info-item">
                <span class="label">面试时间：</span>
                <span class="value">{{ formatDateTime(interviewData.scheduleTime) || '--' }}</span>
              </div>
              <div class="info-item">
                <span class="label">面试时长：</span>
                <span class="value">{{ interviewData.duration || '--' }} 分钟</span>
              </div>
            </div>
          </div>

          <div class="feedback-form">
            <h3>面试反馈</h3>
            <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
              <el-form-item label="面试评分" prop="feedbackRating">
                <el-rate
                  v-model="form.feedbackRating"
                  :colors="['#F56C6C', '#E6A23C', '#67C23A']"
                  :texts="['不合格', '勉强及格', '一般', '优秀', '非常优秀']"
                  show-text
                />
              </el-form-item>

              <el-form-item label="详细反馈" prop="comments">
                <el-input
                  v-model="form.comments"
                  type="textarea"
                  :rows="5"
                  placeholder="请分享您对这次面试的详细反馈，包括技术能力、沟通表现、面试表现等方面"
                />
              </el-form-item>

              <el-form-item>
                <div class="form-actions">
                  <el-button @click="goBack">返回</el-button>
                  <el-button type="primary" @click="submitFeedback" :loading="submitting"
                    >提交反馈</el-button
                  >
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { submitInterviewFeedback, startInterview, updateInterview } from '@/api/interview'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const invitationCode = route.params.id

// 状态变量
const loading = ref(true)
const submitting = ref(false)
const interviewData = ref({})
const formRef = ref(null)

// 简化表单数据
const form = reactive({
  comments: '',
  feedbackRating: 3
})

// 简化表单验证规则
const rules = {
  comments: [
    { required: true, message: '请填写详细反馈', trigger: 'blur' },
    { min: 10, message: '反馈内容至少10个字符', trigger: 'blur' }
  ],
  feedbackRating: [{ required: true, message: '请给出面试评分', trigger: 'change' }]
}

// 获取面试信息
const fetchInterviewData = async () => {
  loading.value = true
  try {
    const response = await startInterview(invitationCode)
    if (response) {
      interviewData.value = response

      // 检查用户是否为面试官
      if (!userStore.isInterviewer) {
        ElMessage.warning('只有面试官可以提交面试反馈')
        router.push('/online-interview')
        return
      }
    } else {
      throw new Error('无法获取面试数据')
    }
  } catch (error) {
    console.error('获取面试数据失败:', error)
    ElMessage.error('获取面试数据失败: ' + (error.message || '请稍后重试'))
  } finally {
    loading.value = false
  }
}

// 提交反馈
const submitFeedback = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    submitting.value = true

    // 将反馈提交到后端 - 只传递必要的三个字段
    await submitInterviewFeedback(invitationCode, form.comments, form.feedbackRating)

    // 更新面试状态为已完成
    await updateInterview(interviewData.value.interviewId, {
      status: 'COMPLETED',
      feedback: form.comments,
      feedbackRating: form.feedbackRating
    })

    ElMessage.success('反馈提交成功，面试已结束！')
    router.push('/online-interview')
  } catch (error) {
    console.error('提交反馈失败:', error)
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('提交反馈失败，请稍后重试')
    }
  } finally {
    submitting.value = false
  }
}

// 返回
const goBack = () => {
  router.push('/online-interview')
}

// 辅助函数 - 格式化日期时间
const formatDateTime = dateTime => {
  if (!dateTime) return '--'
  try {
    const date = new Date(dateTime)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  } catch (error) {
    return '--'
  }
}

// 组件挂载
onMounted(() => {
  fetchInterviewData()
})
</script>

<style scoped>
.feedback-page {
  width: 100%;
  min-height: calc(100vh - 72px);
  background-color: #f5f9ff;
  padding: 40px 0;
}

.feedback-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.feedback-card {
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #303133;
}

.card-content {
  padding: 10px 0;
}

.loading-container {
  padding: 20px;
}

.interview-info {
  margin-bottom: 30px;
}

.interview-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
}

.info-item .label {
  width: 100px;
  color: #909399;
  flex-shrink: 0;
}

.info-item .value {
  color: #303133;
  font-weight: 500;
}

.feedback-form h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .feedback-container {
    padding: 0 15px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
