<template>
  <div class="application-list-page">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>求职申请管理</span>
        </div>
      </template>

      <CommonCrudTable
        :data="applicationList"
        :total="total"
        :loading="loading"
        search-placeholder="输入求职者姓名/职位名称搜索"
        @search="handleSearch"
        @view="handleView"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
        :show-add-button="false"
      >
        <el-table-column prop="id" label="申请ID" width="80" />
        <el-table-column label="求职者" min-width="120">
          <template #default="scope">
            {{ scope.row.jobSeeker?.user?.username || '未知求职者' }}
          </template>
        </el-table-column>
        <el-table-column label="职位名称" min-width="150">
          <template #default="scope">
            {{ scope.row.job?.title || '未知职位' }}
          </template>
        </el-table-column>
        <el-table-column label="公司" min-width="120">
          <template #default="scope">
            {{ scope.row.job?.company?.name || '未知公司' }}
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.appliedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <template #extraActions="{ row }">
          <el-button
            v-if="canScheduleInterview(row.status)"
            type="primary"
            size="small"
            @click="handleScheduleInterview(row)"
            link
          >
            安排面试
          </el-button>
          <el-button
            v-if="canUpdateStatus(row.status)"
            type="success"
            size="small"
            @click="handleUpdateStatus(row)"
            link
          >
            更新状态
          </el-button>
        </template>
      </CommonCrudTable>
    </el-card>

    <!-- 查看详情弹窗 -->
    <el-dialog v-model="viewDialogVisible" title="申请详情" width="60%">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="申请ID" :span="1">{{
          currentApplication?.id
        }}</el-descriptions-item>
        <el-descriptions-item label="申请时间" :span="1">
          {{ formatDate(currentApplication?.appliedAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="求职者" :span="1">
          {{ currentApplication?.jobSeeker?.user?.username }}
        </el-descriptions-item>
        <el-descriptions-item label="职位名称" :span="1">
          {{ currentApplication?.job?.title }}
        </el-descriptions-item>
        <el-descriptions-item label="公司名称" :span="1">
          {{ currentApplication?.job?.company?.name }}
        </el-descriptions-item>
        <el-descriptions-item label="当前状态" :span="1">
          <el-tag :type="getStatusTagType(currentApplication?.status)">
            {{ getStatusText(currentApplication?.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="简历链接" :span="2" v-if="currentApplication?.resumeUrl">
          <el-link :href="currentApplication.resumeUrl" type="primary" target="_blank">
            查看简历
          </el-link>
        </el-descriptions-item>
        <el-descriptions-item label="求职信" :span="2" v-if="currentApplication?.coverLetterUrl">
          <el-link :href="currentApplication.coverLetterUrl" type="primary" target="_blank">
            查看求职信
          </el-link>
        </el-descriptions-item>
        <el-descriptions-item label="应聘备注" :span="2">
          <div class="application-notes">{{ currentApplication?.notes || '无' }}</div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 面试安排信息 -->
      <div
        v-if="currentApplication?.interviews && currentApplication.interviews.length > 0"
        class="interview-section"
      >
        <h3>面试安排</h3>
        <el-table :data="currentApplication.interviews" style="width: 100%">
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column label="面试时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.scheduleTime) }}
            </template>
          </el-table-column>
          <el-table-column label="时长" width="100">
            <template #default="scope"> {{ scope.row.duration }}分钟 </template>
          </el-table-column>
          <el-table-column label="状态" width="120">
            <template #default="scope">
              <el-tag :type="getInterviewStatusType(scope.row.status)">
                {{ getInterviewStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="面试链接" min-width="200">
            <template #default="scope">
              <el-link
                v-if="scope.row.meetingLink"
                :href="scope.row.meetingLink"
                type="primary"
                target="_blank"
              >
                {{ scope.row.meetingLink }}
              </el-link>
              <span v-else>无</span>
            </template>
          </el-table-column>
          <el-table-column label="反馈" min-width="200">
            <template #default="scope">
              {{ scope.row.feedback || '暂无反馈' }}
            </template>
          </el-table-column>
        </el-table>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
          <el-button
            v-if="canScheduleInterview(currentApplication?.status)"
            type="primary"
            @click="handleScheduleInterview(currentApplication)"
          >
            安排面试
          </el-button>
          <el-button
            v-if="canUpdateStatus(currentApplication?.status)"
            type="success"
            @click="handleUpdateStatus(currentApplication)"
          >
            更新状态
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 安排面试弹窗 -->
    <el-dialog
      v-model="scheduleDialogVisible"
      title="安排面试"
      width="40%"
      :close-on-click-modal="false"
    >
      <el-form
        ref="scheduleFormRef"
        :model="scheduleForm"
        :rules="scheduleRules"
        label-position="top"
      >
        <el-form-item label="面试时间" prop="scheduleTime">
          <el-date-picker
            v-model="scheduleForm.scheduleTime"
            type="datetime"
            placeholder="选择日期时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="面试时长(分钟)" prop="duration">
          <el-input-number
            v-model="scheduleForm.duration"
            :min="15"
            :step="15"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="面试链接" prop="meetingLink">
          <el-input v-model="scheduleForm.meetingLink" placeholder="输入线上会议链接" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="scheduleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitScheduleForm" :loading="submitLoading"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 更新状态弹窗 -->
    <el-dialog
      v-model="statusDialogVisible"
      title="更新申请状态"
      width="40%"
      :close-on-click-modal="false"
    >
      <el-form ref="statusFormRef" :model="statusForm" :rules="statusRules" label-position="top">
        <el-form-item label="当前状态">
          <el-tag :type="getStatusTagType(currentApplication?.status)">
            {{ getStatusText(currentApplication?.status) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="新状态" prop="status">
          <el-select v-model="statusForm.status" placeholder="请选择新状态" style="width: 100%">
            <el-option
              v-for="option in getNextStatusOptions(currentApplication?.status)"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="反馈" prop="feedback" v-if="showFeedbackField">
          <el-input
            v-model="statusForm.feedback"
            type="textarea"
            :rows="4"
            placeholder="请输入反馈内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="statusDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitStatusForm" :loading="submitLoading"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import CommonCrudTable from '@/components/CommonCrudTable.vue'
  import { JobApplicationService, InterviewService } from '@/api/userApi'
  import { JobApplication, Interview } from '@/api/model/userModel'
  import { ElMessage, FormInstance, FormRules } from 'element-plus'

  // 数据列表
  const applicationList = ref<JobApplication[]>([])
  const total = ref(0)
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchKeyword = ref('')

  // 查看详情
  const viewDialogVisible = ref(false)
  const currentApplication = ref<JobApplication | null>(null)

  // 安排面试
  const scheduleDialogVisible = ref(false)
  const scheduleFormRef = ref<FormInstance>()
  const scheduleForm = ref({
    scheduleTime: null as Date | null,
    duration: 60,
    meetingLink: ''
  })
  const scheduleRules = ref<FormRules>({
    scheduleTime: [{ required: true, message: '请选择面试时间', trigger: 'change' }],
    duration: [{ required: true, message: '请输入面试时长', trigger: 'blur' }]
  })

  // 更新状态
  const statusDialogVisible = ref(false)
  const statusFormRef = ref<FormInstance>()
  const statusForm = ref({
    status: '',
    feedback: ''
  })
  const statusRules = ref<FormRules>({
    status: [{ required: true, message: '请选择新状态', trigger: 'change' }],
    feedback: [{ required: false, message: '请输入反馈', trigger: 'blur' }]
  })

  const submitLoading = ref(false)

  // 是否显示反馈字段
  const showFeedbackField = computed(() => {
    return ['OFFER', 'REJECTED'].includes(statusForm.value.status)
  })

  // 获取数据
  onMounted(() => {
    fetchApplicationList()
  })

  const fetchApplicationList = async () => {
    loading.value = true
    try {
      const res = await JobApplicationService.getJobApplicationList({
        page: currentPage.value,
        size: pageSize.value,
        keyword: searchKeyword.value
      })

      if (res.code === 200) {
        applicationList.value = res.data || []
        total.value = res.total || 0
      } else {
        ElMessage.error(res.message || '获取申请列表失败')
      }
    } catch (_error) {
      ElMessage.error('获取申请列表失败')
    } finally {
      loading.value = false
    }
  }

  // 处理搜索
  const handleSearch = (params: { keyword: string; page: number; pageSize: number }) => {
    searchKeyword.value = params.keyword
    currentPage.value = params.page
    pageSize.value = params.pageSize
    fetchApplicationList()
  }

  // 处理分页
  const handlePageChange = (params: { page: number; pageSize: number }) => {
    currentPage.value = params.page
    pageSize.value = params.pageSize
    fetchApplicationList()
  }

  const handleSizeChange = (params: { page: number; pageSize: number }) => {
    currentPage.value = params.page
    pageSize.value = params.pageSize
    fetchApplicationList()
  }

  // 查看详情
  const handleView = async (row: JobApplication) => {
    try {
      const res = await JobApplicationService.getJobApplicationDetail(row.id!)
      if (res.code === 200) {
        currentApplication.value = res.data
        viewDialogVisible.value = true
      } else {
        ElMessage.error(res.message || '获取申请详情失败')
      }
    } catch (_error) {
      ElMessage.error('获取申请详情失败')
    }
  }

  // 安排面试
  const handleScheduleInterview = (application: JobApplication | null) => {
    if (!application) return

    currentApplication.value = application
    scheduleForm.value = {
      scheduleTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 默认为明天
      duration: 60,
      meetingLink: ''
    }
    scheduleDialogVisible.value = true
  }

  // 提交面试安排
  const submitScheduleForm = async () => {
    if (!scheduleFormRef.value || !currentApplication.value) return

    await scheduleFormRef.value.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true
        try {
          const res = await InterviewService.scheduleInterview({
            applicationId: currentApplication.value.id!,
            scheduleTime: scheduleForm.value.scheduleTime!,
            duration: scheduleForm.value.duration,
            meetingLink: scheduleForm.value.meetingLink
          })

          if (res.code === 200) {
            ElMessage.success('面试安排成功')
            scheduleDialogVisible.value = false

            // 更新申请状态为"已安排面试"
            await JobApplicationService.updateApplicationStatus(
              currentApplication.value.id!,
              'SCHEDULED'
            )

            // 刷新列表和详情
            fetchApplicationList()
            if (viewDialogVisible.value) {
              handleView(currentApplication.value)
            }
          } else {
            ElMessage.error(res.message || '面试安排失败')
          }
        } catch (_error) {
          ElMessage.error('面试安排失败')
        } finally {
          submitLoading.value = false
        }
      }
    })
  }

  // 更新状态
  const handleUpdateStatus = (application: JobApplication | null) => {
    if (!application) return

    currentApplication.value = application
    statusForm.value = {
      status: '',
      feedback: ''
    }
    statusDialogVisible.value = true
  }

  // 提交状态更新
  const submitStatusForm = async () => {
    if (!statusFormRef.value || !currentApplication.value) return

    await statusFormRef.value.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true
        try {
          // 更新申请状态
          const res = await JobApplicationService.updateApplicationStatus(
            currentApplication.value.id!,
            statusForm.value.status,
            statusForm.value.feedback
          )

          if (res.code === 200) {
            ElMessage.success('状态更新成功')
            statusDialogVisible.value = false

            // 刷新列表和详情
            fetchApplicationList()
            if (viewDialogVisible.value) {
              handleView(currentApplication.value)
            }
          } else {
            ElMessage.error(res.message || '状态更新失败')
          }
        } catch (_error) {
          ElMessage.error('状态更新失败')
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

  // 获取状态标签类型
  const getStatusTagType = (status: string | undefined) => {
    if (!status) return ''
    const statusMap: Record<string, string> = {
      RESUME_SCREENING: 'info',
      WRITTEN_TEST: 'info',
      FIRST_INTERVIEW: 'warning',
      SECOND_INTERVIEW: 'warning',
      HR_INTERVIEW: 'warning',
      SCHEDULED: 'primary',
      OFFER: 'success',
      REJECTED: 'danger'
    }
    return statusMap[status] || ''
  }

  // 获取面试状态标签类型
  const getInterviewStatusType = (status: string | undefined) => {
    if (!status) return ''
    const statusMap: Record<string, string> = {
      SCHEDULED: 'warning',
      COMPLETED: 'success',
      CANCELLED: 'info'
    }
    return statusMap[status] || ''
  }

  // 获取状态文本
  const getStatusText = (status: string | undefined) => {
    if (!status) return '未知'
    const statusMap: Record<string, string> = {
      RESUME_SCREENING: '简历筛选',
      WRITTEN_TEST: '笔试',
      FIRST_INTERVIEW: '一面',
      SECOND_INTERVIEW: '二面',
      HR_INTERVIEW: 'HR面试',
      SCHEDULED: '已安排面试',
      OFFER: 'Offer',
      REJECTED: '已拒绝'
    }
    return statusMap[status] || '未知'
  }

  // 获取面试状态文本
  const getInterviewStatusText = (status: string | undefined) => {
    if (!status) return '未知'
    const statusMap: Record<string, string> = {
      SCHEDULED: '已安排',
      COMPLETED: '已完成',
      CANCELLED: '已取消'
    }
    return statusMap[status] || '未知'
  }

  // 判断是否可以安排面试
  const canScheduleInterview = (status: string | undefined) => {
    if (!status) return false
    // 在这些状态下可以安排面试
    return [
      'RESUME_SCREENING',
      'WRITTEN_TEST',
      'FIRST_INTERVIEW',
      'SECOND_INTERVIEW',
      'HR_INTERVIEW'
    ].includes(status)
  }

  // 判断是否可以更新状态
  const canUpdateStatus = (status: string | undefined) => {
    if (!status) return false
    // 在除了最终状态(Offer和已拒绝)外的状态下可以更新状态
    return !['OFFER', 'REJECTED'].includes(status)
  }

  // 获取下一步可选状态
  const getNextStatusOptions = (currentStatus: string | undefined) => {
    if (!currentStatus) return []

    // 定义状态流转规则
    const statusFlow: Record<string, Array<{ value: string; label: string }>> = {
      RESUME_SCREENING: [
        { value: 'WRITTEN_TEST', label: '笔试' },
        { value: 'FIRST_INTERVIEW', label: '一面' },
        { value: 'REJECTED', label: '拒绝' }
      ],
      WRITTEN_TEST: [
        { value: 'FIRST_INTERVIEW', label: '一面' },
        { value: 'REJECTED', label: '拒绝' }
      ],
      FIRST_INTERVIEW: [
        { value: 'SECOND_INTERVIEW', label: '二面' },
        { value: 'HR_INTERVIEW', label: 'HR面试' },
        { value: 'REJECTED', label: '拒绝' }
      ],
      SECOND_INTERVIEW: [
        { value: 'HR_INTERVIEW', label: 'HR面试' },
        { value: 'OFFER', label: 'Offer' },
        { value: 'REJECTED', label: '拒绝' }
      ],
      HR_INTERVIEW: [
        { value: 'OFFER', label: 'Offer' },
        { value: 'REJECTED', label: '拒绝' }
      ],
      SCHEDULED: [
        { value: 'FIRST_INTERVIEW', label: '一面' },
        { value: 'SECOND_INTERVIEW', label: '二面' },
        { value: 'HR_INTERVIEW', label: 'HR面试' },
        { value: 'REJECTED', label: '拒绝' }
      ]
    }

    return statusFlow[currentStatus] || []
  }
</script>

<style scoped>
  .application-list-page {
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

  .application-notes {
    white-space: pre-line;
    max-height: 100px;
    overflow-y: auto;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 4px;
  }

  .interview-section {
    margin-top: 20px;
    border-top: 1px solid #eee;
    padding-top: 20px;
  }
</style>
