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
                <span class="value">{{ interviewData.interviewer?.name || '未知面试官' }}</span>
              </div>
              <div class="info-item">
                <span class="label">面试时间：</span>
                <span class="value">{{ formatDateTime(interviewData.scheduleTime) || '--' }}</span>
              </div>
              <div class="info-item">
                <span class="label">面试时长：</span>
                <span class="value">{{ interviewData.duration || '--' }} 分钟</span>
              </div>
              <div class="info-item">
                <span class="label">面试轮次：</span>
                <span class="value">{{ getInterviewRoundText(interviewData.round) }}</span>
              </div>
            </div>
          </div>

          <div class="feedback-form">
            <h3>您的反馈</h3>
            <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
              <el-form-item label="整体评价" prop="overallRating">
                <el-rate 
                  v-model="form.overallRating" 
                  :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                  :texts="['失望', '一般', '满意', '良好', '优秀']"
                  show-text
                />
              </el-form-item>

              <el-form-item label="面试体验" prop="experienceRating">
                <el-rate 
                  v-model="form.experienceRating" 
                  :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                />
              </el-form-item>

              <el-form-item label="面试难度" prop="difficultyLevel">
                <el-select v-model="form.difficultyLevel" placeholder="请选择面试难度">
                  <el-option label="非常简单" value="VERY_EASY" />
                  <el-option label="较简单" value="EASY" />
                  <el-option label="中等" value="MEDIUM" />
                  <el-option label="较难" value="HARD" />
                  <el-option label="非常难" value="VERY_HARD" />
                </el-select>
              </el-form-item>

              <el-form-item label="面试时长" prop="durationFeedback">
                <el-radio-group v-model="form.durationFeedback">
                  <el-radio label="TOO_SHORT">时间太短</el-radio>
                  <el-radio label="APPROPRIATE">时间适中</el-radio>
                  <el-radio label="TOO_LONG">时间太长</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="面试内容" prop="contentFeedback">
                <el-checkbox-group v-model="form.contentFeedback">
                  <el-checkbox label="TECHNICAL_SKILLS">技术能力</el-checkbox>
                  <el-checkbox label="PAST_EXPERIENCE">过往经验</el-checkbox>
                  <el-checkbox label="PROBLEM_SOLVING">解决问题能力</el-checkbox>
                  <el-checkbox label="SOFT_SKILLS">软技能</el-checkbox>
                  <el-checkbox label="CULTURE_FIT">文化契合度</el-checkbox>
                </el-checkbox-group>
              </el-form-item>

              <el-form-item label="详细反馈" prop="comments">
                <el-input 
                  v-model="form.comments" 
                  type="textarea" 
                  :rows="5"
                  placeholder="请分享您对这次面试的详细反馈，包括面试内容、面试官表现、公司环境等方面"
                />
              </el-form-item>

              <el-form-item label="下一步" prop="nextSteps">
                <el-radio-group v-model="form.nextSteps">
                  <el-radio label="INTERESTED">我对这个职位很感兴趣</el-radio>
                  <el-radio label="NEED_MORE_INFO">我需要更多信息</el-radio>
                  <el-radio label="NOT_INTERESTED">我对这个职位不感兴趣</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item>
                <div class="form-actions">
                  <el-button @click="goBack">返回</el-button>
                  <el-button type="primary" @click="submitFeedback" :loading="submitting">提交反馈</el-button>
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
import { submitInterviewFeedback, startInterview } from '@/api/interview'

const route = useRoute()
const router = useRouter()
const invitationCode = route.params.id

// 状态变量
const loading = ref(true)
const submitting = ref(false)
const interviewData = ref({})
const formRef = ref(null)

// 表单数据
const form = reactive({
  overallRating: 3,
  experienceRating: 3,
  difficultyLevel: 'MEDIUM',
  durationFeedback: 'APPROPRIATE',
  contentFeedback: ['TECHNICAL_SKILLS', 'PROBLEM_SOLVING'],
  comments: '',
  nextSteps: 'INTERESTED'
})

// 表单验证规则
const rules = {
  overallRating: [{ required: true, message: '请给出整体评价', trigger: 'change' }],
  difficultyLevel: [{ required: true, message: '请选择面试难度', trigger: 'change' }],
  durationFeedback: [{ required: true, message: '请选择对面试时长的反馈', trigger: 'change' }],
  contentFeedback: [{ required: true, message: '请选择面试内容', trigger: 'change' }],
  comments: [
    { required: true, message: '请填写详细反馈', trigger: 'blur' },
    { min: 10, message: '反馈内容至少10个字符', trigger: 'blur' }
  ],
  nextSteps: [{ required: true, message: '请选择下一步意向', trigger: 'change' }]
}

// 获取面试信息
const fetchInterviewData = async () => {
  loading.value = true
  try {
    const response = await startInterview(invitationCode)
    if (response) {
      interviewData.value = response
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
    await submitInterviewFeedback(invitationCode, form)
    
    ElMessage.success('反馈提交成功，感谢您的参与！')
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

// 辅助函数 - 获取面试轮次文本
const getInterviewRoundText = round => {
  const roundMap = {
    'FIRST_INTERVIEW': '一面',
    'SECOND_INTERVIEW': '二面', 
    'HR_INTERVIEW': 'HR面试'
  }
  return roundMap[round] || round || '未知'
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