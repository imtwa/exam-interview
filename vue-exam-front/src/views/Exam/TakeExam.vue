<template>
  <div class="take-exam-page">
    <div class="take-exam-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/question-bank' }">试题库</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: `/exam/${examId}` }">试卷详情</el-breadcrumb-item>
          <el-breadcrumb-item>{{ modeTitle }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton animated :rows="10" />
      </div>
      
      <!-- 试卷内容 -->
      <template v-else>
        <div class="exam-header">
          <div class="exam-title-info">
            <h1 class="exam-title">{{ examData.name }}</h1>
            <div class="exam-meta">
              <span class="meta-item">
                <el-icon><Document /></el-icon>
                {{ questionList.length }} 题
              </span>
              <span class="meta-item">
                <el-icon><Timer /></el-icon>
                已用时间: {{ formatTime(elapsedTime) }}
              </span>
              <span class="meta-item practice-mode">
                <el-tag :type="practiceMode === 'normal' ? 'primary' : practiceMode === 'sequential' ? 'warning' : 'success'" effect="light">{{ modeTitle }}</el-tag>
              </span>
            </div>
          </div>
          <div class="exam-actions">
            <el-button type="primary" size="large" @click="submitExam" :loading="submitting">
              <el-icon><Check /></el-icon>
              提交试卷
            </el-button>
          </div>
        </div>
        
        <!-- 题目列表 -->
        <div class="questions-container">
          <div v-for="(question, index) in questionList" :key="question.questionId || question.id" class="question-item">
            <div class="question-header">
              <div class="question-title">
                <span class="question-index">{{ index + 1 }}</span>
                <span class="question-type-tag">
                  {{ getQuestionTypeName(question.question?.qtype || question.qtype) }}
                </span>
                <span class="title-text">{{ question.question?.question || question.question }}</span>
              </div>
              <div class="question-score">
                <span>{{ question.score || 1 }}分</span>
              </div>
            </div>
            
            <!-- 单选题 -->
            <div v-if="(question.question?.qtype || question.qtype) === 1" class="question-options">
              <el-radio-group v-model="answers[index]">
                <div v-for="(option, optIndex) in parseOptions(question.question?.options || question.options)" 
                     :key="optIndex" 
                     class="option-item">
                  <el-radio :label="optIndex">
                    <span class="option-content">{{ optIndex }}. {{ option }}</span>
                  </el-radio>
                </div>
              </el-radio-group>
            </div>
            
            <!-- 多选题 -->
            <div v-else-if="(question.question?.qtype || question.qtype) === 2" class="question-options">
              <el-checkbox-group v-model="answers[index]">
                <div v-for="(option, optIndex) in parseOptions(question.question?.options || question.options)" 
                     :key="optIndex" 
                     class="option-item">
                  <el-checkbox :label="optIndex">
                    <span class="option-content">{{ optIndex }}. {{ option }}</span>
                  </el-checkbox>
                </div>
              </el-checkbox-group>
            </div>
            
            <!-- 判断题 -->
            <div v-else-if="(question.question?.qtype || question.qtype) === 3" class="question-options">
              <el-radio-group v-model="answers[index]">
                <div class="option-item">
                  <el-radio label="1">
                    <span class="option-content">√ 正确</span>
                  </el-radio>
                </div>
                <div class="option-item">
                  <el-radio label="0">
                    <span class="option-content">× 错误</span>
                  </el-radio>
                </div>
              </el-radio-group>
            </div>
            
            <!-- 填空题 -->
            <div v-else-if="(question.question?.qtype || question.qtype) === 4" class="question-options">
              <el-input 
                v-model="answers[index]" 
                type="textarea" 
                :rows="3"
                placeholder="请输入您的答案"
                class="fill-answer"
              />
            </div>
          </div>
          
          <!-- 提交按钮 -->
          <div class="submit-container">
            <el-button type="primary" size="large" @click="submitExam" :loading="submitting">
              提交试卷
            </el-button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getExamDetail, submitExamAnswer } from '@/api/exam'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Timer, Check } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const examId = computed(() => route.params.id)
const practiceMode = computed(() => route.query.mode || 'normal')

// 数据状态
const loading = ref(true)
const submitting = ref(false)
const examData = ref({})
const questionList = ref([])
const answers = ref([])
const elapsedTime = ref(0)
let timer = null

// 获取试卷详情
const fetchExamDetail = async () => {
  loading.value = true
  try {
    const data = await getExamDetail(examId.value)
    examData.value = data
    
    // 根据不同练习模式处理题目列表
    if (practiceMode.value === 'sequential') {
      // 顺序练习模式 - 按原始顺序展示题目
      questionList.value = data.examQuestions || []
    } else if (practiceMode.value === 'simulation') {
      // 模拟考试模式 - 随机打乱题目顺序
      questionList.value = [...(data.examQuestions || [])].sort(() => Math.random() - 0.5)
    } else {
      // 普通模式
      questionList.value = data.examQuestions || []
    }
    
    // 初始化答案数组
    initAnswers()
    
    // 开始计时
    startTimer()
    
    console.log('试卷详情:', data)
  } catch (error) {
    console.error('获取试卷详情失败:', error)
    ElMessage.error('获取试卷详情失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

// 初始化答案数组
const initAnswers = () => {
  questionList.value.forEach((question, index) => {
    const qtype = question.question?.qtype || question.qtype
    
    // 根据题型设置不同的初始值
    if (qtype === 1 || qtype === 3) {
      // 单选题或判断题初始值为空字符串
      answers.value[index] = ''
    } else if (qtype === 2) {
      // 多选题初始值为空数组
      answers.value[index] = []
    } else if (qtype === 4) {
      // 填空题初始值为空字符串
      answers.value[index] = ''
    }
  })
}

// 开始计时
const startTimer = () => {
  timer = setInterval(() => {
    elapsedTime.value++
  }, 1000)
}

// 格式化时间
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':')
}

// 获取题型名称
const getQuestionTypeName = (type) => {
  const types = {
    1: '单选题',
    2: '多选题',
    3: '判断题',
    4: '填空题'
  }
  return types[type] || '未知类型'
}

// 解析选项
const parseOptions = (optionsStr) => {
  if (!optionsStr) return []
  try {
    return JSON.parse(optionsStr)
  } catch (error) {
    console.error('解析选项失败:', error)
    return []
  }
}

// 获取练习模式标题
const modeTitle = computed(() => {
  const modes = {
    sequential: '顺序练习',
    simulation: '模拟考试',
    normal: '在线答题'
  }
  return modes[practiceMode.value] || '在线答题'
})

// 提交试卷
const submitExam = async () => {
  // 检查是否所有题目都已回答
  const unansweredCount = answers.value.filter(answer => {
    return answer === '' || (Array.isArray(answer) && answer.length === 0)
  }).length
  
  if (unansweredCount > 0) {
    try {
      await ElMessageBox.confirm(
        `还有 ${unansweredCount} 道题目未回答，确定要提交吗？`,
        '提交确认',
        {
          confirmButtonText: '确认提交',
          cancelButtonText: '继续答题',
          type: 'warning'
        }
      )
    } catch (error) {
      // 用户取消提交，继续答题
      return
    }
  }
  
  submitting.value = true
  try {
    // 构建提交数据
    const submitData = {
      examId: examId.value,
      answers: answers.value.map((answer, index) => {
        const question = questionList.value[index]
        const questionId = question.questionId || question.id
        const qtype = question.question?.qtype || question.qtype
        
        return {
          questionId,
          type: qtype,
          answer: formatAnswerForSubmit(answer, qtype)
        }
      }),
      timeTaken: elapsedTime.value,
      mode: practiceMode.value
    }
    
    const result = await submitExamAnswer(submitData)
    
    // 停止计时
    clearInterval(timer)
    
    ElMessage.success('试卷提交成功！')
    
    // 跳转到结果页面，这里使用setTimeout模拟等待后台处理
    setTimeout(() => {
      // 可以跳转到结果页，如果有的话
      // router.push(`/exam-result/${examId.value}`)
      
      // 暂时先跳回试卷详情页
      router.push(`/exam/${examId.value}`)
    }, 1000)
  } catch (error) {
    console.error('提交试卷失败:', error)
    ElMessage.error('提交试卷失败，请稍后再试')
    submitting.value = false
  }
}

// 格式化答案用于提交
const formatAnswerForSubmit = (answer, type) => {
  // 单选题，直接返回选项
  if (type === 1) {
    return answer
  }
  
  // 多选题，将数组转为字符串
  if (type === 2 && Array.isArray(answer)) {
    return answer.sort().join('')
  }
  
  // 判断题和填空题，直接返回
  return answer
}

onMounted(() => {
  fetchExamDetail()
})

onBeforeUnmount(() => {
  // 清除计时器
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style lang="less" scoped>
.take-exam-page {
  width: 100%;
  background-color: #f5f9ff;
  min-height: calc(100vh - 60px);
}

.take-exam-container {
  max-width: 1200px;
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
}

.exam-header {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .exam-title-info {
    .exam-title {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin: 0 0 16px 0;
    }
    
    .exam-meta {
      display: flex;
      gap: 16px;
      
      .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #666;
        font-size: 14px;
        
        .el-icon {
          color: #0352c9;
        }
      }
    }
  }
}

.questions-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 20px;
  
  .question-item {
    padding: 20px;
    border: 1px solid #eee;
    border-radius: 8px;
    margin-bottom: 24px;
    
    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      
      .question-title {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;
        
        .question-index {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background-color: #0352c9;
          color: white;
          border-radius: 50%;
          font-size: 14px;
          font-weight: 600;
        }
        
        .question-type-tag {
          background-color: #e6f1ff;
          color: #0352c9;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        
        .title-text {
          flex: 1;
          font-size: 16px;
          font-weight: 500;
          color: #333;
          line-height: 1.5;
        }
      }
      
      .question-score {
        font-size: 14px;
        color: #ff6b00;
        font-weight: 600;
      }
    }
    
    .question-options {
      padding: 10px 20px;
      
      .option-item {
        margin-bottom: 16px;
        
        .option-content {
          font-size: 14px;
          color: #333;
        }
      }
      
      .fill-answer {
        width: 100%;
      }
    }
  }
  
  .submit-container {
    margin-top: 30px;
    text-align: center;
  }
}
</style> 