<template>
  <div class="interviewer-favorites-list">
    <!-- 标题及功能按钮 -->
    <div class="section-header">
      <h2 class="section-title">您创建的题库</h2>
      <router-link to="/favorites" class="view-all-link">
        查看全部
        <el-icon><ArrowRight /></el-icon>
      </router-link>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton animated :rows="3" />
    </div>

    <!-- 收藏列表 -->
    <div v-else class="favorites-list">
      <div v-if="favorites.length === 0" class="empty-data">
        <el-empty description="暂无收藏题库">
          <template #description>
            <p>您还没有创建任何面试题库</p>
          </template>
          <el-button type="primary" @click="navigateToQuestionBank">创建题库</el-button>
        </el-empty>
      </div>
      <div v-else>
        <el-row :gutter="16">
          <el-col v-for="item in favorites" :key="item.id" :xs="24" :sm="12" :md="8" :lg="8">
            <div class="favorite-card" @click="goToExam(item.id)">
              <h3 class="favorite-title">{{ item.name }}</h3>
              <div class="favorite-meta">
                <span class="meta-item">
                  <el-icon><Document /></el-icon>
                  {{ item.questionsCount || 0 }} 题
                </span>
                <span class="meta-item">
                  <el-icon><Star /></el-icon>
                  {{ item.favoriteCount || 0 }} 收藏
                </span>
              </div>
              <div class="favorite-tags">
                <el-tag v-if="item.category" type="primary" effect="plain" size="small">
                  {{ item.category.name }}
                </el-tag>
                <el-tag v-if="item.subCategory" type="success" effect="plain" size="small">
                  {{ item.subCategory.name }}
                </el-tag>
              </div>
              <div class="favorite-actions">
                <el-button size="small" type="primary" @click.stop="goToExam(item.id)"
                  >查看题库</el-button
                >
                <el-button size="small" type="success" @click.stop="useInInterview(item.id)"
                  >用于面试</el-button
                >
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { getUserFavorites } from '@/api/exam'
import { ElMessage } from 'element-plus'
import { Document, Star, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  userId: {
    type: Number,
    default: undefined
  }
})

const router = useRouter()
const loading = ref(false)
const favorites = ref([])

// 获取收藏列表
const fetchFavorites = async () => {
  loading.value = true
  try {
    const params = {
      page: 1,
      pageSize: 6, // 只显示前6个收藏
      sortField: 'favoriteCreatedAt', // 按收藏时间排序
      sortOrder: 'desc'
    }

    // 如果提供了用户ID，添加到查询参数中，确保是数字类型
    if (props.userId) {
      params.userId = Number(props.userId)
    }

    const response = await getUserFavorites(params)
    favorites.value = response.items || []
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    ElMessage.error('获取收藏列表失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

// 跳转到试卷详情
const goToExam = examId => {
  router.push(`/exam/${examId}`)
}

// 导航到题库列表
const navigateToQuestionBank = () => {
  router.push('/question-bank')
}

// 用于面试
const useInInterview = examId => {
  // 这里需要根据实际业务逻辑实现，例如打开面试题库选择对话框
  // 或者跳转到面试安排页面，带上选中的题库ID
  ElMessage.success('已添加到面试题库选择列表')
  router.push(`/interviewer/jobs?examId=${examId}`)
}

onMounted(() => {
  fetchFavorites()
})
</script>

<style lang="less" scoped>
.interviewer-favorites-list {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .view-all-link {
    color: #0352c9;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 4px;
    text-decoration: none;

    &:hover {
      opacity: 0.8;
    }
  }
}

.loading-container {
  padding: 16px;
}

.empty-data {
  padding: 20px 0;

  p {
    color: #666;
    margin-bottom: 16px;
  }
}

.favorite-card {
  background-color: #f9fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #ebeef5;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .favorite-title {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin: 0 0 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      color: #0352c9;
    }
  }

  .favorite-meta {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #666;
      font-size: 13px;

      .el-icon {
        color: #0352c9;
      }
    }
  }

  .favorite-tags {
    margin-bottom: 12px;

    .el-tag {
      margin-right: 6px;
      margin-bottom: 6px;
    }
  }

  .favorite-actions {
    display: flex;
    gap: 8px;
  }
}
</style>
