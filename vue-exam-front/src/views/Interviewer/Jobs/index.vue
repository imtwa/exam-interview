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

      <!-- 筛选区域 -->
      <div class="filter-container">
        <el-form :inline="true" class="filter-form">
          <div class="filter-items">
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
            <el-form-item label="学历要求" label-width="80px">
              <el-select
                v-model="queryParams.education"
                placeholder="选择学历要求"
                clearable
                style="width: 180px"
              >
                <el-option
                  v-for="item in educationOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="关键词" label-width="60px">
              <el-input
                v-model="queryParams.keyword"
                placeholder="职位名称"
                clearable
                style="width: 200px"
              />
            </el-form-item>
          </div>
          <div class="filter-actions">
            <el-button type="primary" @click="fetchJobs" size="default">搜索</el-button>
            <el-button @click="resetFilters" size="default">重置</el-button>
            <el-button type="primary" @click="createJob">
              <el-icon><Plus /></el-icon>
              发布新职位
            </el-button>
          </div>
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
            <el-table-column prop="title" label="职位名称" min-width="140">
              <template #default="{ row }">
                <span class="job-title" @click="viewJobDetail(row.id)">{{ row.title }}</span>
              </template>
            </el-table-column>
            <!-- <el-table-column prop="company" label="公司" min-width="120">
              <template #default="{ row }">
                {{ row.company?.name || '未知' }}
              </template>
            </el-table-column> -->
            <el-table-column prop="department" label="部门" min-width="100">
              <template #default="{ row }">
                {{ row.department || row.subCategory?.name || '未分配' }}
              </template>
            </el-table-column>
            <el-table-column prop="city" label="工作地点" min-width="120">
              <template #default="{ row }">
                {{ row.city || '未设置' }}
              </template>
            </el-table-column>
            <el-table-column prop="salary" label="薪资范围" min-width="100">
              <template #default="{ row }">
                {{ formatSalary(row.salaryMin, row.salaryMax) }}
              </template>
            </el-table-column>
            <el-table-column prop="experienceReq" label="经验要求" width="100">
              <template #default="{ row }">
                {{ getExperienceLabel(row.experienceReq) }}
              </template>
            </el-table-column>
            <el-table-column prop="applications" label="申请人数" width="90" align="center">
              <template #default="{ row }">
                <el-button type="primary" link @click="viewApplications(row.id)">
                  {{ row.applicationsCount || row._count?.applications || 0 }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column prop="interviews" label="面试" width="90" align="center">
              <template #default="{ row }">
                <el-button type="warning" link @click="viewInterviews(row.id)">
                  {{ row._count?.interviews || 0 }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="发布日期" width="120">
              <template #default="{ row }">
                {{ formatFriendlyDate(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="120">
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

      <!-- 添加职位表单对话框 -->
      <el-dialog
        v-model="jobFormVisible"
        :title="formType === 'create' ? '发布新职位' : '编辑职位'"
        width="650px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
      >
        <el-form
          ref="jobFormRef"
          :model="jobForm"
          :rules="jobFormRules"
          label-width="100px"
          label-position="right"
        >
          <el-form-item label="职位名称" prop="title">
            <el-input v-model="jobForm.title" placeholder="请输入职位名称" />
          </el-form-item>
          <el-form-item label="行业分类" prop="subCategoryId">
            <el-cascader
              v-model="jobForm.subCategoryId"
              placeholder="请选择行业分类"
              :options="industryCategories"
              :props="{
                value: 'id',
                label: 'name',
                children: 'subCategories',
                emitPath: false
              }"
              clearable
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="工作城市" prop="city">
            <el-cascader
              v-model="jobForm.regionCode"
              placeholder="请选择城市"
              :options="regionData"
              :props="{
                value: 'code',
                label: 'name',
                children: 'children',
                checkStrictly: true,
                emitPath: true
              }"
              clearable
              style="width: 100%"
              @change="handleRegionChange"
            />
          </el-form-item>
          <el-form-item label="详细地址" prop="address">
            <el-input
              v-model="jobForm.address"
              placeholder="请输入详细地址（如：海淀区中关村大街1号）"
            />
          </el-form-item>
          <el-form-item label="薪资范围">
            <el-row :gutter="10">
              <el-col :span="11">
                <el-form-item prop="salaryMin">
                  <el-input-number
                    v-model="jobForm.salaryMin"
                    :min="0"
                    placeholder="最低薪资"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="2" class="text-center">至</el-col>
              <el-col :span="11">
                <el-form-item prop="salaryMax">
                  <el-input-number
                    v-model="jobForm.salaryMax"
                    :min="0"
                    placeholder="最高薪资"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <div class="form-tip">单位：K/月，如：10表示10000元/月</div>
          </el-form-item>
          <el-form-item label="工作经验" prop="experienceReq">
            <el-select v-model="jobForm.experienceReq" placeholder="请选择工作经验">
              <el-option
                v-for="item in experienceOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="学历要求" prop="educationReq">
            <el-select v-model="jobForm.educationReq" placeholder="请选择学历要求">
              <el-option
                v-for="item in educationOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="远程工作" prop="isRemote">
            <el-switch v-model="jobForm.isRemote" />
            <span class="switch-label">{{ jobForm.isRemote ? '支持' : '不支持' }}</span>
          </el-form-item>
          <el-form-item label="职位状态" prop="status">
            <el-radio-group v-model="jobForm.status">
              <el-radio label="ACTIVE">招聘中</el-radio>
              <el-radio label="FILLED">已招满</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="职位描述" prop="description">
            <el-input
              v-model="jobForm.description"
              type="textarea"
              :rows="4"
              placeholder="请输入职位描述"
            />
          </el-form-item>
          <el-form-item label="职位要求" prop="requirements">
            <el-input
              v-model="jobForm.requirements"
              type="textarea"
              :rows="4"
              placeholder="请输入职位要求"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="jobFormVisible = false">取消</el-button>
            <el-button type="primary" @click="submitJobForm(jobFormRef)" :loading="jobFormLoading">
              {{ formType === 'create' ? '发布' : '保存' }}
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
  getJobsByInterviewer,
  createJob as createJobAPI,
  updateJob,
  deleteJob as deleteJobAPI
} from '@/api/job'
import { getIndustryCategories } from '@/api/industry'
import { getRegionData } from '@/api/region'
import { formatDate, formatFriendlyDate } from '@/utils/formatDate'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const jobs = ref([])
const total = ref(0)
const industryCategories = ref([])
const regionData = ref([])
const jobFormRef = ref(null)

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

// 工作经验选项
const experienceOptions = [
  { label: '在校生', value: 'STUDENT' },
  { label: '应届生', value: 'FRESH_GRADUATE' },
  { label: '1年以内', value: 'LESS_THAN_ONE' },
  { label: '1-3年', value: 'ONE_TO_THREE' },
  { label: '3-5年', value: 'THREE_TO_FIVE' },
  { label: '5-10年', value: 'FIVE_TO_TEN' },
  { label: '10年以上', value: 'MORE_THAN_TEN' }
]

// 获取职位列表
const fetchJobs = async (page = queryParams.page) => {
  loading.value = true
  queryParams.page = page

  try {
    const response = await getJobsByInterviewer(queryParams)

    // 检查响应结构，兼容后端直接返回数据或嵌套在data字段中的情况
    if (response.data && response.data.list) {
      // 数据嵌套在data字段中的情况
      jobs.value = response.data.list
      total.value = response.data.total
    } else if (response.list) {
      // 数据直接在response中的情况
      jobs.value = response.list
      total.value = response.total
    } else {
      // 异常情况，可能是格式不对
      console.warn('职位数据格式不符合预期:', response)
      jobs.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取职位列表失败:', error)
    ElMessage.error('获取职位列表失败')
    jobs.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 获取行业分类和地区数据
const fetchOptions = async () => {
  try {
    // 获取行业分类
    const categoryRes = await getIndustryCategories()
    // 确保返回的数据有list属性且为数组
    if (categoryRes && categoryRes.list && Array.isArray(categoryRes.list)) {
      industryCategories.value = categoryRes.list
    } else {
      console.warn('行业分类数据格式不正确:', categoryRes)
      industryCategories.value = []
    }

    // 获取地区数据
    const regionRes = await getRegionData()
    // 确保返回的数据是数组
    if (Array.isArray(regionRes)) {
      regionData.value = regionRes
    } else {
      console.warn('地区数据格式不正确:', regionRes)
      regionData.value = []
    }
  } catch (error) {
    console.error('获取选项数据失败:', error)
    industryCategories.value = []
    regionData.value = []
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
  companyId: userStore.companyId || 0,
  interviewerId: userStore.interviewerId || 0,
  subCategoryId: null,
  description: '',
  requirements: '',
  city: '',
  regionCode: [],
  address: '',
  salaryMin: 0,
  salaryMax: 0,
  experienceReq: '',
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
  experienceReq: [{ required: true, message: '请选择工作经验要求', trigger: 'change' }],
  educationReq: [{ required: true, message: '请选择学历要求', trigger: 'change' }],
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
    companyId: userStore.companyId || 0,
    interviewerId: userStore.interviewerId || 0,
    subCategoryId: null,
    description: '',
    requirements: '',
    city: '',
    regionCode: [],
    address: '',
    salaryMin: 0,
    salaryMax: 0,
    experienceReq: '',
    educationReq: '',
    isRemote: false,
    status: 'ACTIVE'
  }

  // 如果没有公司ID或面试官ID，尝试刷新获取
  if (!jobForm.value.companyId || !jobForm.value.interviewerId) {
    userStore.fetchInterviewerProfile().then(() => {
      jobForm.value.companyId = userStore.companyId || 0
      jobForm.value.interviewerId = userStore.interviewerId || 0
    })
  }

  jobFormVisible.value = true
}

// 编辑职位
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

    // 将年份转换为经验级别
    const experienceLevel =
      typeof jobDetail.experienceReq === 'number'
        ? convertYearsToLevel(jobDetail.experienceReq)
        : jobDetail.experienceReq || ''

    jobForm.value = {
      title: jobDetail.title,
      companyId: jobDetail.companyId || userStore.companyId || 0,
      interviewerId: jobDetail.interviewerId || userStore.interviewerId || 0,
      subCategoryId: jobDetail.subCategoryId,
      description: jobDetail.description,
      requirements: jobDetail.requirements,
      city: jobDetail.city,
      regionCode: jobDetail.regionCode || [],
      address: jobDetail.address || '',
      salaryMin: jobDetail.salaryMin,
      salaryMax: jobDetail.salaryMax,
      experienceReq: experienceLevel,
      educationReq: jobDetail.educationReq || '',
      isRemote: jobDetail.isRemote || false,
      status: jobDetail.status
    }

    // 如果没有公司ID或面试官ID，尝试刷新获取
    if (!jobForm.value.companyId || !jobForm.value.interviewerId) {
      userStore
        .checkUserProfile()
        .then(() => {
          jobForm.value.companyId = userStore.companyId || 0
          jobForm.value.interviewerId = userStore.interviewerId || 0
        })
        .catch(error => {
          console.error('获取面试官信息失败:', error)
          ElMessage.warning('获取面试官信息失败，请刷新后重试')
        })
    }

    jobFormVisible.value = true
  } catch (error) {
    console.error('获取职位详情失败:', error)
    ElMessage.error('获取职位详情失败')
  }
}

// 提交职位表单
const submitJobForm = async formEl => {
  if (!formEl) return

  await formEl.validate(async valid => {
    if (valid) {
      // 验证薪资范围
      if (jobForm.value.salaryMin > jobForm.value.salaryMax) {
        ElMessage.error('薪资下限不能大于薪资上限')
        return
      }

      // 确保公司ID和面试官ID已设置
      if (!jobForm.value.companyId) {
        ElMessage.error('缺少公司ID，请确保您的账号已关联公司')
        return
      }

      if (!jobForm.value.interviewerId) {
        ElMessage.error('缺少面试官ID，请确保您的账号信息完整')
        return
      }

      jobFormLoading.value = true
      try {
        // 构建要提交的数据
        const submitData = { ...jobForm.value }

        // 确保ID字段为数字类型
        submitData.companyId = Number(submitData.companyId)
        submitData.interviewerId = Number(submitData.interviewerId)
        if (submitData.subCategoryId) {
          submitData.subCategoryId = Number(submitData.subCategoryId)
        }

        let response
        if (formType.value === 'create') {
          response = await createJobAPI(submitData)
        } else {
          response = await updateJob(editingJobId.value, submitData)
        }

        ElMessage.success(formType.value === 'create' ? '发布职位成功' : '更新职位成功')
        jobFormVisible.value = false
        fetchJobs()
      } catch (error) {
        console.error(formType.value === 'create' ? '发布职位失败:' : '更新职位失败:', error)
        ElMessage.error(formType.value === 'create' ? '发布职位失败' : '更新职位失败')
      } finally {
        jobFormLoading.value = false
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

    // 将年份转换为经验级别
    const experienceLevel =
      typeof jobDetail.experienceReq === 'number'
        ? convertYearsToLevel(jobDetail.experienceReq)
        : jobDetail.experienceReq || ''

    jobForm.value = {
      title: `${jobDetail.title} - 副本`,
      companyId: jobDetail.companyId || userStore.companyId || 0,
      interviewerId: jobDetail.interviewerId || userStore.interviewerId || 0,
      subCategoryId: jobDetail.subCategoryId,
      description: jobDetail.description,
      requirements: jobDetail.requirements,
      city: jobDetail.city,
      regionCode: jobDetail.regionCode || [],
      address: jobDetail.address || '',
      salaryMin: jobDetail.salaryMin,
      salaryMax: jobDetail.salaryMax,
      experienceReq: experienceLevel,
      educationReq: jobDetail.educationReq || '',
      isRemote: jobDetail.isRemote || false,
      status: 'ACTIVE' // 默认为招聘中
    }

    // 如果没有公司ID或面试官ID，尝试刷新获取
    if (!jobForm.value.companyId || !jobForm.value.interviewerId) {
      userStore
        .checkUserProfile()
        .then(() => {
          jobForm.value.companyId = userStore.companyId || 0
          jobForm.value.interviewerId = userStore.interviewerId || 0
        })
        .catch(error => {
          console.error('获取面试官信息失败:', error)
          ElMessage.warning('获取面试官信息失败，请刷新后重试')
        })
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
    await ElMessageBox.confirm('确定要删除该职位吗？已投递简历的候选人将无法查看该职位。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteJobAPI(jobId)
    ElMessage.success('职位删除成功')
    fetchJobs()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('职位删除失败:', error)
      ElMessage.error('职位删除失败')
    }
  }
}

// 更改职位状态
const toggleJobStatus = async (jobId, currentStatus) => {
  try {
    const newStatus = currentStatus === 'ACTIVE' ? 'FILLED' : 'ACTIVE'
    const statusText = newStatus === 'ACTIVE' ? '开放招聘' : '暂停招聘'

    await ElMessageBox.confirm(`确定要${statusText}吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 获取当前职位的完整信息
    const jobDetail = jobs.value.find(job => job.id === jobId)
    if (!jobDetail) {
      ElMessage.error('找不到职位信息，请刷新页面后重试')
      return
    }

    // 构建完整的更新数据对象，只修改status字段
    const updateData = {
      title: jobDetail.title,
      companyId: jobDetail.companyId,
      interviewerId: jobDetail.interviewerId,
      subCategoryId: jobDetail.subCategoryId,
      description: jobDetail.description,
      requirements: jobDetail.requirements,
      city: jobDetail.city,
      address: jobDetail.address || '',
      salaryMin: jobDetail.salaryMin,
      salaryMax: jobDetail.salaryMax,
      experienceReq: jobDetail.experienceReq,
      educationReq: jobDetail.educationReq,
      isRemote: jobDetail.isRemote || false,
      status: newStatus // 只修改状态
    }

    await updateJob(jobId, updateData)
    ElMessage.success(`${statusText}成功`)
    fetchJobs() // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新职位状态失败:', error)
      ElMessage.error('更新职位状态失败')
    }
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

// 获取工作经验要求文本
const getExperienceLabel = experience => {
  if (!experience) return '不限'
  const found = experienceOptions.find(option => option.value === experience)
  return found ? found.label : '不限'
}

// 格式化薪资显示
const formatSalary = (min, max) => {
  if (min === 0 && max === 0) return '面议'
  if (min === 0) return `${max}K以下`
  if (max === 0) return `${min}K以上`
  return `${min}-${max}K`
}

// 处理地区选择变化
const handleRegionChange = value => {
  if (value && value.length > 0) {
    // 提取选中的地区名称
    const selectedLabels = []
    let currentLevel = regionData.value

    for (const code of value) {
      const found = currentLevel.find(item => item.code === code)
      if (found) {
        selectedLabels.push(found.name)
        currentLevel = found.children || []
      }
    }

    // 更新城市字段
    jobForm.value.city = selectedLabels.join(' ')
  } else {
    jobForm.value.city = ''
  }
}

// 将经验年数转换为经验级别
const convertYearsToLevel = years => {
  if (typeof years === 'string') return years

  if (years === 0) return 'ENTRY_LEVEL'
  if (years < 3) return 'JUNIOR'
  if (years < 5) return 'MID_LEVEL'
  if (years < 8) return 'SENIOR'
  return 'EXPERT'
}

onMounted(async () => {
  loading.value = true

  // 确保获取面试官ID和公司ID
  if (!userStore.companyId || !userStore.interviewerId) {
    try {
      await userStore.fetchInterviewerProfile()
      console.log('获取到面试官信息:', {
        companyId: userStore.companyId,
        interviewerId: userStore.interviewerId
      })
    } catch (error) {
      console.error('获取面试官信息失败:', error)
      ElMessage.error('获取面试官信息失败，请刷新页面重试')
    }
  } else {
    console.log('已有面试官信息:', {
      companyId: userStore.companyId,
      interviewerId: userStore.interviewerId
    })
  }

  await fetchJobs()
  loading.value = false
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

.filter-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 20px 24px;
  margin-bottom: 24px;

  .filter-form {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .filter-items {
      display: flex;
      flex-wrap: wrap;
      flex: 1;
    }

    .filter-actions {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      margin-left: 10px;
      height: 40px;
      line-height: 40px;
    }

    .el-form-item {
      margin-bottom: 10px;
      margin-right: 20px;
    }

    :deep(.el-form-item__content) {
      display: flex;
      align-items: center;
    }
  }
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

  :deep(.el-table) {
    .el-button {
      padding: 4px 10px;
    }

    .el-button + .el-dropdown {
      margin-left: 5px;
    }
  }
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.text-center {
  text-align: center;
  line-height: 32px;
}

.switch-label {
  margin-left: 8px;
  font-size: 14px;
  color: #606266;
}

// Add some spacing to the more button dropdown
:deep(.el-dropdown) {
  margin-left: 5px;
}
</style>
