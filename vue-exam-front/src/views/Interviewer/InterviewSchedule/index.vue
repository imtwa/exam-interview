<template>
  <div class="interview-schedule-page">
    <div class="interview-schedule-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>面试安排</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 页面标题 -->
      <div class="page-header">
        <div class="title-section">
          <h1 class="page-title">面试安排</h1>
          <p class="page-description">管理所有职位的面试安排</p>
        </div>
        <div class="actions-section">
          <el-button type="primary" @click="createInterview">
            <el-icon><Plus /></el-icon>
            新增面试
          </el-button>
        </div>
      </div>

      <!-- 视图切换 -->
      <div class="view-toggle">
        <el-radio-group v-model="viewMode" @change="switchView">
          <el-radio-button label="calendar">日历视图</el-radio-button>
          <el-radio-button label="list">列表视图</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 筛选区域 -->
      <div class="filter-container">
        <el-form :inline="true" class="filter-form">
          <el-form-item label="职位">
            <el-select
              v-model="queryParams.jobId"
              placeholder="选择职位"
              clearable
              @change="fetchInterviews"
            >
              <el-option v-for="job in jobs" :key="job.id" :label="job.title" :value="job.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="queryParams.status"
              placeholder="选择状态"
              clearable
              @change="fetchInterviews"
            >
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :shortcuts="dateShortcuts"
              value-format="YYYY-MM-DD"
              @change="handleDateChange"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchInterviews">搜索</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton animated :rows="6" :loading="loading" />
      </div>

      <!-- 日历视图 -->
      <div v-else-if="viewMode === 'calendar'" class="calendar-view">
        <el-calendar v-model="currentDate">
          <template #dateCell="{ data }">
            <div class="calendar-cell">
              <p :class="{ 'is-today': isToday(data) }">
                {{ data.day.split('-').slice(2).join('') }}
              </p>
              <div class="interview-items">
                <div
                  v-for="(interview, index) in getInterviewsByDate(data)"
                  :key="index"
                  class="interview-item"
                  :class="getInterviewClass(interview)"
                  @click="viewInterviewDetail(interview.id)"
                >
                  <span class="time">{{ formatTime(interview.startTime) }}</span>
                  <span class="name">{{ interview.candidateName }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-calendar>
      </div>

      <!-- 列表视图 -->
      <div v-else class="list-view">
        <div v-if="interviews.length === 0" class="empty-container">
          <el-empty description="暂无面试安排">
            <template #description>
              <p>当前没有任何面试安排</p>
            </template>
            <el-button type="primary" @click="createInterview">立即安排面试</el-button>
          </el-empty>
        </div>
        <div v-else>
          <el-table :data="interviews" style="width: 100%" stripe>
            <el-table-column prop="candidateName" label="候选人" min-width="100">
              <template #default="{ row }">
                <span class="candidate-name" @click="viewCandidateDetail(row.candidateId)">{{
                  row.candidateName
                }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="jobTitle" label="应聘职位" min-width="150">
              <template #default="{ row }">
                {{ row.jobTitle || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="interviewDate" label="面试日期" width="120">
              <template #default="{ row }">
                {{ formatDate(row.startTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="interviewTime" label="面试时间" width="120">
              <template #default="{ row }">
                {{ formatTime(row.startTime) }} - {{ formatTime(row.endTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="duration" label="时长" width="80">
              <template #default="{ row }">
                {{ getDuration(row.startTime, row.endTime) }}分钟
              </template>
            </el-table-column>
            <el-table-column prop="interviewers" label="面试官" min-width="120">
              <template #default="{ row }">
                {{ row.interviewers?.join(', ') || '未指定' }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="200">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="viewInterviewDetail(row.id)">
                  查看详情
                </el-button>
                <el-dropdown trigger="click">
                  <el-button link type="primary" size="small">
                    更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="editInterview(row.id)">编辑面试</el-dropdown-item>
                      <el-dropdown-item @click="sendReminder(row.id)">发送提醒</el-dropdown-item>
                      <el-dropdown-item @click="updateStatus(row.id, 'COMPLETED')"
                        >标记完成</el-dropdown-item
                      >
                      <el-dropdown-item @click="updateStatus(row.id, 'CANCELED')"
                        >取消面试</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="queryParams.page"
              v-model:page-size="queryParams.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowDown } from '@element-plus/icons-vue'
import { formatDate as formatDateUtil } from '@/utils/formatDate'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const interviews = ref([])
const total = ref(0)
const jobs = ref([])
const viewMode = ref('calendar')
const currentDate = ref(new Date())

// 日期范围
const dateRange = ref([])
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

// 获取URL中的jobId
const jobId = computed(() => (route.query.jobId ? parseInt(route.query.jobId) : null))

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  jobId: null,
  status: '',
  startDate: '',
  endDate: ''
})

// 状态选项
const statusOptions = [
  { label: '待确认', value: 'PENDING' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '已取消', value: 'CANCELED' },
  { label: '爽约', value: 'NO_SHOW' }
]

// 获取状态显示类型
const getStatusType = status => {
  switch (status) {
    case 'PENDING':
      return 'info'
    case 'CONFIRMED':
      return 'primary'
    case 'COMPLETED':
      return 'success'
    case 'CANCELED':
      return 'warning'
    case 'NO_SHOW':
      return 'danger'
    default:
      return ''
  }
}

// 获取状态显示文本
const getStatusLabel = status => {
  const found = statusOptions.find(option => option.value === status)
  return found ? found.label : '未知'
}

// 格式化日期
const formatDate = dateStr => {
  if (!dateStr) return '-'
  return formatDateUtil(dateStr, 'YYYY-MM-DD')
}

// 格式化时间
const formatTime = dateStr => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 计算时长
const getDuration = (start, end) => {
  if (!start || !end) return 0
  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()
  return Math.round((endTime - startTime) / (1000 * 60))
}

// 检查是否是今天
const isToday = date => {
  const today = new Date()
  const cellDate = new Date(date.day)
  return today.toDateString() === cellDate.toDateString()
}

// 获取指定日期的面试
const getInterviewsByDate = date => {
  const cellDate = new Date(date.day).toISOString().split('T')[0]
  return interviews.value.filter(interview => {
    const interviewDate = new Date(interview.startTime).toISOString().split('T')[0]
    return interviewDate === cellDate
  })
}

// 获取面试项的样式类
const getInterviewClass = interview => {
  return {
    'interview-item--pending': interview.status === 'PENDING',
    'interview-item--confirmed': interview.status === 'CONFIRMED',
    'interview-item--completed': interview.status === 'COMPLETED',
    'interview-item--canceled': interview.status === 'CANCELED',
    'interview-item--no-show': interview.status === 'NO_SHOW'
  }
}

// 切换视图模式
const switchView = mode => {
  viewMode.value = mode
}

// 处理日期变化
const handleDateChange = value => {
  if (value) {
    queryParams.startDate = value[0]
    queryParams.endDate = value[1]
  } else {
    queryParams.startDate = ''
    queryParams.endDate = ''
  }
}

// 获取面试列表
const fetchInterviews = async (page = currentPage.value) => {
  loading.value = true
  currentPage.value = page

  try {
    const response = await getInterviews({
      page: currentPage.value,
      size: pageSize.value,
      startDate: filterForm.dateRange ? filterForm.dateRange[0] : null,
      endDate: filterForm.dateRange ? filterForm.dateRange[1] : null,
      jobId: filterForm.jobId,
      status: filterForm.status
    })

    interviews.value = response.list
    total.value = response.total
  } catch (error) {
    console.error('获取面试列表失败:', error)
    ElMessage.error('获取面试列表失败')
  } finally {
    loading.value = false
  }
}

// 获取职位列表
const fetchJobs = async () => {
  try {
    const response = await getJobs()
    jobs.value = response.list
  } catch (error) {
    console.error('获取职位列表失败:', error)
  }
}

// 重置筛选条件
const resetFilters = () => {
  queryParams.status = ''
  queryParams.startDate = ''
  queryParams.endDate = ''
  queryParams.page = 1
  dateRange.value = []

  // 如果是从职位详情页进入，保留jobId筛选
  if (!jobId.value) {
    queryParams.jobId = null
  }

  fetchInterviews()
}

// 处理分页变化
const handleSizeChange = size => {
  queryParams.pageSize = size
  fetchInterviews()
}

const handleCurrentChange = page => {
  queryParams.page = page
  fetchInterviews()
}

// 创建面试
const createInterview = async () => {
  try {
    const response = await addInterview(interviewForm)
    ElMessage.success('面试创建成功')
    dialogVisible.value = false
    await fetchInterviews()
  } catch (error) {
    console.error('创建面试失败:', error)
    ElMessage.error('创建面试失败')
  }
}

// 查看面试详情
const viewInterviewDetail = id => {
  router.push(`/interview-schedule/detail/${id}`)
}

// 编辑面试
const editInterview = id => {
  router.push(`/interview-schedule/edit/${id}`)
}

// 查看候选人详情
const viewCandidateDetail = id => {
  router.push(`/candidate-management/detail/${id}`)
}

// 发送提醒
const sendReminder = async id => {
  try {
    await ElMessageBox.confirm('确定要向面试者发送提醒邮件吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await sendInterviewReminder(id)

    ElMessage.success('提醒邮件已发送')
    fetchInterviews()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发送提醒失败:', error)
      ElMessage.error('发送提醒失败')
    }
  }
}

// 更新面试状态
const updateStatus = async (interview, newStatus) => {
  try {
    const response = await updateInterview({
      id: interview.id,
      status: newStatus
    })
    ElMessage.success('面试状态更新成功')
    await fetchInterviews()
  } catch (error) {
    console.error('更新面试状态失败:', error)
    ElMessage.error('更新面试状态失败')
  }
}

onMounted(() => {
  // 如果有URL参数，更新查询条件
  if (jobId.value) {
    queryParams.jobId = jobId.value
  }

  fetchJobs()
  fetchInterviews()
})
</script>

<style scoped>
.interview-schedule-page {
  width: 100%;
  background-color: #f5f9ff;
  min-height: calc(100vh - 72px);
}

.interview-schedule-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.breadcrumb-container {
  margin-bottom: 20px;
  font-size: 14px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .title-section {
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
}

.view-toggle {
  margin-bottom: 20px;
  text-align: right;
}

.filter-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 20px;
}

.loading-container {
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.calendar-view {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.list-view {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.empty-container {
  padding: 40px;
  text-align: center;

  p {
    color: #666;
    margin-bottom: 16px;
  }
}

.candidate-name {
  color: #0352c9;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

/* 日历单元格样式 */
.calendar-cell {
  height: 100%;
  display: flex;
  flex-direction: column;

  p {
    text-align: center;
    margin: 2px auto;
    height: 24px;
    width: 24px;
    line-height: 24px;
    font-size: 14px;
  }

  .is-today {
    background: #409eff;
    color: #fff;
    border-radius: 50%;
  }

  .interview-items {
    flex: 1;
    overflow-y: auto;
    font-size: 12px;
    padding: 0 2px;
  }

  .interview-item {
    margin-bottom: 4px;
    padding: 2px 4px;
    border-radius: 2px;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #fff;
    background-color: #909399;

    &:hover {
      opacity: 0.9;
    }

    .time {
      margin-right: 4px;
      font-weight: bold;
    }

    &--pending {
      background-color: #909399;
    }

    &--confirmed {
      background-color: #409eff;
    }

    &--completed {
      background-color: #67c23a;
    }

    &--canceled {
      background-color: #e6a23c;
      text-decoration: line-through;
    }

    &--no-show {
      background-color: #f56c6c;
      text-decoration: line-through;
    }
  }
}
</style>
