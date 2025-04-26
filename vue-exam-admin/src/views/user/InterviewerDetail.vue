<template>
  <div class="interviewer-detail-page">
    <el-page-header @back="goBack">
      <template #content>
        <span class="page-title">面试官详情</span>
      </template>
    </el-page-header>

    <el-card class="detail-card" v-loading="loading">
      <template v-if="interviewer">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-descriptions title="面试官信息" :column="2" border>
              <el-descriptions-item label="面试官ID">{{ interviewer.id }}</el-descriptions-item>
              <el-descriptions-item label="用户名">
                {{ interviewer.user?.username }}
              </el-descriptions-item>
              <el-descriptions-item label="邮箱">
                {{ interviewer.user?.email }}
              </el-descriptions-item>
              <el-descriptions-item label="性别">
                {{ getGenderText(interviewer.gender) }}
              </el-descriptions-item>
              <el-descriptions-item label="职位">{{ interviewer.position }}</el-descriptions-item>
              <el-descriptions-item label="所属公司">
                {{ interviewer.company?.name }}
              </el-descriptions-item>
              <el-descriptions-item label="认证状态">
                <el-tag :type="getStatusType(interviewer.verificationStatus) || 'info'">
                  {{ getStatusText(interviewer.verificationStatus) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">
                {{ formatDate(interviewer.createdAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="最后更新">
                {{ formatDate(interviewer.updatedAt) }}
              </el-descriptions-item>
            </el-descriptions>

            <div class="action-buttons">
              <el-button type="primary" @click="editBasicInfo">编辑基本信息</el-button>
              <el-button
                v-if="interviewer.verificationStatus === 'PENDING'"
                type="success"
                @click="handleVerifyStatus('VERIFIED')"
              >
                通过认证
              </el-button>
              <el-button
                v-if="interviewer.verificationStatus === 'PENDING'"
                type="danger"
                @click="handleVerifyStatus('REJECTED')"
              >
                拒绝认证
              </el-button>
              <el-button
                v-if="interviewer.verificationStatus === 'REJECTED'"
                type="warning"
                @click="handleVerifyStatus('PENDING')"
              >
                重新审核
              </el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane label="发布的职位" name="jobs">
            <div class="list-header">
              <h3>发布的职位列表</h3>
            </div>
            <el-table :data="jobs" style="width: 100%" v-loading="jobsLoading">
              <el-table-column prop="id" label="职位ID" width="80" />
              <el-table-column prop="title" label="职位名称" min-width="150" />
              <el-table-column label="公司名称" min-width="150">
                <template #default="scope">
                  {{ scope.row.company?.name }}
                </template>
              </el-table-column>
              <el-table-column prop="city" label="城市" width="100" />
              <el-table-column label="薪资范围" width="120">
                <template #default="scope">
                  {{ formatSalary(scope.row.salaryMin, scope.row.salaryMax) }}
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getJobStatusType(scope.row.status) || 'info'">
                    {{ getJobStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="viewJob(scope.row)" link>
                    查看
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="jobsPage"
                v-model:page-size="jobsPageSize"
                :page-sizes="[5, 10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="jobsTotal"
                @size-change="handleJobsSizeChange"
                @current-change="handleJobsPageChange"
              />
            </div>
          </el-tab-pane>

          <el-tab-pane label="面试安排" name="interviews">
            <div class="list-header">
              <h3>面试安排列表</h3>
            </div>
            <el-table :data="interviews" style="width: 100%" v-loading="interviewsLoading">
              <el-table-column prop="id" label="面试ID" width="80" />
              <el-table-column label="求职者" min-width="120">
                <template #default="scope">
                  {{ scope.row.application?.jobSeeker?.user?.username }}
                </template>
              </el-table-column>
              <el-table-column label="职位名称" min-width="150">
                <template #default="scope">
                  {{ scope.row.application?.job?.title }}
                </template>
              </el-table-column>
              <el-table-column label="面试时间" width="180">
                <template #default="scope">
                  {{ formatDate(scope.row.scheduleTime) }}
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getInterviewStatusType(scope.row.status) || 'info'">
                    {{ getInterviewStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="viewInterview(scope.row)" link>
                    查看
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="interviewsPage"
                v-model:page-size="interviewsPageSize"
                :page-sizes="[5, 10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="interviewsTotal"
                @size-change="handleInterviewsSizeChange"
                @current-change="handleInterviewsPageChange"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </template>
      <template v-else>
        <el-empty description="未找到面试官信息" />
      </template>
    </el-card>

    <!-- 编辑基本信息弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑面试官信息"
      width="50%"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" disabled />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="form.gender" placeholder="请选择性别" style="width: 100%">
            <el-option label="男" value="MALE" />
            <el-option label="女" value="FEMALE" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="form.position" />
        </el-form-item>
        <el-form-item label="所属公司" prop="companyId">
          <el-select v-model="form.companyId" placeholder="请选择公司" style="width: 100%">
            <el-option
              v-for="item in companies"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="认证状态" prop="verificationStatus">
          <el-select v-model="form.verificationStatus" placeholder="请选择认证状态" style="width: 100%">
            <el-option label="待认证" value="PENDING" />
            <el-option label="已认证" value="VERIFIED" />
            <el-option label="已拒绝" value="REJECTED" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { InterviewerService, CompanyService, JobPostingService, InterviewService } from '@/api/userApi'
import { Interviewer, Company, JobPosting, Interview } from '@/api/model/userModel'
import { ElMessage, FormRules, FormInstance } from 'element-plus'

const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)

// 数据状态
const loading = ref(false)
const interviewer = ref<Interviewer | null>(null)
const activeTab = ref('basic')

// 公司列表
const companies = ref<Company[]>([])

// 职位列表
const jobs = ref<JobPosting[]>([])
const jobsLoading = ref(false)
const jobsPage = ref(1)
const jobsPageSize = ref(10)
const jobsTotal = ref(0)

// 面试列表
const interviews = ref<Interview[]>([])
const interviewsLoading = ref(false)
const interviewsPage = ref(1)
const interviewsPageSize = ref(10)
const interviewsTotal = ref(0)

// 编辑弹窗
const editDialogVisible = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({
  username: '',
  email: '',
  gender: '',
  position: '',
  companyId: '',
  verificationStatus: ''
})

// 表单验证规则
const rules = reactive<FormRules>({
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  position: [{ required: true, message: '请输入职位', trigger: 'blur' }],
  companyId: [{ required: true, message: '请选择公司', trigger: 'change' }],
  verificationStatus: [{ required: true, message: '请选择认证状态', trigger: 'change' }]
})

// 初始化数据
onMounted(async () => {
  await fetchData()
  await fetchCompanies()
  if (activeTab.value === 'jobs') {
    fetchJobs()
  }
})

// 获取面试官详情
const fetchData = async () => {
  loading.value = true
  try {
    const res = await InterviewerService.getInterviewerById(id)
    if (res.success && res.data) {
      interviewer.value = res.data
    } else {
      ElMessage.error(res.message || '获取面试官信息失败')
    }
  } catch (error) {
    console.error('获取面试官详情失败', error)
    ElMessage.error('获取面试官信息失败')
  } finally {
    loading.value = false
  }
}

// 获取公司列表
const fetchCompanies = async () => {
  try {
    const res = await CompanyService.getCompanyList({ page: 1, size: 100 })
    if (res.success && res.data) {
      companies.value = res.data.records || []
    }
  } catch (error) {
    console.error('获取公司列表失败', error)
  }
}

// 获取职位列表
const fetchJobs = async () => {
  if (!id) return
  
  jobsLoading.value = true
  try {
    const res = await JobPostingService.getJobsByInterviewer(id, {
      page: jobsPage.value,
      size: jobsPageSize.value
    })
    
    if (res.success && res.data) {
      jobs.value = res.data.records || []
      jobsTotal.value = res.data.total || 0
    }
  } catch (error) {
    console.error('获取职位列表失败', error)
    ElMessage.error('获取职位列表失败')
  } finally {
    jobsLoading.value = false
  }
}

// 获取面试列表
const fetchInterviews = async () => {
  if (!id) return
  
  interviewsLoading.value = true
  try {
    const res = await InterviewService.getInterviewsByInterviewer(id, {
      page: interviewsPage.value,
      size: interviewsPageSize.value
    })
    
    if (res.success && res.data) {
      interviews.value = res.data.records || []
      interviewsTotal.value = res.data.total || 0
    }
  } catch (error) {
    console.error('获取面试列表失败', error)
    ElMessage.error('获取面试列表失败')
  } finally {
    interviewsLoading.value = false
  }
}

// 标签页切换
const handleTabChange = (tab: string) => {
  if (tab === 'jobs' && jobs.value.length === 0) {
    fetchJobs()
  } else if (tab === 'interviews' && interviews.value.length === 0) {
    fetchInterviews()
  }
}

// 职位分页处理
const handleJobsSizeChange = (size: number) => {
  jobsPageSize.value = size
  fetchJobs()
}

const handleJobsPageChange = (page: number) => {
  jobsPage.value = page
  fetchJobs()
}

// 面试分页处理
const handleInterviewsSizeChange = (size: number) => {
  interviewsPageSize.value = size
  fetchInterviews()
}

const handleInterviewsPageChange = (page: number) => {
  interviewsPage.value = page
  fetchInterviews()
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 格式化时间
const formatDate = (date: string) => {
  if (!date) return '--'
  return new Date(date)
    .toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    .replace(/\//g, '-')
}

// 格式化薪资
const formatSalary = (min?: number, max?: number) => {
  if (!min && !max) return '--'
  if (min && !max) return `${min}K+`
  if (!min && max) return `${max}K以下`
  return `${min}K-${max}K`
}

// 性别文本
const getGenderText = (gender?: string) => {
  const map: Record<string, string> = {
    MALE: '男',
    FEMALE: '女',
    OTHER: '其他'
  }
  return gender ? map[gender] || '--' : '--'
}

// 认证状态文本
const getStatusText = (status?: string) => {
  const map: Record<string, string> = {
    PENDING: '待认证',
    VERIFIED: '已认证',
    REJECTED: '已拒绝'
  }
  return status ? map[status] || '--' : '--'
}

// 认证状态类型
const getStatusType = (status?: string) => {
  const map: Record<string, string> = {
    PENDING: 'warning',
    VERIFIED: 'success',
    REJECTED: 'danger'
  }
  return status ? map[status] : ''
}

// 职位状态文本
const getJobStatusText = (status?: string) => {
  const map: Record<string, string> = {
    ACTIVE: '招聘中',
    FILLED: '已招满',
    EXPIRED: '已过期',
    CLOSED: '已关闭'
  }
  return status ? map[status] || '--' : '--'
}

// 职位状态类型
const getJobStatusType = (status?: string) => {
  const map: Record<string, string> = {
    ACTIVE: 'success',
    FILLED: 'info',
    EXPIRED: 'warning',
    CLOSED: 'danger'
  }
  return status ? map[status] : ''
}

// 面试状态文本
const getInterviewStatusText = (status?: string) => {
  const map: Record<string, string> = {
    PENDING: '待确认',
    CONFIRMED: '已确认',
    COMPLETED: '已完成',
    CANCELED: '已取消'
  }
  return status ? map[status] || '--' : '--'
}

// 面试状态类型
const getInterviewStatusType = (status?: string) => {
  const map: Record<string, string> = {
    PENDING: 'warning',
    CONFIRMED: 'primary',
    COMPLETED: 'success',
    CANCELED: 'info'
  }
  return status ? map[status] : ''
}

// 编辑基本信息
const editBasicInfo = () => {
  if (!interviewer.value) return
  
  form.username = interviewer.value.user?.username || ''
  form.email = interviewer.value.user?.email || ''
  form.gender = interviewer.value.gender || ''
  form.position = interviewer.value.position || ''
  form.companyId = interviewer.value.companyId?.toString() || ''
  form.verificationStatus = interviewer.value.verificationStatus || ''
  
  editDialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitLoading.value = true
    try {
      const res = await InterviewerService.updateInterviewer(id, {
        email: form.email,
        gender: form.gender,
        position: form.position,
        companyId: Number(form.companyId),
        verificationStatus: form.verificationStatus
      })
      
      if (res.success) {
        ElMessage.success('更新成功')
        editDialogVisible.value = false
        fetchData()
      } else {
        ElMessage.error(res.message || '更新失败')
      }
    } catch (error) {
      console.error('更新面试官信息失败', error)
      ElMessage.error('更新失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 处理认证状态
const handleVerifyStatus = async (status: string) => {
  try {
    const res = await InterviewerService.updateInterviewerStatus(id, { status })
    
    if (res.success) {
      ElMessage.success('状态更新成功')
      fetchData()
    } else {
      ElMessage.error(res.message || '状态更新失败')
    }
  } catch (error) {
    console.error('更新认证状态失败', error)
    ElMessage.error('状态更新失败')
  }
}

// 查看职位详情
const viewJob = (job: JobPosting) => {
  router.push(`/recruitment/job/${job.id}`)
}

// 查看面试详情
const viewInterview = (interview: Interview) => {
  router.push(`/recruitment/interview/${interview.id}`)
}

// 监听标签页变化
watch(activeTab, (newValue) => {
  handleTabChange(newValue)
})
</script>

<style lang="scss" scoped>
.interviewer-detail-page {
  padding: 20px;
  
  .page-title {
    font-size: 18px;
    font-weight: 600;
  }
  
  .detail-card {
    margin-top: 20px;
  }
  
  .action-buttons {
    margin-top: 20px;
    display: flex;
    gap: 10px;
  }
  
  .list-header {
    margin-bottom: 15px;
    
    h3 {
      margin: 0;
      font-size: 16px;
    }
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style> 