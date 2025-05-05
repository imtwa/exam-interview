<template>
  <div class="favorites-page">
    <div class="favorites-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/profile' }">个人中心</el-breadcrumb-item>
          <el-breadcrumb-item>我的收藏</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 筛选区域 -->
      <div class="filter-container">
        <el-form :inline="true" class="filter-form">
          <el-form-item label="分类">
            <el-select
              v-model="queryParams.categoryId"
              placeholder="选择分类"
              clearable
              @change="handleCategoryChange"
            >
              <el-option
                v-for="item in categories"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="子分类" v-if="subCategories.length > 0">
            <el-select v-model="queryParams.subCategoryId" placeholder="选择子分类" clearable>
              <el-option
                v-for="item in subCategories"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="关键词">
            <el-input v-model="queryParams.keyword" placeholder="试卷名称/描述" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchFavorites">搜索</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 排序方式 -->
      <div class="sort-container">
        <span class="sort-label">排序:</span>
        <el-radio-group v-model="queryParams.sortField" size="small" @change="fetchFavorites">
          <el-radio-button label="favoriteCreatedAt">收藏时间</el-radio-button>
          <el-radio-button label="createdAt">创建时间</el-radio-button>
          <el-radio-button label="name">名称</el-radio-button>
        </el-radio-group>

        <el-radio-group
          v-model="queryParams.sortOrder"
          size="small"
          @change="fetchFavorites"
          class="sort-order"
        >
          <el-radio-button label="desc">降序</el-radio-button>
          <el-radio-button label="asc">升序</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton animated :rows="5" :loading="loading" />
      </div>

      <!-- 收藏列表 -->
      <div v-else class="favorites-list">
        <div v-if="favorites.length === 0" class="empty-container">
          <el-empty description="暂无收藏内容" />
        </div>
        <div v-else>
          <div
            class="exam-card"
            v-for="exam in favorites"
            :key="exam.id"
            @click="goToExam(exam.id)"
          >
            <div class="exam-info">
              <h2 class="exam-title">{{ exam.name }}</h2>
              <div class="exam-meta">
                <span class="meta-item">
                  <el-icon><Document /></el-icon>
                  {{ exam.questionsCount || 0 }} 题
                </span>
                <span class="meta-item">
                  <el-icon><Star /></el-icon>
                  {{ exam.favoriteCount || 0 }} 收藏
                </span>
                <span class="meta-item">
                  <el-icon><Calendar /></el-icon>
                  收藏于: {{ formatDateTime(exam.favoriteCreatedAt) }}
                </span>
              </div>
              <div class="exam-tags">
                <el-tag type="primary" effect="plain" v-if="exam.category">{{
                  exam.category.name
                }}</el-tag>
                <el-tag type="success" effect="plain" v-if="exam.subCategory">{{
                  exam.subCategory.name
                }}</el-tag>
              </div>
              <div class="exam-description" v-if="exam.description">
                <p>{{ exam.description }}</p>
              </div>
            </div>
            <div class="exam-actions">
              <el-button
                type="primary"
                size="small"
                @click.stop="goToExam(exam.id)"
                class="exam-action-btn"
                >查看详情</el-button
              >
              <el-button
                type="danger"
                size="small"
                @click.stop="cancelFavorite(exam.id)"
                class="exam-action-btn"
                >取消收藏</el-button
              >
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper" v-if="favorites.length > 0">
          <el-pagination
            v-model:current-page="queryParams.page"
            v-model:page-size="queryParams.pageSize"
            :page-sizes="[5, 10, 20, 50]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserFavorites, toggleFavorite } from '@/api/exam'
import { getCategoryList } from '@/api/category'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Star, Calendar } from '@element-plus/icons-vue'
import { formatDateTime } from '@/utils/utils'

const router = useRouter()

// 分类数据
const categories = ref([])
const subCategories = ref([])
const allSubCategories = ref({}) // 用于存储所有子分类

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  categoryId: '',
  subCategoryId: '',
  keyword: '',
  sortField: 'favoriteCreatedAt',
  sortOrder: 'desc'
})

// 数据状态
const loading = ref(false)
const favorites = ref([])
const total = ref(0)

// 获取收藏列表
const fetchFavorites = async () => {
  loading.value = true
  try {
    // 确保数值类型参数是数字
    const params = {
      ...queryParams,
      page: Number(queryParams.page),
      pageSize: Number(queryParams.pageSize)
    }

    // 将分类ID转为数字(如果存在)
    if (params.categoryId) {
      params.categoryId = Number(params.categoryId)
    }

    // 将子分类ID转为数字(如果存在)
    if (params.subCategoryId) {
      params.subCategoryId = Number(params.subCategoryId)
    }

    const response = await getUserFavorites(params)
    favorites.value = response.items || []
    total.value = response.total || 0
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    ElMessage.error('获取收藏列表失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await getCategoryList()
    categories.value = response || []

    // 处理子分类数据
    allSubCategories.value = {}
    categories.value.forEach(category => {
      if (category.children && category.children.length > 0) {
        allSubCategories.value[category.id] = category.children
      }
    })

    // 如果有选中的分类，更新子分类列表
    if (queryParams.categoryId) {
      handleCategoryChange(queryParams.categoryId)
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 处理分类变更，更新子分类选项
const handleCategoryChange = categoryId => {
  if (!categoryId) {
    subCategories.value = []
    queryParams.subCategoryId = ''
    return
  }

  subCategories.value = allSubCategories.value[categoryId] || []
  // 如果当前选中的子分类不在新分类的子分类中，清空选择
  if (
    queryParams.subCategoryId &&
    !subCategories.value.find(s => s.id === queryParams.subCategoryId)
  ) {
    queryParams.subCategoryId = ''
  }
}

// 分页相关方法
const handleSizeChange = newSize => {
  queryParams.pageSize = newSize
  fetchFavorites()
}

const handleCurrentChange = newPage => {
  queryParams.page = newPage
  fetchFavorites()
}

// 重置筛选条件
const resetFilters = () => {
  queryParams.categoryId = ''
  queryParams.subCategoryId = ''
  queryParams.keyword = ''
  subCategories.value = []
  fetchFavorites()
}

// 跳转至试卷详情
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
  fetchCategories()
  fetchFavorites()
})
</script>

<style lang="less" scoped>
.favorites-page {
  width: 100%;
  background-color: #f5f9ff;
  min-height: calc(100vh - 72px);
}

.favorites-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.breadcrumb-container {
  margin-bottom: 20px;
  font-size: 14px;
}

.page-header {
  margin-bottom: 24px;

  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
  }

  .page-description {
    color: #666;
    font-size: 14px;
    margin: 0;
  }
}

.filter-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;

  :deep(.el-form-item) {
    margin-right: 0;
    margin-bottom: 0;
  }

  :deep(.el-select) {
    width: 220px;
  }

  :deep(.el-input) {
    width: 220px;
  }
}

.sort-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;

  .sort-label {
    margin-right: 12px;
    color: #666;
  }

  .sort-order {
    margin-left: 16px;
  }
}

.loading-container {
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.favorites-list {
  .exam-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    padding: 24px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }

    .exam-info {
      flex: 1;

      .exam-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin: 0 0 12px 0;
        cursor: pointer;

        &:hover {
          color: #0352c9;
        }
      }

      .exam-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 12px;

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
        margin-bottom: 12px;

        .el-tag {
          margin-right: 8px;
        }
      }

      .exam-description {
        color: #666;
        font-size: 14px;
        line-height: 1.6;

        p {
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .exam-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      justify-content: center;
      margin-left: 24px;

      .exam-action-btn {
        min-width: 90px;
      }
    }
  }
}

.empty-container {
  padding: 40px;
  text-align: center;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}
</style>
