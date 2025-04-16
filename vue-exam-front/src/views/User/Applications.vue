<template>
  <div class="applications-page">
    <div class="applications-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/profile' }">个人中心</el-breadcrumb-item>
          <el-breadcrumb-item>应聘记录</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">我的应聘记录</h1>
        <p class="page-description">这里列出了您所有的应聘申请记录及其状态</p>
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
        <div v-if="applications.length === 0" class="empty-container">
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

const router = useRouter()
const loading = ref(false)
const applications = ref([])
const total = ref(0)
const dateRange = ref([])

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
  { label: '待处理', value: 'pending' },
  { label: '筛选中', value: 'screening' },
  { label: '面试中', value: 'interview' },
  { label: '已录用', value: 'offer' },
  { label: '已拒绝', value: 'rejected' },
  { label: '已撤回', value: 'withdrawn' }
]

// 获取应聘记录列表
const fetchApplications = async () => {
  loading.value = true
  try {
    // 这里需要实现从API获取应聘记录的功能
    // const response = await getApplications(queryParams)
    // applications.value = response.items || []
    // total.value = response.total || 0

    // 模拟数据，实际项目中应替换为API调用
    setTimeout(() => {
      applications.value = [
        {
          id: 1,
          jobId: 101,
          jobTitle: '前端开发工程师',
          companyName: '腾讯科技有限公司',
          salary: '25k-35k',
          status: 'pending',
          applyDate: '2023-08-15T08:30:00',
          lastUpdateDate: '2023-08-15T08:30:00'
        },
        {
          id: 2,
          jobId: 102,
          jobTitle: '后端开发工程师',
          companyName: '字节跳动有限公司',
          salary: '30k-45k',
          status: 'interview',
          applyDate: '2023-08-10T14:20:00',
          lastUpdateDate: '2023-08-12T10:15:00'
        },
        {
          id: 3,
          jobId: 103,
          jobTitle: '全栈开发工程师',
          companyName: '百度科技有限公司',
          salary: '35k-50k',
          status: 'rejected',
          applyDate: '2023-08-05T09:15:00',
          lastUpdateDate: '2023-08-08T16:40:00'
        },
        {
          id: 4,
          jobId: 104,
          jobTitle: '资深前端工程师',
          companyName: '阿里巴巴集团',
          salary: '40k-60k',
          status: 'offer',
          applyDate: '2023-07-20T11:30:00',
          lastUpdateDate: '2023-08-10T09:20:00'
        },
        {
          id: 5,
          jobId: 105,
          jobTitle: '前端架构师',
          companyName: '京东科技',
          salary: '50k-70k',
          status: 'screening',
          applyDate: '2023-08-18T10:00:00',
          lastUpdateDate: '2023-08-18T15:45:00'
        }
      ]
      total.value = 5
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('获取应聘记录失败:', error)
    ElMessage.error('获取应聘记录失败，请稍后再试')
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

// 撤回应聘申请
const withdrawApplication = async applicationId => {
  try {
    await ElMessageBox.confirm('确定要撤回这份应聘申请吗？', '撤回申请', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 这里需要实现撤回应聘申请的API调用
    // await withdrawApplicationApi(applicationId)

    // 模拟API调用成功
    ElMessage.success('已成功撤回申请')

    // 更新列表
    fetchApplications()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('撤回应聘申请失败:', error)
      ElMessage.error('操作失败，请稍后再试')
    }
  }
}

// 跳转到招聘页面
const goToRecruitment = () => {
  router.push('/recruitment')
}

// 获取状态标签
const getStatusLabel = status => {
  const statusMap = {
    pending: '待处理',
    screening: '筛选中',
    interview: '面试中',
    offer: '已录用',
    rejected: '已拒绝',
    withdrawn: '已撤回'
  }
  return statusMap[status] || '未知状态'
}

// 获取状态类型（用于标签颜色）
const getStatusType = status => {
  const typeMap = {
    pending: 'info',
    screening: 'warning',
    interview: 'primary',
    offer: 'success',
    rejected: 'danger',
    withdrawn: 'info'
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
  min-height: calc(100vh - 60px);
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
</style>
