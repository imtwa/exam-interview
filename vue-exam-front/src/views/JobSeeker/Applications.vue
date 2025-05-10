<template>
  <div class="applications-page">
    <div class="applications-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>应聘记录</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 筛选区域 -->
      <div class="filter-container">
        <el-form :inline="true" class="filter-form">
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="选择状态" clearable>
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              @change="handleDateRangeChange"
            />
          </el-form-item>
          <el-form-item label="关键词">
            <el-input v-model="queryParams.keyword" placeholder="岗位/公司" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchApplications">搜索</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton animated :rows="10" :loading="loading" />
      </div>

      <!-- 应聘记录列表 -->
      <div v-else class="applications-list">
        <div v-if="showProfileWarning" class="profile-warning">
          <el-alert
            title="需要完善求职者资料"
            type="warning"
            description="您需要先完善求职者资料才能查看应聘记录和投递简历"
            show-icon
            :closable="false"
          >
            <template #default>
              <div class="alert-content">
                <div class="warning-text">
                  <p>系统无法找到您的求职者资料，请先完成以下步骤：</p>
                  <ol>
                    <li>完善基本信息</li>
                    <li>填写教育经历</li>
                    <li>添加工作经验（可选）</li>
                    <li>设置求职意向</li>
                  </ol>
                  <p>完成资料设置后，您将可以查看应聘记录和投递简历</p>
                </div>
                <el-button type="primary" @click="goToProfileSetup">去完善资料</el-button>
              </div>
            </template>
          </el-alert>
        </div>
        <div v-else-if="applications.length === 0" class="empty-container">
          <el-empty description="暂无应聘记录">
            <template #description>
              <p>您还没有提交过任何职位申请</p>
            </template>
            <el-button type="primary" @click="goToRecruitment">浏览招聘信息</el-button>
          </el-empty>
        </div>
        <div v-else>
          <el-table :data="applications" style="width: 100%" stripe>
            <el-table-column prop="jobTitle" label="应聘职位" min-width="160">
              <template #default="{ row }">
                <span class="job-title" @click="viewJobDetail(row.jobId)">{{ row.jobTitle }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="companyName" label="公司" min-width="140">
              <template #default="{ row }">
                <div class="company-info">
                  <span>{{ row.companyName }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="salary" label="薪资" width="120">
              <template #default="{ row }">
                {{ row.salary || '面议' }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="applyDate" label="申请时间" width="120">
              <template #default="{ row }">
                {{ formatDate(row.applyDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="lastUpdateDate" label="最后更新" width="120">
              <template #default="{ row }">
                {{ formatDate(row.lastUpdateDate) }}
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="150">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="viewApplicationDetail(row.id)">
                  查看详情
                </el-button>
                <el-button
                  v-if="row.status === 'pending'"
                  link
                  type="danger"
                  size="small"
                  @click="withdrawApplication(row.id)"
                >
                  撤回申请
                </el-button>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserApplications, withdrawApplication as withdrawApplicationApi } from '@/api/job'
import { getJobseekerProfile } from '@/api/jobseeker'

const router = useRouter()
const loading = ref(false)
const applications = ref([])
const total = ref(0)
const dateRange = ref([])
const showProfileWarning = ref(false)

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  status: '',
  startDate: '',
  endDate: '',
  keyword: ''
})

// 状态选项
const statusOptions = [
  { label: '简历筛选', value: 'RESUME_SCREENING' },
  { label: '笔试中', value: 'WRITTEN_TEST' },
  { label: '一面中', value: 'FIRST_INTERVIEW' },
  { label: '二面中', value: 'SECOND_INTERVIEW' },
  { label: 'HR面试', value: 'HR_INTERVIEW' },
  { label: '已录用', value: 'OFFER' },
  { label: '已拒绝', value: 'REJECTED' }
]

// 检查用户是否已设置求职者资料
const checkJobseekerProfile = async () => {
  try {
    await getJobseekerProfile()
    return true
  } catch (error) {
    console.error('获取求职者资料失败:', error)
    return false
  }
}

// 获取应聘记录列表
const fetchApplications = async () => {
  loading.value = true
  showProfileWarning.value = false // 重置警告状态

  try {
    // 先检查用户是否已设置求职者资料
    const hasProfile = await checkJobseekerProfile()
    if (!hasProfile) {
      showProfileWarning.value = true
      loading.value = false
      return
    }

    const response = await getUserApplications(queryParams)

    // 处理返回的数据
    if (response.list) {
      applications.value = response.list
      total.value = response.total || 0
    } else {
      // 如果返回格式不符合预期，显示空列表
      applications.value = []
      total.value = 0
      console.warn('API返回格式不符合预期:', response)
    }
  } catch (error) {
    console.error('获取应聘记录失败:', error)

    // 处理不同类型的错误
    if (error.response) {
      console.error('错误响应:', error.response.data)

      const errorMsg = error.response.data.message || '未知错误'

      // 检查是否是求职者资料相关的错误
      if (
        errorMsg === '查询求职者失败' ||
        errorMsg.includes('求职者不存在') ||
        errorMsg.includes('jobseeker') ||
        error.response.status === 404
      ) {
        showProfileWarning.value = true
        ElMessage.warning('您需要先完善求职者资料')
      } else if (error.response.status === 401) {
        // 未授权错误
        ElMessage.error('您的登录已过期，请重新登录')
        // 可以选择重定向到登录页面
        // router.push('/login')
      } else if (error.response.status === 403) {
        // 权限错误
        ElMessage.error('您没有权限查看此内容')
      } else {
        // 其他API错误
        ElMessage.error(`获取应聘记录失败: ${errorMsg}`)
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      ElMessage.error('服务器未响应，请检查网络连接')
    } else {
      // 请求设置错误
      ElMessage.error('请求错误，请稍后再试')
    }

    // 显示一个空列表
    applications.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 处理日期范围变化
const handleDateRangeChange = val => {
  if (val) {
    queryParams.startDate = val[0]
    queryParams.endDate = val[1]
  } else {
    queryParams.startDate = ''
    queryParams.endDate = ''
  }
}

// 分页相关方法
const handleSizeChange = newSize => {
  queryParams.pageSize = newSize
  fetchApplications()
}

const handleCurrentChange = newPage => {
  queryParams.page = newPage
  fetchApplications()
}

// 重置筛选条件
const resetFilters = () => {
  queryParams.status = ''
  queryParams.startDate = ''
  queryParams.endDate = ''
  queryParams.keyword = ''
  dateRange.value = []
  fetchApplications()
}

// 查看职位详情
const viewJobDetail = jobId => {
  router.push(`/job/${jobId}`)
}

// 查看应聘详情
const viewApplicationDetail = applicationId => {
  router.push(`/application/${applicationId}`)
}

// 撤回申请
const withdrawApplication = async applicationId => {
  try {
    await ElMessageBox.confirm('确定要撤回该申请吗？', '撤回申请', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    loading.value = true
    const response = await withdrawApplicationApi(applicationId)
    console.log('撤回申请响应:', response)
    ElMessage.success('申请已成功撤回')
    await fetchApplications() // 重新加载数据
  } catch (error) {
    if (error === 'cancel') {
      return // 用户取消操作，不显示错误
    }

    console.error('撤回申请失败:', error)

    // 处理不同类型的错误
    if (error.response) {
      const errorMsg = error.response.data.message || '未知错误'
      console.error('错误响应:', error.response.data)

      if (error.response.status === 401) {
        ElMessage.error('您的登录已过期，请重新登录')
      } else if (error.response.status === 403) {
        ElMessage.error('您没有权限执行此操作')
      } else if (errorMsg.includes('求职者不存在') || errorMsg.includes('找不到申请记录')) {
        ElMessage.error('该申请记录不存在或已被处理')
      } else {
        ElMessage.error(`撤回申请失败: ${errorMsg}`)
      }
    } else if (error.request) {
      ElMessage.error('服务器未响应，请检查网络连接')
    } else {
      ElMessage.error('操作失败，请稍后再试')
    }
  } finally {
    loading.value = false
  }
}

// 跳转到招聘页面
const goToRecruitment = () => {
  router.push('/recruitment')
}

// 跳转到个人资料设置页面
const goToProfileSetup = () => {
  router.push('/job-seeker/profile-setup')
}

// 获取状态标签
const getStatusLabel = status => {
  const statusMap = {
    RESUME_SCREENING: '简历筛选',
    WRITTEN_TEST: '笔试中',
    FIRST_INTERVIEW: '一面中',
    SECOND_INTERVIEW: '二面中',
    HR_INTERVIEW: 'HR面试',
    OFFER: '已录用',
    REJECTED: '已拒绝'
  }
  return statusMap[status] || '未知状态'
}

// 获取状态类型（用于标签颜色）
const getStatusType = status => {
  const typeMap = {
    RESUME_SCREENING: 'info',
    WRITTEN_TEST: 'warning',
    FIRST_INTERVIEW: 'primary',
    SECOND_INTERVIEW: 'primary',
    HR_INTERVIEW: 'warning',
    OFFER: 'success',
    REJECTED: 'danger'
  }
  return typeMap[status] || 'info'
}

// 格式化日期
const formatDate = dateString => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('日期格式化错误:', error)
    return dateString
  }
}

onMounted(() => {
  fetchApplications()
})
</script>

<style lang="less" scoped>
.applications-page {
  width: 100%;
  background-color: #f5f9ff;
  min-height: calc(100vh - 72px);
}

.applications-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.breadcrumb-container {
  margin-bottom: 20px;
  font-size: 14px;
}

.page-header {
  margin-bottom: 24px;

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
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;

  :deep(.el-form-item) {
    margin-right: 0;
    margin-bottom: 0;
    min-width: 200px;
  }

  :deep(.el-select) {
    width: 200px;
  }

  :deep(.el-date-editor) {
    width: 200px;
  }
}

.loading-container {
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.applications-list {
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

.job-title {
  color: #0352c9;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.company-info {
  display: flex;
  align-items: center;

  .company-logo {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    margin-right: 8px;
    object-fit: contain;
  }
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

.profile-warning {
  margin-bottom: 24px;

  :deep(.el-alert) {
    border-radius: 8px;
  }

  .alert-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 12px 0;

    .warning-text {
      flex: 1;

      p {
        margin: 0 0 8px 0;
        line-height: 1.5;
      }

      ol {
        margin: 8px 0;
        padding-left: 20px;

        li {
          margin-bottom: 4px;
        }
      }
    }

    .el-button {
      margin-left: 16px;
      white-space: nowrap;
    }
  }
}
</style>
