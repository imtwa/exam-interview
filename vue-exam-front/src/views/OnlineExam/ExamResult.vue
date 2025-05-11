<template>
  <div class="exam-result-page">
    <div class="exam-result-container">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>

      <template v-else-if="result">
        <!-- 结果概览 -->
        <el-card class="result-overview-card">
          <div class="result-header">
            <h1 class="exam-title">{{ result.examTitle }}</h1>
            <div class="completion-time">完成时间：{{ formatDate(result.submittedAt) }}</div>
          </div>

          <div class="score-panel">
            <div class="score-circle" :class="getScoreClass(result.scorePercent)">
              <div class="score-number">{{ result.score }}</div>
              <div class="score-total">/ {{ result.totalScore }}</div>
            </div>

            <div class="score-details">
              <div class="result-row">
                <span class="label">得分率：</span>
                <span :class="getScoreClass(result.scorePercent)">{{ result.scorePercent }}%</span>
              </div>
              <div class="result-row">
                <span class="label">用时：</span>
                <span>{{ formatDuration(result.duration) }}</span>
              </div>
              <div class="result-row">
                <span class="label">正确题数：</span>
                <span>{{ result.correctCount }} / {{ result.totalQuestions }}</span>
              </div>
              <div class="result-row">
                <span class="label">评价：</span>
                <span :class="getScoreClass(result.scorePercent)">{{
                  getScoreEvaluation(result.scorePercent)
                }}</span>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <el-button type="primary" @click="viewAnswers">查看解析</el-button>
            <el-button @click="goHome">返回首页</el-button>
          </div>
        </el-card>

        <!-- 分析图表 -->
        <el-card class="analysis-card">
          <template #header>
            <div class="card-header">
              <h2>答题分析</h2>
            </div>
          </template>

          <div class="chart-container">
            <div class="chart-item">
              <h3>题型得分</h3>
              <div ref="questionTypeChart" class="chart"></div>
            </div>

            <div class="chart-item">
              <h3>答题用时分布</h3>
              <div ref="timeDistributionChart" class="chart"></div>
            </div>
          </div>

          <el-divider content-position="center">详细数据</el-divider>

          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-title">平均每题用时</div>
              <div class="stat-value">{{ averageTimePerQuestion }}秒</div>
            </div>

            <div class="stat-box">
              <div class="stat-title">最高分题型</div>
              <div class="stat-value">{{ bestQuestionType }}</div>
            </div>

            <div class="stat-box">
              <div class="stat-title">最低分题型</div>
              <div class="stat-value">{{ worstQuestionType }}</div>
            </div>

            <div class="stat-box">
              <div class="stat-title">知识点掌握</div>
              <div class="stat-value">
                <el-progress
                  :percentage="knowledgeMastery"
                  :color="getProgressColor(knowledgeMastery)"
                />
              </div>
            </div>
          </div>
        </el-card>

        <!-- 答题详情(点击查看解析后展示) -->
        <el-card v-if="showAnswers" class="answers-card">
          <template #header>
            <div class="card-header">
              <h2>试题解析</h2>
            </div>
          </template>

          <div class="questions-container">
            <div
              v-for="(question, index) in result.questions"
              :key="index"
              class="question-item"
              :class="{
                'question-correct': question.isCorrect,
                'question-wrong': !question.isCorrect
              }"
            >
              <div class="question-header">
                <div class="question-status">
                  <el-tag :type="question.isCorrect ? 'success' : 'danger'" size="small">
                    {{ question.isCorrect ? '正确' : '错误' }}
                  </el-tag>
                  <span class="question-score"
                    >({{ question.score }}/{{ question.totalScore }}分)</span
                  >
                </div>
                <div class="question-type">{{ getQuestionTypeName(question.type) }}</div>
              </div>

              <div class="question-content">
                <div class="question-title" v-html="question.content"></div>

                <!-- 选择题选项 -->
                <div
                  v-if="question.type === 'single_choice' || question.type === 'multiple_choice'"
                  class="options-container"
                >
                  <div
                    v-for="(option, optionIndex) in question.options"
                    :key="optionIndex"
                    class="option-item"
                    :class="{
                      'option-correct': option.isCorrect || option.label === question.correctAnswer,
                      'option-selected':
                        isOptionSelected(question, option.value) ||
                        option.label === question.userAnswer,
                      'option-wrong':
                        (isOptionSelected(question, option.value) ||
                          option.label === question.userAnswer) &&
                        !option.isCorrect &&
                        option.label !== question.correctAnswer
                    }"
                  >
                    <span class="option-label">{{ option.label }}</span>
                    <span class="option-content">{{ option.content }}</span>
                  </div>
                </div>

                <!-- 选择题答案总结 -->
                <div
                  v-if="question.type === 'single_choice' || question.type === 'multiple_choice'"
                  class="answer-summary"
                >
                  <div class="user-choice">
                    <span class="answer-label">你的选择：</span>
                    <span
                      :class="{
                        'correct-text': question.isCorrect,
                        'wrong-text': !question.isCorrect
                      }"
                    >
                      {{ formatUserAnswer(question) }}
                    </span>
                  </div>
                  <div class="correct-choice">
                    <span class="answer-label">正确答案：</span>
                    <span class="correct-text">{{ question.correctAnswer }}</span>
                  </div>
                </div>

                <!-- 填空题/简答题 -->
                <div v-else class="text-answer-container">
                  <div class="user-answer">
                    <div class="answer-label">你的答案：</div>
                    <div class="answer-content" v-html="question.userAnswer || '（未作答）'"></div>
                  </div>

                  <div class="correct-answer">
                    <div class="answer-label">参考答案：</div>
                    <div class="answer-content" v-html="question.correctAnswer"></div>
                  </div>
                </div>

                <!-- 解析 -->
                <div class="explanation-container">
                  <div class="explanation-title">解析：</div>
                  <div class="explanation-content" v-html="question.explanation"></div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </template>

      <div v-else class="error-container">
        <el-empty description="未找到考试结果数据" :image-size="200">
          <el-button type="primary" @click="goHome">返回首页</el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { getOnlineExamResult } from '@/api/exam'
import { formatDate } from '@/utils/formatDate'

// 注册必需的组件formatDate
echarts.use([
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  CanvasRenderer
])

const route = useRoute()
const router = useRouter()
const examId = route.params.id
const invitationCode = route.params.id

// 页面状态
const loading = ref(true)
const showAnswers = ref(false)
const result = ref(null)

// 图表引用
const questionTypeChart = ref(null)
const timeDistributionChart = ref(null)

// 计算题型得分
const questionTypeScores = computed(() => {
  if (!result.value || !result.value.questions || result.value.questions.length === 0) {
    return []
  }

  // 分类统计题目
  const typeStats = {}

  result.value.questions.forEach(question => {
    const type = getQuestionTypeName(question.type)
    if (!typeStats[type]) {
      typeStats[type] = { score: 0, total: 0, count: 0 }
    }

    typeStats[type].score += Number(question.score) || 0
    typeStats[type].total += Number(question.totalScore) || 0
    typeStats[type].count += 1
  })

  // 转换为数组格式
  return Object.keys(typeStats).map(type => {
    const score = typeStats[type].score || 0
    const total = typeStats[type].total || 1 // 避免除以0
    const percentage = Math.round((score / total) * 100)

    return {
      name: type,
      score: score,
      total: total,
      count: typeStats[type].count,
      percentage: percentage
    }
  })
})

// 计算最佳和最差题型
const bestQuestionType = computed(() => {
  if (!questionTypeScores.value || questionTypeScores.value.length === 0) {
    return '未知'
  }

  const sorted = [...questionTypeScores.value].sort((a, b) => b.percentage - a.percentage)
  return sorted[0].name
})

const worstQuestionType = computed(() => {
  if (!questionTypeScores.value || questionTypeScores.value.length === 0) {
    return '未知'
  }

  const sorted = [...questionTypeScores.value].sort((a, b) => a.percentage - b.percentage)
  return sorted[0].name
})

// 计算平均每题用时
const averageTimePerQuestion = computed(() => {
  if (!result.value || !result.value.duration || !result.value.totalQuestions) {
    return 0
  }

  return Math.round(result.value.duration / result.value.totalQuestions)
})

// 计算知识点掌握度（使用得分百分比）
const knowledgeMastery = computed(() => {
  if (!result.value || !result.value.scorePercent) {
    return 0
  }

  return result.value.scorePercent
})

// 计算用时分布
const timeDistribution = computed(() => {
  if (!result.value || !result.value.questions || result.value.questions.length === 0) {
    return []
  }

  // 用时区间定义
  const timeRanges = [
    { name: '0-30秒', min: 0, max: 30, count: 0 },
    { name: '30-60秒', min: 30, max: 60, count: 0 },
    { name: '1-2分钟', min: 60, max: 120, count: 0 },
    { name: '2分钟以上', min: 120, max: Infinity, count: 0 }
  ]

  // 假设每道题目平均耗时相同
  const avgTimePerQuestion = result.value.duration / result.value.totalQuestions

  // 根据平均用时对题目进行分类
  timeRanges.forEach(range => {
    if (avgTimePerQuestion >= range.min && avgTimePerQuestion < range.max) {
      range.count = result.value.totalQuestions
    }
  })

  return timeRanges
})

// 获取考试结果
const fetchExamResult = async () => {
  loading.value = true

  try {
    // 使用真实API调用获取考试结果
    const response = await getOnlineExamResult(invitationCode)
    // console.log('获取到的考试结果:', response)

    if (!response) {
      throw new Error('未获取到考试结果数据')
    }

    // 获取返回的结果数据
    const resultData = response

    // 构建结果对象
    result.value = {
      examId: examId,
      examTitle: resultData.examTitle || '在线考试',
      submittedAt: new Date(resultData.submittedAt) || new Date(),
      score: resultData.score || 0,
      totalScore: resultData.totalScore || 0,
      scorePercent:
        resultData.percentage || Math.round((resultData.score / resultData.totalScore) * 100) || 0,
      duration: resultData.duration || 0,
      correctCount: resultData.correctCount || 0,
      totalQuestions: resultData.totalQuestions || 0,
      questions: resultData.questions || []
    }
  } catch (error) {
    console.error('获取考试结果失败:', error)
    ElMessage.error('获取考试结果失败，请稍后重试')
    result.value = null
  } finally {
    loading.value = false
  }
}

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    // 题型得分图表
    if (questionTypeChart.value) {
      const chartInstance = echarts.init(questionTypeChart.value)

      // 获取单选题的得分情况
      const singleChoiceData = {
        name: '单选题',
        score: 0,
        total: 0,
        percentage: 0
      }

      // 手动计算单选题的得分率
      if (result.value && result.value.questions) {
        let correctCount = 0
        let totalCount = 0

        result.value.questions.forEach(q => {
          if (q.type === 'single_choice') {
            totalCount++
            if (q.isCorrect) {
              correctCount++
            }
          }
        })

        singleChoiceData.score = correctCount
        singleChoiceData.total = totalCount
        singleChoiceData.percentage =
          totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
      }

      // 简单的柱状图，只显示单选题的得分率
      const typeOptions = {
        color: ['#FF6B6B'],
        title: {
          text: '题型得分率',
          textStyle: {
            fontSize: 16,
            fontWeight: 'normal'
          },
          left: 'center',
          top: 10
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            const data = params[0].data
            return `单选题: ${data.score}/${data.total} (${data.percentage}%)`
          },
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderColor: '#ddd',
          borderWidth: 1,
          padding: 10,
          textStyle: {
            color: '#333'
          }
        },
        grid: {
          left: '10%',
          right: '10%',
          bottom: '15%',
          top: '25%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['单选题'],
          axisLine: {
            lineStyle: {
              color: '#ccc'
            }
          },
          axisLabel: {
            fontSize: 14,
            color: '#333'
          }
        },
        yAxis: {
          type: 'value',
          max: 100,
          axisLabel: {
            formatter: '{value}%',
            color: '#666'
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#eee'
            }
          }
        },
        series: [
          {
            name: '得分率',
            type: 'bar',
            barWidth: '40%',
            label: {
              show: true,
              position: 'top',
              formatter: '{c}%',
              fontSize: 14,
              color: '#333'
            },
            itemStyle: {
              borderRadius: [4, 4, 0, 0]
            },
            data: [
              {
                value: singleChoiceData.percentage,
                score: singleChoiceData.score,
                total: singleChoiceData.total,
                percentage: singleChoiceData.percentage,
                itemStyle: {
                  color: singleChoiceData.percentage >= 60 ? '#67C23A' : '#F56C6C'
                }
              }
            ]
          }
        ]
      }

      chartInstance.setOption(typeOptions)
      window.addEventListener('resize', () => chartInstance.resize())
    }

    // 用时统计，使用环形图而不是文本
    if (timeDistributionChart.value) {
      const timeChartInstance = echarts.init(timeDistributionChart.value)

      // 计算关键时间数据
      const totalSeconds = result.value?.duration || 0
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      const totalQuestions = result.value?.totalQuestions || 1
      const avgTimePerQuestion = Math.round(totalSeconds / totalQuestions)

      // 构建图表数据 - 使用数字类型的值
      const pieData = [
        {
          value: totalSeconds,
          name: '总用时(秒)',
          itemStyle: { color: '#FF6B6B' }
        },
        {
          value: avgTimePerQuestion,
          name: '平均每题用时(秒)',
          itemStyle: { color: '#4FC08D' }
        }
      ]

      // 为了更好的可视化，如果题目数量很小时，使用乘数调整显示比例
      const multiplier = totalQuestions < 10 ? 100 : 10

      pieData.push({
        value: totalQuestions * multiplier,
        name: `题目数量: ${totalQuestions}`,
        itemStyle: { color: '#5C7BD9' }
      })

      // 简洁的环形图，优化了显示效果
      const timeOptions = {
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            if (params.name === '总用时(秒)') {
              const mins = Math.floor(params.value / 60)
              const secs = params.value % 60
              return `总用时: ${mins}分${secs}秒`
            } else if (params.name === '平均每题用时(秒)') {
              return `平均每题用时: ${params.value}秒`
            } else if (params.name.startsWith('题目数量')) {
              return `题目数量: ${totalQuestions}`
            }
            return `${params.name}: ${params.value}`
          },
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderColor: '#eee',
          borderWidth: 1,
          padding: 10,
          textStyle: {
            color: '#333',
            fontSize: 13
          }
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          itemWidth: 12,
          itemHeight: 12,
          icon: 'circle',
          formatter: function (name) {
            if (name === '总用时(秒)') {
              return `总用时: ${minutes}分${seconds}秒`
            } else if (name === '平均每题用时(秒)') {
              return `平均每题: ${avgTimePerQuestion}秒`
            } else if (name.startsWith('题目数量')) {
              return `题目数量: ${totalQuestions}`
            }
            return name
          },
          textStyle: {
            fontSize: 12,
            color: '#666'
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['40%', '50%'],
            avoidLabelOverlap: true,
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: false
              },
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.2)'
              }
            },
            labelLine: {
              show: false
            },
            data: pieData
          }
        ]
      }

      timeChartInstance.setOption(timeOptions)
      window.addEventListener('resize', () => timeChartInstance.resize())
    }
  })
}

// 返回首页
const goHome = () => {
  router.push('/')
}

// 查看答案解析
const viewAnswers = () => {
  showAnswers.value = true

  // 等待DOM更新后滚动到答题详情部分
  nextTick(() => {
    const answersCard = document.querySelector('.answers-card')
    if (answersCard) {
      answersCard.scrollIntoView({ behavior: 'smooth' })
    }
  })
}

// 格式化时长
const formatDuration = seconds => {
  if (!seconds) return '0秒'

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes === 0) {
    return `${remainingSeconds}秒`
  } else if (remainingSeconds === 0) {
    return `${minutes}分钟`
  } else {
    return `${minutes}分钟${remainingSeconds}秒`
  }
}

// 获取得分等级样式
const getScoreClass = scorePercent => {
  if (scorePercent >= 90) return 'score-excellent'
  if (scorePercent >= 80) return 'score-good'
  if (scorePercent >= 60) return 'score-pass'
  return 'score-fail'
}

// 获取得分评价
const getScoreEvaluation = scorePercent => {
  if (scorePercent >= 90) return '优秀'
  if (scorePercent >= 80) return '良好'
  if (scorePercent >= 60) return '及格'
  return '不及格'
}

// 获取进度条颜色
const getProgressColor = percentage => {
  if (percentage >= 80) return '#67C23A'
  if (percentage >= 60) return '#E6A23C'
  return '#F56C6C'
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

// 检查选项是否被选中
const isOptionSelected = (question, optionValue) => {
  if (!question.userAnswer) return false

  // 处理选项值可能是字母形式的情况（例如 "C", "D"）
  if (typeof question.userAnswer === 'string') {
    // 直接比较选项的label（例如"A", "B", "C", "D"）
    if (question.options && question.options.length > 0) {
      for (const option of question.options) {
        if (option.label === question.userAnswer && option.value === optionValue) {
          return true
        }
      }
    }

    // 如果用户答案是C，而选项value是2，那么也匹配
    const letterMap = { A: '0', B: '1', C: '2', D: '3', E: '4', F: '5' }
    if (letterMap[question.userAnswer] === optionValue) {
      return true
    }
  }

  // 处理数组形式的答案（多选题）
  if (Array.isArray(question.userAnswer)) {
    return question.userAnswer.includes(optionValue)
  }

  // 直接比较
  return question.userAnswer === optionValue
}

// 获取选项标签 (将数字转为字母 0->A, 1->B)
const getOptionLabel = value => {
  if (value === null || value === undefined) return ''

  const numericValue = parseInt(value, 10)
  if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 25) {
    return String.fromCharCode(65 + numericValue) // A的ASCII码是65
  }

  return value
}

// 格式化用户答案为可读形式
const formatUserAnswer = question => {
  if (!question.userAnswer) return '未作答'

  // 如果答案是字母形式，直接返回
  if (
    typeof question.userAnswer === 'string' &&
    question.userAnswer.length === 1 &&
    /[A-Za-z]/.test(question.userAnswer)
  ) {
    return question.userAnswer.toUpperCase()
  }

  // 如果是数组（多选题），转换为字母序列
  if (Array.isArray(question.userAnswer)) {
    return question.userAnswer.map(value => getOptionLabel(value)).join(', ')
  }

  // 如果是数字，转换为字母
  return getOptionLabel(question.userAnswer)
}

onMounted(() => {
  fetchExamResult().then(() => {
    if (result.value) {
      initCharts()
    }
  })
})
</script>

<style lang="less" scoped>
.exam-result-page {
  background-color: #f5f9ff;
  width: 100%;
}
.exam-result-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 15px;
  }

  @media (max-width: 576px) {
    padding: 10px;
  }
}

// 在这里深度覆盖el-card的阴影样式
:deep(.el-card) {
  border-radius: 8px;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  overflow: hidden;

  &:hover {
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  }

  .el-card__header {
    padding: 18px 20px;
    border-bottom: 1px solid #f0f0f0;
    background-color: #ffffff;
  }

  .el-card__body {
    padding: 20px;
  }
}

.loading-container {
  padding: 20px;
}

.result-overview-card {
  margin-bottom: 30px;

  @media (max-width: 576px) {
    margin-bottom: 20px;
  }
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}

.exam-title {
  margin: 0;
  font-size: 24px;
  color: #303133;

  @media (max-width: 576px) {
    font-size: 20px;
  }
}

.completion-time {
  color: #909399;
  font-size: 14px;
}

.score-panel {
  display: flex;
  align-items: center;
  margin-bottom: 30px;

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    margin-bottom: 20px;
  }
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-right: 40px;
  border: 5px solid #f56c6c;
  color: #f56c6c;

  @media (max-width: 576px) {
    width: 100px;
    height: 100px;
    margin-right: 0;
    align-self: center;
  }

  &.score-pass {
    border-color: #e6a23c;
    color: #e6a23c;
  }

  &.score-good {
    border-color: #67c23a;
    color: #67c23a;
  }

  &.score-excellent {
    border-color: #409eff;
    color: #409eff;
  }
}

.score-number {
  font-size: 36px;
  font-weight: bold;
  line-height: 1;

  @media (max-width: 576px) {
    font-size: 32px;
  }
}

.score-total {
  font-size: 16px;
  margin-top: 5px;
}

.score-details {
  flex: 1;
}

.result-row {
  margin-bottom: 10px;
  font-size: 16px;

  @media (max-width: 576px) {
    font-size: 14px;
  }
}

.label {
  color: #606266;
  margin-right: 10px;
}

.score-fail {
  color: #f56c6c;
}

.score-pass {
  color: #e6a23c;
}

.score-good {
  color: #67c23a;
}

.score-excellent {
  color: #409eff;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;

  @media (max-width: 576px) {
    flex-direction: column;
    gap: 10px;
  }
}

.analysis-card {
  margin-bottom: 30px;
  border-radius: 8px;
  overflow: hidden;

  .el-card__header {
    background-color: #f8f9fa;
    padding: 15px;
  }

  .chart {
    height: 300px;
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
  }

  .stats-grid {
    margin-top: 15px;
  }

  .stat-box {
    border-radius: 6px;
    padding: 15px;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 18px;
    color: #303133;

    @media (max-width: 576px) {
      font-size: 16px;
    }
  }
}

.chart-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    margin-bottom: 20px;
  }
}

.chart-item {
  display: flex;
  flex-direction: column;

  h3 {
    text-align: center;
    margin-top: 0;
    margin-bottom: 15px;
    color: #606266;

    @media (max-width: 576px) {
      font-size: 14px;
      margin-bottom: 10px;
    }
  }
}

.chart {
  height: 300px;
  width: 100%;

  @media (max-width: 576px) {
    height: 250px;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;

  @media (max-width: 576px) {
    font-size: 12px;
    margin-bottom: 8px;
  }
}

.stat-value {
  font-size: 18px;
  color: #303133;
  font-weight: bold;

  @media (max-width: 576px) {
    font-size: 16px;
  }
}

.answers-card {
  margin-top: 30px;

  @media (max-width: 576px) {
    margin-top: 20px;
  }
}

.questions-container {
  display: flex;
  flex-direction: column;
  gap: 30px;

  @media (max-width: 576px) {
    gap: 20px;
  }
}

.question-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 20px;
  background-color: #fff;

  @media (max-width: 576px) {
    padding: 15px;
  }

  &.question-correct {
    border-left: 4px solid #67c23a;
  }

  &.question-wrong {
    border-left: 4px solid #f56c6c;
  }
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 12px;
  }
}

.question-status {
  display: flex;
  align-items: center;
  gap: 8px;

  .question-score {
    font-size: 14px;
    color: #606266;

    @media (max-width: 576px) {
      font-size: 12px;
    }
  }
}

.question-type {
  font-size: 14px;
  color: #909399;

  @media (max-width: 576px) {
    font-size: 12px;
  }
}

.question-content {
  .question-title {
    margin-bottom: 15px;
    font-size: 16px;
    line-height: 1.5;

    @media (max-width: 576px) {
      font-size: 14px;
      margin-bottom: 12px;
    }
  }
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;

  .option-item {
    padding: 10px 15px;
    border-radius: 4px;
    background-color: #f5f7fa;
    display: flex;
    align-items: flex-start;

    @media (max-width: 576px) {
      padding: 8px 12px;
    }

    &.option-selected {
      background-color: #ecf5ff;
      border: 1px solid #d9ecff;
    }

    &.option-correct {
      background-color: #f0f9eb;
      border: 1px solid #e1f3d8;
    }

    &.option-wrong {
      background-color: #fef0f0;
      border: 1px solid #fde2e2;
    }

    .option-label {
      font-weight: bold;
      margin-right: 8px;
      min-width: 20px;
    }

    .option-content {
      font-size: 14px;
    }
  }
}

.text-answer-container {
  margin-bottom: 15px;

  .user-answer,
  .correct-answer {
    margin-bottom: 15px;

    @media (max-width: 576px) {
      margin-bottom: 12px;
    }
  }

  .answer-label {
    font-weight: bold;
    margin-bottom: 5px;
    color: #606266;

    @media (max-width: 576px) {
      font-size: 13px;
    }
  }

  .answer-content {
    background-color: #f5f7fa;
    padding: 10px;
    border-radius: 4px;
    white-space: pre-wrap;

    @media (max-width: 576px) {
      padding: 8px;
      font-size: 13px;
    }
  }
}

.explanation-container {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #e4e7ed;

  @media (max-width: 576px) {
    margin-top: 12px;
    padding-top: 12px;
  }

  .explanation-title {
    font-weight: bold;
    margin-bottom: 5px;
    color: #606266;

    @media (max-width: 576px) {
      font-size: 13px;
    }
  }

  .explanation-content {
    color: #606266;
    line-height: 1.5;

    @media (max-width: 576px) {
      font-size: 13px;
    }
  }
}

.answer-summary {
  margin-bottom: 15px;
  padding: 10px 15px;
  background-color: #f5f7fa;
  border-radius: 4px;

  .user-choice,
  .correct-choice {
    margin-bottom: 10px;
    display: flex;
    align-items: center;

    @media (max-width: 576px) {
      margin-bottom: 8px;
    }
  }

  .answer-label {
    font-weight: bold;
    margin-right: 8px;
    min-width: 70px;
  }

  .correct-text {
    color: #67c23a;
    font-weight: bold;
  }

  .wrong-text {
    color: #f56c6c;
    font-weight: bold;
  }
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

// 添加时间统计卡片样式
.time-stats-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  box-sizing: border-box;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.time-stats-header {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.time-stats-body {
  display: flex;
  justify-content: space-around;
  width: 100%;
}

.time-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  background-color: #f5f7fa;
  min-width: 120px;

  &.highlight {
    background-color: #ecf5ff;
    border: 1px solid #d9ecff;
  }
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}
</style>
