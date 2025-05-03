<template>
  <div class="job-detail-page">
    <div class="job-detail-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/job-management' }">岗位管理</el-breadcrumb-item>
          <el-breadcrumb-item>岗位详情</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 页面标题 -->
      <div class="page-header">
        <div class="title-section">
          <h1 class="page-title">{{ job.title || '岗位详情' }}</h1>
        </div>
        <div class="actions-section">
          <el-button @click="goBack">返回列表</el-button>
          <el-button type="primary" @click="editJob" v-if="job.id">
            <el-icon><Edit /></el-icon>
            编辑职位
          </el-button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton animated :rows="10" :loading="loading" />
      </div>

      <!-- 职位详情 -->
      <div v-else-if="job.id" class="job-detail-content">
        <el-card class="job-card">
          <template #header>
            <div class="job-header">
              <h2 class="job-title">{{ job.title }}</h2>
              <el-tag :type="getStatusType(job.status)">{{ getStatusLabel(job.status) }}</el-tag>
            </div>
          </template>

          <div class="job-info">
            <div class="job-meta">
              <div class="meta-item">
                <span class="label">薪资范围：</span>
                <span class="value">{{ formatSalary(job.salaryMin, job.salaryMax) }}</span>
              </div>
              <div class="meta-item">
                <span class="label">工作地点：</span>
                <span class="value"
                  >{{ job.city }}{{ job.address ? ' - ' + job.address : '' }}</span
                >
              </div>
              <div class="meta-item">
                <span class="label">工作经验：</span>
                <span class="value">{{
                  job.experienceReq ? `${job.experienceReq}年` : '不限'
                }}</span>
              </div>
              <div class="meta-item">
                <span class="label">学历要求：</span>
                <span class="value">{{ getEducationLabel(job.educationReq) }}</span>
              </div>
              <div class="meta-item">
                <span class="label">远程工作：</span>
                <span class="value">{{ job.isRemote ? '支持' : '不支持' }}</span>
              </div>
              <div class="meta-item">
                <span class="label">行业分类：</span>
                <span class="value">{{ job.subCategory?.name || '-' }}</span>
              </div>
              <div class="meta-item">
                <span class="label">发布时间：</span>
                <span class="value">{{ formatDate(job.createdAt) }}</span>
              </div>
              <div class="meta-item">
                <span class="label">更新时间：</span>
                <span class="value">{{ formatDate(job.updatedAt) }}</span>
              </div>
            </div>

            <div class="job-content">
              <div class="content-section">
                <h3 class="section-title">职位描述</h3>
                <div class="description">{{ job.description }}</div>
              </div>

              <div class="content-section">
                <h3 class="section-title">职位要求</h3>
                <div class="requirements">{{ job.requirements }}</div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 应用者统计区域 -->
        <el-card class="applicants-card">
          <template #header>
            <div class="card-header">
              <h3>应聘情况概览</h3>
            </div>
          </template>

          <div class="applicants-stats">
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="stat-card total-applicants">
                  <div class="stat-value">{{ job.applications?.length || 0 }}</div>
                  <div class="stat-label">总申请人数</div>
                  <el-button type="primary" link @click="viewApplicants">查看应聘者</el-button>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-card interviews">
                  <div class="stat-value">{{ interviewsCount }}</div>
                  <div class="stat-label">面试安排</div>
                  <el-button type="warning" link @click="viewInterviews">管理面试</el-button>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-card conversion">
                  <div class="stat-value">
                    {{
                      job.applications?.length
                        ? Math.round((interviewsCount / job.applications.length) * 100)
                        : 0
                    }}%
                  </div>
                  <div class="stat-label">面试转化率</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </div>

      <!-- 无数据 -->
      <div v-else class="empty-container">
        <el-empty description="暂无职位信息" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Edit } from '@element-plus/icons-vue'
import { getJobById } from '@/api/job'
import { formatDate } from '@/utils/formatDate'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const job = ref({})

// 计算面试数量
const interviewsCount = computed(() => {
  if (!job.value.applications) return 0

  // 统计有面试安排的申请数量
  return job.value.applications.filter(app => app.interviews && app.interviews.length > 0).length
})

// 获取职位详情
const fetchJobDetail = async () => {
  const jobId = route.params.id
  if (!jobId) {
    ElMessage.error('缺少职位ID参数')
    return
  }

  loading.value = true
  try {
    const response = await getJobById(jobId)
    job.value = response
  } catch (error) {
    console.error('获取职位详情失败:', error)
    ElMessage.error('获取职位详情失败')
  } finally {
    loading.value = false
  }
}

// 格式化薪资
const formatSalary = (min, max) => {
  if (!min && !max) return '面议'
  if (min === max) return `${min}K/月`
  return `${min}K-${max}K/月`
}

// 获取状态类型
const getStatusType = status => {
  switch (status) {
    case 'ACTIVE':
      return 'success'
    case 'FILLED':
      return 'warning'
    case 'EXPIRED':
      return 'info'
    default:
      return ''
  }
}

// 获取状态文本
const getStatusLabel = status => {
  switch (status) {
    case 'ACTIVE':
      return '招聘中'
    case 'FILLED':
      return '已招满'
    case 'EXPIRED':
      return '已过期'
    default:
      return '未知'
  }
}

// 获取教育要求文本
const getEducationLabel = education => {
  if (!education) return '不限'

  const educationMap = {
    HIGH_SCHOOL: '高中',
    ASSOCIATE: '大专',
    BACHELOR: '本科',
    MASTER: '硕士',
    DOCTORATE: '博士',
    OTHER: '其他'
  }

  return educationMap[education] || '不限'
}

// 返回职位列表
const goBack = () => {
  router.push('/job-management')
}

// 编辑职位
const editJob = () => {
  router.push(`/job-management?edit=${job.value.id}`)
}

// 查看应聘者
const viewApplicants = () => {
  router.push(`/candidate-management?jobId=${job.value.id}`)
}

// 查看面试安排
const viewInterviews = () => {
  router.push(`/interview-schedule?jobId=${job.value.id}`)
}

onMounted(() => {
  fetchJobDetail()
})
</script>

<style scoped>
.job-detail-page {
  padding: 20px;
}

.job-detail-container {
  max-width: 1200px;
  margin: 0 auto;
}

.breadcrumb-container {
  margin-bottom: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  margin: 0;
}

.job-card {
  margin-bottom: 24px;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.job-title {
  margin: 0;
  font-size: 20px;
}

.job-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.job-meta {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.value {
  font-size: 16px;
  font-weight: 500;
}

.content-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  margin-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.description,
.requirements {
  white-space: pre-line;
  line-height: 1.6;
}

.applicants-card {
  margin-top: 24px;
}

.applicants-stats .el-row {
  margin-bottom: 0;
}

.stat-card {
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
}

.loading-container {
  margin-top: 24px;
}

.empty-container {
  margin-top: 40px;
  padding: 40px 0;
}
</style>
