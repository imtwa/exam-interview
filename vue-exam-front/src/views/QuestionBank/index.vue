<template>
  <div class="question-bank-page">
    <div class="question-bank-container">
      <!-- 一级分类导航 -->
      <div class="category-nav">
        <div class="category-wrapper">
          <div class="primary-categories">
            <div
              v-for="(category, index) in primaryCategories"
              :key="index"
              :class="['category-item', { active: activePrimaryCategory === category.id }]"
              @click="handlePrimaryCategoryClick(category.id)"
            >
              {{ category.name }}
            </div>
          </div>

          <!-- 二级分类导航 -->
          <div class="secondary-categories">
            <div
              v-for="(category, index) in secondaryCategories"
              :key="index"
              :class="['category-item', { active: activeSecondaryCategory === category.id }]"
              @click="handleSecondaryCategoryClick(category.id)"
            >
              {{ category.name }}
            </div>
          </div>
        </div>

        <!-- 关键词搜索 -->
        <div class="search-wrapper">
          <div class="left">
            <p class="search-tip">{{ searchTip }}</p>
          </div>
          <div class="right">
            <el-input v-model="searchKeyword" placeholder="输入关键词搜索" class="search-input">
              <template #append>
                <el-button @click="handleSearch">
                  <el-icon>
                    <search />
                  </el-icon>
                </el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>

      <!-- 试题列表 -->
      <div class="question-list">
        <div v-for="(item, index) in questionList" :key="index" class="question-item">
          <div class="item-header">
            <h3 class="item-title">{{ item.title }}</h3>
            <span class="item-views">{{ item.views }}次浏览</span>
          </div>
          <div class="item-time">{{ item.date }}</div>
          <div class="item-footer">
            <el-button type="primary" size="small" @click="viewDetail(item.id)">查看</el-button>
            <el-button type="success" size="small" @click="startExam(item.id)">开始做题</el-button>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalItems"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {Search} from '@element-plus/icons-vue'

// 一级分类
const primaryCategories = ref([
  { id: 'all', name: '全部分类' },
  { id: 'gaokao', name: '高考院校' },
  { id: 'college', name: '大学课程' },
  { id: 'it', name: 'IT认证' },
  { id: 'language', name: '语言考试' },
  { id: 'finance', name: '金融财会' },
  { id: 'medicine', name: '医药卫生' },
  { id: 'civil', name: '公务员' },
  { id: 'foreign', name: '外语考试' }
])

// 二级分类（根据选中的一级分类动态变化）
const secondaryCategories = computed(() => {
  const categoriesMap = {
    all: [
      { id: 'all-sub', name: '全部' },
      { id: 'hot', name: '热门课程' }
    ],
    gaokao: [
      { id: 'all-gaokao', name: '全部' },
      { id: 'math', name: '数学' },
      { id: 'chinese', name: '语文' },
      { id: 'english', name: '英语' },
      { id: 'physics', name: '物理' },
      { id: 'chemistry', name: '化学' },
      { id: 'biology', name: '生物' },
      { id: 'politics', name: '政治' }
    ],
    college: [
      { id: 'all-college', name: '全部' },
      { id: 'engineering', name: '工学类' },
      { id: 'science', name: '理学类' },
      { id: 'economics', name: '经济学类' },
      { id: 'management', name: '管理学类' },
      { id: 'arts', name: '文学类' },
      { id: 'law', name: '法学类' }
    ],
    it: [
      { id: 'all-it', name: '全部' },
      { id: 'developer', name: '程序开发' },
      { id: 'database', name: '数据库' },
      { id: 'network', name: '网络技术' },
      { id: 'security', name: '信息安全' }
    ],
    language: [
      { id: 'all-language', name: '全部' },
      { id: 'english', name: '英语考试' },
      { id: 'japanese', name: '日语考试' },
      { id: 'korean', name: '韩语考试' },
      { id: 'french', name: '法语考试' }
    ],
    finance: [
      { id: 'all-finance', name: '全部' },
      { id: 'accounting', name: '会计' },
      { id: 'audit', name: '审计' },
      { id: 'tax', name: '税务' },
      { id: 'finance', name: '金融' }
    ]
  }

  return categoriesMap[activePrimaryCategory.value] || categoriesMap.all
})

// 当前选中的分类
const activePrimaryCategory = ref('all')
const activeSecondaryCategory = ref('all-sub')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(200)

// 搜索提示
const searchTip = computed(() => {
  const primary = primaryCategories.value.find(item => item.id === activePrimaryCategory.value)
  const secondary = secondaryCategories.value.find(
    item => item.id === activeSecondaryCategory.value
  )

  return `${primary?.name || '全部分类'} > ${secondary?.name || '全部'}`
})

// 模拟题目数据
const questionList = ref([
  {
    id: 1,
    title: '清华大学考研(985/211高校考研试题集)',
    views: 13,
    date: '2024-04-11 09:09:16'
  },
  {
    id: 2,
    title: '中科院管理科学与工程类博士考试题目',
    views: 191,
    date: '2024-04-11 08:51:12'
  },
  {
    id: 3,
    title: '计算机技术考研(计算机系统与编译原理精选题库)',
    views: 127,
    date: '2024-04-11 09:00:03'
  },
  {
    id: 4,
    title: '江西师范大学考研 计算机',
    views: 83,
    date: '2024-04-11 09:01:22'
  },
  {
    id: 5,
    title: '南京大学-金融硕士',
    views: 76,
    date: '2024-04-11 08:58:33'
  },
  {
    id: 6,
    title: '南京大学-金融硕士考试试题',
    views: 54,
    date: '2024-04-10 08:09:38'
  },
  {
    id: 7,
    title: '南京大学-法律',
    views: 110,
    date: '2024-04-10 12:27:42'
  },
  {
    id: 8,
    title: '内蒙古师范大学(旅游规划与管理)专业考研真题试卷',
    views: 103,
    date: '2024-04-11 08:20:09'
  },
  {
    id: 9,
    title: '山西财经大学(经济学)考研真题',
    views: 69,
    date: '2024-04-11 08:09:45'
  },
  {
    id: 10,
    title: '山西财经大学(经济学)网络远程考试',
    views: 167,
    date: '2024-04-09 08:32:47'
  }
])

// 分类点击事件处理
const handlePrimaryCategoryClick = categoryId => {
  activePrimaryCategory.value = categoryId
  // 重置二级分类选择
  activeSecondaryCategory.value = secondaryCategories.value[0]?.id || 'all-sub'
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

// 搜索处理
const handleSearch = () => {
  // 搜索重置分页
  currentPage.value = 1
  // 重新加载数据
  fetchQuestionList()
}

// 分页事件处理
const handleSizeChange = size => {
  pageSize.value = size
  fetchQuestionList()
}

const handleCurrentChange = page => {
  currentPage.value = page
  fetchQuestionList()
}

// 获取题目列表数据
const fetchQuestionList = () => {
  // 这里应该调用API获取数据
  console.log('获取题目列表', {
    primaryCategory: activePrimaryCategory.value,
    secondaryCategory: activeSecondaryCategory.value,
    keyword: searchKeyword.value,
    page: currentPage.value,
    pageSize: pageSize.value
  })

  // 模拟异步请求
  setTimeout(() => {
    // 这里为了演示，我们不改变数据
  }, 300)
}

// 详情页和考试按钮处理
const viewDetail = id => {
  console.log('查看详情', id)
  // 跳转到详情页
}

const startExam = id => {
  console.log('开始做题', id)
  // 跳转到考试页面
}

onMounted(() => {
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

  .category-item {
    padding: 8px 16px;
    margin-right: 10px;
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

  .category-item {
    padding: 6px 14px;
    margin-right: 10px;
    margin-bottom: 10px;
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
  background-color: #f9f9f9;

  .left {
    .search-tip {
      font-size: 14px;
      color: #666;
    }
  }

  .right {
    .search-input {
      width: 320px;
    }
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
    transform: translateY(-3px);
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
    }

    .item-views {
      font-size: 14px;
      color: #999;
    }
  }

  .item-time {
    font-size: 14px;
    color: #999;
    margin-bottom: 15px;
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
</style>
