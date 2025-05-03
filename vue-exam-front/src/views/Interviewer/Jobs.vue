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
          <el-form-item label="学历要求">
            <el-select v-model="queryParams.education" placeholder="选择学历要求" clearable>
              <el-option
                v-for="item in educationOptions"
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
                        :disabled="row.status === 'FILLED'"
                        @click="toggleJobStatus(row.id, row.status)"
                      >
                        {{ row.status === 'ACTIVE' ? '暂停招聘' : '重新开放' }}
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
import { getJobs, createJob, updateJob, deleteJob } from '@/api/job'
import { getIndustrySubCategories } from '@/api/industry'
import { getRegionData } from '@/api/region'
import { formatDate } from '@/utils/formatDate'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const jobs = ref([])
const total = ref(0)
const subCategories = ref([])
const hotCities = ref([])

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  status: '',
  education: '',
  keyword: ''
})

// 状态选项
const statusOptions = [
  { label: '招聘中', value: 'ACTIVE' },
  { label: '已招满', value: 'FILLED' },
  { label: '已过期', value: 'EXPIRED' }
]

// 学历要求选项
const educationOptions = [
  { label: '高中', value: 'HIGH_SCHOOL' },
  { label: '大专', value: 'ASSOCIATE' },
  { label: '本科', value: 'BACHELOR' },
  { label: '硕士', value: 'MASTER' },
  { label: '博士', value: 'DOCTORATE' },
  { label: '其他', value: 'OTHER' }
]

// 获取职位列表
const fetchJobs = async () => {
  loading.value = true
  try {
    const response = await getJobs(queryParams)
    jobs.value = response.list
    total.value = response.total
  } catch (error) {
    console.error('获取职位列表失败:', error)
    ElMessage.error('获取职位列表失败')
  } finally {
    loading.value = false
  }
}

// 获取行业分类和热门城市
const fetchOptions = async () => {
  try {
    const categoryRes = await getIndustrySubCategories()
    subCategories.value = categoryRes.list

    const citiesRes = await getRegionData()
    hotCities.value = citiesRes.list
  } catch (error) {
    console.error('获取选项数据失败:', error)
  }
}

// 重置筛选条件
const resetFilters = () => {
  queryParams.status = ''
  queryParams.education = ''
  queryParams.keyword = ''
  queryParams.page = 1
  fetchJobs()
}

// 处理分页变化
const handleSizeChange = size => {
  queryParams.pageSize = size
  fetchJobs()
}

const handleCurrentChange = page => {
  queryParams.page = page
  fetchJobs()
}

// 新增职位对话框
const jobFormVisible = ref(false)
const jobFormLoading = ref(false)
const jobForm = ref({
  title: '',
  companyId: userStore.userInfo?.interviewer?.companyId || 0,
  subCategoryId: '',
  description: '',
  requirements: '',
  city: '',
  address: '',
  salaryMin: 0,
  salaryMax: 0,
  experienceReq: 0,
  educationReq: '',
  isRemote: false,
  status: 'ACTIVE'
})
const formType = ref('create') // create 或 edit
const editingJobId = ref(null)

// 表单验证规则
const jobFormRules = {
  title: [
    { required: true, message: '请输入职位名称', trigger: 'blur' },
    { max: 50, message: '职位名称不能超过50个字符', trigger: 'blur' }
  ],
  subCategoryId: [{ required: true, message: '请选择行业分类', trigger: 'change' }],
  description: [{ required: true, message: '请输入职位描述', trigger: 'blur' }],
  requirements: [{ required: true, message: '请输入职位要求', trigger: 'blur' }],
  city: [{ required: true, message: '请输入工作城市', trigger: 'blur' }],
  salaryMin: [
    { required: true, message: '请输入薪资下限', trigger: 'blur' },
    { type: 'number', message: '薪资必须为数字', trigger: 'blur' }
  ],
  salaryMax: [
    { required: true, message: '请输入薪资上限', trigger: 'blur' },
    { type: 'number', message: '薪资必须为数字', trigger: 'blur' }
  ]
}

// 打开新增职位表单
const createJob = () => {
  formType.value = 'create'
  jobForm.value = {
    title: '',
    companyId: userStore.userInfo?.interviewer?.companyId || 0,
    subCategoryId: '',
    description: '',
    requirements: '',
    city: '',
    address: '',
    salaryMin: 0,
    salaryMax: 0,
    experienceReq: 0,
    educationReq: '',
    isRemote: false,
    status: 'ACTIVE'
  }
  jobFormVisible.value = true
}

// 打开编辑职位表单
const editJob = async jobId => {
  try {
    // 获取职位详情
    const jobDetail = jobs.value.find(job => job.id === jobId)
    if (!jobDetail) {
      ElMessage.error('未找到职位信息')
      return
    }

    formType.value = 'edit'
    editingJobId.value = jobId
    jobForm.value = {
      title: jobDetail.title,
      companyId: jobDetail.companyId,
      subCategoryId: jobDetail.subCategoryId,
      description: jobDetail.description,
      requirements: jobDetail.requirements,
      city: jobDetail.city,
      address: jobDetail.address || '',
      salaryMin: jobDetail.salaryMin,
      salaryMax: jobDetail.salaryMax,
      experienceReq: jobDetail.experienceReq || 0,
      educationReq: jobDetail.educationReq || '',
      isRemote: jobDetail.isRemote || false,
      status: jobDetail.status
    }
    jobFormVisible.value = true
  } catch (error) {
    console.error('获取职位详情失败:', error)
    ElMessage.error('获取职位详情失败')
  }
}

// 提交职位表单
const submitJob = async () => {
  jobFormRef.value.validate(async valid => {
    if (valid) {
      submitLoading.value = true

      try {
        let response
        if (isEdit.value) {
          response = await updateJob(editingJobId.value, jobForm)
          ElMessage.success('更新职位成功')
        } else {
          response = await createJob(jobForm)
          ElMessage.success('创建职位成功')
        }

        dialogVisible.value = false
        await fetchJobs()
      } catch (error) {
        console.error(isEdit.value ? '更新职位失败:' : '创建职位失败:', error)
        ElMessage.error(isEdit.value ? '更新职位失败' : '创建职位失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 复制职位
const copyJob = async jobId => {
  try {
    // 获取职位详情
    const jobDetail = jobs.value.find(job => job.id === jobId)
    if (!jobDetail) {
      ElMessage.error('未找到职位信息')
      return
    }

    formType.value = 'create'
    jobForm.value = {
      title: `${jobDetail.title} - 副本`,
      companyId: jobDetail.companyId,
      subCategoryId: jobDetail.subCategoryId,
      description: jobDetail.description,
      requirements: jobDetail.requirements,
      city: jobDetail.city,
      address: jobDetail.address || '',
      salaryMin: jobDetail.salaryMin,
      salaryMax: jobDetail.salaryMax,
      experienceReq: jobDetail.experienceReq || 0,
      educationReq: jobDetail.educationReq || '',
      isRemote: jobDetail.isRemote || false,
      status: 'ACTIVE' // 默认为招聘中
    }
    jobFormVisible.value = true
  } catch (error) {
    console.error('复制职位失败:', error)
    ElMessage.error('复制职位失败')
  }
}

// 删除职位
const deleteJob = async jobId => {
  try {
    await ElMessageBox.confirm('确认删除该职位？删除后将无法恢复。', '警告', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteJob(jobId)
    ElMessage.success('删除职位成功')
    await fetchJobs()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除职位失败:', error)
      ElMessage.error('删除职位失败')
    }
  }
}

// 更改职位状态
const toggleJobStatus = async (jobId, currentStatus) => {
  const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
  try {
    await updateJob(jobId, { status: newStatus })
    ElMessage.success(`职位状态已更新为${newStatus === 'ACTIVE' ? '招聘中' : '已关闭'}`)
    await fetchJobs()
  } catch (error) {
    console.error('更新职位状态失败:', error)
    ElMessage.error('更新职位状态失败')
  }
}

// 查看职位详情
const viewJobDetail = jobId => {
  router.push(`/job-management/detail/${jobId}`)
}

// 查看应聘者
const viewApplications = jobId => {
  router.push(`/candidate-management?jobId=${jobId}`)
}

// 查看面试安排
const viewInterviews = jobId => {
  router.push(`/interview-schedule?jobId=${jobId}`)
}

// 获取状态显示类型
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

// 获取状态显示文本
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
  const found = educationOptions.find(option => option.value === education)
  return found ? found.label : '不限'
}

onMounted(() => {
  fetchJobs()
  fetchOptions()
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
