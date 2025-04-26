<template>
  <div class="hr-jobs-page">
    <div class="hr-jobs-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/profile' }">个人中心</el-breadcrumb-item>
          <el-breadcrumb-item>职位管理</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 页面标题 -->
      <div class="page-header">
        <div class="title-section">
          <h1 class="page-title">职位管理</h1>
          <p class="page-description">管理公司发布的所有职位并查看应聘情况</p>
        </div>
        <div class="actions-section">
          <el-button type="primary" @click="createJob">
            <el-icon><Plus /></el-icon>
            发布新职位
          </el-button>
        </div>
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
          <el-form-item label="部门">
            <el-select v-model="queryParams.department" placeholder="选择部门" clearable>
              <el-option
                v-for="item in departmentOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="关键词">
            <el-input v-model="queryParams.keyword" placeholder="职位名称" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchJobs">搜索</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton animated :rows="6" :loading="loading" />
      </div>

      <!-- HR职位列表 -->
      <div v-else class="jobs-list">
        <div v-if="jobs.length === 0" class="empty-container">
          <el-empty description="暂无职位">
            <template #description>
              <p>您的公司还没有发布任何职位</p>
            </template>
            <el-button type="primary" @click="createJob">立即发布职位</el-button>
          </el-empty>
        </div>
        <div v-else>
          <el-table :data="jobs" style="width: 100%" stripe>
            <el-table-column prop="title" label="职位名称" min-width="160">
              <template #default="{ row }">
                <span class="job-title" @click="viewJobDetail(row.id)">{{ row.title }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="department" label="部门" min-width="120">
              <template #default="{ row }">
                {{ row.department || '未分配' }}
              </template>
            </el-table-column>
            <el-table-column prop="location" label="工作地点" width="120">
              <template #default="{ row }">
                {{ row.location }}
              </template>
            </el-table-column>
            <el-table-column prop="applications" label="申请人数" width="100" align="center">
              <template #default="{ row }">
                <el-button type="primary" link @click="viewApplications(row.id)">
                  {{ row.applications || 0 }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column prop="interviews" label="面试" width="100" align="center">
              <template #default="{ row }">
                <el-button type="warning" link @click="viewInterviews(row.id)">
                  {{ row.interviews || 0 }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column prop="published" label="发布日期" width="120">
              <template #default="{ row }">
                {{ formatDate(row.publishedAt) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="160">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="editJob(row.id)">
                  编辑
                </el-button>
                <el-dropdown trigger="click">
                  <el-button link type="primary" size="small">
                    更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="viewJobDetail(row.id)">查看详情</el-dropdown-item>
                      <el-dropdown-item @click="copyJob(row.id)">复制职位</el-dropdown-item>
                      <el-dropdown-item
                        :disabled="row.status === 'inactive'"
                        @click="toggleJobStatus(row.id, row.status)"
                      >
                        {{ row.status === 'active' ? '暂停招聘' : '重新开放' }}
                      </el-dropdown-item>
                      <el-dropdown-item divided class="text-danger" @click="deleteJob(row.id)">
                        删除职位
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const jobs = ref([])
const total = ref(0)

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  status: '',
  department: '',
  keyword: ''
})

// 状态选项
const statusOptions = [
  { label: '招聘中', value: 'active' },
  { label: '已暂停', value: 'inactive' },
  { label: '已结束', value: 'closed' }
]

// 部门选项
const departmentOptions = [
  { label: '技术部', value: 'tech' },
  { label: '产品部', value: 'product' },
  { label: '市场部', value: 'marketing' },
  { label: '销售部', value: 'sales' },
  { label: '人力资源部', value: 'hr' },
  { label: '财务部', value: 'finance' },
  { label: '运营部', value: 'operations' }
]

// 获取职位列表
const fetchJobs = async () => {
  loading.value = true
  try {
    // 这里需要实现从API获取职位列表的功能
    // const response = await getCompanyJobs(queryParams)
    // jobs.value = response.items || []
    // total.value = response.total || 0

    // 模拟数据，实际项目中应替换为API调用
    setTimeout(() => {
      jobs.value = [
        {
          id: 1,
          title: '前端开发工程师',
          department: '技术部',
          location: '深圳',
          applications: 12,
          interviews: 5,
          publishedAt: '2023-07-15T08:30:00',
          status: 'active'
        },
        {
          id: 2,
          title: '产品经理',
          department: '产品部',
          location: '北京',
          applications: 8,
          interviews: 3,
          publishedAt: '2023-07-20T14:20:00',
          status: 'active'
        },
        {
          id: 3,
          title: 'UI设计师',
          department: '产品部',
          location: '深圳',
          applications: 18,
          interviews: 7,
          publishedAt: '2023-08-01T09:15:00',
          status: 'active'
        },
        {
          id: 4,
          title: '后端开发工程师',
          department: '技术部',
          location: '上海',
          applications: 10,
          interviews: 4,
          publishedAt: '2023-08-05T11:30:00',
          status: 'inactive'
        },
        {
          id: 5,
          title: '市场专员',
          department: '市场部',
          location: '广州',
          applications: 6,
          interviews: 2,
          publishedAt: '2023-08-10T10:00:00',
          status: 'closed'
        }
      ]
      total.value = 5
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('获取职位列表失败:', error)
    ElMessage.error('获取职位列表失败，请稍后再试')
    loading.value = false
  }
}

// 分页相关方法
const handleSizeChange = newSize => {
  queryParams.pageSize = newSize
  fetchJobs()
}

const handleCurrentChange = newPage => {
  queryParams.page = newPage
  fetchJobs()
}

// 重置筛选条件
const resetFilters = () => {
  queryParams.status = ''
  queryParams.department = ''
  queryParams.keyword = ''
  fetchJobs()
}

// 创建新职位
const createJob = () => {
  router.push('/interviewer/job/create')
}

// 编辑职位
const editJob = jobId => {
  router.push(`/interviewer/job/edit/${jobId}`)
}

// 查看职位详情
const viewJobDetail = jobId => {
  router.push(`/job/${jobId}`)
}

// 复制职位
const copyJob = async jobId => {
  try {
    await ElMessageBox.confirm('确定要复制这个职位吗？将创建一个相同内容的新职位', '复制职位', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })

    // 这里需要实现复制职位的API调用
    // const response = await copyJobApi(jobId)
    // const newJobId = response.id

    // 模拟API调用成功
    ElMessage.success('已成功复制职位')

    // 刷新列表
    fetchJobs()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('复制职位失败:', error)
      ElMessage.error('操作失败，请稍后再试')
    }
  }
}

// 切换职位状态
const toggleJobStatus = async (jobId, currentStatus) => {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  const actionText = newStatus === 'active' ? '重新开放' : '暂停'

  try {
    await ElMessageBox.confirm(`确定要${actionText}这个职位的招聘吗？`, `${actionText}招聘`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 这里需要实现更新职位状态的API调用
    // await updateJobStatusApi(jobId, newStatus)

    // 模拟API调用成功
    ElMessage.success(`已${actionText}该职位的招聘`)

    // 更新本地状态
    const index = jobs.value.findIndex(job => job.id === jobId)
    if (index !== -1) {
      jobs.value[index].status = newStatus
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新职位状态失败:', error)
      ElMessage.error('操作失败，请稍后再试')
    }
  }
}

// 删除职位
const deleteJob = async jobId => {
  try {
    await ElMessageBox.confirm('确定要删除这个职位吗？此操作不可恢复', '删除职位', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    })

    // 这里需要实现删除职位的API调用
    // await deleteJobApi(jobId)

    // 模拟API调用成功
    ElMessage.success('已成功删除职位')

    // 更新列表
    fetchJobs()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除职位失败:', error)
      ElMessage.error('操作失败，请稍后再试')
    }
  }
}

// 查看应聘者
const viewApplications = jobId => {
  router.push(`/interviewer/job/${jobId}/applications`)
}

// 查看面试
const viewInterviews = jobId => {
  router.push(`/interviewer/job/${jobId}/interviews`)
}

// 获取状态标签
const getStatusLabel = status => {
  const statusMap = {
    active: '招聘中',
    inactive: '已暂停',
    closed: '已结束'
  }
  return statusMap[status] || '未知状态'
}

// 获取状态类型（用于标签颜色）
const getStatusType = status => {
  const typeMap = {
    active: 'success',
    inactive: 'info',
    closed: 'danger'
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
  fetchJobs()
})
</script>

<style lang="less" scoped>
.hr-jobs-page {
  width: 100%;
  background-color: #f5f9ff;
  min-height: calc(100vh - 60px);
}

.hr-jobs-container {
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

.jobs-list {
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
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

.text-danger {
  color: #f56c6c;
}
</style>
