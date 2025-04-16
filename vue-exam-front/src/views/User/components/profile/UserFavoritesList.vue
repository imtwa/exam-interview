<template>
  <div class="user-favorites-list">
    <!-- 标题及功能按钮 -->
    <div class="section-header">
      <h2 class="section-title">收藏题库</h2>
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
        <el-empty description="暂无收藏题库" />
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
                  >查看详情</el-button
                >
                <el-button size="small" type="danger" @click.stop="cancelFavorite(item.id)"
                  >取消收藏</el-button
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getFavorites, toggleFavorite } from '@/api/exam'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Star, ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const favorites = ref([])

// 获取收藏列表
const fetchFavorites = async () => {
  loading.value = true
  try {
    const response = await getFavorites({
      page: 1,
      pageSize: 6, // 只显示前6个收藏
      sortField: 'createdAt',
      sortOrder: 'desc'
    })
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

// 取消收藏
const cancelFavorite = async examId => {
  try {
    await ElMessageBox.confirm('确定要取消收藏这份试卷吗？', '取消收藏', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const result = await toggleFavorite(examId)
    if (!result.isFavorite) {
      ElMessage.success('已取消收藏')
      // 重新加载收藏列表
      fetchFavorites()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消收藏失败:', error)
      ElMessage.error('操作失败，请稍后再试')
    }
  }
}

onMounted(() => {
  fetchFavorites()
})
</script>

<style lang="less" scoped>
.user-favorites-list {
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
