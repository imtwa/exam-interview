<template>
  <div class="practice-exam-page">
    <div class="practice-exam-container">
      <!-- 头部导航 -->
      <div class="practice-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/question-bank' }">试题库</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: `/exam/${examId}` }">{{
              loading ? '加载中...' : examData.name || '未命名试卷'
            }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ modeTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton animated :rows="10" />
      </div>

      <!-- 主要内容区 -->
      <template v-else>
        <div class="practice-main">
          <!-- 左侧题目区域 -->
          <div class="question-section">
            <!-- 题目序号和信息 -->
            <div class="question-header">
              <div class="question-info">
                <span class="question-tag">{{ currentIndex + 1 }}/{{ questionList.length }}.</span>
                <span v-if="currentQuestion">{{
                  currentQuestion.question?.question || currentQuestion.question
                }}</span>
                <el-tag
                  size="small"
                  class="question-type-tag"
                  :type="
                    getQuestionTypeTag(currentQuestion?.question?.qtype || currentQuestion?.qtype)
                  "
                >
                  {{
                    getQuestionTypeName(currentQuestion?.question?.qtype || currentQuestion?.qtype)
                  }}
                </el-tag>
              </div>
            </div>

            <!-- 选项区域 -->
            <div
              class="question-options"
              v-if="
                currentQuestion &&
                [1, 2].includes(currentQuestion.question?.qtype || currentQuestion.qtype)
              "
            >
              <div
                v-for="(option, optIndex) in parseOptions(
                  currentQuestion.question?.options || currentQuestion.options
                )"
                :key="optIndex"
                :class="[
                  'option-item',
                  {
                    selected: isOptionSelected(optIndex),
                    correct: showAnswer && isCorrectOption(optIndex)
                  }
                ]"
                @click="selectOption(optIndex)"
              >
                <div class="option-marker">{{ optionLabels[optIndex] }}</div>
                <div class="option-content">{{ option }}</div>
              </div>
            </div>

            <!-- 判断题选项 -->
            <div
              class="question-options"
              v-else-if="
                currentQuestion && (currentQuestion.question?.qtype || currentQuestion.qtype) === 3
              "
            >
              <div
                :class="[
                  'option-item',
                  {
                    selected: userAnswers[currentIndex] === '1',
                    correct:
                      showAnswer &&
                      '1' === (currentQuestion.question?.answer || currentQuestion.answer)
                  }
                ]"
                @click="selectJudgementOption('1')"
              >
                <div class="option-marker">A</div>
                <div class="option-content">正确</div>
              </div>
              <div
                :class="[
                  'option-item',
                  {
                    selected: userAnswers[currentIndex] === '0',
                    correct:
                      showAnswer &&
                      '0' === (currentQuestion.question?.answer || currentQuestion.answer)
                  }
                ]"
                @click="selectJudgementOption('0')"
              >
                <div class="option-marker">B</div>
                <div class="option-content">错误</div>
              </div>
            </div>

            <!-- 填空题输入框 -->
            <div
              class="question-options"
              v-else-if="
                currentQuestion && (currentQuestion.question?.qtype || currentQuestion.qtype) === 4
              "
            >
              <el-input
                v-model="userAnswers[currentIndex]"
                type="textarea"
                :rows="3"
                placeholder="请输入您的答案"
                class="fill-answer"
              />
            </div>

            <!-- 答案与解析区域 -->
            <div class="answer-section" v-if="showAnswer">
              <div class="answer-header">
                <span class="correct-tag" v-if="isCurrentAnswerCorrect">正确</span>
                <span class="wrong-tag" v-else>错误</span>
              </div>
              <div class="answer-content">
                <p class="answer-title">参考答案：</p>
                <p class="answer-value">
                  {{
                    formatAnswer(
                      currentQuestion?.question?.answer || currentQuestion?.answer,
                      currentQuestion?.question?.qtype || currentQuestion?.qtype
                    )
                  }}
                </p>
              </div>
              <div
                class="analysis-content"
                v-if="currentQuestion?.question?.ai_analysis || currentQuestion?.ai_analysis"
              >
                <p class="analysis-title">答案解析：</p>
                <p class="analysis-value">
                  {{ currentQuestion?.question?.ai_analysis || currentQuestion?.ai_analysis }}
                </p>
              </div>
            </div>

            <!-- 底部操作区 -->
            <div class="question-actions">
              <div class="action-buttons">
                <el-button @click="prevQuestion" :disabled="currentIndex === 0">
                  <el-icon><ArrowLeft /></el-icon>上一题
                </el-button>

                <!-- 模拟考试模式不显示查看答案按钮 -->
                <el-button
                  v-if="practiceMode !== 'simulation'"
                  type="primary"
                  @click="checkAnswer"
                  :disabled="answered[currentIndex]"
                >
                  <el-icon><Check /></el-icon>查看答案
                </el-button>

                <el-button
                  type="success"
                  @click="nextQuestion"
                  :disabled="currentIndex === questionList.length - 1"
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
                :percentage="progressPercentage"
                :stroke-width="12"
                :format="progressFormat"
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
                  { current: question.order - 1 === currentIndex },
                  { answered: isAnswered(question.order - 1) },
                  { correct: answered[question.order - 1] && correct[question.order - 1] },
                  { wrong: answered[question.order - 1] && !correct[question.order - 1] },
                  { 'single-choice': getQuestionType(question) === 1 },
                  { 'multiple-choice': getQuestionType(question) === 2 },
                  { judgment: getQuestionType(question) === 3 },
                  { 'fill-blank': getQuestionType(question) === 4 }
                ]"
                @click="goToQuestion(question.order - 1)"
              >
                {{ question.order || index + 1 }}
              </div>
            </div>

            <div class="card-legend">
              <div class="legend-item">
                <div class="legend-color" style="background-color: #2468f2"></div>
                <span>正确: {{ correctCount }}</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background-color: #0af"></div>
                <span>错误: {{ incorrectCount }}</span>
              </div>

              <!-- 添加题型图例 -->
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
                  <span>判断</span>
                </div>
                <div class="type-item">
                  <div class="type-dot fill"></div>
                  <span>填空</span>
                </div>
              </div>
            </div>

            <div class="card-actions">
              <el-button type="primary" @click="finishPractice">
                <!-- 根据模式显示不同的按钮文本 -->
                <template v-if="practiceMode === 'simulation'">交卷</template>
                <template v-else>结束练习</template>
              </el-button>
              <!-- 模拟考试模式不显示设置按钮 -->
              <el-button v-if="practiceMode !== 'simulation'" @click="toggleSettings" plain>
                设置
              </el-button>
            </div>
          </div>

          <!-- 设置面板 -->
          <div class="settings-panel" v-if="showSettings">
            <div class="settings-header">
              <h3>设置</h3>
              <el-button @click="toggleSettings" type="text" icon="Close"></el-button>
            </div>

            <div class="settings-content">
              <div class="setting-item">
                <span>答对自动下一题</span>
                <el-switch v-model="autoNext" />
              </div>
              <div class="setting-item">
                <span>显示解析</span>
                <el-switch v-model="alwaysShowAnalysis" />
              </div>
              <div class="setting-item">
                <span>保护模式</span>
                <el-switch v-model="protectionMode" />
              </div>
              <div class="setting-item">
                <span>字体大小</span>
                <div class="font-size-options">
                  <span
                    :class="['size-option', { active: fontSize === 'small' }]"
                    @click="fontSize = 'small'"
                    >较小</span
                  >
                  <span
                    :class="['size-option', { active: fontSize === 'normal' }]"
                    @click="fontSize = 'normal'"
                    >标准</span
                  >
                  <span
                    :class="['size-option', { active: fontSize === 'large' }]"
                    @click="fontSize = 'large'"
                    >较大</span
                  >
                </div>
              </div>
              <!-- 随机练习相关设置 -->
              <div class="setting-item" v-if="practiceMode === 'random'">
                <span>随机题目数量</span>
                <el-input-number
                  v-model="randomQuestionCount"
                  :min="5"
                  :max="100"
                  size="small"
                  @change="handleRandomCountChange"
                />
              </div>
              <div class="setting-item">
                <span>随机间隔（秒）</span>
                <el-input-number v-model="randomInterval" :min="1" :max="999" />
              </div>
              <div class="setting-item">
                <span>自动提交时间（分钟）</span>
                <el-input-number v-model="autoSubmitTime" :min="0" :max="999" />
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 题型选择对话框 -->
      <el-dialog
        v-model="showTypeDialog"
        title="选择题型"
        width="400px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
      >
        <div class="question-type-dialog">
          <div class="type-options">
            <el-button type="primary" @click="selectQuestionType(1)" size="large">单选题</el-button>
            <el-button type="success" @click="selectQuestionType(2)" size="large">多选题</el-button>
          </div>
          <div class="type-options">
            <el-button type="warning" @click="selectQuestionType(3)" size="large">判断题</el-button>
            <el-button type="info" @click="selectQuestionType(4)" size="large">填空题</el-button>
          </div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="goBackToExam">返回试卷</el-button>
            <el-button type="primary" @click="selectRandomType">随机题型</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getExamDetail } from '@/api/exam'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Star,
  Grid,
  Close,
  Document,
  Timer
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const examId = computed(() => route.params.id)

// 数据状态
const loading = ref(true)
const examData = ref({})
const questionList = ref([])
const currentIndex = ref(0)
const userAnswers = ref([])
const showAnswer = ref(false)
const answered = ref([])
const correct = ref([])
const showQuestionCard = ref(false)
const showSettings = ref(false)
const isCurrentQuestionCollected = ref(false)
const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const selectedQuestionType = ref(0) // 题型练习选择的题型
const showTypeDialog = ref(false) // 控制题型选择对话框显示

// 练习设置
const autoNext = ref(false)
const alwaysShowAnalysis = ref(true)
const protectionMode = ref(false)
const fontSize = ref('normal')
const randomInterval = ref(3)
const autoSubmitTime = ref(0)
const cardFilter = ref('all')
const randomQuestionCount = ref(10) // 随机练习的题目数量
const practiceMode = computed(() => route.query.mode || 'sequential') // 练习模式

// 从URL参数中获取要跳转的题目索引
const questionIndexParam = computed(() => {
  const indexParam = route.query.questionIndex
  if (indexParam) {
    const parsedIndex = parseInt(indexParam)
    return !isNaN(parsedIndex) ? parsedIndex : 0
  }
  return 0
})

// 计算属性
const currentQuestion = computed(() => {
  if (questionList.value.length === 0) return null
  return questionList.value[currentIndex.value]
})

const isCurrentAnswerCorrect = computed(() => {
  if (!currentQuestion.value) return false
  return correct.value[currentIndex.value] || false
})

const progressPercentage = computed(() => {
  if (questionList.value.length === 0) return 0
  return Math.round((answered.value.filter(Boolean).length / questionList.value.length) * 100)
})

const correctCount = computed(() => {
  return correct.value.filter(Boolean).length
})

const incorrectCount = computed(() => {
  return answered.value.filter(Boolean).length - correctCount.value
})

const filteredQuestions = computed(() => {
  if (cardFilter.value === 'all') return questionList.value
  if (cardFilter.value === 'done')
    return questionList.value.filter((_, index) => {
      // 已提交答案的题目或已有答案但未提交的题目
      return answered.value[index] || hasUserAnswer(index)
    })
  if (cardFilter.value === 'undone') {
    // 未提交答案且未选择任何选项的题目
    return questionList.value.filter((_, index) => {
      return !answered.value[index] && !hasUserAnswer(index)
    })
  }
  if (cardFilter.value === 'marked') return questionList.value.filter((_, index) => false) // 暂未实现标记功能
  return questionList.value
})

const modeTitle = computed(() => {
  const modes = {
    sequential: '顺序练习',
    random: '随机练习',
    simulation: '模拟考试',
    typebased: '题型练习'
  }
  return modes[practiceMode.value] || '顺序练习'
})

// 检查用户是否已经选择了答案但还未提交
const hasUserAnswer = index => {
  const userAnswer = userAnswers.value[index]
  const question = questionList.value[index]
  if (!question) return false

  const qtype = question.question?.qtype || question.qtype

  // 单选题或判断题：检查是否有选择
  if (qtype === 1 || qtype === 3) {
    return userAnswer !== '' && userAnswer !== undefined
  }
  // 多选题：检查是否有选择（数组是否为空）
  else if (qtype === 2) {
    return Array.isArray(userAnswer) && userAnswer.length > 0
  }
  // 填空题：检查是否有输入
  else if (qtype === 4) {
    return userAnswer !== '' && userAnswer !== undefined
  }

  return false
}

// 方法
const fetchExamDetail = async () => {
  loading.value = true
  try {
    const data = await getExamDetail(examId.value)
    if (!data) {
      throw new Error('获取试卷详情失败，返回数据为空')
    }

    examData.value = data
    let originalOrders = {} // 保存原始题号

    // 保存原始order值，用于可能需要显示原始题号的场景
    if (data.examQuestions && data.examQuestions.length > 0) {
      data.examQuestions.forEach(q => {
        if (q.questionId) {
          originalOrders[q.questionId] = q.order || 0
        } else if (q.id) {
          originalOrders[q.id] = q.order || 0
        }
      })
    }

    // 根据不同练习模式处理题目列表
    if (practiceMode.value === 'random') {
      // 随机练习模式 - 随机选择指定数量的题目
      const allQuestions = [...(data.examQuestions || [])]
      // 随机打乱题目
      const shuffled = allQuestions.sort(() => Math.random() - 0.5)
      // 取指定数量的题目，如果题目总数小于设定数量，则取全部题目
      questionList.value = shuffled.slice(0, Math.min(randomQuestionCount.value, shuffled.length))
      // 重新设置题号
      resetQuestionOrder(questionList.value, originalOrders)
    } else if (practiceMode.value === 'simulation') {
      // 模拟考试模式 - 随机打乱所有题目顺序
      questionList.value = [...(data.examQuestions || [])].sort(() => Math.random() - 0.5)
      // 重新设置题号
      resetQuestionOrder(questionList.value, originalOrders)
    } else if (practiceMode.value === 'typebased') {
      // 题型练习模式 - 根据selectedQuestionType筛选题目
      // 如果是第一次加载且未选择题型，弹出选择对话框
      if (selectedQuestionType.value === 0) {
        // 先加载所有题目
        questionList.value = data.examQuestions || []
        // 显示题型选择对话框
        setTimeout(() => {
          showTypeDialog.value = true
        }, 500)
      } else {
        // 已选择题型，筛选对应题型的题目
        const filteredQuestions = (data.examQuestions || []).filter(q => {
          const qtype = q.question?.qtype || q.qtype
          return qtype === selectedQuestionType.value
        })

        if (filteredQuestions.length === 0) {
          ElMessage.warning(
            `该试卷中没有类型为"${getQuestionTypeName(selectedQuestionType.value)}"的题目`
          )
          // 没有符合条件的题目，加载所有题目
          questionList.value = data.examQuestions || []
        } else {
          questionList.value = filteredQuestions
          // 重新设置题号
          resetQuestionOrder(questionList.value, originalOrders)
        }
      }
    } else {
      // 顺序练习模式 - 按原始顺序，保持原始题号
      questionList.value = data.examQuestions || []
    }

    // 检查试卷数据是否完整
    if (!examData.value.name) {
      console.warn('试卷名称为空')
    }

    if (!questionList.value.length) {
      ElMessage.warning('该试卷暂无题目')
    }

    // 初始化答案和状态数组
    initUserAnswers()

    // 如果URL中有指定题目索引，跳转到对应题目
    if (questionIndexParam.value > 0 && questionIndexParam.value < questionList.value.length) {
      setTimeout(() => {
        currentIndex.value = questionIndexParam.value
      }, 300)
    }

    // console.log('试卷详情:', data)
  } catch (error) {
    console.error('获取试卷详情失败:', error)
    ElMessage.error('获取试卷详情失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

// 重新设置题号，按照新的顺序
const resetQuestionOrder = (questions, originalOrders) => {
  questions.forEach((question, index) => {
    // 保存原始题号，用于特殊场景显示
    question.originalOrder = question.order
    // 更新为新的连续题号
    question.order = index + 1
    // 添加原始题号（如果需要显示）
    if (question.questionId) {
      question.originalOrder = originalOrders[question.questionId] || question.originalOrder
    } else if (question.id) {
      question.originalOrder = originalOrders[question.id] || question.originalOrder
    }
  })
}

// 解析选项
const parseOptions = optionsStr => {
  if (!optionsStr) return []
  try {
    const options = JSON.parse(optionsStr)
    if (Array.isArray(options)) {
      return options.map(option => {
        if (typeof option === 'string') return option
        return option.Value || option
      })
    }
    return []
  } catch (error) {
    console.error('解析选项失败:', error, optionsStr)
    return []
  }
}

const initUserAnswers = () => {
  userAnswers.value = new Array(questionList.value.length).fill('')
  answered.value = new Array(questionList.value.length).fill(false)
  correct.value = new Array(questionList.value.length).fill(false)

  // 对于多选题，初始化为空数组
  questionList.value.forEach((question, index) => {
    const qtype = question.question?.qtype || question.qtype
    if (qtype === 2) {
      userAnswers.value[index] = []
    }
  })
}

const selectOption = optIndex => {
  if (answered.value[currentIndex.value]) return

  const qtype = currentQuestion.value.question?.qtype || currentQuestion.value.qtype

  if (qtype === 1) {
    // 单选题 - 允许取消选择
    if (userAnswers.value[currentIndex.value] === optIndex) {
      // 如果点击的是已选中的选项，则取消选择
      userAnswers.value[currentIndex.value] = ''
    } else {
      // 否则选择新选项
      userAnswers.value[currentIndex.value] = optIndex
    }
  } else if (qtype === 2) {
    // 多选题
    if (!Array.isArray(userAnswers.value[currentIndex.value])) {
      userAnswers.value[currentIndex.value] = []
    }

    const index = userAnswers.value[currentIndex.value].indexOf(optIndex)
    if (index === -1) {
      userAnswers.value[currentIndex.value].push(optIndex)
    } else {
      userAnswers.value[currentIndex.value].splice(index, 1)
    }
  }
}

const selectJudgementOption = value => {
  if (answered.value[currentIndex.value]) return
  userAnswers.value[currentIndex.value] = value
}

const isOptionSelected = optIndex => {
  const qtype = currentQuestion.value.question?.qtype || currentQuestion.value.qtype

  if (qtype === 1) {
    return userAnswers.value[currentIndex.value] === optIndex
  } else if (qtype === 2) {
    return (
      Array.isArray(userAnswers.value[currentIndex.value]) &&
      userAnswers.value[currentIndex.value].includes(optIndex)
    )
  }

  return false
}

const isCorrectOption = optIndex => {
  const answer = currentQuestion.value.question?.answer || currentQuestion.value.answer
  const qtype = currentQuestion.value.question?.qtype || currentQuestion.value.qtype

  if (qtype === 1) {
    return answer === optIndex
  } else if (qtype === 2) {
    const correctOptions = answer.split('')
    return correctOptions.includes(optIndex)
  }

  return false
}

const checkAnswer = () => {
  if (!currentQuestion.value) return

  showAnswer.value = true
  answered.value[currentIndex.value] = true

  const userAnswer = userAnswers.value[currentIndex.value]
  const correctAnswer = currentQuestion.value.question?.answer || currentQuestion.value.answer
  const qtype = currentQuestion.value.question?.qtype || currentQuestion.value.qtype

  let isCorrect = false

  // 单选题判断
  if (qtype === 1) {
    // 检查正确答案是否为字母格式(如"A","B")
    if (typeof correctAnswer === 'string' && /^[A-Z]$/.test(correctAnswer)) {
      // 将用户的选项索引转换为对应的字母
      const userLetter = optionLabels[userAnswer]
      isCorrect = userLetter === correctAnswer
    } else {
      // 标准索引比较方式
      isCorrect = userAnswer.toString() === correctAnswer.toString()
    }
  }
  // 多选题判断
  else if (qtype === 2) {
    if (Array.isArray(userAnswer)) {
      // 将用户选择的选项索引排序后连接，与正确答案进行比较
      const sortedUserAnswer = [...userAnswer].sort().join('')

      // 检查正确答案是否为字母格式(如"ABD")
      if (typeof correctAnswer === 'string' && /^[A-Z]+$/.test(correctAnswer)) {
        // 将用户的选项索引转换为对应的字母
        const userLetters = userAnswer
          .map(index => optionLabels[index])
          .sort()
          .join('')
        isCorrect = userLetters === correctAnswer
      } else {
        // 标准索引格式比较方式
        isCorrect = sortedUserAnswer === correctAnswer
      }
    }
  }
  // 判断题判断
  else if (qtype === 3) {
    // 判断题的情况：用户选择索引0或1，而答案可能是A或B
    if (typeof correctAnswer === 'string' && /^[AB]$/.test(correctAnswer)) {
      // 如果正确答案是A，对应用户选择"1"（正确）
      // 如果正确答案是B，对应用户选择"0"（错误）
      if (correctAnswer === 'A' && userAnswer === '1') {
        isCorrect = true
      } else if (correctAnswer === 'B' && userAnswer === '0') {
        isCorrect = true
      } else {
        isCorrect = false
      }
    } else {
      // 标准比较方式
      isCorrect = userAnswer.toString() === correctAnswer.toString()
    }
  }
  // 填空题判断
  else if (qtype === 4) {
    try {
      // 首先尝试解析JSON
      const parsedAnswer = JSON.parse(correctAnswer)
      if (Array.isArray(parsedAnswer)) {
        // 如果是数组，检查用户答案是否在数组中
        isCorrect = parsedAnswer.includes(userAnswer)
      } else {
        // 否则直接比较
        isCorrect = userAnswer === correctAnswer
      }
    } catch (e) {
      // 如果不是JSON格式，进行常规比较

      // 检查正确答案是否含有字母格式选项，如"A"或"A,B"
      if (typeof correctAnswer === 'string' && /[A-Z]/.test(correctAnswer)) {
        // 尝试将用户答案（可能是索引）转换为字母
        let userLetterAnswer = userAnswer

        // 如果用户答案是单个数字，尝试转换为对应字母
        if (
          !isNaN(parseInt(userAnswer)) &&
          parseInt(userAnswer) >= 0 &&
          parseInt(userAnswer) < optionLabels.length
        ) {
          userLetterAnswer = optionLabels[parseInt(userAnswer)]
        }
        // 如果用户答案像是索引数组，尝试一一转换
        else if (typeof userAnswer === 'string' && /^[0-9,\s]+$/.test(userAnswer)) {
          userLetterAnswer = userAnswer
            .split(',')
            .map(idx => idx.trim())
            .filter(
              idx =>
                !isNaN(parseInt(idx)) && parseInt(idx) >= 0 && parseInt(idx) < optionLabels.length
            )
            .map(idx => optionLabels[parseInt(idx)])
            .join(',')
        }

        // 忽略空格和大小写进行比较
        isCorrect =
          userLetterAnswer.replace(/\s+/g, '').toLowerCase() ===
          correctAnswer.replace(/\s+/g, '').toLowerCase()
      } else {
        // 标准比较方式
        isCorrect = userAnswer === correctAnswer
      }
    }
  }

  correct.value[currentIndex.value] = isCorrect

  if (isCorrect && autoNext.value) {
    setTimeout(() => {
      nextQuestion()
    }, 1500)
  }
}

const prevQuestion = () => {
  // 检查当前题目是否已作答但未判断
  if (hasAnswerButNotChecked()) {
    checkAnswer()
  }

  if (currentIndex.value > 0) {
    currentIndex.value--
    // 只在已答题的情况下显示答案
    showAnswer.value = answered.value[currentIndex.value]
  }
}

const nextQuestion = () => {
  // 检查当前题目是否已作答但未判断
  if (hasAnswerButNotChecked()) {
    checkAnswer()
  }

  if (currentIndex.value < questionList.value.length - 1) {
    currentIndex.value++
    // 只在已答题的情况下显示答案
    showAnswer.value = answered.value[currentIndex.value]
  }
}

const goToQuestion = index => {
  // 检查当前题目是否已作答但未判断
  if (hasAnswerButNotChecked()) {
    checkAnswer()
  }

  currentIndex.value = index
  // 只在已答题的情况下显示答案
  showAnswer.value = answered.value[index]
}

const toggleQuestionCard = () => {
  showQuestionCard.value = !showQuestionCard.value
  showSettings.value = false
}

const toggleSettings = () => {
  showSettings.value = !showSettings.value
}

const toggleCollect = () => {
  isCurrentQuestionCollected.value = !isCurrentQuestionCollected.value
  ElMessage.success(isCurrentQuestionCollected.value ? '收藏成功' : '已取消收藏')
}

const finishPractice = () => {
  if (practiceMode.value === 'simulation') {
    // 检查是否有未回答的题目
    const unansweredCount = userAnswers.value.filter((answer, index) => {
      // 处理不同类型题目的答案检查
      if (answer === '' || answer === undefined) return true
      if (Array.isArray(answer) && answer.length === 0) return true
      return false
    }).length

    // 构建确认消息
    let confirmMessage = '确定要交卷吗？'
    if (unansweredCount > 0) {
      confirmMessage = `还有 ${unansweredCount} 道题目未回答，确定要交卷吗？`
    }

    // 确认交卷
    ElMessageBox.confirm(confirmMessage, '交卷确认', {
      confirmButtonText: '确认交卷',
      cancelButtonText: '继续答题',
      type: 'warning'
    })
      .then(() => {
        // 用户确认交卷，批量判断所有答案
        batchCheckAllAnswers()
        ElMessage.success('试卷已提交，可以查看答案')
      })
      .catch(() => {
        // 用户取消，继续答题
      })
  } else {
    // 普通练习模式，直接询问是否结束
    ElMessageBox.confirm('确定要结束练习吗？', '结束练习', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        router.push(`/exam/${examId.value}`)
      })
      .catch(() => {})
  }
}

const batchCheckAllAnswers = () => {
  questionList.value.forEach((question, index) => {
    const userAnswer = userAnswers.value[index]
    const correctAnswer = question.question?.answer || question.answer
    const qtype = question.question?.qtype || question.qtype

    let isCorrect = false

    // 判断不同题型的答案
    // 单选题判断
    if (qtype === 1) {
      // 检查正确答案是否为字母格式(如"A","B")
      if (typeof correctAnswer === 'string' && /^[A-Z]$/.test(correctAnswer)) {
        // 将用户的选项索引转换为对应的字母
        const userLetter = optionLabels[userAnswer]
        isCorrect = userLetter === correctAnswer
      } else {
        // 标准索引比较方式
        isCorrect = userAnswer.toString() === correctAnswer.toString()
      }
    }
    // 多选题判断
    else if (qtype === 2) {
      if (Array.isArray(userAnswer)) {
        // 将用户选择的选项索引排序后连接，与正确答案进行比较
        const sortedUserAnswer = [...userAnswer].sort().join('')

        // 检查正确答案是否为字母格式(如"ABD")
        if (typeof correctAnswer === 'string' && /^[A-Z]+$/.test(correctAnswer)) {
          // 将用户的选项索引转换为对应的字母
          const userLetters = userAnswer
            .map(index => optionLabels[index])
            .sort()
            .join('')
          isCorrect = userLetters === correctAnswer
        } else {
          // 标准索引格式比较方式
          isCorrect = sortedUserAnswer === correctAnswer
        }
      }
    }
    // 判断题判断
    else if (qtype === 3) {
      // 判断题的情况：用户选择索引0或1，而答案可能是A或B
      if (typeof correctAnswer === 'string' && /^[AB]$/.test(correctAnswer)) {
        // 如果正确答案是A，对应用户选择"1"（正确）
        // 如果正确答案是B，对应用户选择"0"（错误）
        if (correctAnswer === 'A' && userAnswer === '1') {
          isCorrect = true
        } else if (correctAnswer === 'B' && userAnswer === '0') {
          isCorrect = true
        } else {
          isCorrect = false
        }
      } else {
        // 标准比较方式
        isCorrect = userAnswer.toString() === correctAnswer.toString()
      }
    }
    // 填空题判断
    else if (qtype === 4) {
      try {
        // 首先尝试解析JSON
        const parsedAnswer = JSON.parse(correctAnswer)
        if (Array.isArray(parsedAnswer)) {
          // 如果是数组，检查用户答案是否在数组中
          isCorrect = parsedAnswer.includes(userAnswer)
        } else {
          // 否则直接比较
          isCorrect = userAnswer === correctAnswer
        }
      } catch (e) {
        // 如果不是JSON格式，进行常规比较
        // 标准比较方式
        isCorrect = userAnswer === correctAnswer
      }
    }

    // 记录判断结果
    answered.value[index] = true
    correct.value[index] = isCorrect
  })

  // 显示当前题目的答案
  showAnswer.value = true
}

const progressFormat = percentage => {
  return `${answered.value.filter(Boolean).length}/${questionList.value.length}`
}

// 格式化答案
const formatAnswer = (answer, type) => {
  if (!answer && answer !== 0) return '无'

  // 单选题
  if (type === 1) {
    // 如果answer已经是字母（A、B、C...），直接返回
    if (typeof answer === 'string' && /^[A-Z]$/.test(answer)) {
      return answer
    }
    // 确保answer是数字索引，然后转换为字母
    const index = parseInt(answer)
    if (!isNaN(index) && index >= 0 && index < optionLabels.length) {
      return optionLabels[index]
    }
    // 如果无法正确转换，返回原始答案
    return answer
  }

  // 多选题
  if (type === 2) {
    // 尝试将答案拆分为数组
    try {
      if (Array.isArray(answer)) {
        // 如果已经是数组，将每个元素转换为对应字母
        return answer
          .map(opt => {
            const index = parseInt(opt)
            return !isNaN(index) ? optionLabels[index] : opt
          })
          .join(', ')
      } else {
        // 拆分字符串并转换
        return answer
          .split('')
          .map(opt => {
            const index = parseInt(opt)
            return !isNaN(index) ? optionLabels[index] : opt
          })
          .join(', ')
      }
    } catch (error) {
      return answer
    }
  }

  // 判断题
  if (type === 3) {
    // 处理各种可能的判断题答案格式
    if (answer === '1' || answer === 1 || answer === true || answer === 'true') {
      return '正确'
    } else {
      return '错误'
    }
  }

  // 填空题
  if (type === 4) {
    try {
      // 尝试解析JSON
      const answers = JSON.parse(answer)
      // 如果是数组，则用"或"连接所有答案
      if (Array.isArray(answers)) {
        return answers.join(' 或 ')
      }
      // 如果是对象或其他格式，直接使用原始答案
      return answer
    } catch (error) {
      // 如果不是有效的JSON，直接使用原始答案
      return answer
    }
  }

  return answer
}

// 获取题型名称
const getQuestionTypeName = type => {
  const types = {
    1: '单选题',
    2: '多选题',
    3: '判断题',
    4: '填空题'
  }
  return types[type] || '未知类型'
}

// 获取题型对应的标签类型
const getQuestionTypeTag = type => {
  const types = {
    1: 'primary',
    2: 'success',
    3: 'warning',
    4: 'info'
  }
  return types[type] || ''
}

// 检查当前题目是否已作答但未判断
const hasAnswerButNotChecked = () => {
  const userAnswer = userAnswers.value[currentIndex.value]
  const qtype = currentQuestion.value.question?.qtype || currentQuestion.value.qtype

  // 已经判断过的题目不需要再判断
  if (answered.value[currentIndex.value]) {
    return false
  }

  // 检查不同题型的答案是否已填写
  if (qtype === 1 || qtype === 3) {
    // 单选题或判断题
    return userAnswer !== '' && userAnswer !== undefined
  } else if (qtype === 2) {
    // 多选题
    return Array.isArray(userAnswer) && userAnswer.length > 0
  } else if (qtype === 4) {
    // 填空题
    return userAnswer !== '' && userAnswer !== undefined
  }

  return false
}

// 检查指定索引的问题是否已回答
const isAnswered = index => {
  const answer = userAnswers.value[index]

  // 如果答案不存在
  if (answer === undefined) return false

  // 如果是空字符串
  if (answer === '') return false

  // 如果是数组（多选题），检查是否为空数组
  if (Array.isArray(answer)) {
    return answer.length > 0
  }

  // 其他情况，视为已回答
  return true
}

// 获取题目类型
const getQuestionType = question => {
  return question.question?.qtype || question.qtype || 1
}

// 生命周期钩子
onMounted(() => {
  fetchExamDetail()
})

// 监听器
watch(currentIndex, () => {
  isCurrentQuestionCollected.value = false // 重置当前题目收藏状态
})

// 处理随机题目数量变更
const handleRandomCountChange = value => {
  if (practiceMode.value === 'random') {
    ElMessageBox.confirm(
      `修改题目数量将重新加载随机题目，已做答案将丢失，确定修改吗？`,
      '确认修改',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
      .then(() => {
        // 重新加载题目
        fetchExamDetail()
      })
      .catch(() => {
        // 用户取消，恢复之前的值
        randomQuestionCount.value = value
      })
  }
}

// 选择题型并重新加载题目
const selectQuestionType = type => {
  selectedQuestionType.value = type
  ElMessage.success(`已选择"${getQuestionTypeName(type)}"类型练习`)
  showTypeDialog.value = false

  // 重新加载题目
  fetchExamDetail()
}

// 选择随机题型
const selectRandomType = () => {
  const availableTypes = [1, 2, 3, 4]
  const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)]
  selectQuestionType(randomType)
}

// 返回试卷详情页
const goBackToExam = () => {
  router.push(`/exam/${examId.value}`)
}
</script>

<style lang="less" scoped>
.practice-exam-page {
  width: 100%;
  background-color: #f5f9ff;
}

.practice-exam-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.practice-header {
  background: #fff;
  padding: 12px 16px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.loading-container {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.practice-main {
  display: flex;
  gap: 16px;
  position: relative;
}

.question-section {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 122px);
}

.question-header {
  margin-bottom: 24px;

  .question-info {
    font-size: 16px;
    line-height: 1.6;

    .question-tag {
      color: #3370ff;
      font-weight: bold;
      margin-right: 8px;
      font-size: 16px;
    }

    .question-type-tag {
      margin-left: 10px;
      vertical-align: middle;
      font-size: 12px;
    }
  }
}

.question-options {
  margin-bottom: 24px;

  .option-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: #f5f7fa;
    }

    &.selected {
      border-color: #3370ff;
      background-color: #f0f5ff;
    }

    &.correct {
      border-color: #52c41a;
      background-color: #f6ffed;
    }

    .option-marker {
      width: 24px;
      height: 24px;
      background-color: #f0f0f0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .option-content {
      flex: 1;
    }
  }

  .fill-answer {
    width: 100%;
  }
}

.answer-section {
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 24px;
  border-left: 4px solid #3370ff;
  max-height: 300px;
  overflow-y: auto;

  .answer-header {
    margin-bottom: 12px;

    .correct-tag,
    .wrong-tag {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 2px;
      font-size: 12px;
      font-weight: bold;
      color: #fff;
    }

    .correct-tag {
      background-color: #52c41a;
    }

    .wrong-tag {
      background-color: #ff4d4f;
    }
  }

  .answer-content,
  .analysis-content {
    margin-bottom: 12px;

    .answer-title,
    .analysis-title {
      font-weight: bold;
      margin-bottom: 8px;
      color: #333;
    }

    .answer-value,
    .analysis-value {
      color: #666;
      line-height: 1.6;
    }
  }
}

.question-actions {
  margin-top: auto;
  padding-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;

  .action-buttons {
    display: flex;
    gap: 12px;
  }
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

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 16px;
    }
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

    &::-webkit-scrollbar {
      display: none; /* Hide scrollbar for Chrome, Safari and Opera */
    }

    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */

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

      &:hover {
        opacity: 0.8;
      }

      &.current {
        border-color: #3370ff;
        box-shadow: 0 0 5px rgba(51, 112, 255, 0.5);
        font-weight: bold;
      }

      &.answered {
        color: #333;
        font-weight: bold;
      }

      &.correct {
        border-color: #52c41a;
        background-color: #f6ffed !important;
      }

      &.wrong {
        border-color: #ff4d4f;
        background-color: #fff1f0 !important;
      }

      // 不同题型的样式
      &.single-choice {
        background-color: transparent; // 单选题为透明背景
      }

      &.multiple-choice {
        background-color: rgba(24, 144, 255, 0.15); // 蓝色背景，多选题
      }

      &.judgment {
        background-color: rgba(250, 173, 20, 0.15); // 黄色背景，判断题
      }

      &.fill-blank {
        background-color: rgba(114, 46, 209, 0.15); // 紫色背景，填空题
      }
    }
  }

  .card-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 16px;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;

      .legend-color {
        width: 16px;
        height: 16px;
        border-radius: 4px;
      }
    }

    .type-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 8px;

      .type-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;

        .type-dot {
          width: 12px;
          height: 12px;
          border-radius: 2px;
          border: 1px solid #e8e8e8;

          &.single {
            background-color: transparent; // 单选题，透明
          }

          &.multiple {
            background-color: rgba(24, 144, 255, 0.15); // 蓝色，多选题
          }

          &.judgment {
            background-color: rgba(250, 173, 20, 0.15); // 黄色，判断题
          }

          &.fill {
            background-color: rgba(114, 46, 209, 0.15); // 紫色，填空题
          }
        }
      }
    }
  }

  .card-actions {
    display: flex;
    gap: 12px;
  }
}

.settings-panel {
  position: absolute;
  right: 280px;
  top: 70px;
  width: 280px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  z-index: 100;

  .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 16px;
    }
  }

  .settings-content {
    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .font-size-options {
        display: flex;
        gap: 8px;

        .size-option {
          padding: 4px 8px;
          border-radius: 2px;
          cursor: pointer;

          &.active {
            background-color: #3370ff;
            color: #fff;
          }
        }
      }
    }
  }
}

.font-small {
  font-size: 14px;
}

.font-normal {
  font-size: 16px;
}

.font-large {
  font-size: 18px;
}

// 题型选择对话框样式
.question-type-dialog {
  padding: 20px 0;

  .type-options {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;

    .el-button {
      width: 120px;
    }
  }
}
</style>
