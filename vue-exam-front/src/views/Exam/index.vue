<template>
  <div class="question-bank-page">
    <div class="question-bank-container">
      <!-- 一级分类导航 -->
      <div class="category-nav">
        <div class="category-wrapper">
          <div class="primary-categories">
            <div
              class="category-item"
              :class="{ active: activePrimaryCategory === 0 }"
              @click="handlePrimaryCategoryClick(0)"
            >
              全部
            </div>
            <el-tooltip
              v-for="category in primaryCategories"
              :key="category.id"
              :content="category.description || '暂无描述'"
              placement="top"
              :effect="'light'"
            >
              <div
                class="category-item"
                :class="{ active: activePrimaryCategory === category.id }"
                @click="handlePrimaryCategoryClick(category.id)"
              >
                {{ category.name }}
              </div>
            </el-tooltip>
          </div>

          <!-- 二级分类导航 -->
          <div class="secondary-categories">
            <div
              class="category-item"
              :class="{ active: activeSecondaryCategory === 0 }"
              @click="handleSecondaryCategoryClick(0)"
            >
              全部
            </div>
            <el-tooltip
              v-for="subCategory in secondaryCategories.filter(item => item.id !== 0)"
              :key="subCategory.id"
              :content="subCategory.description || '暂无描述'"
              placement="top"
              :effect="'light'"
            >
              <div
                class="category-item"
                :class="{ active: activeSecondaryCategory === subCategory.id }"
                @click="handleSecondaryCategoryClick(subCategory.id)"
              >
                {{ subCategory.name }}
              </div>
            </el-tooltip>
          </div>
        </div>

        <!-- 关键词搜索 -->
        <div class="search-wrapper">
          <div class="left">
            <p class="search-tip">{{ searchTip }}</p>
          </div>
          <div class="right">
            <el-input
              v-model="searchKeyword"
              placeholder="输入关键词搜索"
              class="search-input"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button @click="handleSearch" :loading="loading">
                  <el-icon>
                    <search />
                  </el-icon>
                </el-button>
              </template>
            </el-input>
            <el-button type="primary" class="upload-btn" @click="goToUpload">
              <el-icon><upload-filled /></el-icon>
              上传试卷
            </el-button>
          </div>
        </div>
      </div>

      <!-- 试题列表 -->
      <div class="question-list">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>
        <template v-else>
          <div v-if="questionList.length === 0" class="empty-container">
            <el-empty description="暂无题库数据">
              <template #description>
                <p>暂无试卷数据</p>
                <p class="empty-tips">可以尝试更换分类或搜索条件，或者上传一份新的试卷</p>
              </template>
              <el-button type="primary" @click="goToUpload">上传试卷</el-button>
            </el-empty>
          </div>
          <div v-else v-for="(item, index) in questionList" :key="index" class="question-item">
            <div class="item-header">
              <h3 class="item-title" @click="viewDetail(item.id)">{{ item.name }}</h3>
              <div class="item-stats">
                <el-tag size="small" effect="plain" type="info"
                  >{{ item.questionsCount || 0 }} 题</el-tag
                >
                <el-tag size="small" effect="plain" type="info"
                  >{{ item.favoriteCount || 0 }} 收藏</el-tag
                >
              </div>
            </div>
            <div class="item-details">
              <el-tag size="small" type="primary">{{ item.category?.name }}</el-tag>
              <el-tag size="small" type="success" v-if="item.subCategory">{{
                item.subCategory.name
              }}</el-tag>
              <div class="author">
                <el-icon>
                  <User />
                </el-icon>
                创建者: {{ item.userName || item.user?.username || '未知' }}

                <!-- 创建者: {{ item.userName || item.user?.username || '未知' }} -->
              </div>
            </div>
            <div class="item-time">{{ formatDate(item.createdAt) }}</div>
            <div class="item-description" v-if="item.description">{{ item.description }}</div>

            <div class="item-footer">
              <el-button type="primary" size="small" @click="viewDetail(item.id)">查看</el-button>
              <el-button type="success" size="small" @click="startExam(item.id)"
                >开始做题</el-button
              >
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination-wrapper" v-if="questionList.length > 0">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 30, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              prev-text="上一页"
              next-text="下一页"
              :total="totalItems"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, UploadFilled, User } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { getCategoryList } from '@/api/category'
import { getExamList } from '@/api/exam'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 分类数据
const categoryData = ref([])
const loading = ref(false)

// 试卷列表数据
const questionList = ref([])
const totalItems = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 当前选中的分类
const activePrimaryCategory = ref(0) // 默认选中"全部分类"
const activeSecondaryCategory = ref(0) // 默认选中"全部"
const searchKeyword = ref('')

// 一级分类
const primaryCategories = computed(() => {
  // 返回原始分类数据，不添加"全部分类"选项
  return (
    categoryData.value.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description || ''
    })) || []
  )
})

// 二级分类（根据选中的一级分类动态变化）
const secondaryCategories = computed(() => {
  // 如果选择了"全部分类"，则展示空的二级分类
  if (activePrimaryCategory.value === 0) {
    return [{ id: 0, name: '全部', description: '所有子分类' }]
  }

  // 根据选中的一级分类获取对应的二级分类
  const selectedCategory = categoryData.value.find(
    category => category.id === activePrimaryCategory.value
  )

  // 如果找到对应的一级分类，并且有children属性
  if (
    selectedCategory &&
    selectedCategory.children &&
    Array.isArray(selectedCategory.children) &&
    selectedCategory.children.length > 0
  ) {
    // 添加"全部"选项
    return [{ id: 0, name: '全部', description: '所有子分类' }].concat(
      selectedCategory.children.map(child => ({
        id: child.id,
        name: child.name,
        description: child.description || ''
      }))
    )
  }

  // 默认返回只有"全部"的数组
  return [{ id: 0, name: '全部', description: '所有子分类' }]
})

// 搜索提示
const searchTip = computed(() => {
  // 特殊处理id为0的情况（全部分类）
  if (activePrimaryCategory.value === 0) {
    const secondary = secondaryCategories.value.find(
      item => item.id === activeSecondaryCategory.value
    )
    return `全部 > ${secondary?.name || '全部'}`
  }

  const primary = primaryCategories.value.find(item => item.id === activePrimaryCategory.value)
  const secondary = secondaryCategories.value.find(
    item => item.id === activeSecondaryCategory.value
  )

  return `${primary?.name || '全部'} > ${secondary?.name || '全部'}`
})

// 获取分类数据
const fetchCategories = async () => {
  loading.value = true
  try {
    // 由于响应拦截器已经处理了响应，直接拿到data部分
    const data = await getCategoryList()

    // 检查数据格式并使用
    if (data && Array.isArray(data)) {
      categoryData.value = data
      console.log('分类数据:', data)
    } else {
      categoryData.value = []
      ElMessage.warning('获取分类数据失败，请刷新页面重试')
    }
  } catch (error) {
    console.error('获取分类数据异常:', error)
    categoryData.value = []
  } finally {
    loading.value = false
  }
}

// 获取试题列表数据
const fetchQuestionList = async () => {
  loading.value = true
  questionList.value = [] // 清空列表，避免闪烁

  try {
    // 构建请求参数
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value || undefined
    }

    // 如果选择了一级分类（不是"全部"）
    if (activePrimaryCategory.value !== 0) {
      params.categoryId = activePrimaryCategory.value
    }

    // 如果选择了二级分类（不是"全部"）
    if (activeSecondaryCategory.value !== 0) {
      params.subCategoryId = activeSecondaryCategory.value
    }

    console.log('试卷列表请求参数:', params)

    // 由于响应拦截器已经直接返回了res.data，所以这里直接使用返回值
    const data = await getExamList(params)

    // console.log('试卷列表API返回数据:', data)

    // 这里直接使用返回数据，不需要检查res.code
    if (data) {
      setTimeout(() => {
        questionList.value = data.items || []
        totalItems.value = data.total || 0
        loading.value = false

        if (questionList.value.length === 0) {
          ElMessage.info('未找到符合条件的试卷')
        }
      }, 300) // 添加小延迟，让加载状态更流畅
    } else {
      questionList.value = []
      totalItems.value = 0
      loading.value = false
      ElMessage.warning('获取试卷列表失败，请稍后重试')
    }
  } catch (error) {
    console.error('获取试卷列表异常:', error)
    ElMessage.error('网络异常，请稍后重试')
    questionList.value = []
    totalItems.value = 0
    loading.value = false
  }
}

// 日期格式化函数
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

// 分类点击事件处理
const handlePrimaryCategoryClick = categoryId => {
  activePrimaryCategory.value = categoryId
  // 重置二级分类选择
  activeSecondaryCategory.value = 0 // 默认选中"全部"
  // 重置分页
  currentPage.value = 1
  // 重新加载数据
  fetchQuestionList()
}

const handleSecondaryCategoryClick = categoryId => {
  activeSecondaryCategory.value = categoryId
  // 重置分页
  currentPage.value = 1
  // 重新加载数据
  fetchQuestionList()
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchQuestionList()
}

// 分页变化
const handleSizeChange = val => {
  pageSize.value = val
  fetchQuestionList()
}

const handleCurrentChange = val => {
  currentPage.value = val
  fetchQuestionList()
}

// 查看详情
const viewDetail = id => {
  router.push(`/exam/${id}`)
}

// 开始做题
const startExam = id => {
  router.push(`/practice-exam/${id}`)
}

// 上传试卷
const goToUpload = () => {
  router.push('/question-bank/upload')
}

onMounted(() => {
  // 获取分类数据
  fetchCategories()
  // 初始加载数据
  fetchQuestionList()
})
</script>

<style lang="less" scoped>
.question-bank-page {
  width: 100%;
  background-color: #f5f9ff;
}

.question-bank-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .page-stats {
    display: flex;
    align-items: center;
    gap: 12px;

    .el-tag {
      margin: 0;
    }

    .creator-info {
      font-size: 14px;
      color: #666;
    }
  }
}

.category-tags {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;

  .category-tag {
    cursor: pointer;
  }
}

// 分类导航样式
.category-nav {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  overflow: hidden;
}

.category-wrapper {
  padding: 0 20px;
}

.primary-categories {
  display: flex;
  flex-wrap: wrap;
  border-bottom: 1px solid #f0f0f0;
  padding: 15px 0;
  gap: 8px;

  .category-item {
    padding: 8px 16px;
    margin-right: 0;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;

    &:hover {
      color: #0352c9;
      background-color: #f5f9ff;
    }

    &.active {
      color: #fff;
      background-color: #0352c9;
    }
  }
}

.secondary-categories {
  display: flex;
  flex-wrap: wrap;
  padding: 15px 0;
  gap: 8px;

  .category-item {
    padding: 6px 14px;
    margin-right: 0;
    margin-bottom: 0;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;

    &:hover {
      color: #0352c9;
      background-color: #f5f9ff;
    }

    &.active {
      color: #0352c9;
      background-color: #f1f7ff;
    }
  }
}

// 搜索区域样式
.search-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-top: 1px solid #f0f0f0;

  .left {
    .search-tip {
      font-size: 14px;
      color: #666;
      margin: 0;
    }
  }

  .right {
    display: flex;
    align-items: center;
    gap: 12px;

    .search-input {
      width: 300px;
    }

    .upload-btn {
      margin-left: 0;
    }
  }
}

// 自定义Element Plus按钮样式
:deep(.el-button--primary) {
  background-color: #0352c9;
  border-color: #0352c9;

  &:hover,
  &:focus {
    background-color: #0461e3;
    border-color: #0461e3;
    opacity: 0.9;
  }

  &:active {
    background-color: #0247b2;
    border-color: #0247b2;
  }
}

// 自定义标签样式
:deep(.el-tag) {
  &.el-tag--plain {
    border-color: #d0e5ff;
    background-color: #f1f7ff;
  }
}

:deep(.el-button--success) {
  background-color: #67c23a;
  border-color: #67c23a;

  &:hover,
  &:focus {
    background-color: #85ce61;
    border-color: #85ce61;
    opacity: 0.9;
  }
}

:deep(.el-button) {
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.3s;

  &:hover {
    opacity: 0.9;
  }
}

// 试题列表样式
.question-list {
  margin-top: 20px;
}

.question-item {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 15px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .item-title {
      font-size: 16px;
      color: #333;
      font-weight: 500;
      cursor: pointer;

      &:hover {
        color: #0352c9;
      }
    }

    .item-stats {
      display: flex;
      align-items: center;
      gap: 10px;

      .el-tag {
        margin: 0;
        color: #0352c9;
      }
    }
  }

  .item-details {
    margin-bottom: 10px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;

    .author {
      margin-left: auto;
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

  .item-time {
    font-size: 14px;
    color: #999;
    margin-bottom: 15px;
  }

  .item-description {
    font-size: 14px;
    color: #666;
    margin-bottom: 15px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.5;
  }

  .item-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}

// 分页样式
.pagination-wrapper {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.loading-container {
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.empty-container {
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  text-align: center;

  .empty-tips {
    color: #999;
    font-size: 14px;
    margin-top: 8px;
    margin-bottom: 16px;
  }
}
</style>
