<template>
  <div class="interview-management-page">
    <div class="interview-management-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>我的面试</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 筛选区域 -->
      <div class="filter-container">
        <el-form :inline="true" class="filter-form">
          <div class="filter-items">
            <el-form-item label="职位" label-width="60px">
              <el-input
                v-model="queryParams.jobTitle"
                placeholder="职位名称"
                clearable
                style="width: 180px"
              />
            </el-form-item>
            <el-form-item label="状态" label-width="60px">
              <el-select
                v-model="queryParams.status"
                placeholder="选择状态"
                clearable
                style="width: 180px"
              >
                <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="公司" label-width="60px">
              <el-input
                v-model="queryParams.companyName"
                placeholder="公司名称"
                clearable
                style="width: 180px"
              />
            </el-form-item>
            <el-form-item label="日期范围" label-width="80px">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :shortcuts="dateShortcuts"
                value-format="YYYY-MM-DD"
                style="width: 320px"
              />
            </el-form-item>
          </div>
          <div class="filter-actions">
            <el-button type="primary" @click="fetchInterviews">搜索</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </div>
        </el-form>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton animated :rows="6" :loading="loading" />
      </div>

      <!-- 面试列表 -->
      <div v-else class="interviews-list">
        <div v-if="!interviews || interviews.length === 0" class="empty-container">
          <el-empty description="暂无面试">
            <template #description>
              <p>您还没有任何面试安排</p>
            </template>
            <el-button type="primary" @click="goToJobList">浏览职位</el-button>
          </el-empty>
        </div>
        <div v-else>
          <el-table :data="interviews" style="width: 100%" stripe>
            <el-table-column prop="title" label="面试标题" min-width="150" show-overflow-tooltip>
              <template #default="{ row }">
                <span @click="viewInterviewDetail(row.id)">
                  {{
                    row.application && row.application.job && row.application.job.title
                      ? `${row.application.job.title} - ${getRoundLabel(row.round)}`
                      : '未命名面试'
                  }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="job.title" label="职位" min-width="120" show-overflow-tooltip>
              <template #default="{ row }">
                <span>
                  {{ row.application.job.title || '未关联' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="company" label="公司" min-width="140">
              <template #default="{ row }">
                <span>
                  {{ row.interviewer.company.name || '未知公司' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="interviewer" label="面试官" min-width="100">
              <template #default="{ row }">
                <span>
                  {{
                    row.interviewer && row.interviewer.user
                      ? row.interviewer.user.username
                      : '未指定面试官'
                  }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="duration" label="时长" width="80" align="center">
              <template #default="{ row }"> {{ row.duration }}分钟 </template>
            </el-table-column>
            <el-table-column prop="scheduleTime" label="面试时间" min-width="160">
              <template #default="{ row }">
                {{ formatDateTime(row.scheduleTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="round" label="轮次" width="80" align="center">
              <template #default="{ row }">
                {{ getRoundLabel(row.round) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="160" align="center">
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
                      <el-dropdown-item
                        @click="joinOnlineInterview(row)"
                        :disabled="!canJoinInterview(row)"
                      >
                        加入在线面试
                      </el-dropdown-item>
                      <el-dropdown-item
                        @click="confirmInterview(row.id)"
                        :disabled="row.status !== 'SCHEDULED'"
                      >
                        确认参加
                      </el-dropdown-item>
                      <el-dropdown-item
                        divided
                        class="text-danger"
                        @click="requestReschedule(row.id)"
                        :disabled="row.status === 'COMPLETED' || row.status === 'CANCELLED'"
                      >
                        请求改期
                      </el-dropdown-item>
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

    <!-- 面试详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="面试详情"
      width="600px"
      custom-class="interview-detail-dialog"
    >
      <div v-if="currentInterview" class="interview-detail">
        <div class="detail-header">
          <div class="detail-job-title">
            {{
              currentInterview.application?.job?.title
                ? `${currentInterview.application.job.title} - ${getRoundLabel(currentInterview.round)}`
                : '未命名面试'
            }}
          </div>
          <el-tag :type="getStatusType(currentInterview.status)" size="small">
            {{ getStatusLabel(currentInterview.status) }}
          </el-tag>
        </div>

        <div class="detail-content">
          <div class="detail-info-section">
            <div class="detail-item">
              <span class="label">公司</span>
              <span class="value">{{
                currentInterview.application?.job?.company?.name || '未知公司'
              }}</span>
            </div>
            <div class="detail-item">
              <span class="label">面试官</span>
              <span class="value">{{
                currentInterview.interviewer?.user?.username || '未知面试官'
              }}</span>
            </div>
            <div class="detail-item">
              <span class="label">面试时间</span>
              <span class="value">{{ formatDateTime(currentInterview.scheduleTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">时长</span>
              <span class="value">{{ currentInterview.duration }} 分钟</span>
            </div>
            <div class="detail-item">
              <span class="label">面试地点</span>
              <span class="value">{{ currentInterview.location || '线上面试' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">类型</span>
              <span class="value">{{ currentInterview.type || '未指定' }}</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="interview-notes" v-if="currentInterview.notes">
            <h3>面试说明</h3>
            <div class="notes-content">
              {{ currentInterview.notes }}
            </div>
          </div>

          <div class="divider" v-if="currentInterview.notes"></div>

          <div class="action-buttons">
            <el-button
              type="primary"
              @click="joinOnlineInterview(currentInterview)"
              :disabled="!canJoinInterview(currentInterview)"
            >
              加入在线面试
            </el-button>
            <el-button
              @click="confirmInterview(currentInterview.id)"
              :disabled="currentInterview.status !== 'SCHEDULED'"
            >
              确认参加
            </el-button>
            <el-button
              type="danger"
              plain
              @click="requestReschedule(currentInterview.id)"
              :disabled="
                currentInterview.status === 'COMPLETED' || currentInterview.status === 'CANCELLED'
              "
            >
              请求改期
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { getInterviewList, getInterview, updateInterview } from '@/api/interview'
import { useUserStore } from '@/stores/user'
import { formatDate } from '@/utils/formatDate'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const interviews = ref([])
const total = ref(0)
const dateRange = ref([])
const detailVisible = ref(false)
const currentInterview = ref(null)

// 状态选项
const statusOptions = [
  { value: 'SCHEDULED', label: '待进行' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'CANCELLED', label: '已取消' },
  { value: 'PASS', label: '通过' },
  { value: 'PENDING', label: '待定' },
  { value: 'REJECTED', label: '拒绝' }
]

// 面试轮次选项
const roundOptions = [
  { value: 'FIRST_INTERVIEW', label: '一面' },
  { value: 'SECOND_INTERVIEW', label: '二面' },
  { value: 'HR_INTERVIEW', label: 'HR面' }
]

// 日期快捷选项
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

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  jobTitle: '',
  status: '',
  companyName: '',
  startDate: '',
  endDate: ''
})

// 监听日期范围变化
watch(
  dateRange,
  newVal => {
    if (newVal && newVal.length === 2 && newVal[0] && newVal[1]) {
      // 使用日期值（不包含时间部分）
      queryParams.startDate = newVal[0]
      queryParams.endDate = newVal[1]
    } else {
      queryParams.startDate = ''
      queryParams.endDate = ''
    }
  },
  { deep: true }
)

// 获取面试列表
const fetchInterviews = async () => {
  loading.value = true
  try {
    // 创建一个新的查询参数对象，移除空值
    const params = { ...queryParams }

    // 处理日期参数，确保格式为ISO 8601
    if (params.startDate) {
      // 如果只有日期没有时间，添加时间部分
      if (params.startDate.length === 10) {
        params.startDate = `${params.startDate}T00:00:00.000Z`
      }
    }
    if (params.endDate) {
      // 如果只有日期没有时间，添加时间部分并设置为当天结束
      if (params.endDate.length === 10) {
        params.endDate = `${params.endDate}T23:59:59.999Z`
      }
    }

    // 移除空字符串参数
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === undefined || params[key] === null) {
        delete params[key]
      }
    })

    // 确保是查询当前用户作为求职者的面试
    params.jobSeekerId = userStore.userInfo.id

    console.log('查询参数:', params)
    const response = await getInterviewList(params)
    console.log('面试列表响应:', response)

    if (response) {
      // 从返回数据中提取面试列表和总数
      if (response.interviews && Array.isArray(response.interviews)) {
        interviews.value = response.interviews
        total.value = response.total || 0
      } else if (Array.isArray(response)) {
        interviews.value = response
        // 如果API只返回了数组而没有total，则使用数组长度作为total
        total.value = interviews.value.length
      } else {
        interviews.value = []
        total.value = 0
      }

      console.log(`加载了 ${interviews.value.length} 条面试记录，总计 ${total.value} 条`)
    } else {
      interviews.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取面试列表失败:', error)
    ElMessage.error(`获取面试列表失败: ${error.message || '请稍后重试'}`)
    interviews.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 重置筛选条件
const resetFilters = () => {
  Object.assign(queryParams, {
    jobTitle: '',
    status: '',
    companyName: '',
    startDate: '',
    endDate: ''
  })
  dateRange.value = []
  fetchInterviews()
}

// 分页相关方法
const handleSizeChange = size => {
  queryParams.pageSize = size
  fetchInterviews()
}

const handleCurrentChange = page => {
  queryParams.page = page
  fetchInterviews()
}

// 格式化日期时间
const formatDateTime = dateTime => {
  if (!dateTime) return '-'
  return formatDate(new Date(dateTime), 'YYYY-MM-DD HH:mm')
}

// 获取状态标签样式
const getStatusType = status => {
  const map = {
    SCHEDULED: 'warning',
    PENDING: 'info',
    COMPLETED: 'success',
    CANCELLED: 'info',
    PASS: 'success',
    REJECTED: 'danger'
  }
  return map[status] || 'info'
}

// 获取状态标签文本
const getStatusLabel = status => {
  const map = {
    SCHEDULED: '待进行',
    PENDING: '待定',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
    PASS: '通过',
    REJECTED: '拒绝'
  }
  return map[status] || '未知'
}

// 获取面试轮次标签
const getRoundLabel = round => {
  const map = {
    FIRST_INTERVIEW: '一面',
    SECOND_INTERVIEW: '二面',
    HR_INTERVIEW: 'HR面'
  }
  return map[round] || round || '未知'
}

// 判断是否可以加入在线面试
const canJoinInterview = interview => {
  if (!interview) return false
  return interview.status === 'SCHEDULED' || interview.status === 'PENDING'
}

// 跳转到职位列表
const goToJobList = () => {
  router.push('/recruitment')
}

// 查看面试详情
const viewInterviewDetail = async id => {
  if (!id) return

  try {
    loading.value = true
    const response = await getInterview(id)
    currentInterview.value = response
    detailVisible.value = true
  } catch (error) {
    console.error('获取面试详情失败:', error)
    ElMessage.error('获取面试详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 查看职位详情
const viewJobDetail = id => {
  if (!id) return
  router.push(`/job/${id}`)
}

// 加入在线面试
const joinOnlineInterview = interview => {
  if (!interview || !interview.invitationCode) {
    ElMessage.warning('无法加入面试，缺少邀请码')
    return
  }
  router.push(`/online-interview/session/${interview.invitationCode}`)
}

// 确认参加面试
const confirmInterview = id => {
  ElMessageBox.confirm('确认您将参加这场面试吗？', '确认面试', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'info'
  })
    .then(async () => {
      try {
        // 更新面试状态为已确认
        await updateInterview(id, { status: 'CONFIRMED' })
        ElMessage.success('已确认参加面试')
        fetchInterviews()

        // 如果详情对话框打开，则刷新详情
        if (detailVisible.value && currentInterview.value?.id === id) {
          viewInterviewDetail(id)
        }
      } catch (error) {
        console.error('确认面试失败:', error)
        ElMessage.error('确认面试失败，请稍后重试')
      }
    })
    .catch(() => {})
}

// 请求改期面试
const requestReschedule = id => {
  ElMessageBox.prompt('请输入您希望改期的原因', '请求改期', {
    confirmButtonText: '提交',
    cancelButtonText: '取消',
    inputPlaceholder: '请简要说明改期原因',
    type: 'warning'
  })
    .then(async ({ value }) => {
      if (!value.trim()) {
        ElMessage.warning('请输入改期原因')
        return
      }

      try {
        // 实际项目中，这里可能需要调用一个专门的改期接口
        // 这里简化为更新面试备注
        await updateInterview(id, {
          status: 'PENDING',
          notes: `改期请求：${value}`
        })
        ElMessage.success('改期请求已提交')
        fetchInterviews()

        // 如果详情对话框打开，则刷新详情
        if (detailVisible.value && currentInterview.value?.id === id) {
          viewInterviewDetail(id)
        }
      } catch (error) {
        console.error('请求改期失败:', error)
        ElMessage.error('请求改期失败，请稍后重试')
      }
    })
    .catch(() => {})
}

// 页面加载时获取数据
onMounted(() => {
  fetchInterviews()
})
</script>

<style scoped>
.interview-management-page {
  width: 100%;
  background-color: #f5f9ff;
  min-height: calc(100vh - 72px);
}

.interview-management-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.breadcrumb-container {
  margin-bottom: 20px;
  font-size: 14px;
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
  justify-content: space-between;
  align-items: flex-start;
}

.filter-items {
  display: flex;
  flex-wrap: wrap;
  flex: 1;
  gap: 10px;
}

.filter-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.loading-container {
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.empty-container {
  padding: 40px;
  text-align: center;
}

.interviews-list {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-top: 20px;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

.interview-title {
  color: #0352c9;
  cursor: pointer;
  font-weight: 500;
}

.interview-title:hover {
  text-decoration: underline;
}

.job-title,
.company-name {
  color: #0352c9;
  cursor: pointer;
  font-weight: 500;
}

.job-title:hover,
.company-name:hover {
  text-decoration: underline;
}

.text-danger {
  color: #f56c6c;
}

/* 面试详情对话框样式 */
:deep(.interview-detail-dialog) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.interview-detail-dialog .el-dialog__header) {
  margin: 0;
  padding: 20px 20px 15px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.interview-detail-dialog .el-dialog__title) {
  font-weight: 600;
  font-size: 18px;
  color: #303133;
}

:deep(.interview-detail-dialog .el-dialog__body) {
  padding: 0;
}

.interview-detail {
  background-color: #fff;
}

.detail-header {
  padding: 20px 20px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8faff;
}

.detail-job-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.detail-content {
  padding: 20px;
}

.detail-info-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 5px;
}

.value {
  font-size: 15px;
  color: #303133;
  font-weight: 500;
}

.divider {
  height: 1px;
  background-color: #ebeef5;
  margin: 20px 0;
}

.interview-notes h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 15px;
}

.notes-content {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  color: #606266;
  line-height: 1.6;
  white-space: pre-line;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .filter-form {
    flex-direction: column;
  }

  .filter-actions {
    margin-top: 15px;
    justify-content: flex-end;
  }

  .detail-info-section {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
