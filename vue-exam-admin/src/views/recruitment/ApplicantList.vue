<template>
  <div class="applicant-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>应聘管理</span>
        </div>
      </template>

      <CommonCrudTable
        ref="tableRef"
        :columns="columns"
        :data="applicantList"
        :loading="loading"
        :pagination="pagination"
        :searchConfig="searchConfig"
        :searchParams="searchParams"
        @search="handleSearch"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
        @view="handleView"
      >
        <template #status="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ formatStatus(row.status) }}
          </el-tag>
        </template>

        <template #extraAction="{ row }">
          <el-button
            v-if="row.status === 'pending'"
            type="success"
            size="small"
            @click="handleUpdateStatus(row.id, 'accepted')"
          >
            通过
          </el-button>
          <el-button
            v-if="row.status === 'pending'"
            type="danger"
            size="small"
            @click="handleUpdateStatus(row.id, 'rejected')"
          >
            拒绝
          </el-button>
          <el-button
            v-if="row.status === 'accepted'"
            type="primary"
            size="small"
            @click="handleScheduleInterview(row)"
          >
            安排面试
          </el-button>
        </template>
      </CommonCrudTable>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="viewDialogVisible" title="应聘详情" width="700px" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID" width="180px">{{ viewData.id }}</el-descriptions-item>
        <el-descriptions-item label="应聘者">{{ viewData.jobSeeker?.name }}</el-descriptions-item>
        <el-descriptions-item label="职位">{{ viewData.jobPosting?.title }}</el-descriptions-item>
        <el-descriptions-item label="公司">{{
          viewData.jobPosting?.company?.name
        }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{
          formatDate(viewData.createdAt)
        }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(viewData.status)">{{
            formatStatus(viewData.status)
          }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="简历链接" :span="2">
          <a :href="viewData.resumeUrl" target="_blank">查看简历</a>
        </el-descriptions-item>
        <el-descriptions-item label="自我介绍" :span="2">
          <div style="white-space: pre-wrap">{{ viewData.coverLetter }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 安排面试弹窗 -->
    <el-dialog v-model="interviewDialogVisible" title="安排面试" width="500px" destroy-on-close>
      <el-form
        ref="interviewFormRef"
        :model="interviewForm"
        :rules="interviewRules"
        label-width="120px"
      >
        <el-form-item label="面试类型" prop="type">
          <el-select v-model="interviewForm.type" placeholder="请选择面试类型" style="width: 100%">
            <el-option label="电话面试" value="phone" />
            <el-option label="视频面试" value="video" />
            <el-option label="现场面试" value="onsite" />
          </el-select>
        </el-form-item>
        <el-form-item label="面试官" prop="interviewerId">
          <el-select
            v-model="interviewForm.interviewerId"
            placeholder="请选择面试官"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="interviewer in interviewerOptions"
              :key="interviewer.id"
              :label="interviewer.name"
              :value="interviewer.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="面试时间" prop="scheduledTime">
          <el-date-picker
            v-model="interviewForm.scheduledTime"
            type="datetime"
            placeholder="选择日期时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="面试地点/链接" prop="location">
          <el-input v-model="interviewForm.location" placeholder="请输入面试地点或链接" />
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="interviewForm.notes"
            type="textarea"
            placeholder="请输入面试备注"
            rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="interviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitInterviewForm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { jobApplicationApi, interviewerApi, interviewApi } from '@/api/services/user'
  import type { JobApplication, Interview, Interviewer } from '@/api/model/userModel'

  const tableRef = ref()
  const loading = ref(false)
  const applicantList = ref<JobApplication[]>([])
  const pagination = reactive({
    total: 0,
    page: 1,
    size: 10
  })

  const searchParams = reactive({
    keyword: '',
    jobId: null,
    status: '',
    page: 1,
    size: 10
  })

  // 表格列配置
  const columns = [
    { prop: 'id', label: 'ID', width: '80' },
    { prop: 'jobSeeker.name', label: '应聘者', width: '120' },
    { prop: 'jobPosting.title', label: '应聘职位', minWidth: '150' },
    { prop: 'jobPosting.company.name', label: '公司', width: '150' },
    { prop: 'status', label: '状态', width: '120', slot: true },
    {
      prop: 'createdAt',
      label: '申请时间',
      width: '180',
      formatter: (row: any) => formatDate(row.createdAt)
    },
    { prop: 'action', label: '操作', width: '220', fixed: 'right', slot: 'extraAction' }
  ]

  // 搜索配置
  const searchConfig = {
    items: [
      {
        label: '关键词',
        prop: 'keyword',
        component: 'Input',
        componentProps: {
          placeholder: '应聘者姓名/职位名称'
        }
      },
      {
        label: '状态',
        prop: 'status',
        component: 'Select',
        componentProps: {
          placeholder: '请选择状态',
          options: [
            { label: '全部', value: '' },
            { label: '待处理', value: 'pending' },
            { label: '已通过', value: 'accepted' },
            { label: '已拒绝', value: 'rejected' },
            { label: '已安排面试', value: 'interview_scheduled' },
            { label: '已录用', value: 'hired' }
          ]
        }
      }
    ]
  }

  // 视图详情相关
  const viewDialogVisible = ref(false)
  const viewData = ref<JobApplication>({} as JobApplication)

  // 面试表单相关
  const interviewDialogVisible = ref(false)
  const interviewFormRef = ref<FormInstance>()
  const currentApplication = ref<JobApplication>({} as JobApplication)
  const interviewerOptions = ref<Interviewer[]>([])
  const interviewForm = reactive<Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>>({
    jobApplicationId: 0,
    jobSeekerId: 0,
    interviewerId: 0,
    type: '',
    scheduledTime: '',
    location: '',
    status: 'scheduled',
    notes: ''
  })
  const interviewRules: FormRules = {
    type: [{ required: true, message: '请选择面试类型', trigger: 'change' }],
    interviewerId: [{ required: true, message: '请选择面试官', trigger: 'change' }],
    scheduledTime: [{ required: true, message: '请选择面试时间', trigger: 'change' }],
    location: [{ required: true, message: '请输入面试地点或链接', trigger: 'blur' }]
  }

  // 初始化加载数据
  onMounted(() => {
    fetchApplicationList()
  })

  // 获取应聘列表数据
  const fetchApplicationList = async () => {
    loading.value = true
    try {
      const res = await jobApplicationApi.getList(searchParams)
      if (res.success) {
        applicantList.value = res.data.list
        pagination.total = res.data.paging.total
        pagination.page = res.data.paging.page
        pagination.size = res.data.paging.size
      }
    } catch (error) {
      console.error('获取应聘列表失败', error)
      ElMessage.error('获取应聘列表失败')
    } finally {
      loading.value = false
    }
  }

  // 搜索、分页相关方法
  const handleSearch = (params: any) => {
    searchParams.keyword = params.keyword || ''
    searchParams.status = params.status || ''
    searchParams.page = 1
    fetchApplicationList()
  }

  const handlePageChange = (page: number) => {
    searchParams.page = page
    fetchApplicationList()
  }

  const handleSizeChange = (size: number) => {
    searchParams.size = size
    searchParams.page = 1
    fetchApplicationList()
  }

  // 查看应聘详情
  const handleView = async (row: JobApplication) => {
    try {
      const res = await jobApplicationApi.getById(row.id)
      if (res.success) {
        viewData.value = res.data
        viewDialogVisible.value = true
      }
    } catch (error) {
      console.error('获取应聘详情失败', error)
      ElMessage.error('获取应聘详情失败')
    }
  }

  // 更新应聘状态
  const handleUpdateStatus = (id: number, status: string) => {
    const statusText = status === 'accepted' ? '通过' : '拒绝'
    ElMessageBox.confirm(`确认要${statusText}该应聘申请吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        try {
          const res = await jobApplicationApi.updateStatus(id, status)
          if (res.success) {
            ElMessage.success(`操作成功`)
            fetchApplicationList()
          }
        } catch (error) {
          console.error('更新状态失败', error)
          ElMessage.error('操作失败')
        }
      })
      .catch(() => {
        // 用户取消操作
      })
  }

  // 安排面试相关方法
  const handleScheduleInterview = async (row: JobApplication) => {
    currentApplication.value = row
    interviewForm.jobApplicationId = row.id
    interviewForm.jobSeekerId = row.jobSeeker.id

    // 获取公司的面试官列表
    try {
      const res = await interviewerApi.getByCompany(row.jobPosting.companyId)
      if (res.success) {
        interviewerOptions.value = res.data
        interviewDialogVisible.value = true
      }
    } catch (error) {
      console.error('获取面试官列表失败', error)
      ElMessage.error('获取面试官列表失败')
    }
  }

  const submitInterviewForm = async () => {
    if (!interviewFormRef.value) return

    await interviewFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const res = await interviewApi.add(interviewForm as Interview)
          if (res.success) {
            // 更新应聘状态为已安排面试
            await jobApplicationApi.updateStatus(currentApplication.value.id, 'interview_scheduled')
            ElMessage.success('面试安排成功')
            interviewDialogVisible.value = false
            fetchApplicationList()
          }
        } catch (error) {
          console.error('安排面试失败', error)
          ElMessage.error('安排面试失败')
        }
      }
    })
  }

  // 工具方法
  const formatDate = (date: string) => {
    if (!date) return ''
    return new Date(date).toLocaleString()
  }

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: '待处理',
      accepted: '已通过',
      rejected: '已拒绝',
      interview_scheduled: '已安排面试',
      hired: '已录用'
    }
    return statusMap[status] || status
  }

  const getStatusTagType = (status: string) => {
    const typeMap: Record<string, string> = {
      pending: 'info',
      accepted: 'success',
      rejected: 'danger',
      interview_scheduled: 'warning',
      hired: 'success'
    }
    return typeMap[status] || ''
  }
</script>

<style scoped>
  .applicant-list {
    padding: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
