<template>
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
            <div class="stat-value">{{ result.averageTimePerQuestion }}秒</div>
          </div>

          <div class="stat-box">
            <div class="stat-title">最高分题型</div>
            <div class="stat-value">{{ result.bestQuestionType }}</div>
          </div>

          <div class="stat-box">
            <div class="stat-title">最低分题型</div>
            <div class="stat-value">{{ result.worstQuestionType }}</div>
          </div>

          <div class="stat-box">
            <div class="stat-title">知识点掌握</div>
            <div class="stat-value">
              <el-progress
                :percentage="result.knowledgeMastery"
                :color="getProgressColor(result.knowledgeMastery)"
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
                    'option-correct': option.isCorrect,
                    'option-selected': isOptionSelected(question, option.value),
                    'option-wrong': isOptionSelected(question, option.value) && !option.isCorrect
                  }"
                >
                  <span class="option-label">{{ option.label }}</span>
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
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
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

// 注册必需的组件
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

// 页面状态
const loading = ref(true)
const showAnswers = ref(false)
const result = ref(null)

// 图表引用
const questionTypeChart = ref(null)
const timeDistributionChart = ref(null)

// 获取考试结果
const fetchExamResult = async () => {
  loading.value = true

  try {
    // TODO: 替换为实际API调用
    // const response = await getExamResult(examId)
    // result.value = response.data

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 模拟考试结果数据
    result.value = {
      examId: examId,
      examTitle: '前端工程师笔试题',
      submittedAt: new Date(),
      score: 85,
      totalScore: 100,
      scorePercent: 85,
      duration: 35 * 60, // 35分钟（以秒为单位）
      correctCount: 12,
      totalQuestions: 15,

      // 分析数据
      averageTimePerQuestion: 140, // 秒
      bestQuestionType: '单选题',
      worstQuestionType: '简答题',
      knowledgeMastery: 82, // 百分比

      // 图表数据
      questionTypeScores: [
        { name: '单选题', score: 25, total: 25 },
        { name: '多选题', score: 20, total: 25 },
        { name: '填空题', score: 15, total: 20 },
        { name: '简答题', score: 25, total: 30 }
      ],

      timeDistribution: [
        { name: '0-30秒', count: 5 },
        { name: '30-60秒', count: 4 },
        { name: '60-120秒', count: 3 },
        { name: '120秒以上', count: 3 }
      ],

      // 试题详情
      questions: [
        {
          id: 'q1',
          content: '以下哪个不是JavaScript的基本数据类型？',
          type: 'single_choice',
          score: 5,
          totalScore: 5,
          isCorrect: true,
          options: [
            { label: 'A. String', value: 'A', isCorrect: false },
            { label: 'B. Number', value: 'B', isCorrect: false },
            { label: 'C. Boolean', value: 'C', isCorrect: false },
            { label: 'D. Array', value: 'D', isCorrect: true }
          ],
          userAnswer: 'D',
          correctAnswer: 'D',
          explanation:
            'JavaScript的基本数据类型包括String、Number、Boolean、Null、Undefined和Symbol（ES6新增）。Array是引用类型，不是基本数据类型。'
        },
        {
          id: 'q2',
          content: '以下关于Vue.js生命周期的说法，哪些是正确的？',
          type: 'multiple_choice',
          score: 10,
          totalScore: 10,
          isCorrect: true,
          options: [
            { label: 'A. created钩子可以访问到数据', value: 'A', isCorrect: true },
            { label: 'B. mounted钩子中DOM已经更新完成', value: 'B', isCorrect: true },
            { label: 'C. beforeDestroy钩子中无法访问实例', value: 'C', isCorrect: false },
            {
              label: 'D. updated钩子在数据变化导致的虚拟DOM重新渲染后调用',
              value: 'D',
              isCorrect: true
            }
          ],
          userAnswer: ['A', 'B', 'D'],
          correctAnswer: ['A', 'B', 'D'],
          explanation:
            'Vue生命周期中，created钩子可以访问到数据，但DOM还未挂载；mounted钩子中DOM已经挂载完成；beforeDestroy钩子中仍然可以访问到实例；updated钩子在数据变化导致的虚拟DOM重新渲染和打补丁后调用。'
        },
        {
          id: 'q3',
          content: '在CSS中，使用______属性可以控制元素的不透明度。',
          type: 'fill_blank',
          score: 5,
          totalScore: 5,
          isCorrect: true,
          userAnswer: 'opacity',
          correctAnswer: 'opacity',
          explanation:
            'CSS中使用opacity属性控制元素的不透明度，值的范围为0-1，其中0表示完全透明，1表示完全不透明。'
        },
        {
          id: 'q5',
          content: '简述前端性能优化的三种方法及其原理。',
          type: 'short_answer',
          score: 20,
          totalScore: 30,
          isCorrect: false,
          userAnswer: '1. 资源压缩：减小文件体积，加快加载速度。\n2. 使用CDN：分发资源，减少延迟。',
          correctAnswer:
            '1. 资源压缩与合并：减小文件体积和HTTP请求数量，加快加载速度。\n2. 使用CDN：利用分布式服务器网络，减少资源获取的延迟时间。\n3. 图片优化：使用适当的图片格式和大小，减少带宽占用。\n4. 懒加载：按需加载资源，提高首屏加载速度。\n5. 缓存策略：合理利用浏览器缓存，减少重复请求。',
          explanation:
            '前端性能优化涉及多个方面，包括但不限于以上几点。评分标准考虑：是否能够覆盖资源加载优化、代码执行优化和用户体验优化三个维度；是否能够准确解释各种优化方法的原理；是否能够结合实际场景分析。'
        }
      ]
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
  if (!result.value) return

  nextTick(() => {
    // 题型得分图表
    if (questionTypeChart.value) {
      const chart = echarts.init(questionTypeChart.value)
      const { questionTypeScores } = result.value

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: params => {
            const data = params[0].data
            return `${params[0].name}<br/>得分：${data.score}/${data.total}分<br/>得分率：${Math.round((data.score / data.total) * 100)}%`
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: questionTypeScores.map(item => item.name)
        },
        yAxis: {
          type: 'value',
          max: Math.max(...questionTypeScores.map(item => item.total))
        },
        series: [
          {
            name: '得分',
            type: 'bar',
            data: questionTypeScores.map(item => ({
              value: item.score,
              score: item.score,
              total: item.total
            })),
            itemStyle: {
              color: function (params) {
                const scoreRate = params.data.score / params.data.total
                if (scoreRate >= 0.8) return '#67C23A'
                if (scoreRate >= 0.6) return '#E6A23C'
                return '#F56C6C'
              }
            },
            label: {
              show: true,
              position: 'top',
              formatter: '{c}/{@total}'
            }
          }
        ]
      }

      chart.setOption(option)
      window.addEventListener('resize', () => chart.resize())
    }

    // 答题用时分布图
    if (timeDistributionChart.value) {
      const chart = echarts.init(timeDistributionChart.value)
      const { timeDistribution } = result.value

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}题 ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          data: timeDistribution.map(item => item.name)
        },
        series: [
          {
            name: '答题用时',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: timeDistribution.map(item => ({
              name: item.name,
              value: item.count
            }))
          }
        ]
      }

      chart.setOption(option)
      window.addEventListener('resize', () => chart.resize())
    }
  })
}

// 显示答题详情
const viewAnswers = () => {
  showAnswers.value = !showAnswers.value
  if (showAnswers.value) {
    nextTick(() => {
      document.querySelector('.answers-card').scrollIntoView({ behavior: 'smooth' })
    })
  }
}

// 返回首页
const goHome = () => {
  router.push('/online-exam')
}

// 格式化日期
const formatDate = date => {
  if (!date) return '-'
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 格式化时长
const formatDuration = seconds => {
  if (!seconds) return '-'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  let result = ''
  if (hours > 0) result += `${hours}小时`
  if (minutes > 0) result += `${minutes}分钟`
  if (secs > 0 && hours === 0) result += `${secs}秒`

  return result
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
  if (Array.isArray(question.userAnswer)) {
    return question.userAnswer.includes(optionValue)
  }
  return question.userAnswer === optionValue
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
.exam-result-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 15px;
  }

  @media (max-width: 576px) {
    padding: 10px;
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

  @media (max-width: 576px) {
    margin-bottom: 20px;
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

.stat-box {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 15px;

  @media (max-width: 576px) {
    padding: 12px;
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

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
