<template>
  <div class="interviewer-detail-page">
    <el-page-header @back="goBack" :title="`面试官详情 - ${interviewer?.user?.username || ''}`">
      <template #extra>
        <el-button-group>
          <el-button type="primary" @click="handleEdit">编辑资料</el-button>
          <el-button type="success" @click="handleViewJobs">查看发布职位</el-button>
          <el-button type="info" @click="handleViewApplications">查看收到申请</el-button>
        </el-button-group>
      </template>
    </el-page-header>

    <div class="content-container" v-loading="loading">
      <!-- 基本信息卡片 -->
      <el-card class="box-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
            <el-tag :type="getStatusType(interviewer?.verificationStatus)">
              {{ getStatusText(interviewer?.verificationStatus) }}
            </el-tag>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">
            {{ interviewer?.user?.username || '--' }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱">
            {{ interviewer?.user?.email || '--' }}
          </el-descriptions-item>
          <el-descriptions-item label="性别">
            {{ getGenderText(interviewer?.gender) }}
          </el-descriptions-item>
          <el-descriptions-item label="职位">
            {{ interviewer?.position || '--' }}
          </el-descriptions-item>
          <el-descriptions-item label="所属公司">
            {{ interviewer?.company?.name || '--' }}
          </el-descriptions-item>
          <el-descriptions-item label="注册时间">
            {{ formatDate(interviewer?.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 公司信息卡片 -->
      <el-card class="box-card" shadow="hover" v-if="interviewer?.company">
        <template #header>
          <div class="card-header">
            <span>公司信息</span>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="公司名称">
            {{ interviewer?.company?.name || '--' }}
          </el-descriptions-item>
          <el-descriptions-item label="公司地址">
            {{ interviewer?.company?.address || '--' }}
          </el-descriptions-item>
          <el-descriptions-item label="融资阶段">
            {{ getFundingStageText(interviewer?.company?.fundingStage) }}
          </el-descriptions-item>
          <el-descriptions-item label="公司规模">
            {{ getCompanySizeText(interviewer?.company?.size) }}
          </el-descriptions-item>
          <el-descriptions-item label="所属行业">
            {{ interviewer?.company?.industry || '--' }}
          </el-descriptions-item>
          <el-descriptions-item label="成立年份">
            {{ interviewer?.company?.foundedYear || '--' }}
          </el-descriptions-item>
          <el-descriptions-item label="公司简介" :span="2">
            {{ interviewer?.company?.description || '--' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 统计信息卡片 -->
      <el-card class="box-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>统计信息</span>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-title">发布职位</div>
              <div class="stat-value">{{ stats.jobCount }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-title">收到申请</div>
              <div class="stat-value">{{ stats.applicationCount }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-title">面试场次</div>
              <div class="stat-value">{{ stats.interviewCount }}</div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 最近发布的职位 -->
      <el-card class="box-card" shadow="hover" v-if="recentJobs.length > 0">
        <template #header>
          <div class="card-header">
            <span>最近发布的职位</span>
            <el-button type="primary" link @click="handleViewJobs">查看全部</el-button>
          </div>
        </template>
        <el-table :data="recentJobs" style="width: 100%">
          <el-table-column prop="title" label="职位名称" min-width="150" />
          <el-table-column label="薪资范围" width="150">
            <template #default="scope">
              {{ formatSalary(scope.row.salaryMin, scope.row.salaryMax) }}
            </template>
          </el-table-column>
          <el-table-column prop="city" label="工作城市" width="120" />
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getJobStatusType(scope.row.status)">
                {{ getJobStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="发布时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.createdAt) }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 编辑面试官对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑面试官资料"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="right"
      >
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
          <el-select
            v-model="form.verificationStatus"
            placeholder="请选择认证状态"
            style="width: 100%"
          >
            <el-option label="待认证" value="PENDING" />
            <el-option label="已认证" value="VERIFIED" />
            <el-option label="已拒绝" value="REJECTED" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage, FormInstance, FormRules } from 'element-plus'
  import { InterviewerService } from '@/api/interviewerService'
  import { CompanyService } from '@/api/companyService'
  import { JobPostingService } from '@/api/jobPostingService'
  import { Interviewer, Company, JobPosting } from '@/api/model/userModel'

  const route = useRoute()
  const router = useRouter()
  const interviewerId = ref<number>(Number(route.params.id))

  // 面试官信息
  const interviewer = ref<Interviewer | null>(null)
  const loading = ref(false)

  // 统计信息
  const stats = reactive({
    jobCount: 0,
    applicationCount: 0,
    interviewCount: 0
  })

  // 最近发布的职位
  const recentJobs = ref<JobPosting[]>([])

  // 公司列表
  const companies = ref<Company[]>([])

  // 编辑表单
  const dialogVisible = ref(false)
  const submitLoading = ref(false)
  const formRef = ref<FormInstance>()
  const form = reactive({
    id: '',
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
    position: [{ required: true, message: '请输入职位', trigger: 'blur' }],
    companyId: [{ required: true, message: '请选择公司', trigger: 'change' }],
    verificationStatus: [{ required: true, message: '请选择认证状态', trigger: 'change' }]
  })

  // 初始化
  onMounted(() => {
    fetchInterviewerDetail()
    fetchCompanies()
    fetchRecentJobs()
    fetchStats()
  })

  // 获取面试官详情
  const fetchInterviewerDetail = async () => {
    if (!interviewerId.value) return

    loading.value = true
    try {
      const res = await InterviewerService.getInterviewerDetail(interviewerId.value)
      if (res.code === 200) {
        interviewer.value = res.data
      } else {
        ElMessage.error(res.message || '获取面试官详情失败')
      }
    } catch (error) {
      console.error('获取面试官详情失败', error)
      ElMessage.error('获取面试官详情失败')
    } finally {
      loading.value = false
    }
  }

  // 获取公司列表
  const fetchCompanies = async () => {
    try {
      const res = await CompanyService.getCompanyList({
        page: 1,
        size: 100
      })

      if (res.code === 200) {
        companies.value = res.data || []
      }
    } catch (error) {
      console.error('获取公司列表失败', error)
    }
  }

  // 获取最近发布的职位
  const fetchRecentJobs = async () => {
    if (!interviewerId.value) return

    try {
      const res = await JobPostingService.getJobPostingList({
        page: 1,
        size: 5,
        interviewerId: interviewerId.value
      })

      if (res.code === 200) {
        recentJobs.value = res.data || []
      }
    } catch (error) {
      console.error('获取最近职位失败', error)
    }
  }

  // 获取统计信息
  const fetchStats = async () => {
    if (!interviewerId.value) return

    // 这里假设有一个获取统计信息的API，实际项目中需要根据实际API调整
    // 如果没有专门的统计API，可以通过多个请求组合获取数据
    try {
      // 获取职位数量
      const jobRes = await JobPostingService.getJobPostingList({
        page: 1,
        size: 1,
        interviewerId: interviewerId.value
      })

      if (jobRes.code === 200) {
        stats.jobCount = jobRes.total || 0
      }

      // 获取申请数量和面试数量可以通过类似方式实现
      // 这里使用模拟数据
      stats.applicationCount = 12
      stats.interviewCount = 5
    } catch (error) {
      console.error('获取统计信息失败', error)
    }
  }

  // 返回上一页
  const goBack = () => {
    router.back()
  }

  // 编辑面试官
  const handleEdit = () => {
    if (!interviewer.value) return

    form.id = interviewer.value.id?.toString() || ''
    form.username = interviewer.value.user?.username || ''
    form.email = interviewer.value.user?.email || ''
    form.gender = interviewer.value.gender || ''
    form.position = interviewer.value.position || ''
    form.companyId = interviewer.value.companyId?.toString() || ''
    form.verificationStatus = interviewer.value.verificationStatus || ''

    dialogVisible.value = true
  }

  // 查看面试官发布的职位
  const handleViewJobs = () => {
    if (!interviewerId.value) return
    router.push({
      path: '/recruitment/jobs',
      query: { interviewerId: interviewerId.value.toString() }
    })
  }

  // 查看面试官收到的申请
  const handleViewApplications = () => {
    if (!interviewerId.value) return
    router.push({
      path: '/recruitment/applications',
      query: { interviewerId: interviewerId.value.toString() }
    })
  }

  // 提交表单
  const submitForm = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (!valid) return

      submitLoading.value = true
      try {
        const data = {
          email: form.email,
          gender: form.gender,
          position: form.position,
          companyId: Number(form.companyId),
          verificationStatus: form.verificationStatus
        }

        const res = await InterviewerService.updateProfile({
          ...data,
          id: Number(form.id)
        })

        if (res.code === 200) {
          ElMessage.success('更新成功')
          dialogVisible.value = false
          fetchInterviewerDetail()
        } else {
          ElMessage.error(res.message || '更新失败')
        }
      } catch (error) {
        console.error('更新面试官资料失败', error)
        ElMessage.error('更新失败')
      } finally {
        submitLoading.value = false
      }
    })
  }

  // 格式化日期
  const formatDate = (date: string | undefined) => {
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

  // 获取性别文本
  const getGenderText = (gender: string | undefined) => {
    if (!gender) return '--'
    const map: Record<string, string> = {
      MALE: '男',
      FEMALE: '女',
      OTHER: '其他'
    }
    return map[gender] || '--'
  }

  // 获取状态文本
  const getStatusText = (status: string | undefined) => {
    if (!status) return '--'
    const map: Record<string, string> = {
      PENDING: '待认证',
      VERIFIED: '已认证',
      REJECTED: '已拒绝'
    }
    return map[status] || '--'
  }

  // 获取状态类型
  const getStatusType = (status: string | undefined) => {
    if (!status) return ''
    const map: Record<string, string> = {
      PENDING: 'warning',
      VERIFIED: 'success',
      REJECTED: 'danger'
    }
    return map[status] || ''
  }

  // 获取职位状态文本
  const getJobStatusText = (status: string | undefined) => {
    if (!status) return '--'
    const map: Record<string, string> = {
      ACTIVE: '招聘中',
      FILLED: '已招满',
      EXPIRED: '已过期'
    }
    return map[status] || '--'
  }

  // 获取职位状态类型
  const getJobStatusType = (status: string | undefined) => {
    if (!status) return ''
    const map: Record<string, string> = {
      ACTIVE: 'success',
      FILLED: 'info',
      EXPIRED: 'danger'
    }
    return map[status] || ''
  }

  // 获取融资阶段文本
  const getFundingStageText = (stage: string | undefined) => {
    if (!stage) return '--'
    const map: Record<string, string> = {
      UNFUNDED: '未融资',
      ANGEL: '天使轮',
      SERIES_A: 'A轮',
      SERIES_B: 'B轮',
      SERIES_C: 'C轮',
      SERIES_D: 'D轮及以上',
      IPO: '已上市',
      SELF_FUNDED: '自筹资金'
    }
    return map[stage] || '--'
  }

  // 获取公司规模文本
  const getCompanySizeText = (size: string | undefined) => {
    if (!size) return '--'
    const map: Record<string, string> = {
      TINY: '1-10人',
      SMALL: '11-50人',
      MEDIUM: '51-200人',
      LARGE: '201-500人',
      XLARGE: '501-1000人',
      XXLARGE: '1000人以上'
    }
    return map[size] || '--'
  }
</script>

<style scoped>
  .interviewer-detail-page {
    padding: 20px;
  }

  .content-container {
    margin-top: 20px;
  }

  .box-card {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stat-item {
    text-align: center;
    padding: 20px 0;
  }

  .stat-title {
    font-size: 14px;
    color: #909399;
    margin-bottom: 10px;
  }

  .stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #409eff;
  }
</style>
