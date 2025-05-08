<template>
  <div class="interview-management-page">
    <div class="interview-management-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>面试管理</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 筛选区域 -->
      <div class="filter-container">
        <el-form :inline="true" class="filter-form">
          <div class="filter-items">
            <el-form-item label="职位" label-width="60px">
              <el-select
                v-model="queryParams.jobId"
                placeholder="选择职位"
                clearable
                style="width: 180px"
              >
                <el-option v-for="job in jobs" :key="job.id" :label="job.title" :value="job.id" />
              </el-select>
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
            <el-form-item label="求职者" label-width="60px">
              <el-input
                v-model="queryParams.candidateName"
                placeholder="求职者姓名"
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
            <!-- <div class="actions-section">
              <el-button type="primary" @click="createInterview">
                <el-icon><Plus /></el-icon>
                新增面试
              </el-button>
            </div> -->
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
              <p>您还没有安排任何面试</p>
            </template>
            <el-button type="primary" @click="createInterview">立即安排面试</el-button>
          </el-empty>
        </div>
        <div v-else>
          <el-table :data="interviews" style="width: 100%" stripe>
            <el-table-column prop="title" label="面试标题" min-width="150" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="interview-title" @click="viewInterviewDetail(row.id)">
                  {{
                    row.application && row.application.job && row.application.job.title
                      ? `${row.application.job.title} - ${getRoundLabel(row.round)}`
                      : '未命名面试'
                  }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop="job.title"
              label="关联职位"
              min-width="120"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <span
                  class="job-title"
                  @click="
                    viewJobDetail(
                      row.application && row.application.job ? row.application.job.id : null
                    )
                  "
                >
                  {{
                    row.application && row.application.job ? row.application.job.title : '未关联'
                  }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="jobSeeker.username" label="求职者姓名" min-width="120">
              <template #default="{ row }">
                <span class="candidate-name" @click="viewCandidateProfile(row.jobSeekerId)">
                  {{
                    row.jobSeeker && row.jobSeeker.user ? row.jobSeeker.user.username : '未知求职者'
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
            <el-table-column prop="round" label="面试轮次" width="100" align="center">
              <template #default="{ row }">
                {{ getRoundLabel(row.round) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="invitationCode" label="邀请码" min-width="150" align="center">
              <template #default="{ row }">
                <div class="invitation-code-wrapper">
                  <el-tooltip effect="dark" content="点击复制邀请码" placement="top">
                    <span class="invitation-code" @click="copyInvitationCode(row.invitationCode)">
                      {{ row.invitationCode ? row.invitationCode.slice(0, 8) + '...' : '-' }}
                    </span>
                  </el-tooltip>
                  <div class="invitation-actions" v-if="row.invitationCode">
                    <!-- <el-button 
                      type="primary" 
                      size="small" 
                      circle 
                      class="action-btn"
                      @click="downloadInvitationCode(row)"
                    >
                      <el-icon><Download /></el-icon>
                    </el-button> -->
                    <el-button
                      type="info"
                      size="small"
                      circle
                      class="action-btn"
                      @click="showInvitationDetail(row)"
                    >
                      <el-icon><Link /></el-icon>
                    </el-button>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="180" align="center">
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
                        @click="startOnlineInterview(row)"
                        :disabled="!canStartInterview(row)"
                      >
                        开始在线面试
                      </el-dropdown-item>
                      <el-dropdown-item
                        @click="sendReminder(row.id)"
                        :disabled="row.status !== 'PENDING'"
                      >
                        发送提醒
                      </el-dropdown-item>
                      <el-dropdown-item
                        @click="rescheduleInterview(row.id)"
                        :disabled="row.status === 'COMPLETED'"
                      >
                        重新安排时间
                      </el-dropdown-item>
                      <el-dropdown-item
                        divided
                        class="text-danger"
                        @click="cancelInterview(row.id)"
                      >
                        取消面试
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

    <!-- 邀请码详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="面试邀请码详情"
      width="550px"
      custom-class="invitation-dialog"
    >
      <div v-if="currentInterview" class="invitation-detail">
        <div class="detail-header">
          <div class="detail-job-title">
            {{ currentInterview.application?.job?.title || '未命名职位' }}
          </div>
          <el-tag :type="getStatusType(currentInterview.status)" size="small">
            {{ getStatusLabel(currentInterview.status) }}
          </el-tag>
        </div>

        <div class="detail-content">
          <div class="detail-info-section">
            <div class="detail-item">
              <span class="label">求职者</span>
              <span class="value">{{
                currentInterview.jobSeeker?.user?.username || '未知求职者'
              }}</span>
            </div>
            <div class="detail-item">
              <span class="label">面试时间</span>
              <span class="value">{{ formatDateTime(currentInterview.scheduleTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">面试轮次</span>
              <span class="value">{{ getRoundLabel(currentInterview.round) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">时长</span>
              <span class="value">{{ currentInterview.duration }} 分钟</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="invitation-code-section">
            <h3>邀请码信息</h3>
            <div class="code-item">
              <div class="code-label">邀请码</div>
              <div class="code-value-wrapper">
                <span class="full-code">{{ currentInterview.invitationCode }}</span>
                <el-button
                  type="primary"
                  size="small"
                  plain
                  @click="copyInvitationCode(currentInterview.invitationCode)"
                >
                  <el-icon><CopyDocument /></el-icon> 复制
                </el-button>
              </div>
            </div>
            <div class="code-item">
              <div class="code-label">访问链接</div>
              <div class="link-value-wrapper">
                <el-input v-model="invitationLink" readonly size="default" class="link-input">
                  <template #prefix>
                    <el-icon><Link /></el-icon>
                  </template>
                </el-input>
                <el-button type="primary" size="default" @click="copyInvitationLink">
                  <el-icon><CopyDocument /></el-icon> 复制链接
                </el-button>
              </div>
            </div>
          </div>

          <div class="invitation-qrcode" v-if="invitationLink">
            <h3>分享二维码</h3>
            <div class="qrcode-wrapper">
              <img
                :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(invitationLink)}`"
                alt="面试邀请链接二维码"
                class="qrcode-image"
              />
              <div class="qrcode-tip">扫描二维码直接访问面试</div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="downloadInvitationCode(currentInterview)">
            <el-icon><Download /></el-icon> 下载邀请信息
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowDown, Download, CopyDocument, Link } from '@element-plus/icons-vue'
import { getInterviewList } from '@/api/interview'
import { getInterviewerJobs } from '@/api/interviewer'
import { useUserStore } from '@/stores/user'
import { formatDate } from '@/utils/formatDate'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const interviews = ref([])
const total = ref(0)
const jobs = ref([])
const dateRange = ref([])
const dialogVisible = ref(false)
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
  jobId: '',
  status: '',
  candidateName: '',
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

// 获取面试官创建的职位列表
const fetchJobs = async () => {
  try {
    const response = await getInterviewerJobs()
    console.log('职位列表响应:', response)

    if (response && response.list) {
      jobs.value = response.list
    } else if (Array.isArray(response)) {
      jobs.value = response
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
  Object.assign(queryParams, {
    jobId: '',
    status: '',
    candidateName: '',
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

// 判断是否可以开始在线面试
const canStartInterview = interview => {
  if (!interview) return false
  return interview.status === 'SCHEDULED' || interview.status === 'PENDING'
}

// 新增面试
const createInterview = () => {
  router.push('/interviewer/create-interview')
}

// 查看面试详情
const viewInterviewDetail = id => {
  router.push(`/interviewer/interview-detail/${id}`)
}

// 查看职位详情
const viewJobDetail = id => {
  if (!id) return
  router.push(`/interviewer/job-detail/${id}`)
}

// 查看求职者详情
const viewCandidateProfile = id => {
  if (!id) return
  router.push(`/interviewer/candidate-profile/${id}`)
}

// 开始在线面试
const startOnlineInterview = interview => {
  if (!interview || !interview.invitationCode) {
    ElMessage.warning('无法开始面试，缺少邀请码')
    return
  }
  router.push(`/online-interview/session/${interview.invitationCode}`)
}

// 发送面试提醒
const sendReminder = id => {
  ElMessageBox.confirm('确定要向求职者发送面试提醒吗？', '发送提醒', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  })
    .then(() => {
      ElMessage.success('面试提醒已发送')
    })
    .catch(() => {})
}

// 重新安排面试时间
const rescheduleInterview = id => {
  router.push(`/interviewer/reschedule-interview/${id}`)
}

// 取消面试
const cancelInterview = id => {
  ElMessageBox.confirm('确定要取消这场面试吗？此操作不可恢复。', '取消面试', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        // 此处应调用取消面试的API
        // await cancelInterviewAPI(id)
        ElMessage.success('面试已取消')
        fetchInterviews()
      } catch (error) {
        console.error('取消面试失败:', error)
        ElMessage.error('取消面试失败，请稍后重试')
      }
    })
    .catch(() => {})
}

// 添加复制邀请码的功能
const copyInvitationCode = code => {
  if (!code) {
    ElMessage.warning('该面试没有邀请码')
    return
  }

  // 使用 navigator.clipboard API 复制内容到剪贴板
  navigator.clipboard
    .writeText(code)
    .then(() => {
      ElMessage.success('邀请码已复制到剪贴板')
    })
    .catch(() => {
      // 备用方法：创建一个临时输入框来复制
      const textarea = document.createElement('textarea')
      textarea.value = code
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      ElMessage.success('邀请码已复制到剪贴板')
    })
}

// 添加下载邀请码功能
const downloadInvitationCode = interview => {
  if (!interview.invitationCode) {
    ElMessage.warning('该面试没有邀请码')
    return
  }

  // 获取面试相关信息
  const jobTitle = interview.application?.job?.title || '未命名职位'
  const candidateName = interview.jobSeeker?.user?.username || '未知求职者'
  const scheduleTime = formatDate(new Date(interview.scheduleTime), 'YYYY-MM-DD HH:mm')
  const round = getRoundLabel(interview.round)

  // 创建邀请码信息文本
  const content = `面试邀请码信息
------------------------
职位: ${jobTitle}
求职者: ${candidateName}
面试时间: ${scheduleTime}
面试轮次: ${round}
邀请码: ${interview.invitationCode}
------------------------
访问链接: ${window.location.origin}/online-interview/${interview.invitationCode}
`

  // 创建并下载文本文件
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `面试邀请码_${jobTitle}_${candidateName}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  ElMessage.success('邀请码已下载')
}

// 添加显示邀请码详情的方法
const showInvitationDetail = interview => {
  if (!interview.invitationCode) {
    ElMessage.warning('该面试没有邀请码')
    return
  }

  currentInterview.value = interview
  dialogVisible.value = true
}

// 生成邀请链接
const invitationLink = computed(() => {
  if (!currentInterview.value || !currentInterview.value.invitationCode) return ''
  return `${window.location.origin}/online-interview/session/${currentInterview.value.invitationCode}`
})

// 复制邀请链接
const copyInvitationLink = () => {
  if (!invitationLink.value) {
    ElMessage.warning('无法获取邀请链接')
    return
  }

  navigator.clipboard
    .writeText(invitationLink.value)
    .then(() => {
      ElMessage.success('邀请链接已复制到剪贴板')
    })
    .catch(() => {
      // 备用方法
      const textarea = document.createElement('textarea')
      textarea.value = invitationLink.value
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      ElMessage.success('邀请链接已复制到剪贴板')
    })
}

// 页面加载时获取数据
onMounted(() => {
  fetchJobs()
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

.actions-section {
  margin-left: 20px;
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
.candidate-name {
  color: #0352c9;
  cursor: pointer;
  font-weight: 500;
}

.job-title:hover,
.candidate-name:hover {
  text-decoration: underline;
}

.text-danger {
  color: #f56c6c;
}

.invitation-code-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.invitation-code {
  font-family: monospace;
  background-color: #f0f5ff;
  border: 1px solid #d9e6ff;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  color: #2468f2;
  cursor: pointer;
  transition: all 0.3s;
}

.invitation-code:hover {
  background-color: #e0edff;
  color: #1654dd;
  border-color: #b6d3ff;
}

.invitation-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  font-size: 12px;
  padding: 4px;
}

/* 邀请码详情对话框样式 */
:deep(.invitation-dialog) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.invitation-dialog .el-dialog__header) {
  margin: 0;
  padding: 20px 20px 15px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.invitation-dialog .el-dialog__title) {
  font-weight: 600;
  font-size: 18px;
  color: #303133;
}

:deep(.invitation-dialog .el-dialog__body) {
  padding: 0;
}

:deep(.invitation-dialog .el-dialog__footer) {
  padding: 15px 20px;
  border-top: 1px solid #ebeef5;
}

.invitation-detail {
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

.invitation-code-section {
  margin-bottom: 25px;
}

.invitation-code-section h3,
.invitation-qrcode h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #ebeef5;
}

.code-item {
  margin-bottom: 15px;
}

.code-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.code-value-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.full-code {
  font-family: monospace;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  color: #2468f2;
  flex: 1;
  word-break: break-all;
}

.link-value-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.link-input {
  flex: 1;
}

.invitation-qrcode {
  margin-top: 25px;
}

.qrcode-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.qrcode-image {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 5px;
  background-color: #fff;
}

.qrcode-tip {
  font-size: 12px;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .filter-form {
    flex-direction: column;
  }

  .filter-actions {
    margin-top: 15px;
    justify-content: flex-end;
  }
}
</style>
