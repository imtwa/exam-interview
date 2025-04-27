<template>
  <div class="job-list-page">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>职位管理</span>
        </div>
      </template>

      <CommonCrudTable
        :data="jobList"
        :total="total"
        :loading="loading"
        search-placeholder="输入职位名称/公司名称搜索"
        add-button-text="新增职位"
        @search="handleSearch"
        @add="handleAdd"
        @edit="handleEdit"
        @delete="handleDelete"
        @view="handleView"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="职位名称" min-width="150" />
        <el-table-column label="公司" min-width="150">
          <template #default="scope">
            {{ scope.row.company?.name || '未知公司' }}
          </template>
        </el-table-column>
        <el-table-column prop="city" label="工作城市" width="100" />
        <el-table-column label="薪资范围" width="150">
          <template #default="scope">
            {{ formatSalary(scope.row.salaryMin, scope.row.salaryMax) }}
          </template>
        </el-table-column>
        <el-table-column label="工作性质" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isRemote ? 'success' : 'info'">
              {{ scope.row.isRemote ? '远程' : '现场' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status) || 'info'">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <template #extraActions="{ row }">
          <el-button
            v-if="row.status === 'ACTIVE'"
            type="warning"
            size="small"
            @click="handleUpdateStatus(row, 'FILLED')"
            link
          >
            标记已招满
          </el-button>
          <el-button
            v-if="row.status === 'ACTIVE'"
            type="info"
            size="small"
            @click="handleUpdateStatus(row, 'EXPIRED')"
            link
          >
            设为过期
          </el-button>
          <el-button
            v-if="row.status !== 'ACTIVE'"
            type="success"
            size="small"
            @click="handleUpdateStatus(row, 'ACTIVE')"
            link
          >
            重新激活
          </el-button>
        </template>
      </CommonCrudTable>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增职位' : '编辑职位'"
      width="60%"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="职位名称" prop="title">
              <el-input v-model="form.title" placeholder="请输入职位名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公司" prop="companyId">
              <el-select v-model="form.companyId" placeholder="请选择公司" style="width: 100%">
                <el-option
                  v-for="company in companies"
                  :key="company.id"
                  :label="company.name"
                  :value="company.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="行业分类" prop="subCategoryId">
              <el-select
                v-model="form.subCategoryId"
                placeholder="请选择行业分类"
                style="width: 100%"
              >
                <el-option
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="面试官" prop="interviewerId">
              <el-select
                v-model="form.interviewerId"
                placeholder="请选择面试官"
                style="width: 100%"
              >
                <el-option
                  v-for="interviewer in interviewers"
                  :key="interviewer.id"
                  :label="interviewer.user?.username"
                  :value="interviewer.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="工作城市" prop="city">
              <el-input v-model="form.city" placeholder="请输入工作城市" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="薪资下限(K)" prop="salaryMin">
              <el-input-number v-model="form.salaryMin" :min="0" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="薪资上限(K)" prop="salaryMax">
              <el-input-number v-model="form.salaryMax" :min="0" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="经验要求(年)" prop="experienceReq">
              <el-input-number
                v-model="form.experienceReq"
                :min="0"
                :step="1"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="学历要求" prop="educationReq">
              <el-select
                v-model="form.educationReq"
                placeholder="请选择学历要求"
                style="width: 100%"
              >
                <el-option label="高中" value="HIGH_SCHOOL" />
                <el-option label="大专" value="ASSOCIATE" />
                <el-option label="本科" value="BACHELOR" />
                <el-option label="硕士" value="MASTER" />
                <el-option label="博士" value="DOCTORATE" />
                <el-option label="其他" value="OTHER" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="职位状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择职位状态" style="width: 100%">
                <el-option label="招聘中" value="ACTIVE" />
                <el-option label="已招满" value="FILLED" />
                <el-option label="已过期" value="EXPIRED" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="详细地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入详细地址" />
        </el-form-item>

        <el-form-item label="工作性质" prop="isRemote">
          <el-switch
            v-model="form.isRemote"
            active-text="远程"
            inactive-text="现场"
            :active-value="true"
            :inactive-value="false"
          />
        </el-form-item>

        <el-form-item label="职位描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入职位描述"
          />
        </el-form-item>

        <el-form-item label="职位要求" prop="requirements">
          <el-input
            v-model="form.requirements"
            type="textarea"
            :rows="4"
            placeholder="请输入职位要求"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看详情弹窗 -->
    <el-dialog v-model="viewDialogVisible" title="职位详情" width="60%">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="职位ID" :span="1">{{ currentJob?.id }}</el-descriptions-item>
        <el-descriptions-item label="职位名称" :span="1">{{
          currentJob?.title
        }}</el-descriptions-item>
        <el-descriptions-item label="公司名称" :span="1">
          {{ currentJob?.company?.name }}
        </el-descriptions-item>
        <el-descriptions-item label="工作城市" :span="1">{{
          currentJob?.city
        }}</el-descriptions-item>
        <el-descriptions-item label="薪资范围" :span="1">
          {{ formatSalary(currentJob?.salaryMin, currentJob?.salaryMax) }}
        </el-descriptions-item>
        <el-descriptions-item label="工作性质" :span="1">
          <el-tag :type="currentJob?.isRemote ? 'success' : 'info'">
            {{ currentJob?.isRemote ? '远程' : '现场' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="经验要求" :span="1">
          {{ currentJob?.experienceReq ? `${currentJob.experienceReq}年` : '不限' }}
        </el-descriptions-item>
        <el-descriptions-item label="学历要求" :span="1">
          {{ getEducationText(currentJob?.educationReq) }}
        </el-descriptions-item>
        <el-descriptions-item label="状态" :span="1">
          <el-tag :type="getStatusType(currentJob?.status) || 'info'">
            {{ getStatusText(currentJob?.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="1">
          {{ formatDate(currentJob?.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="详细地址" :span="2">
          {{ currentJob?.address || '未设置' }}
        </el-descriptions-item>
        <el-descriptions-item label="职位描述" :span="2">
          <div class="job-description">{{ currentJob?.description || '无' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="职位要求" :span="2">
          <div class="job-requirements">{{ currentJob?.requirements || '无' }}</div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import CommonCrudTable from '@/components/CommonCrudTable.vue'
  import { JobPostingService, CompanyService, InterviewerService } from '@/api/userApi'
  import { JobPosting, Company, Interviewer } from '@/api/model/userModel'
  import { ElMessage, FormInstance, FormRules } from 'element-plus'

  // 数据列表
  const jobList = ref<JobPosting[]>([])
  const total = ref(0)
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchKeyword = ref('')

  // 下拉选项数据
  const companies = ref<Company[]>([])
  const interviewers = ref<Interviewer[]>([])
  const categories = ref<any[]>([])

  // 表单
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const form = ref<JobPosting>({
    title: '',
    companyId: 0,
    interviewerId: 0,
    subCategoryId: 0,
    description: '',
    requirements: '',
    city: '',
    address: '',
    salaryMin: 0,
    salaryMax: 0,
    experienceReq: 0,
    educationReq: undefined,
    isRemote: false,
    status: 'ACTIVE'
  })
  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  // 查看详情
  const viewDialogVisible = ref(false)
  const currentJob = ref<JobPosting | null>(null)

  // 表单规则
  const rules = ref<FormRules>({
    title: [
      { required: true, message: '请输入职位名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    companyId: [{ required: true, message: '请选择公司', trigger: 'change' }],
    interviewerId: [{ required: true, message: '请选择面试官', trigger: 'change' }],
    subCategoryId: [{ required: true, message: '请选择行业分类', trigger: 'change' }],
    description: [{ required: true, message: '请输入职位描述', trigger: 'blur' }],
    requirements: [{ required: true, message: '请输入职位要求', trigger: 'blur' }],
    city: [{ required: true, message: '请输入工作城市', trigger: 'blur' }],
    salaryMin: [{ required: true, message: '请输入薪资下限', trigger: 'blur' }],
    salaryMax: [{ required: true, message: '请输入薪资上限', trigger: 'blur' }],
    status: [{ required: true, message: '请选择职位状态', trigger: 'change' }]
  })

  // 获取数据
  onMounted(() => {
    fetchJobList()
    fetchDropdownOptions()
  })

  const fetchJobList = async () => {
    loading.value = true
    try {
      const res = await JobPostingService.getJobPostingList({
        page: currentPage.value,
        size: pageSize.value,
        keyword: searchKeyword.value
      })

      if (res.code === 200) {
        jobList.value = res.data || []
        total.value = res.total || 0
      } else {
        ElMessage.error(res.message || '获取职位列表失败')
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      ElMessage.error('获取职位列表失败')
    } finally {
      loading.value = false
    }
  }

  // 获取下拉选项数据
  const fetchDropdownOptions = async () => {
    try {
      // 获取公司列表
      const companyRes = await CompanyService.getCompanyList({ size: 100 })
      if (companyRes.code === 200) {
        companies.value = companyRes.data || []
      }

      // 获取面试官列表
      const interviewerRes = await InterviewerService.getInterviewerList({ size: 100 })
      if (interviewerRes.code === 200) {
        interviewers.value = interviewerRes.data || []
      }

      // 简单模拟行业分类数据
      categories.value = [
        { id: 1, name: '互联网/IT' },
        { id: 2, name: '金融' },
        { id: 3, name: '教育' },
        { id: 4, name: '医疗' },
        { id: 5, name: '制造业' },
        { id: 6, name: '建筑/房地产' },
        { id: 7, name: '其他行业' }
      ]
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      ElMessage.error('获取下拉选项失败')
    }
  }

  // 处理搜索
  const handleSearch = (params: { keyword: string; page: number; pageSize: number }) => {
    searchKeyword.value = params.keyword
    currentPage.value = params.page
    pageSize.value = params.pageSize
    fetchJobList()
  }

  // 处理分页
  const handlePageChange = (params: { page: number; pageSize: number }) => {
    currentPage.value = params.page
    pageSize.value = params.pageSize
    fetchJobList()
  }

  const handleSizeChange = (params: { page: number; pageSize: number }) => {
    currentPage.value = params.page
    pageSize.value = params.pageSize
    fetchJobList()
  }

  // 新增
  const handleAdd = () => {
    dialogType.value = 'add'
    form.value = {
      title: '',
      companyId: 0,
      interviewerId: 0,
      subCategoryId: 0,
      description: '',
      requirements: '',
      city: '',
      address: '',
      salaryMin: 0,
      salaryMax: 0,
      experienceReq: 0,
      educationReq: undefined,
      isRemote: false,
      status: 'ACTIVE'
    }
    dialogVisible.value = true
  }

  // 编辑
  const handleEdit = (row: JobPosting) => {
    dialogType.value = 'edit'
    form.value = { ...row }
    dialogVisible.value = true
  }

  // 查看
  const handleView = (row: JobPosting) => {
    currentJob.value = row
    viewDialogVisible.value = true
  }

  // 删除
  const handleDelete = async (row: JobPosting) => {
    try {
      const res = await JobPostingService.updateJobPosting(row.id!, {
        deletedAt: new Date().toISOString()
      })
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchJobList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      ElMessage.error('删除失败')
    }
  }

  // 修改职位状态
  const handleUpdateStatus = async (row: JobPosting, status: 'ACTIVE' | 'FILLED' | 'EXPIRED') => {
    try {
      const res = await JobPostingService.updateJobStatus(row.id!, status)
      if (res.code === 200) {
        ElMessage.success('状态更新成功')
        fetchJobList()
      } else {
        ElMessage.error(res.message || '状态更新失败')
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      ElMessage.error('状态更新失败')
    }
  }

  // 提交表单
  const submitForm = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        // 验证薪资范围
        if (form.value.salaryMin > form.value.salaryMax) {
          ElMessage.error('薪资下限不能大于薪资上限')
          return
        }

        submitLoading.value = true
        try {
          let res
          if (dialogType.value === 'add') {
            // 创建新职位
            res = await JobPostingService.updateJobPosting(0, form.value)
          } else {
            // 更新职位
            const { id, ...updateData } = form.value
            res = await JobPostingService.updateJobPosting(id!, updateData)
          }

          if (res.code === 200) {
            ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
            dialogVisible.value = false
            fetchJobList()
          } else {
            ElMessage.error(res.message || (dialogType.value === 'add' ? '添加失败' : '更新失败'))
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
          ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败')
        } finally {
          submitLoading.value = false
        }
      }
    })
  }

  // 格式化日期
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-'
    if (typeof date === 'string') {
      return new Date(date).toLocaleString()
    }
    return date.toLocaleString()
  }

  // 格式化薪资
  const formatSalary = (min?: number, max?: number) => {
    if (min === undefined || max === undefined) return '面议'
    if (min === max) return `${min}K/月`
    return `${min}K-${max}K/月`
  }

  // 获取状态类型
  const getStatusType = (status: string | undefined) => {
    if (!status) return ''
    const statusMap: Record<string, string> = {
      ACTIVE: 'success',
      FILLED: 'warning',
      EXPIRED: 'info'
    }
    return statusMap[status] || ''
  }

  // 获取状态文本
  const getStatusText = (status: string | undefined) => {
    if (!status) return '未知'
    const statusMap: Record<string, string> = {
      ACTIVE: '招聘中',
      FILLED: '已招满',
      EXPIRED: '已过期'
    }
    return statusMap[status] || '未知'
  }

  // 获取学历要求文本
  const getEducationText = (education: string | undefined) => {
    if (!education) return '不限'
    const educationMap: Record<string, string> = {
      HIGH_SCHOOL: '高中',
      ASSOCIATE: '大专',
      BACHELOR: '本科',
      MASTER: '硕士',
      DOCTORATE: '博士',
      OTHER: '其他'
    }
    return educationMap[education] || '不限'
  }
</script>

<style scoped>
  .job-list-page {
    padding: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }

  .job-description,
  .job-requirements {
    white-space: pre-line;
    max-height: 300px;
    overflow-y: auto;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 4px;
  }
</style>
