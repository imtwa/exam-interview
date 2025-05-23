<template>
  <div class="candidates-page">
    <div class="candidates-page-container">
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
                <el-option v-for="job in jobs" :key="job.id" :label="job.title" :value="job.id" />
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
                placeholder="姓名/邮箱/学校"
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
            :default-sort="{ prop: 'appliedAt', order: 'descending' }"
          >
            <el-table-column label="候选人" min-width="180">
              <template #default="{ row }">
                <div class="candidate-info">
                  <el-avatar
                    :size="40"
                    :src="
                      row.avatar ||
                      generateAvatar(row.candidateName || row.jobSeeker?.user?.username || '未知')
                    "
                  >
                    {{ (row.candidateName || row.jobSeeker?.user?.username || '未知').charAt(0) }}
                  </el-avatar>
                  <div class="candidate-details">
                    <el-tooltip placement="right" :show-after="300">
                      <template #content>
                        <div class="tooltip-content">
                          <p v-if="row.jobSeeker?.user?.email">
                            <b>邮箱:</b> {{ row.jobSeeker.user.email }}
                          </p>
                          <p v-if="row.jobSeeker?.gender">
                            <b>性别:</b> {{ getGenderText(row.jobSeeker.gender) }}
                          </p>
                          <p v-if="row.jobSeeker?.expectedPosition">
                            <b>期望职位:</b> {{ row.jobSeeker.expectedPosition }}
                          </p>
                        </div>
                      </template>
                      <div class="candidate-name">
                        <el-link type="primary" @click="viewUserProfile(row.jobSeeker?.user?.id)">
                          {{ row.candidateName || row.jobSeeker?.user?.username || '未知' }}
                        </el-link>
                      </div>
                    </el-tooltip>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="job.title" label="应聘职位" min-width="140">
              <template #default="{ row }">
                <el-link type="primary" @click="viewJobDetail(row.job?.id)" v-if="row.job?.id">
                  {{ row.job?.title || '未知职位' }}
                </el-link>
                <span v-else>{{ row.job?.title || '未知职位' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="教育背景" min-width="160">
              <template #default="{ row }">
                <div
                  v-if="
                    row.highestEducation ||
                    (row.jobSeeker?.education && row.jobSeeker.education.length)
                  "
                >
                  <div>
                    {{
                      getEducationText(
                        row.highestEducation?.degree ||
                          (row.jobSeeker?.education && row.jobSeeker.education.length > 0
                            ? row.jobSeeker.education[0]?.degree
                            : null)
                      )
                    }}
                  </div>
                  <div class="text-secondary">
                    {{
                      row.highestEducation?.school ||
                      (row.jobSeeker?.education && row.jobSeeker.education.length > 0
                        ? row.jobSeeker.education[0]?.school
                        : '')
                    }}
                  </div>
                  <div
                    v-if="row.jobSeeker?.education && row.jobSeeker.education.length > 1"
                    class="more-info"
                  >
                    <el-popover placement="right" trigger="hover" width="300">
                      <template #reference>
                        <el-link type="info" style="font-size: 12px">更多学历信息</el-link>
                      </template>
                      <template #default>
                        <div
                          v-for="(edu, index) in row.jobSeeker.education"
                          :key="index"
                          class="popover-item"
                        >
                          <div>
                            <strong>{{ getEducationText(edu.degree) }}</strong> / {{ edu.major }}
                          </div>
                          <div>{{ edu.school }}</div>
                          <div class="text-secondary">
                            {{ formatDate(edu.startDate) }} -
                            {{ edu.endDate ? formatDate(edu.endDate) : '至今' }}
                          </div>
                        </div>
                      </template>
                    </el-popover>
                  </div>
                </div>
                <div v-else>暂无教育信息</div>
              </template>
            </el-table-column>
            <el-table-column label="工作经验" min-width="120">
              <template #default="{ row }">
                <span
                  v-if="
                    row.totalExperience ||
                    (row.jobSeeker?.workExperience && row.jobSeeker.workExperience.length)
                  "
                >
                  {{ row.totalExperience || getYearsOfExperience(row.jobSeeker.workExperience) }}年
                </span>
                <div
                  v-if="row.jobSeeker?.workExperience && row.jobSeeker.workExperience.length > 0"
                  class="more-info"
                >
                  <el-popover placement="right" trigger="hover" width="300">
                    <template #reference>
                      <el-link type="info" style="font-size: 12px">查看详情</el-link>
                    </template>
                    <template #default>
                      <div
                        v-for="(exp, index) in row.jobSeeker.workExperience"
                        :key="index"
                        class="popover-item"
                      >
                        <div>
                          <strong>{{ exp.position }}</strong>
                        </div>
                        <div>{{ exp.company }}</div>
                        <div class="text-secondary">
                          {{ formatDate(exp.startDate) }} -
                          {{ exp.endDate ? formatDate(exp.endDate) : '至今' }}
                        </div>
                        <div v-if="exp.description" class="exp-description">
                          {{ exp.description }}
                        </div>
                      </div>
                    </template>
                  </el-popover>
                </div>
                <span v-else>无经验</span>
              </template>
            </el-table-column>
            <el-table-column label="应聘日期" min-width="100" sortable>
              <template #default="{ row }">
                {{ formatDate(row.appliedAt) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" min-width="100">
              <template #default="{ row }">
                <status-tag :status="row.status" />
              </template>
            </el-table-column>
            <el-table-column label="简历" min-width="100">
              <template #default="{ row }">
                <el-button
                  v-if="row.jobSeeker?.resumeUrl"
                  type="primary"
                  link
                  @click="viewResume(row)"
                >
                  查看简历
                </el-button>
                <span v-else class="text-muted">暂无简历</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-dropdown trigger="click">
                  <el-button size="small" type="primary" link>
                    管理<el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="handleCommand('written_test', row)"
                        >发放笔试</el-dropdown-item
                      >
                      <el-dropdown-item @click="handleCommand('schedule', row)"
                        >安排面试</el-dropdown-item
                      >
                      <el-dropdown-item @click="handleCommand('offer', row)"
                        >发送Offer</el-dropdown-item
                      >
                      <el-dropdown-item @click="handleCommand('hire', row)">录用</el-dropdown-item>
                      <el-dropdown-item
                        divided
                        class="text-danger"
                        @click="handleCommand('reject', row)"
                        >拒绝</el-dropdown-item
                      >
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

      <!-- 简历查看对话框 -->
      <el-dialog
        v-model="resumeDialogVisible"
        :title="selectedCandidate?.jobSeeker?.resumeFileName || '候选人简历'"
        :width="pdfWidth"
        destroy-on-close
        @close="closeResumeDialog"
      >
        <div
          v-if="selectedCandidate && selectedCandidate.jobSeeker?.resumeUrl"
          class="resume-container"
        >
          <iframe
            v-if="selectedCandidate.jobSeeker.resumeUrl.endsWith('.pdf')"
            :src="pdfViewerUrl"
            frameborder="0"
            width="100%"
            height="600"
          ></iframe>
          <div v-else class="non-pdf-resume">
            <p>此简历不是PDF格式，请点击以下链接下载查看：</p>
            <el-button type="primary" @click="downloadResume"> 下载简历 </el-button>
          </div>
        </div>
      </el-dialog>

      <!-- 分配笔试对话框 -->
      <el-dialog v-model="examDialogVisible" title="分配笔试试卷" width="550px">
        <assign-exam-form
          v-if="examDialogVisible"
          :application-id="currentApplication?.id"
          :job-seeker-id="currentApplication?.jobSeeker?.id"
          @success="handleAssignExamSuccess"
          @cancel="examDialogVisible = false"
        />
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, Message } from '@element-plus/icons-vue'
import {
  getInterviewerApplications,
  updateApplicationStatus,
  scheduleInterview,
  assignExam as assignExamApi
} from '@/api/interviewer'
import { getInterviewerJobs } from '@/api/job'
import { getInterviewerPrivateExams } from '@/api/exam'
import { formatDate } from '@/utils/formatDate'
import InterviewSchedule from './components/InterviewSchedule.vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import StatusTag from './components/StatusTag.vue'
import AssignExamForm from './components/AssignExamForm.vue'

// 响应式数据
const loading = ref(true)
const candidates = ref([])
const jobs = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const scheduleDialogVisible = ref(false)
const currentCandidate = ref(null)
const resumeDialogVisible = ref(false)
const selectedCandidate = ref(null)
const pdfWidth = ref('80%')
const userStore = useUserStore()

// 笔试相关状态
const examDialogVisible = ref(false)
const loadingExams = ref(false)
const examList = ref([])
const selectedExamId = ref(null)
const examNote = ref('')
const currentApplication = ref(null)

const filterForm = reactive({
  jobId: '',
  status: '',
  keyword: ''
})

const router = useRouter()

// 计算PDF查看器URL
const pdfViewerUrl = computed(() => {
  if (!selectedCandidate.value || !selectedCandidate.value.jobSeeker?.resumeUrl) return ''

  // 使用PDF.js查看器 - 直接使用完整URL，不需要拼接
  const pdfUrl = selectedCandidate.value.jobSeeker.resumeUrl
  return `${pdfUrl}`
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
    const response = await getInterviewerJobs({ pageSize: 100 })
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

    totalMonths += years * 12 + months
  })

  return Math.round(totalMonths / 12)
}

// 生成头像
const generateAvatar = name => {
  const colors = [
    '#1abc9c',
    '#2ecc71',
    '#3498db',
    '#9b59b6',
    '#34495e',
    '#16a085',
    '#27ae60',
    '#2980b9',
    '#8e44ad',
    '#2c3e50',
    '#f1c40f',
    '#e67e22',
    '#e74c3c',
    '#f39c12',
    '#d35400'
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

// 发送邮件
const sendEmail = email => {
  window.location.href = `mailto:${email}`
}

// 查看用户资料
const viewUserProfile = userId => {
  if (!userId) {
    ElMessage.info('找不到该用户的详细信息')
    return
  }
  router.push(`/profile/${userId}`)
}

// 获取性别文本
const getGenderText = gender => {
  const genderMap = {
    MALE: '男',
    FEMALE: '女',
    OTHER: '其他'
  }
  return genderMap[gender] || '未知'
}

// 查看简历
const viewResume = candidate => {
  if (candidate.jobSeeker?.resumeUrl) {
    selectedCandidate.value = candidate
    resumeDialogVisible.value = true
  } else {
    ElMessage.info(
      `${candidate.candidateName || candidate.jobSeeker?.user?.username || '候选人'}暂未上传简历`
    )
  }
}

// 关闭简历对话框
const closeResumeDialog = () => {
  resumeDialogVisible.value = false
  setTimeout(() => {
    selectedCandidate.value = null
  }, 300)
}

// 下载简历
const downloadResume = () => {
  if (selectedCandidate.value?.jobSeeker?.resumeUrl) {
    // 直接使用完整URL下载
    window.open(selectedCandidate.value.jobSeeker.resumeUrl, '_blank')
  }
}

// 查看职位详情
const viewJobDetail = jobId => {
  if (!jobId) {
    ElMessage.info('找不到该职位的详细信息')
    return
  }
  router.push(`/job/${jobId}`)
}

// 获取HR的试卷列表
const fetchExams = async () => {
  loadingExams.value = true
  try {
    const response = await getInterviewerPrivateExams({
      page: 1,
      pageSize: 50,
      interviewerId: userStore.interviewerId,
      isPublic: false // 只获取HR创建的私有试卷
    })

    if (response.items) {
      examList.value = response.items
    } else {
      examList.value = []
    }
  } catch (error) {
    console.error('获取试卷列表失败:', error)
    examList.value = []
    ElMessage.error('获取试卷列表失败')
  } finally {
    loadingExams.value = false
  }
}

// 分配笔试
const handleAssignExam = async () => {
  if (!selectedExamId.value) {
    ElMessage.warning('请选择一份试卷')
    return
  }

  try {
    // 使用新的API端点发放笔试试卷并发送邮件
    const response = await assignExamApi(currentCandidate.value.id, {
      examId: selectedExamId.value,
      note: examNote.value || undefined
    })

    if (response && response.message) {
      ElMessage.success(response.message || '笔试试卷已成功发放，并已发送通知邮件')
    } else {
      ElMessage.success('笔试试卷已成功发放，并已发送通知邮件')
    }

    examDialogVisible.value = false
    fetchCandidates(currentPage.value)
  } catch (error) {
    console.error('发放笔试失败:', error)
    ElMessage.error(error.response?.data?.message || '发放笔试失败')
  }
}

// 跳转到创建试卷页面
const goToCreateExam = () => {
  router.push('/exam/create')
}

// 处理候选人操作
const handleCommand = (command, row) => {
  currentApplication.value = row

  if (command === 'written_test') {
    selectedExamId.value = null
    examNote.value = ''
    fetchExams()
    examDialogVisible.value = true
  } else if (command === 'schedule') {
    currentCandidate.value = row
    scheduleDialogVisible.value = true
  } else if (command === 'offer') {
    updateApplicationStatus(row.id, { status: 'OFFER' })
    ElMessage.success(`已向${row.candidateName || '候选人'}发送Offer`)
    fetchCandidates(currentPage.value)
  } else if (command === 'hire') {
    updateApplicationStatus(row.id, { status: 'OFFER' })
    ElMessage.success(`已录用${row.candidateName || '候选人'}`)
    fetchCandidates(currentPage.value)
  } else if (command === 'reject') {
    rejectApplication(row)
  }
}

// 处理面试安排成功
const handleScheduleSuccess = () => {
  fetchCandidates(currentPage.value)
}

// 拒绝申请
const rejectApplication = application => {
  ElMessageBox.confirm(
    `确定要拒绝 ${application.candidateName || '该候选人'} 的申请吗？`,
    '拒绝确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        const res = await updateApplicationStatus(application.id, {
          status: 'REJECTED',
          feedback: '很遗憾，您的条件与我们的要求不符。'
        })

        if (res) {
          ElMessage.success('已拒绝该申请')
          fetchCandidates(currentPage.value)
        }
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败')
      }
    })
    .catch(() => {})
}

// 处理笔试分配成功
const handleAssignExamSuccess = examData => {
  examDialogVisible.value = false
  ElMessage.success(`笔试邀请码: ${examData.invitationCode}`)
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
  background-color: #f5f9ff;
  width: 100%;
  min-height: calc(100vh - 72px);
}

.candidates-page-container {
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
  justify-content: center;
}

.candidate-name {
  font-weight: bold;
  cursor: pointer;
}

.tooltip-content {
  min-width: 180px;
  padding: 5px;
}

.tooltip-content p {
  margin: 5px 0;
  font-size: 13px;
}

.text-secondary {
  color: #666;
  font-size: 13px;
}

.text-danger {
  color: #f56c6c;
}

.text-muted {
  color: #909399;
  font-size: 12px;
}

.more-info {
  margin-top: 4px;
}

.popover-item {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.popover-item:last-child {
  border-bottom: none;
}

.exp-description {
  margin-top: 4px;
  font-size: 12px;
  color: #606266;
}

.resume-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.non-pdf-resume {
  text-align: center;
  padding: 30px;
}

.exam-dialog-content {
  min-height: 300px;
}

.exam-option {
  display: flex;
  flex-direction: column;
}

.exam-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.no-exams {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}
</style>
