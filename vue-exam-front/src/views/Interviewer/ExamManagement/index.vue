<template>
  <div class="exam-management-page">
    <div class="exam-management-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>考试管理</el-breadcrumb-item>
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
            <el-form-item label="求职者" label-width="60px">
              <el-input
                v-model="queryParams.candidateName"
                placeholder="求职者姓名"
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
            <el-form-item label="关键词" label-width="60px">
              <el-input
                v-model="queryParams.keyword"
                placeholder="考试名称"
                clearable
                style="width: 180px"
              />
            </el-form-item>
          </div>
          <div class="filter-actions">
            <el-button type="primary" @click="fetchExams">搜索</el-button>
            <el-button @click="resetFilters">重置</el-button>
            <div class="actions-section">
              <el-button type="primary" @click="createExam">
                <el-icon><Plus /></el-icon>
                创建考试
              </el-button>
            </div>
          </div>
        </el-form>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton animated :rows="6" :loading="loading" />
      </div>

      <!-- 考试列表 -->
      <div v-else class="exams-list">
        <div v-if="exams.length === 0" class="empty-container">
          <el-empty description="暂无考试">
            <template #description>
              <p>您还没有创建任何考试</p>
            </template>
            <el-button type="primary" @click="createExam">立即创建考试</el-button>
          </el-empty>
        </div>
        <div v-else>
          <el-table :data="exams" style="width: 100%" stripe>
            <el-table-column
              prop="examTitle"
              label="试卷名称"
              min-width="150"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <span class="exam-title" @click="viewExamDetail(row.examId)">{{
                  row.examTitle
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="positionName"
              label="关联职位"
              min-width="120"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <span class="job-name" @click="viewJobDetail(row.positionId)">
                  {{ row.positionName || '未关联' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="candidateName" label="考生姓名" min-width="120">
              <template #default="{ row }">
                <span class="candidate-name" @click="viewCandidateProfile(row.candidateId)">
                  {{ row.candidateName }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="duration" label="时长" width="80" align="center">
              <template #default="{ row }"> {{ row.duration }}分钟 </template>
            </el-table-column>
            <el-table-column prop="examTime" label="考试时间" min-width="180">
              <template #default="{ row }">
                <div class="time-range">
                  <div>开始：{{ formatDate(row.startTime) }}</div>
                  <div>截止：{{ formatDate(row.endTime) }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="score" label="得分" width="90" align="center">
              <template #default="{ row }">
                <span v-if="row.status === 'COMPLETED'">{{ row.score }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="150" align="center">
              <template #default="{ row }">
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="viewExamResult(row)"
                  :disabled="row.status !== 'COMPLETED'"
                >
                  查看结果
                </el-button>
                <el-dropdown trigger="click">
                  <el-button link type="primary" size="small">
                    更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        @click="sendReminder(row)"
                        :disabled="row.status !== 'PENDING'"
                      >
                        发送提醒
                      </el-dropdown-item>
                      <el-dropdown-item
                        @click="extendDeadline(row)"
                        :disabled="row.status === 'COMPLETED'"
                      >
                        延长截止时间
                      </el-dropdown-item>
                      <el-dropdown-item divided class="text-danger" @click="cancelExam(row.id)">
                        取消考试
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

      <!-- 延长截止时间对话框 -->
      <el-dialog v-model="extendDeadlineDialogVisible" title="延长考试截止时间" width="500px">
        <el-form :model="extendForm" label-width="100px">
          <el-form-item label="考试名称">
            <span>{{ extendForm.examTitle }}</span>
          </el-form-item>
          <el-form-item label="考生">
            <span>{{ extendForm.candidateName }}</span>
          </el-form-item>
          <el-form-item label="当前截止时间">
            <span>{{ formatDate(extendForm.currentEndTime) }}</span>
          </el-form-item>
          <el-form-item label="新截止时间">
            <el-date-picker
              v-model="extendForm.newEndTime"
              type="datetime"
              placeholder="选择新的截止时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              :disabled-date="disabledDate"
              style="width: 100%"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="extendDeadlineDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitExtendDeadline" :loading="submitLoading">
              确认延长
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowDown } from '@element-plus/icons-vue'
import {
  getInterviewerExams,
  extendExamDeadline,
  sendExamReminder,
  cancelExam as cancelExamAPI
} from '@/api/interviewer'
import { getInterviewerJobs } from '@/api/job'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const exams = ref([])
const total = ref(0)
const jobs = ref([])
const submitLoading = ref(false)

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  jobId: null,
  candidateName: '',
  status: '',
  keyword: ''
})

// 状态选项
const statusOptions = [
  { label: '待完成', value: 'PENDING' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '已过期', value: 'EXPIRED' }
]

// 获取状态显示类型
const getStatusType = status => {
  switch (status) {
    case 'COMPLETED':
      return 'success'
    case 'PENDING':
      return 'warning'
    case 'EXPIRED':
      return 'info'
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
const formatDate = date => {
  if (!date) return '-'
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 获取考试列表
const fetchExams = async () => {
  if (!userStore.isLoggedIn || !userStore.isInterviewer) {
    ElMessage.warning('请先登录面试官账号')
    router.push('/login')
    return
  }

  loading.value = true

  try {
    const response = await getInterviewerExams(queryParams)

    if (response) {
      exams.value = response.items || []
      total.value = response.total || 0
    } else {
      exams.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取考试列表失败:', error)
    ElMessage.error('获取考试列表失败')
    exams.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 获取职位列表
const fetchJobs = async () => {
  try {
    const response = await getInterviewerJobs()
    if (response) {
      jobs.value = response.list || []
    } else {
      jobs.value = []
    }
  } catch (error) {
    jobs.value = []
  }
}

// 重置筛选条件
const resetFilters = () => {
  queryParams.jobId = null
  queryParams.candidateName = ''
  queryParams.status = ''
  queryParams.keyword = ''
  queryParams.page = 1
  fetchExams()
}

// 处理分页变化
const handleSizeChange = size => {
  queryParams.pageSize = size
  fetchExams()
}

const handleCurrentChange = page => {
  queryParams.page = page
  fetchExams()
}

// 创建考试
const createExam = () => {
  router.push('/private-exams/create')
}

// 查看考试详情
const viewExamDetail = id => {
  router.push(`/exam/${id}`)
}

// 查看职位详情
const viewJobDetail = id => {
  if (id) {
    router.push(`/job/${id}`)
  }
}

// 查看求职者档案
const viewCandidateProfile = candidateId => {
  if (candidateId) {
    router.push(`/profile/${candidateId}`)
  }
}

// 查看考试结果
const viewExamResult = exam => {
  if (exam.status === 'COMPLETED') {
    router.push(`/online-exam/result/${exam.invitationCode}`)
  } else {
    ElMessage.warning('考生尚未完成考试')
  }
}

// 延长截止时间对话框
const extendDeadlineDialogVisible = ref(false)
const extendForm = reactive({
  id: null,
  examTitle: '',
  candidateName: '',
  currentEndTime: null,
  newEndTime: null
})

// 打开延长截止时间对话框
const extendDeadline = exam => {
  extendForm.id = exam.id
  extendForm.examTitle = exam.examTitle
  extendForm.candidateName = exam.candidateName
  extendForm.currentEndTime = new Date(exam.endTime)
  extendForm.newEndTime = new Date(new Date(exam.endTime).getTime() + 24 * 60 * 60 * 1000) // 默认延长一天
  extendDeadlineDialogVisible.value = true
}

// 禁用今天之前的日期
const disabledDate = time => {
  return time.getTime() < Date.now()
}

// 提交延长截止时间
const submitExtendDeadline = async () => {
  if (!extendForm.newEndTime) {
    ElMessage.warning('请选择新的截止时间')
    return
  }

  if (new Date(extendForm.newEndTime) <= extendForm.currentEndTime) {
    ElMessage.warning('新截止时间必须晚于当前截止时间')
    return
  }

  submitLoading.value = true
  try {
    await extendExamDeadline({
      examAssignmentId: extendForm.id,
      newEndTime: extendForm.newEndTime
    })

    ElMessage.success('已成功延长截止时间')
    extendDeadlineDialogVisible.value = false
    fetchExams() // 刷新列表
  } catch (error) {
    console.error('延长截止时间失败:', error)
    ElMessage.error('延长截止时间失败')
  } finally {
    submitLoading.value = false
  }
}

// 发送提醒
const sendReminder = async exam => {
  try {
    await ElMessageBox.confirm(`确定要向 ${exam.candidateName} 发送考试提醒邮件吗？`, '发送提醒', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })

    await sendExamReminder(exam.id)
    ElMessage.success('提醒邮件已发送')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发送提醒失败:', error)
      ElMessage.error('发送提醒失败')
    }
  }
}

// 取消考试
const cancelExam = async examId => {
  try {
    await ElMessageBox.confirm('确定要取消此考试吗？此操作不可逆', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await cancelExamAPI(examId)
    ElMessage.success('考试已取消')
    fetchExams() // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消考试失败:', error)
      ElMessage.error('取消考试失败')
    }
  }
}

onMounted(() => {
  fetchJobs()
  fetchExams()
})
</script>

<style scoped>
.exam-management-page {
  width: 100%;
  background-color: #f5f9ff;
  min-height: calc(100vh - 72px);
}

.exam-management-container {
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
}

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

.exams-list {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.empty-container {
  padding: 40px;
  text-align: center;
}

.exam-title,
.job-name,
.candidate-name {
  color: #0352c9;
  cursor: pointer;
  font-weight: 500;
}

.exam-title:hover,
.job-name:hover,
.candidate-name:hover {
  text-decoration: underline;
}

.time-range {
  font-size: 13px;
  line-height: 1.5;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

.text-danger {
  color: #f56c6c;
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
