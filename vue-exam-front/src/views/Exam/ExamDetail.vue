<template>
  <div class="exam-detail-page">
    <div class="exam-detail-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/question-bank' }">试题库</el-breadcrumb-item>
          <el-breadcrumb-item>{{ examData.name || '试卷详情' }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton animated :rows="10" />
      </div>

      <!-- 试卷基本信息 -->
      <template v-else>
        <div class="exam-header">
          <div class="exam-info">
            <h1 class="exam-title">{{ examData.name }}</h1>
            <div class="exam-meta">
              <span class="meta-item">
                <el-icon>
                  <Document />
                </el-icon>
                {{ examData.questionsCount || examData.examQuestions?.length || 0 }} 题
              </span>
              <span class="meta-item">
                <el-icon>
                  <Star />
                </el-icon>
                {{ examData.favoriteCount || 0 }} 收藏
              </span>
              <span class="meta-item">
                <el-icon>
                  <User />
                </el-icon>
                创建者: {{ examData.userName || examData.user?.username || '未知' }}
              </span>
              <span class="meta-item">
                <el-icon>
                  <Calendar />
                </el-icon>
                创建时间: {{ formatDate(examData.createdAt) }}
              </span>
            </div>
            <div class="exam-tags">
              <el-tag type="primary" effect="plain" v-if="examData.category">{{
                examData.category.name
              }}</el-tag>
              <el-tag type="success" effect="plain" v-if="examData.subCategory">{{
                examData.subCategory.name
              }}</el-tag>
            </div>
            <div class="exam-description" v-if="examData.description">
              <p>{{ examData.description }}</p>
            </div>
          </div>
          <div class="exam-actions">
            <el-button type="primary" size="large" @click="startExam" class="action-button">
              <el-icon> <VideoPlay /> </el-icon>开始考试</el-button
            >
            <el-button
              type="default"
              size="large"
              @click="collectExam"
              :disabled="isCollecting"
              class="action-button"
            >
              <el-icon>
                <Star />
              </el-icon>
              {{ isCollected ? '已收藏' : '收藏试卷' }}
            </el-button>
          </div>
        </div>

        <!-- 练习功能区 -->
        <div class="study-features-container">
          <!-- <div class="feature-section">
            <h2 class="section-header">我的练习</h2>
            <div class="feature-cards">
              <div class="feature-card" @click="goToWrongQuestions">
                <div class="card-icon wrong-icon">
                  <el-icon><CloseBold /></el-icon>
                </div>
                <div class="card-content">
                  <div class="card-title">我的错题</div>
                  <div class="card-count">({{ wrongQuestionsCount }}题)</div>
                </div>
              </div>
              
              <div class="feature-card" @click="goToFavorites">
                <div class="card-icon favorite-icon">
                  <el-icon><Star /></el-icon>
                </div>
                <div class="card-content">
                  <div class="card-title">我的收藏</div>
                  <div class="card-count">({{ favoritesCount }}题)</div>
                </div>
              </div>
            </div>
          </div> -->

          <div class="feature-section">
            <h2 class="section-header">专项练习</h2>
            <div class="feature-cards practice-cards">
              <div class="feature-card practice-card" @click="startSequentialPractice">
                <div class="card-icon sequence-icon">
                  <el-icon>
                    <List />
                  </el-icon>
                </div>
                <div class="card-content">
                  <div class="card-title">顺序练习</div>
                  <div class="card-count">
                    {{ examData.questionsCount || examData.examQuestions?.length || 0 }} /
                    {{ examData.questionsCount || examData.examQuestions?.length || 0 }}
                  </div>
                </div>
              </div>

              <div class="feature-card practice-card" @click="startRandomPractice">
                <div class="card-icon random-icon">
                  <el-icon>
                    <Refresh />
                  </el-icon>
                </div>
                <div class="card-content">
                  <div class="card-title">随机练习</div>
                  <div class="card-count">自定义设置练习量</div>
                </div>
              </div>
            </div>

            <div class="feature-cards practice-cards" style="margin-top: 16px">
              <div class="feature-card practice-card" @click="startSimulationExam">
                <div class="card-icon simulation-icon">
                  <el-icon>
                    <DocumentCopy />
                  </el-icon>
                </div>
                <div class="card-content">
                  <div class="card-title">模拟考试</div>
                  <div class="card-count">仿真模拟</div>
                </div>
              </div>

              <div class="feature-card practice-card" @click="startTypeBasedPractice">
                <div class="card-icon type-icon">
                  <el-icon>
                    <List />
                  </el-icon>
                </div>
                <div class="card-content">
                  <div class="card-title">题型练习</div>
                  <div class="card-count">按题型分类练习</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 试题列表 -->
        <div class="questions-container">
          <div class="section-header">
            <h2 class="section-title">试题列表</h2>
            <div class="section-tools">
              <el-radio-group v-model="questionType" size="small">
                <el-radio-button :label="0">全部</el-radio-button>
                <el-radio-button :label="1">单选题</el-radio-button>
                <el-radio-button :label="2">多选题</el-radio-button>
                <el-radio-button :label="3">判断题</el-radio-button>
                <el-radio-button :label="4">填空题</el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <!-- 题目列表内容 -->
          <div v-if="filteredQuestions.length === 0" class="empty-container">
            <el-empty description="暂无题目" />
          </div>
          <div v-else class="question-list">
            <div
              v-for="(question, index) in paginatedQuestions"
              :key="question.questionId || question.id"
              class="question-item"
              @click="goToQuestionPractice(question, index)"
            >
              <div class="question-title">
                <span class="question-index">{{ (currentPage - 1) * pageSize + index + 1 }}</span>
                <span class="question-type-tag">
                  {{ getQuestionTypeName(question.question?.qtype || question.qtype) }}
                </span>
                <span class="title-text">{{
                  question.question?.question || question.question
                }}</span>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination-wrapper" v-if="filteredQuestions.length > 0">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 30, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredQuestions.length"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getExamDetail, toggleFavorite, checkFavorite } from '@/api/exam'
import { ElMessage } from 'element-plus'
import {
  Document,
  Star,
  User,
  Calendar,
  VideoPlay,
  CloseBold,
  List,
  Refresh,
  DocumentCopy
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const examId = computed(() => route.params.id)

// 数据状态
const loading = ref(true)
const examData = ref({})
const questionType = ref(0)
const isCollected = ref(false)
const isCollecting = ref(false)

// 练习功能相关数据
const wrongQuestionsCount = ref(0)
const favoritesCount = ref(0)

// 分页相关数据
const currentPage = ref(1)
const pageSize = ref(10)

// 获取试卷详情
const fetchExamDetail = async () => {
  loading.value = true
  try {
    const data = await getExamDetail(examId.value)
    examData.value = data
    // 检查当前用户是否已收藏该试卷
    checkIsCollected()
  } catch (error) {
    console.error('获取试卷详情失败:', error)
    ElMessage.error('获取试卷详情失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

// 检查当前用户是否已收藏该试卷
const checkIsCollected = async () => {
  try {
    const res = await checkFavorite(examId.value)
    isCollected.value = res.isFavorite || false
  } catch (error) {
    console.error('检查收藏状态失败:', error)
    isCollected.value = false
  }
}

// 开始考试
const startExam = () => {
  router.push(`/practice-exam/${examId.value}??mode=simulation`)
}

// 收藏试卷
const collectExam = async () => {
  if (isCollecting.value) return

  isCollecting.value = true
  try {
    const res = await toggleFavorite(examId.value)
    isCollected.value = res.isFavorite

    // 更新试卷的收藏数量
    if (examData.value) {
      examData.value.favoriteCount = res.favoriteCount || examData.value.favoriteCount
    }

    ElMessage.success(isCollected.value ? '收藏成功' : '已取消收藏')
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error('操作失败，请稍后再试')
  } finally {
    isCollecting.value = false
  }
}

// 练习功能相关方法
const goToWrongQuestions = () => {
  ElMessage.info('错题功能开发中')
}

const goToFavorites = () => {
  ElMessage.info('收藏功能开发中')
}

const startSequentialPractice = () => {
  router.push(`/practice-exam/${examId.value}?mode=sequential`)
}

const startRandomPractice = () => {
  router.push(`/practice-exam/${examId.value}?mode=random`)
}

const startSimulationExam = () => {
  router.push(`/practice-exam/${examId.value}?mode=simulation`)
}

const startTypeBasedPractice = () => {
  router.push(`/practice-exam/${examId.value}?mode=typebased`)
}

// 根据题型筛选题目
const filteredQuestions = computed(() => {
  const questions = examData.value.examQuestions || []
  if (questionType.value === 0) {
    return questions
  }
  return questions.filter(q => {
    const qtype = q.question?.qtype || q.qtype
    return qtype === questionType.value
  })
})

// 分页相关方法
const paginatedQuestions = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  return filteredQuestions.value.slice(startIndex, startIndex + pageSize.value)
})

const handleSizeChange = newSize => {
  pageSize.value = newSize
}

const handleCurrentChange = newPage => {
  currentPage.value = newPage
}

// 格式化日期
const formatDate = dateString => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch (error) {
    console.error('日期格式化错误:', error)
    return dateString
  }
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

// 解析选项
const parseOptions = optionsStr => {
  if (!optionsStr) return []
  try {
    return JSON.parse(optionsStr)
  } catch (error) {
    console.error('解析选项失败:', error)
    return []
  }
}

// 跳转到练习的指定题目
const goToQuestionPractice = (question, index) => {
  // 计算题目在原始数组中的位置
  const questionIndex = findQuestionIndex(question)

  // 跳转到顺序练习页面，并传递要打开的题目索引
  router.push(`/practice-exam/${examId.value}?mode=sequential&questionIndex=${questionIndex}`)
}

// 找到题目在原始数组中的索引
const findQuestionIndex = targetQuestion => {
  const allQuestions = examData.value.examQuestions || []

  // 尝试通过questionId或id查找
  const questionId = targetQuestion.questionId || targetQuestion.id
  const index = allQuestions.findIndex(
    q => (q.questionId && q.questionId === questionId) || (q.id && q.id === questionId)
  )

  // 如果找到了，返回索引，否则返回0（第一题）
  return index >= 0 ? index : 0
}

onMounted(() => {
  fetchExamDetail()
})
</script>

<style lang="less" scoped>
.exam-detail-page {
  width: 100%;
  background-color: #f5f9ff;
  min-height: calc(100vh - 60px);
}

.exam-detail-container {
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

  .exam-info {
    flex: 1;

    .exam-title {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin: 0 0 16px 0;
      line-height: 1.3;
    }

    .exam-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 16px;

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

    .exam-tags {
      margin-bottom: 16px;

      .el-tag {
        margin-right: 8px;
      }
    }

    .exam-description {
      color: #666;
      font-size: 14px;
      line-height: 1.6;
    }
  }

  .exam-actions {
    display: flex;
    // flex-direction: column;
    gap: 12px;
    justify-content: center;

    .action-button {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}

.study-features-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 20px;

  .feature-section {
    margin-bottom: 24px;

    &:not(:last-child) {
      border-bottom: 1px solid #f0f0f0;
      padding-bottom: 16px;
    }

    .section-header {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin: 0 0 16px 0;
    }
  }

  .feature-cards {
    display: flex;
    gap: 16px;

    .feature-card {
      flex: 1;
      padding: 16px;
      background-color: #fff;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      border: 1px solid #f0f0f0;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .card-icon {
        width: 40px;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        margin-right: 12px;

        .el-icon {
          font-size: 20px;
        }

        &.wrong-icon {
          background-color: #ffeded;
          color: #ff4d4f;
        }

        &.favorite-icon {
          background-color: #fff7e6;
          color: #ffa940;
        }

        &.note-icon {
          background-color: #e6fffb;
          color: #13c2c2;
        }

        &.sequence-icon {
          background-color: #fff7e6;
          color: #fa8c16;
        }

        &.random-icon {
          background-color: #f0f5ff;
          color: #2f54eb;
        }

        &.simulation-icon {
          background-color: #f6ffed;
          color: #52c41a;
        }

        &.type-icon {
          background-color: #f0f5ff;
          color: #2f54eb;
        }
      }

      .card-content {
        flex: 1;

        .card-title {
          font-size: 15px;
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
        }

        .card-count {
          font-size: 13px;
          color: #666;
        }
      }
    }
  }

  .question-type-card {
    width: 100%;
    background-color: #f0f5ff;
    border: 1px solid #d6e4ff;
  }
}

.questions-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #eee;

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
  }

  .question-list {
    .question-item {
      padding: 16px;
      border: 1px solid #e8e8e8;
      border-radius: 4px;
      margin-bottom: 16px;
      transition: all 0.3s;
      cursor: pointer;

      &:hover {
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        border-color: #409eff;
        transform: translateY(-2px);
      }

      .question-title {
        display: flex;
        align-items: center;
        gap: 10px;

        .question-index {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 28px;
          padding: 0 6px;
          background-color: #2468f2;
          color: white;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 600;
        }

        .question-type-tag {
          background-color: #e6f1ff;
          color: #0352c9;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          margin-right: 6px;
        }

        .title-text {
          flex: 1;
          font-size: 14px;
          color: #333;
          line-height: 1.5;
        }
      }

      &::after {
        content: '点击练习';
        position: absolute;
        right: 16px;
        color: #409eff;
        font-size: 12px;
        opacity: 0;
        transition: opacity 0.3s;
      }

      &:hover::after {
        opacity: 1;
      }
    }
  }
}

.empty-container {
  padding: 40px;
  text-align: center;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}
</style>
