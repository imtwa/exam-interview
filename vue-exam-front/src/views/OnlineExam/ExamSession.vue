<template>
  <div class="exam-session-page">
    <div class="exam-session-container">
      <!-- 头部导航 -->
      <div class="exam-header">
        <div class="header-left">
          <h1 class="exam-title">{{ loading ? '加载中...' : exam ? exam.title : '未找到考试' }}</h1>
        </div>
        <div class="header-right" v-if="exam">
          <div class="timer-container">
            <el-icon><Timer /></el-icon>
            <div class="timer">{{ formatTime(remainingTime) }}</div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton animated :rows="10" />
      </div>

      <!-- 考试内容 -->
      <template v-else-if="exam">
        <div class="exam-main">
          <!-- 左侧题目区域 -->
          <div class="question-section">
            <!-- 题目基本信息 -->
            <div class="question-header">
              <div class="question-info">
                <span class="question-tag">{{ currentIndex + 1 }}/{{ totalQuestions }}</span>
                <span>{{ currentQuestion ? currentQuestion.content : '' }}</span>
                <el-tag
                  size="small"
                  class="question-type-tag"
                  :type="getQuestionTypeTagColor(currentQuestion?.type)"
                >
                  {{ getQuestionTypeName(currentQuestion?.type) }}
                </el-tag>
                <span class="question-score"
                  >{{ currentQuestion ? currentQuestion.score : 0 }}分</span
                >
              </div>
            </div>

            <!-- 题目内容 -->
            <!-- <div class="question-content" v-if="currentQuestion">
              <div v-html="currentQuestion.content"></div>
            </div> -->

            <!-- 选择题选项 -->
            <div
              class="question-options"
              v-if="
                currentQuestion &&
                (currentQuestion.type === 'single_choice' ||
                  currentQuestion.type === 'multiple_choice')
              "
            >
              <div
                v-for="(option, optIndex) in currentQuestion.options"
                :key="optIndex"
                :class="[
                  'option-item',
                  {
                    selected: isOptionSelected(option.value)
                  }
                ]"
                @click="selectOption(option.value)"
              >
                <div class="option-marker">{{ option.value }}</div>
                <div class="option-content">
                  {{ option.label.substring(option.label.indexOf('.') + 1).trim() }}
                </div>
              </div>
            </div>

            <!-- 填空题输入框 -->
            <div
              class="question-options"
              v-else-if="currentQuestion && currentQuestion.type === 'fill_blank'"
            >
              <el-input
                v-model="answers[currentQuestion.id]"
                type="textarea"
                :rows="3"
                placeholder="请输入您的答案"
                class="fill-answer"
              />
            </div>

            <!-- 简答题输入框 -->
            <div
              class="question-options"
              v-else-if="currentQuestion && currentQuestion.type === 'short_answer'"
            >
              <el-input
                v-model="answers[currentQuestion.id]"
                type="textarea"
                :rows="5"
                placeholder="请输入您的答案"
                class="fill-answer"
              />
            </div>

            <!-- 底部操作区 -->
            <div class="question-actions">
              <div class="action-buttons">
                <el-button @click="prevQuestion" :disabled="currentIndex === 0">
                  <el-icon><ArrowLeft /></el-icon>上一题
                </el-button>

                <el-button
                  type="success"
                  @click="nextQuestion"
                  :disabled="currentIndex === totalQuestions - 1"
                >
                  <el-icon><ArrowRight /></el-icon>下一题
                </el-button>
                <el-button @click="toggleQuestionCard" type="info" plain>
                  <el-icon><Grid /></el-icon>答题卡
                </el-button>
              </div>
            </div>
          </div>

          <!-- 右侧答题卡区域 -->
          <div class="question-card-section" v-if="showQuestionCard">
            <div class="card-header">
              <h3>答题卡</h3>
              <el-button @click="toggleQuestionCard" type="text" icon="Close"></el-button>
            </div>

            <div class="question-progress">
              <span>进度：</span>
              <el-progress
                :percentage="completionPercentage"
                :stroke-width="12"
                :format="percentageFormat"
              />
            </div>

            <div class="card-filters">
              <el-radio-group v-model="cardFilter" size="small">
                <el-radio-button label="all">全部</el-radio-button>
                <el-radio-button label="done">已做</el-radio-button>
                <el-radio-button label="undone">未做</el-radio-button>
              </el-radio-group>
            </div>

            <div class="card-grid">
              <div
                v-for="(question, index) in filteredQuestions"
                :key="index"
                :class="[
                  'card-item',
                  { current: index === currentIndex },
                  { answered: isAnswered(question.id) },
                  { 'single-choice': question.type === 'single_choice' },
                  { 'multiple-choice': question.type === 'multiple_choice' },
                  { judgment: question.type === 'fill_blank' },
                  { 'fill-blank': question.type === 'short_answer' }
                ]"
                @click="goToQuestion(index)"
              >
                {{ index + 1 }}
              </div>
            </div>

            <div class="card-legend">
              <div class="legend-item">
                <div class="legend-color" style="background-color: #2468f2"></div>
                <span>已答: {{ answeredCount }}</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background-color: #c0c4cc"></div>
                <span>未答: {{ totalQuestions - answeredCount }}</span>
              </div>

              <!-- 题型图例 -->
              <div class="type-legend">
                <div class="type-item">
                  <div class="type-dot single"></div>
                  <span>单选</span>
                </div>
                <div class="type-item">
                  <div class="type-dot multiple"></div>
                  <span>多选</span>
                </div>
                <div class="type-item">
                  <div class="type-dot judgment"></div>
                  <span>填空</span>
                </div>
                <div class="type-item">
                  <div class="type-dot fill"></div>
                  <span>简答</span>
                </div>
              </div>
            </div>

            <div class="card-actions">
              <el-button type="primary" @click="confirmSubmit"> 交卷 </el-button>
              <el-button @click="saveAnswers" :loading="saving"> 保存 </el-button>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="error-container">
        <el-empty description="未找到考试或考试已结束" :image-size="200">
          <el-button type="primary" @click="goToHome">返回首页</el-button>
        </el-empty>
      </div>
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
import { Timer, ArrowLeft, ArrowRight, Grid, Close } from '@element-plus/icons-vue'
import { startExam, saveExamAnswers, submitExamAnswers } from '@/api/exam'

const route = useRoute()
const router = useRouter()
const examId = route.params.id

// 页面状态
const loading = ref(true)
const saving = ref(false)
const submitting = ref(false)
const submitConfirmVisible = ref(false)
const showQuestionCard = ref(false)
const cardFilter = ref('all')
const currentIndex = ref(0)

// 考试数据
const exam = ref(null)
const answers = reactive({})
const remainingTime = ref(0)
const timerInterval = ref(null)

// 计算总题目数
const totalQuestions = computed(() => {
  if (!exam.value) return 0

  return exam.value.sections.reduce((total, section) => {
    return total + section.questions.length
  }, 0)
})

// 获取当前题目
const currentQuestion = computed(() => {
  if (!exam.value) return null

  // 将所有section中的questions展平为一个数组
  const allQuestions = []
  exam.value.sections.forEach(section => {
    section.questions.forEach(question => {
      allQuestions.push(question)
    })
  })

  if (allQuestions.length === 0) return null
  return allQuestions[currentIndex.value]
})

// 获取所有题目（展平）
const allQuestions = computed(() => {
  if (!exam.value) return []

  const questions = []
  exam.value.sections.forEach(section => {
    section.questions.forEach(question => {
      questions.push(question)
    })
  })

  return questions
})

// 过滤题目（根据答题状态）
const filteredQuestions = computed(() => {
  if (cardFilter.value === 'all') return allQuestions.value

  return allQuestions.value.filter(question => {
    const isAnswered = isAnswered(question.id)
    return cardFilter.value === 'done' ? isAnswered : !isAnswered
  })
})

// 已答题数量
const answeredCount = computed(() => {
  return allQuestions.value.filter(question => isAnswered(question.id)).length
})

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

// 获取题型标签颜色
const getQuestionTypeTagColor = type => {
  const colorMap = {
    single_choice: 'primary',
    multiple_choice: 'success',
    fill_blank: 'warning',
    short_answer: 'info'
  }
  return colorMap[type] || ''
}

// 上一题
const prevQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

// 下一题
const nextQuestion = () => {
  if (currentIndex.value < totalQuestions.value - 1) {
    currentIndex.value++
  }
}

// 跳转到特定题目
const goToQuestion = index => {
  if (index >= 0 && index < totalQuestions.value) {
    currentIndex.value = index
  }
}

// 切换答题卡显示
const toggleQuestionCard = () => {
  showQuestionCard.value = !showQuestionCard.value
}

// 判断选项是否已选中
const isOptionSelected = optionValue => {
  if (!currentQuestion.value) return false

  const answer = answers[currentQuestion.value.id]
  if (currentQuestion.value.type === 'multiple_choice') {
    return Array.isArray(answer) && answer.includes(optionValue)
  } else {
    return answer === optionValue
  }
}

// 选择选项
const selectOption = optionValue => {
  if (!currentQuestion.value) return

  if (currentQuestion.value.type === 'multiple_choice') {
    const answerArray = answers[currentQuestion.value.id]
    const index = answerArray.indexOf(optionValue)

    if (index === -1) {
      answerArray.push(optionValue)
    } else {
      answerArray.splice(index, 1)
    }
  } else {
    answers[currentQuestion.value.id] = optionValue
  }
}

// 判断题目是否已回答
const isAnswered = questionId => {
  const answer = answers[questionId]
  if (Array.isArray(answer)) {
    return answer.length > 0
  } else {
    return answer !== null && answer !== undefined && answer.trim() !== ''
  }
}

// 计算完成百分比
const completionPercentage = computed(() => {
  if (!exam.value) return 0
  return totalQuestions.value === 0
    ? 0
    : Math.round((answeredCount.value / totalQuestions.value) * 100)
})

// 格式化百分比
const percentageFormat = percentage => {
  return `${percentage}%`
}

// 计算未回答题目数
const unansweredCount = computed(() => {
  return totalQuestions.value - answeredCount.value
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

      // 跳转到结果页面，使用邀请码路径
      router.push(`/online-exam/result/code/${route.params.id}`)
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
.exam-session-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.exam-session-container {
  max-width: 1200px;
  margin: 0 auto;
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.exam-title {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
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

.loading-container {
  padding: 20px;
  background-color: white;
  border-radius: 4px;
}

.exam-main {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  position: relative;
}

.question-section {
  flex: 1;
  background-color: white;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.question-header {
  margin-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 15px;
}

.question-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
}

.question-tag {
  background-color: #409eff;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.question-type-tag {
  margin-left: auto;
}

.question-score {
  color: #e6a23c;
  font-weight: bold;
}

.question-content {
  margin-bottom: 20px;
  font-size: 16px;
  line-height: 1.6;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
}

.option-item {
  display: flex;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.option-item:hover {
  background-color: #f5f7fa;
}

.option-item.selected {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.option-marker {
  width: 24px;
  height: 24px;
  background-color: #f0f2f5;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  margin-right: 10px;
}

.option-item.selected .option-marker {
  background-color: #409eff;
  color: white;
}

.option-content {
  flex: 1;
}

.fill-answer {
  width: 100%;
}

.question-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.question-card-section {
  width: 250px;
  height: 400px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
}

.question-progress {
  margin-bottom: 16px;
}

.card-filters {
  margin-bottom: 16px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  margin-bottom: 16px;
  overflow-y: auto;
  max-height: 200px;
  padding-right: 5px;
}

.card-grid::-webkit-scrollbar {
  display: none; /* Hide scrollbar for Chrome, Safari and Opera */
}

.card-grid {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.card-item {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  font-size: 12px;
}

.card-item:hover {
  opacity: 0.8;
}

.card-item.current {
  border-color: #3370ff;
  box-shadow: 0 0 5px rgba(51, 112, 255, 0.5);
  font-weight: bold;
}

.card-item.answered {
  color: #333;
  font-weight: bold;
  background-color: #e6f7ff;
}

/* 不同题型的样式 */
.card-item.single-choice {
  background-color: transparent; /* 单选题为透明背景 */
}

.card-item.multiple-choice {
  background-color: rgba(24, 144, 255, 0.15); /* 蓝色背景，多选题 */
}

.card-item.judgment {
  background-color: rgba(250, 173, 20, 0.15); /* 黄色背景，判断题 */
}

.card-item.fill-blank {
  background-color: rgba(114, 46, 209, 0.15); /* 紫色背景，填空题 */
}

.card-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.type-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.type-dot {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid #e8e8e8;
}

.type-dot.single {
  background-color: transparent; /* 单选题，透明 */
}

.type-dot.multiple {
  background-color: rgba(24, 144, 255, 0.15); /* 蓝色，多选题 */
}

.type-dot.judgment {
  background-color: rgba(250, 173, 20, 0.15); /* 黄色，判断题 */
}

.type-dot.fill {
  background-color: rgba(114, 46, 209, 0.15); /* 紫色，填空题 */
}

.card-actions {
  display: flex;
  gap: 12px;
  margin-top: auto;
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
  background-color: white;
  border-radius: 4px;
  padding: 20px;
}

@media (max-width: 768px) {
  .exam-main {
    flex-direction: column;
  }

  .question-card-section {
    width: 100%;
  }
}
</style>
