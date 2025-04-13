<template>
  <div class="recruitment-container">
    <!-- 招聘筛选区域 -->
    <div class="filter-section">
      <div class="filter-wrapper">
        <!-- 院校类型筛选 -->
        <div class="filter-group">
          <div class="filter-label">院校类型：</div>
          <div class="filter-options">
            <div
              v-for="(item, index) in schoolTypes"
              :key="index"
              :class="['filter-option', { active: selectedSchoolType === item.id }]"
              @click="handleSchoolTypeChange(item.id)"
            >
              {{ item.name }}
            </div>
          </div>
        </div>

        <!-- 学校筛选 -->
        <div class="filter-group">
          <div class="filter-label">学校：</div>
          <div class="filter-options">
            <div
              v-for="(item, index) in universities"
              :key="index"
              :class="['filter-option', { active: selectedUniversity === item.id }]"
              @click="handleUniversityChange(item.id)"
            >
              {{ item.name }}
            </div>
          </div>
        </div>

        <!-- 专业筛选 -->
        <div class="filter-group">
          <div class="filter-label">专业：</div>
          <div class="filter-options">
            <div
              v-for="(item, index) in majors"
              :key="index"
              :class="['filter-option', { active: selectedMajor === item.id }]"
              @click="handleMajorChange(item.id)"
            >
              {{ item.name }}
            </div>
          </div>
        </div>

        <!-- 关键字搜索 -->
        <div class="search-wrapper">
          <el-input v-model="searchKeyword" placeholder="输入关键词搜索" class="search-input">
            <template #append>
              <el-button @click="handleSearch">
                <i class="el-icon-search"></i>
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
    </div>

    <!-- 招聘信息列表 -->
    <div class="recruitment-list">
      <div v-for="(item, index) in jobList" :key="index" class="job-item">
        <div class="job-title">{{ item.title }}</div>
        <div class="job-info">
          <span>{{ item.views }}次浏览</span>
          <span>{{ item.date }}</span>
        </div>
        <div class="job-actions">
          <el-button type="primary" size="small" @click="viewDetail(item.id)">查看</el-button>
          <el-button type="success" size="small" @click="applyJob(item.id)">申请职位</el-button>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 院校类型筛选项
const schoolTypes = ref([
  { id: 'all', name: '全部' },
  { id: '985', name: '985工程' },
  { id: '211', name: '211工程' },
  { id: 'double', name: '双一流' },
  { id: 'foreign', name: '中外合办' }
])

// 学校筛选项
const universities = ref([
  { id: 'all', name: '全部' },
  { id: 'tsinghua', name: '清华大学' },
  { id: 'peking', name: '北京大学' },
  { id: 'fudan', name: '复旦大学' },
  { id: 'zhejiang', name: '浙江大学' },
  { id: 'nanjing', name: '南京大学' },
  { id: 'tongji', name: '同济大学' },
  { id: 'sjtu', name: '上海交通大学' }
])

// 专业筛选项
const majors = ref([
  { id: 'all', name: '全部' },
  { id: 'cs', name: '计算机科学' },
  { id: 'ee', name: '电子工程' },
  { id: 'finance', name: '金融学' },
  { id: 'law', name: '法学' },
  { id: 'medicine', name: '医学' },
  { id: 'art', name: '艺术学' },
  { id: 'literature', name: '文学' }
])

// 筛选状态
const selectedSchoolType = ref('all')
const selectedUniversity = ref('all')
const selectedMajor = ref('all')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(280)

// 招聘信息列表（模拟数据）
const jobList = ref([
  {
    id: 1,
    title: '清华大学 2024年计算机科学与技术学院博士研究生招生',
    views: 389,
    date: '2024-04-11 09:09:16'
  },
  {
    id: 2,
    title: '中科院管理科学与工程类科研助理招聘',
    views: 127,
    date: '2024-04-11 08:51:12'
  },
  {
    id: 3,
    title: '计算机技术研究所招聘专职科研人员（职位：高级研发工程师）',
    views: 185,
    date: '2024-04-11 09:00:03'
  },
  {
    id: 4,
    title: '江西师范大学 计算机学院',
    views: 62,
    date: '2024-04-11 09:01:22'
  },
  {
    id: 5,
    title: '南京大学 金融硕士点',
    views: 76,
    date: '2024-04-11 08:58:33'
  },
  {
    id: 6,
    title: '南京大学 金融研究中心',
    views: 54,
    date: '2024-04-10 08:09:38'
  },
  {
    id: 7,
    title: '南京大学 法律',
    views: 110,
    date: '2024-04-10 12:27:42'
  },
  {
    id: 8,
    title: '内蒙古师范大学(旅游规划与管理)专业招聘',
    views: 103,
    date: '2024-04-11 08:20:09'
  },
  {
    id: 9,
    title: '山西财经大学(经济学)招聘启事',
    views: 69,
    date: '2024-04-11 08:09:45'
  },
  {
    id: 10,
    title: '山西财经大学(经济学)网络远程面试招聘',
    views: 167,
    date: '2024-04-09 08:32:47'
  }
])

// 筛选事件处理
const handleSchoolTypeChange = typeId => {
  selectedSchoolType.value = typeId
  // 重置分页
  currentPage.value = 1
  // 重新加载数据
  fetchJobList()
}

const handleUniversityChange = universityId => {
  selectedUniversity.value = universityId
  // 重置分页
  currentPage.value = 1
  // 重新加载数据
  fetchJobList()
}

const handleMajorChange = majorId => {
  selectedMajor.value = majorId
  // 重置分页
  currentPage.value = 1
  // 重新加载数据
  fetchJobList()
}

// 搜索处理
const handleSearch = () => {
  // 搜索重置分页
  currentPage.value = 1
  // 重新加载数据
  fetchJobList()
}

// 分页事件处理
const handleSizeChange = size => {
  pageSize.value = size
  fetchJobList()
}

const handleCurrentChange = page => {
  currentPage.value = page
  fetchJobList()
}

// 获取招聘列表数据
const fetchJobList = () => {
  // 这里应该调用API获取数据
  console.log('获取招聘列表', {
    schoolType: selectedSchoolType.value,
    university: selectedUniversity.value,
    major: selectedMajor.value,
    keyword: searchKeyword.value,
    page: currentPage.value,
    pageSize: pageSize.value
  })

  // 模拟异步请求
  setTimeout(() => {
    // 这里为了演示，我们不改变数据
  }, 300)
}

// 详情页和申请职位按钮处理
const viewDetail = id => {
  console.log('查看详情', id)
  // 跳转到详情页
}

const applyJob = id => {
  console.log('申请职位', id)
  // 跳转到申请页面
}

onMounted(() => {
  fetchJobList()
})
</script>

<style lang="less" scoped>
.recruitment-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

// 筛选区域样式
.filter-section {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  overflow: hidden;
}

.filter-wrapper {
  padding: 15px 20px;
}

.filter-group {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .filter-label {
    width: 80px;
    font-size: 14px;
    color: #666;
    line-height: 32px;
    flex-shrink: 0;
  }

  .filter-options {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
  }

  .filter-option {
    padding: 6px 15px;
    margin-right: 10px;
    margin-bottom: 8px;
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

.search-wrapper {
  padding: 15px 0 5px;

  .search-input {
    width: 320px;
  }
}

// 招聘列表样式
.recruitment-list {
  margin-top: 20px;
}

.job-item {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  }

  .job-title {
    font-size: 16px;
    color: #333;
    font-weight: 500;
    margin-right: 20px;
    flex: 1;

    @media (max-width: 768px) {
      margin-bottom: 10px;
    }
  }

  .job-info {
    display: flex;
    color: #999;
    font-size: 14px;
    margin-right: 20px;

    @media (max-width: 768px) {
      margin-bottom: 15px;
    }

    span {
      margin-right: 15px;

      &:last-child {
        margin-right: 0;
      }
    }
  }

  .job-actions {
    display: flex;
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
