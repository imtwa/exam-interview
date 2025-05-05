<template>
  <div class="exam-session-container">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <template v-else-if="exam">
      <!-- 考试头部信息 -->
      <el-card class="exam-header">
        <div class="header-top">
          <h1 class="exam-title">{{ exam.title }}</h1>
          <div class="timer-container">
            <el-icon><Timer /></el-icon>
            <div class="timer">{{ formatTime(remainingTime) }}</div>
          </div>
        </div>

        <div class="exam-details">
          <div><span class="label">总分:</span> {{ exam.totalScore }}分</div>
          <div><span class="label">题目数:</span> {{ exam.totalQuestions }}题</div>
          <div><span class="label">考试时长:</span> {{ exam.duration }}分钟</div>
        </div>
      </el-card>

      <!-- 考试内容 -->
      <div class="exam-content">
        <el-tabs v-model="activeTab" class="exam-tabs" tab-position="left">
          <el-tab-pane
            v-for="(section, sectionIndex) in exam.sections"
            :key="sectionIndex"
            :label="`第${sectionIndex + 1}部分`"
            :name="sectionIndex.toString()"
          >
            <div class="section-info">
              <h2>{{ section.title }}</h2>
              <p v-if="section.description">{{ section.description }}</p>
            </div>

            <div class="questions-container">
              <div
                v-for="(question, questionIndex) in section.questions"
                :key="questionIndex"
                class="question-item"
              >
                <div class="question-header">
                  <span class="question-number">{{ questionIndex + 1 }}</span>
                  <span class="question-score">({{ question.score }}分)</span>
                  <span class="question-type">[{{ getQuestionTypeName(question.type) }}]</span>
                </div>

                <div class="question-content">
                  <div v-html="question.content"></div>
                </div>

                <!-- 选择题 -->
                <div
                  v-if="question.type === 'single_choice' || question.type === 'multiple_choice'"
                  class="options-container"
                >
                  <el-radio-group
                    v-if="question.type === 'single_choice'"
                    v-model="answers[question.id]"
                  >
                    <el-radio
                      v-for="(option, optionIndex) in question.options"
                      :key="optionIndex"
                      :label="option.value"
                      class="option-item"
                    >
                      {{ option.label }}
                    </el-radio>
                  </el-radio-group>

                  <el-checkbox-group v-else v-model="answers[question.id]">
                    <el-checkbox
                      v-for="(option, optionIndex) in question.options"
                      :key="optionIndex"
                      :label="option.value"
                      class="option-item"
                    >
                      {{ option.label }}
                    </el-checkbox>
                  </el-checkbox-group>
                </div>

                <!-- 填空题 -->
                <div v-else-if="question.type === 'fill_blank'" class="fill-blank-container">
                  <el-input
                    v-model="answers[question.id]"
                    placeholder="请输入答案"
                    class="fill-input"
                  />
                </div>

                <!-- 简答题 -->
                <div v-else-if="question.type === 'short_answer'" class="short-answer-container">
                  <el-input
                    v-model="answers[question.id]"
                    type="textarea"
                    placeholder="请输入答案"
                    :rows="4"
                    resize="vertical"
                    class="short-answer-input"
                  />
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 底部提交区域 -->
      <div class="footer-actions">
        <el-progress
          :percentage="completionPercentage"
          :format="percentageFormat"
          style="width: 300px"
        />
        <div class="submit-container">
          <el-button @click="saveAnswers" :loading="saving">保存答案</el-button>
          <el-button type="primary" @click="confirmSubmit" :loading="submitting"
            >提交试卷</el-button
          >
        </div>
      </div>
    </template>

    <div v-else class="error-container">
      <el-empty description="未找到考试或考试已结束" :image-size="200">
        <el-button type="primary" @click="goToHome">返回首页</el-button>
      </el-empty>
    </div>

    <!-- 提交确认对话框 -->
    <el-dialog v-model="submitConfirmVisible" title="确认提交" width="30%" center>
      <span>
        确定要提交试卷吗？提交后将无法修改答案。
        <template v-if="unansweredCount > 0">
          <br /><br />
          <el-alert type="warning" :title="`你还有 ${unansweredCount} 道题目未回答`" show-icon />
        </template>
      </span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="submitConfirmVisible = false">取消</el-button>
          <el-button type="primary" @click="submitExam" :loading="submitting"> 确认提交 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Timer } from '@element-plus/icons-vue'
import { startExam, saveExamAnswers, submitExamAnswers } from '@/api/exam'

const route = useRoute()
const router = useRouter()
const examId = route.params.id

// 页面状态
const loading = ref(true)
const saving = ref(false)
const submitting = ref(false)
const submitConfirmVisible = ref(false)

// 考试数据
const exam = ref(null)
const answers = reactive({})
const activeTab = ref('0')
const remainingTime = ref(0)
const timerInterval = ref(null)

// 模拟获取考试数据
const fetchExamData = async () => {
  loading.value = true

  try {
    // 使用实际API调用，从邀请码获取考试详情
    const response = await startExam(route.params.id)
    console.log('获取到的考试数据:', response)
    
    // 设置考试数据
    if (!response) {
      throw new Error('无法获取考试数据')
    }
    
    if (!response.examTitle || !response.questions) {
      console.error('获取的考试数据格式不正确:', response)
      throw new Error('考试数据格式不正确，请联系管理员')
    }
    
    exam.value = {
      id: response.examId,
      title: response.examTitle,
      totalScore: 100, // 总分默认100分
      totalQuestions: response.questions.length,
      duration: response.duration,
      sections: [
        {
          title: '考试内容',
          description: response.note || '请认真作答，诚信考试',
          questions: response.questions.map((q, index) => {
            // 格式转换
            let type = 'single_choice'
            if (q.qtype === 1) type = 'single_choice'
            else if (q.qtype === 2) type = 'multiple_choice'
            else if (q.qtype === 3) type = 'fill_blank'
            else if (q.qtype === 4) type = 'short_answer'
            
            let options = []
            if (q.options) {
              try {
                const parsedOptions = JSON.parse(q.options)
                options = parsedOptions.map(opt => ({
                  label: `${opt.Key}. ${opt.Value}`,
                  value: opt.Key
                }))
              } catch (err) {
                console.error('解析选项错误:', err, '原始选项:', q.options)
              }
            }
            
            return {
              id: q.id.toString(),
              type,
              content: q.question,
              score: q.score || 5,
              options
            }
          })
        }
      ]
    }

    // 初始化计时器
    remainingTime.value = exam.value.duration * 60 // 转换为秒
    startTimer()

    // 初始化答案对象
    initializeAnswers()
  } catch (error) {
    console.error('获取考试数据失败:', error)
    ElMessage.error('获取考试数据失败: ' + (error.message || '请稍后重试'))
    exam.value = null
  } finally {
    loading.value = false
  }
}

// 初始化答案
const initializeAnswers = () => {
  if (!exam.value) return

  exam.value.sections.forEach(section => {
    section.questions.forEach(question => {
      if (question.type === 'multiple_choice') {
        answers[question.id] = []
      } else {
        answers[question.id] = ''
      }
    })
  })
}

// 启动计时器
const startTimer = () => {
  if (timerInterval.value) clearInterval(timerInterval.value)

  timerInterval.value = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
    } else {
      clearInterval(timerInterval.value)
      timeUp()
    }
  }, 1000)
}

// 时间格式化
const formatTime = seconds => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 时间到期处理
const timeUp = () => {
  ElMessageBox.alert('考试时间已到，系统将自动提交你的答案', '提示', {
    confirmButtonText: '确定',
    callback: () => {
      submitExam()
    }
  })
}

// 获取题型名称
const getQuestionTypeName = type => {
  const typeMap = {
    single_choice: '单选题',
    multiple_choice: '多选题',
    fill_blank: '填空题',
    short_answer: '简答题'
  }
  return typeMap[type] || '未知题型'
}

// 计算完成百分比
const completionPercentage = computed(() => {
  if (!exam.value) return 0

  let totalQuestions = 0
  let answeredQuestions = 0

  exam.value.sections.forEach(section => {
    section.questions.forEach(question => {
      totalQuestions++

      const answer = answers[question.id]
      if (
        (Array.isArray(answer) && answer.length > 0) ||
        (typeof answer === 'string' && answer.trim() !== '')
      ) {
        answeredQuestions++
      }
    })
  })

  return totalQuestions === 0 ? 0 : Math.round((answeredQuestions / totalQuestions) * 100)
})

// 格式化百分比
const percentageFormat = percentage => {
  return `已完成 ${percentage}%`
}

// 计算未回答题目数
const unansweredCount = computed(() => {
  if (!exam.value) return 0

  let count = 0

  exam.value.sections.forEach(section => {
    section.questions.forEach(question => {
      const answer = answers[question.id]
      if (
        (Array.isArray(answer) && answer.length === 0) ||
        (typeof answer === 'string' && answer.trim() === '')
      ) {
        count++
      }
    })
  })

  return count
})

// 保存答案
const saveAnswers = async () => {
  saving.value = true

  try {
    // 准备提交的答案数据
    const formattedAnswers = {}
    Object.keys(answers).forEach(key => {
      formattedAnswers[key] = answers[key]
    })
    
    // 调用API保存答案
    await saveExamAnswers(route.params.id, formattedAnswers)
    
    ElMessage.success('答案已保存')
  } catch (error) {
    console.error('保存答案失败:', error)
    ElMessage.error('保存答案失败: ' + (error.message || '请稍后重试'))
  } finally {
    saving.value = false
  }
}

// 确认提交
const confirmSubmit = () => {
  submitConfirmVisible.value = true
}

// 提交考试
const submitExam = async () => {
  submitting.value = true

  try {
    // 准备提交的答案数据
    const formattedAnswers = {}
    Object.keys(answers).forEach(key => {
      formattedAnswers[key] = answers[key]
    })
    
    // 调用API提交答案
    const response = await submitExamAnswers(route.params.id, formattedAnswers)
    
    // 处理提交结果
    if (response) {
      ElMessage.success('试卷提交成功')
      // 清除计时器
      if (timerInterval.value) {
        clearInterval(timerInterval.value)
      }
      
      // 跳转到结果页面
      router.push(`/online-exam/result/${route.params.id}`)
    } else {
      throw new Error('提交失败，未收到服务器响应')
    }
  } catch (error) {
    console.error('提交试卷失败:', error)
    ElMessage.error('提交试卷失败: ' + (error.message || '请稍后重试'))
    
    // 关闭提交确认对话框，但不跳转
    submitConfirmVisible.value = false
  } finally {
    submitting.value = false
  }
}

// 返回首页
const goToHome = () => {
  router.push('/online-exam')
}

// 页面离开提示
const beforeWindowUnload = e => {
  e.preventDefault()
  e.returnValue = '考试进行中，确定要离开页面吗？'
}

// 生命周期钩子
onMounted(() => {
  fetchExamData()
  window.addEventListener('beforeunload', beforeWindowUnload)
})

onBeforeUnmount(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  window.removeEventListener('beforeunload', beforeWindowUnload)
})
</script>

<style scoped>
.exam-session-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container {
  padding: 20px;
}

.exam-header {
  margin-bottom: 20px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.exam-title {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.timer-container {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f56c6c;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
}

.timer {
  font-size: 18px;
  font-weight: bold;
  font-family: monospace;
}

.exam-details {
  display: flex;
  gap: 30px;
  color: #606266;
}

.label {
  font-weight: bold;
  margin-right: 5px;
}

.exam-content {
  margin-bottom: 30px;
}

.exam-tabs {
  min-height: 600px;
}

:deep(.el-tabs__item) {
  height: auto;
  padding: 15px;
  text-align: center;
}

.section-info {
  margin-bottom: 25px;
}

.section-info h2 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #303133;
}

.section-info p {
  color: #606266;
  margin: 0;
}

.questions-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.question-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 20px;
  background-color: #fff;
}

.question-header {
  margin-bottom: 15px;
}

.question-number {
  font-weight: bold;
  color: #409eff;
  margin-right: 8px;
}

.question-score {
  color: #e6a23c;
  margin-right: 8px;
}

.question-type {
  color: #606266;
}

.question-content {
  margin-bottom: 20px;
  color: #303133;
  line-height: 1.6;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.option-item {
  display: block;
  margin-left: 0 !important;
}

.fill-input,
.short-answer-input {
  width: 100%;
}

.footer-actions {
  position: sticky;
  bottom: 0;
  background-color: white;
  padding: 15px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.submit-container {
  display: flex;
  gap: 15px;
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
}
</style>
