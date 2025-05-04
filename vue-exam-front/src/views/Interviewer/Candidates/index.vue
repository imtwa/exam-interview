<template>
  <div class="candidates-page">
    <!-- Breadcrumb -->
    <div class="breadcrumb-container">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/profile' }">个人中心</el-breadcrumb-item>
        <el-breadcrumb-item>候选人管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <!-- Filter Section -->
    <div class="filter-container">
      <el-form :inline="true" class="filter-form">
        <div class="filter-items">
          <el-form-item label="应聘职位">
            <el-select 
              v-model="filterForm.jobId" 
              placeholder="全部职位" 
              clearable
              style="width: 180px"
            >
              <el-option 
                v-for="job in jobs" 
                :key="job.id" 
                :label="job.title" 
                :value="job.id" 
              />
            </el-select>
          </el-form-item>
          <el-form-item label="候选人状态">
            <el-select 
              v-model="filterForm.status" 
              placeholder="全部状态" 
              clearable
              style="width: 180px"
            >
              <el-option label="简历筛选" value="RESUME_SCREENING" />
              <el-option label="笔试" value="WRITTEN_TEST" />
              <el-option label="一面" value="FIRST_INTERVIEW" />
              <el-option label="二面" value="SECOND_INTERVIEW" />
              <el-option label="HR面试" value="HR_INTERVIEW" />
              <el-option label="已安排" value="SCHEDULED" />
              <el-option label="已录用" value="OFFER" />
              <el-option label="已拒绝" value="REJECTED" />
            </el-select>
          </el-form-item>
          <el-form-item label="关键词">
            <el-input 
              v-model="filterForm.keyword" 
              placeholder="姓名/手机/邮箱" 
              clearable
              style="width: 180px" 
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchCandidates(1)">搜索</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="6" animated />
    </div>

    <!-- Candidates Table -->
    <div v-else class="candidates-list">
      <div v-if="candidates.length === 0" class="empty-container">
        <el-empty description="暂无候选人">
          <template #description>
            <p>暂未找到符合条件的候选人</p>
          </template>
        </el-empty>
      </div>
      <div v-else>
        <el-table
          :data="candidates"
          style="width: 100%"
          border
          stripe
          :default-sort="{ prop: 'applyDate', order: 'descending' }"
        >
          <el-table-column label="候选人" min-width="180">
            <template #default="{ row }">
              <div class="candidate-info">
                <el-avatar :size="40" :src="row.avatar || generateAvatar(row.jobSeeker?.name || '未知')">
                  {{ (row.jobSeeker?.name || '未知').charAt(0) }}
                </el-avatar>
                <div class="candidate-details">
                  <div class="candidate-name">{{ row.jobSeeker?.name || '未知' }}</div>
                  <div class="candidate-contact">
                    <span v-if="row.jobSeeker?.phone">{{ row.jobSeeker.phone }}</span>
                    <span v-if="row.jobSeeker?.email">{{ row.jobSeeker.email }}</span>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="job.title" label="应聘职位" min-width="140">
            <template #default="{ row }">
              {{ row.job?.title || '未知职位' }}
            </template>
          </el-table-column>
          <el-table-column label="教育背景" min-width="160">
            <template #default="{ row }">
              <div v-if="row.jobSeeker?.education && row.jobSeeker.education.length">
                {{ getEducationText(row.jobSeeker.education[0]?.degree) }}
              </div>
              <div class="text-secondary" v-if="row.jobSeeker?.education && row.jobSeeker.education.length">
                {{ row.jobSeeker.education[0]?.school }}
              </div>
              <div v-else>暂无教育信息</div>
            </template>
          </el-table-column>
          <el-table-column label="工作经验" min-width="100">
            <template #default="{ row }">
              <span v-if="row.jobSeeker?.workExperience && row.jobSeeker.workExperience.length">
                {{ getYearsOfExperience(row.jobSeeker.workExperience) }}年
              </span>
              <span v-else>无经验</span>
            </template>
          </el-table-column>
          <el-table-column label="应聘日期" min-width="120" sortable>
            <template #default="{ row }">
              {{ formatDate(row.appliedAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" min-width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" effect="light">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="240" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" link @click="viewResume(row)">查看简历</el-button>
              <el-dropdown
                trigger="click"
              >
                <el-button size="small" type="primary" link>
                  管理<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleCommand('schedule', row)">安排面试</el-dropdown-item>
                    <el-dropdown-item @click="handleCommand('offer', row)">发送Offer</el-dropdown-item>
                    <el-dropdown-item @click="handleCommand('hire', row)">录用</el-dropdown-item>
                    <el-dropdown-item divided class="text-danger" @click="handleCommand('reject', row)">拒绝</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>

        <!-- Pagination -->
        <div class="pagination-wrapper">
          <el-pagination
            background
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <!-- 面试安排对话框 -->
    <interview-schedule
      :visible="scheduleDialogVisible"
      @update:visible="scheduleDialogVisible = $event"
      :candidate="currentCandidate"
      @success="handleScheduleSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { getInterviewerApplications, updateApplicationStatus, scheduleInterview } from '@/api/interviewer'
import { getJobsByInterviewer } from '@/api/job'
import { formatDate } from '@/utils/formatDate'
import InterviewSchedule from './components/InterviewSchedule.vue'

// 响应式数据
const loading = ref(true)
const candidates = ref([])
const jobs = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const scheduleDialogVisible = ref(false)
const currentCandidate = ref(null)

const filterForm = reactive({
  jobId: '',
  status: '',
  keyword: ''
})

// 获取候选人列表
const fetchCandidates = async (page = currentPage.value) => {
  loading.value = true
  currentPage.value = page

  try {
    const response = await getInterviewerApplications({
      page: currentPage.value,
      pageSize: pageSize.value,
      jobId: filterForm.jobId || undefined,
      status: filterForm.status || undefined,
      keyword: filterForm.keyword || undefined
    })

    // 处理API返回的不同可能格式
    if (response.list) {
      candidates.value = response.list
      total.value = response.total
    } else if (Array.isArray(response.data)) {
      candidates.value = response.data
      total.value = response.total || response.count || response.data.length
    } else if (response.data && response.data.applications) {
      candidates.value = response.data.applications
      total.value = response.data.total || response.data.applications.length
    } else {
      candidates.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取候选人列表失败:', error)
    ElMessage.error('获取候选人列表失败')
    candidates.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 获取职位列表
const fetchJobs = async () => {
  try {
    const response = await getJobsByInterviewer({ pageSize: 100 })
    if (response.list) {
      jobs.value = response.list
    } else if (Array.isArray(response.data)) {
      jobs.value = response.data
    } else if (response.data && response.data.jobs) {
      jobs.value = response.data.jobs
    } else {
      jobs.value = []
    }
  } catch (error) {
    console.error('获取职位列表失败:', error)
    jobs.value = []
  }
}

// 重置筛选条件
const resetFilters = () => {
  Object.keys(filterForm).forEach(key => {
    filterForm[key] = ''
  })
  fetchCandidates(1)
}

// 分页操作
const handlePageChange = page => {
  fetchCandidates(page)
}

const handleSizeChange = size => {
  pageSize.value = size
  fetchCandidates(1)
}

// 状态处理
const getStatusText = status => {
  const statusMap = {
    RESUME_SCREENING: '简历筛选',
    WRITTEN_TEST: '笔试',
    FIRST_INTERVIEW: '一面',
    SECOND_INTERVIEW: '二面',
    HR_INTERVIEW: 'HR面试',
    SCHEDULED: '已安排',
    OFFER: '已录用',
    REJECTED: '已拒绝'
  }
  return statusMap[status] || status
}

const getStatusType = status => {
  const typeMap = {
    RESUME_SCREENING: 'info',
    WRITTEN_TEST: 'info',
    FIRST_INTERVIEW: 'warning',
    SECOND_INTERVIEW: 'warning',
    HR_INTERVIEW: 'warning',
    SCHEDULED: 'primary',
    OFFER: 'success',
    REJECTED: 'danger'
  }
  return typeMap[status] || 'info'
}

// 学历转换
const getEducationText = degree => {
  const degreeMap = {
    HIGH_SCHOOL: '高中',
    ASSOCIATE: '大专',
    BACHELOR: '本科',
    MASTER: '硕士',
    DOCTORATE: '博士',
    OTHER: '其他'
  }
  return degreeMap[degree] || degree || '未知'
}

// 计算工作经验年数
const getYearsOfExperience = workExperience => {
  if (!workExperience || !workExperience.length) return 0
  
  const now = new Date()
  let totalMonths = 0
  
  workExperience.forEach(exp => {
    const startDate = new Date(exp.startDate)
    const endDate = exp.endDate ? new Date(exp.endDate) : now
    
    const years = endDate.getFullYear() - startDate.getFullYear()
    const months = endDate.getMonth() - startDate.getMonth()
    
    totalMonths += (years * 12) + months
  })
  
  return Math.round(totalMonths / 12)
}

// 生成头像
const generateAvatar = (name) => {
  const colors = [
    '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e',
    '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50',
    '#f1c40f', '#e67e22', '#e74c3c', '#f39c12', '#d35400'
  ]
  
  // 使用名字的第一个字符的ASCII码值来选择颜色
  const charCode = name.charCodeAt(0) || 0
  const colorIndex = charCode % colors.length
  const bgColor = colors[colorIndex]
  
  // 返回一个SVG数据URL
  const text = name.charAt(0).toUpperCase()
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <rect width="40" height="40" fill="${bgColor}" />
      <text x="50%" y="50%" dy=".35em" fill="white" font-family="Arial" font-size="20" font-weight="bold" text-anchor="middle">${text}</text>
    </svg>
  `
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

// 操作函数
const viewResume = candidate => {
  if (candidate.jobSeeker?.resumeUrl) {
    window.open(candidate.jobSeeker.resumeUrl, '_blank')
  } else {
    ElMessage.info(`${candidate.jobSeeker?.name || '候选人'}暂未上传简历`)
  }
}

const handleCommand = async (command, candidate) => {
  try {
    switch (command) {
      case 'schedule':
        currentCandidate.value = candidate
        scheduleDialogVisible.value = true
        break
      case 'offer':
        await updateApplicationStatus(candidate.id, { status: 'OFFER' })
        ElMessage.success(`已向${candidate.jobSeeker?.name || '候选人'}发送Offer`)
        fetchCandidates(currentPage.value)
        break
      case 'hire':
        await updateApplicationStatus(candidate.id, { status: 'OFFER' })
        ElMessage.success(`已录用${candidate.jobSeeker?.name || '候选人'}`)
        fetchCandidates(currentPage.value)
        break
      case 'reject':
        await ElMessageBox.confirm(`确定要拒绝候选人${candidate.jobSeeker?.name || ''}吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await updateApplicationStatus(candidate.id, { status: 'REJECTED' })
        ElMessage.success(`已拒绝${candidate.jobSeeker?.name || '候选人'}`)
        fetchCandidates(currentPage.value)
        break
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 处理面试安排成功
const handleScheduleSuccess = () => {
  fetchCandidates(currentPage.value)
}

// 初始化
onMounted(() => {
  fetchJobs()
  fetchCandidates()
})

// 监听筛选条件变化
watch([() => filterForm.jobId, () => filterForm.status], () => {
  fetchCandidates(1)
})
</script>

<style scoped>
.candidates-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.breadcrumb-container {
  margin-bottom: 16px;
}

.filter-container {
  background-color: #fff;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.filter-form {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.filter-items {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.filter-items .el-form-item {
  margin-bottom: 0;
  margin-right: 10px;
}

.loading-container,
.candidates-list {
  background-color: #fff;
  border-radius: 4px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.empty-container {
  padding: 60px 0;
  text-align: center;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.candidate-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.candidate-details {
  display: flex;
  flex-direction: column;
}

.candidate-name {
  font-weight: bold;
}

.candidate-contact {
  font-size: 12px;
  color: #666;
  display: flex;
  gap: 10px;
}

.text-secondary {
  color: #666;
  font-size: 13px;
}

.text-danger {
  color: #f56c6c;
}
</style>
