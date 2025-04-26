<template>
  <div class="interview-list-page">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>面试管理</span>
        </div>
      </template>

      <CommonCrudTable
        :data="interviewList"
        :total="total"
        :loading="loading"
        search-placeholder="输入求职者姓名/职位名称搜索"
        @search="handleSearch"
        @view="handleView"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
        :show-add-button="false"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="求职者" min-width="120">
          <template #default="scope">
            {{ scope.row.application?.jobSeeker?.user?.username || '未知求职者' }}
          </template>
        </el-table-column>
        <el-table-column label="职位名称" min-width="150">
          <template #default="scope">
            {{ scope.row.application?.job?.title || '未知职位' }}
          </template>
        </el-table-column>
        <el-table-column label="公司" min-width="120">
          <template #default="scope">
            {{ scope.row.application?.job?.company?.name || '未知公司' }}
          </template>
        </el-table-column>
        <el-table-column label="面试时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.scheduleTime) }}
          </template>
        </el-table-column>
        <el-table-column label="时长" width="100">
          <template #default="scope">
            {{ scope.row.duration }}分钟
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status) || 'info'">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <template #extraActions="{ row }">
          <el-button
            v-if="row.status === 'SCHEDULED'"
            type="success"
            size="small"
            @click="handleComplete(row)"
            link
          >
            完成面试
          </el-button>
          <el-button
            v-if="row.status === 'SCHEDULED'"
            type="danger"
            size="small"
            @click="handleCancel(row)"
            link
          >
            取消面试
          </el-button>
        </template>
      </CommonCrudTable>
    </el-card>

    <!-- 查看详情弹窗 -->
    <el-dialog v-model="viewDialogVisible" title="面试详情" width="60%">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="面试ID" :span="1">{{ currentInterview?.id }}</el-descriptions-item>
        <el-descriptions-item label="面试时间" :span="1">
          {{ formatDate(currentInterview?.scheduleTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="时长" :span="1">
          {{ currentInterview?.duration }}分钟
        </el-descriptions-item>
        <el-descriptions-item label="状态" :span="1">
          <el-tag :type="getStatusType(currentInterview?.status) || 'info'">
            {{ getStatusText(currentInterview?.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="求职者" :span="1">
          {{ currentInterview?.application?.jobSeeker?.user?.username }}
        </el-descriptions-item>
        <el-descriptions-item label="职位名称" :span="1">
          {{ currentInterview?.application?.job?.title }}
        </el-descriptions-item>
        <el-descriptions-item label="公司名称" :span="1">
          {{ currentInterview?.application?.job?.company?.name }}
        </el-descriptions-item>
        <el-descriptions-item label="申请状态" :span="1">
          <el-tag :type="getApplicationStatusType(currentInterview?.application?.status) || 'info'">
            {{ getApplicationStatusText(currentInterview?.application?.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="面试链接" :span="2" v-if="currentInterview?.meetingLink">
          <el-link :href="currentInterview.meetingLink" type="primary" target="_blank">
            {{ currentInterview.meetingLink }}
          </el-link>
        </el-descriptions-item>
        <el-descriptions-item label="面试反馈" :span="2">
          <div class="interview-feedback">{{ currentInterview?.feedback || '暂无反馈' }}</div>
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
          <el-button
            v-if="currentInterview?.status === 'SCHEDULED'"
            type="success"
            @click="handleComplete(currentInterview)"
          >
            完成面试
          </el-button>
          <el-button
            v-if="currentInterview?.status === 'SCHEDULED'"
            type="danger"
            @click="handleCancel(currentInterview)"
          >
            取消面试
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 完成面试弹窗 -->
    <el-dialog
      v-model="completeDialogVisible"
      title="完成面试"
      width="40%"
      :close-on-click-modal="false"
    >
      <el-form
        ref="completeFormRef"
        :model="completeForm"
        :rules="completeRules"
        label-position="top"
      >
        <el-form-item label="面试反馈" prop="feedback">
          <el-input
            v-model="completeForm.feedback"
            type="textarea"
            :rows="6"
            placeholder="请输入面试反馈"
          />
        </el-form-item>
        <el-form-item label="更新申请状态" prop="nextStatus">
          <el-select v-model="completeForm.nextStatus" placeholder="请选择下一步状态" style="width: 100%">
            <el-option label="二面" value="SECOND_INTERVIEW" />
            <el-option label="HR面试" value="HR_INTERVIEW" />
            <el-option label="发放Offer" value="OFFER" />
            <el-option label="拒绝申请" value="REJECTED" />
            <el-option label="不更新状态" value="NONE" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="completeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCompleteForm" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 取消面试弹窗 -->
    <el-dialog
      v-model="cancelDialogVisible"
      title="取消面试"
      width="40%"
      :close-on-click-modal="false"
    >
      <p>确定要取消此次面试吗？</p>
      <el-form
        ref="cancelFormRef"
        :model="cancelForm"
        :rules="cancelRules"
        label-position="top"
      >
        <el-form-item label="取消原因" prop="reason">
          <el-input
            v-model="cancelForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入取消原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelDialogVisible = false">关闭</el-button>
          <el-button type="danger" @click="submitCancelForm" :loading="submitLoading">确定取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CommonCrudTable from '@/components/CommonCrudTable.vue'
import { InterviewService, JobApplicationService } from '@/api/userApi'
import { Interview } from '@/api/model/userModel'
import { ElMessage, FormInstance, FormRules } from 'element-plus'

// 数据列表
const interviewList = ref<Interview[]>([])
const total = ref(0)
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')

// 查看详情
const viewDialogVisible = ref(false)
const currentInterview = ref<Interview | null>(null)

// 完成面试
const completeDialogVisible = ref(false)
const completeFormRef = ref<FormInstance>()
const completeForm = ref({
  feedback: '',
  nextStatus: 'NONE' // 默认不更新申请状态
})
const completeRules = ref<FormRules>({
  feedback: [{ required: true, message: '请输入面试反馈', trigger: 'blur' }],
  nextStatus: [{ required: true, message: '请选择下一步状态', trigger: 'change' }]
})

// 取消面试
const cancelDialogVisible = ref(false)
const cancelFormRef = ref<FormInstance>()
const cancelForm = ref({
  reason: ''
})
const cancelRules = ref<FormRules>({
  reason: [{ required: true, message: '请输入取消原因', trigger: 'blur' }]
})

const submitLoading = ref(false)

// 获取数据
onMounted(() => {
  fetchInterviewList()
})

const fetchInterviewList = async () => {
  loading.value = true
  try {
    const res = await InterviewService.getInterviewList({
      page: currentPage.value,
      size: pageSize.value,
      keyword: searchKeyword.value
    })

    if (res.code === 200) {
      interviewList.value = res.data || []
      total.value = res.total || 0
    } else {
      ElMessage.error(res.message || '获取面试列表失败')
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    ElMessage.error('获取面试列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = (params: { keyword: string; page: number; pageSize: number }) => {
  searchKeyword.value = params.keyword
  currentPage.value = params.page
  pageSize.value = params.pageSize
  fetchInterviewList()
}

// 处理分页
const handlePageChange = (params: { page: number; pageSize: number }) => {
  currentPage.value = params.page
  pageSize.value = params.pageSize
  fetchInterviewList()
}

const handleSizeChange = (params: { page: number; pageSize: number }) => {
  currentPage.value = params.page
  pageSize.value = params.pageSize
  fetchInterviewList()
}

// 查看详情
const handleView = async (row: Interview) => {
  try {
    const res = await InterviewService.getInterviewById(row.id!)
    if (res.code === 200) {
      currentInterview.value = res.data
      viewDialogVisible.value = true
    } else {
      ElMessage.error(res.message || '获取面试详情失败')
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    ElMessage.error('获取面试详情失败')
  }
}

// 完成面试
const handleComplete = (interview: Interview | null) => {
  if (!interview) return

  currentInterview.value = interview
  completeForm.value = {
    feedback: '',
    nextStatus: 'NONE'
  }
  completeDialogVisible.value = true
}

// 提交完成面试表单
const submitCompleteForm = async () => {
  if (!completeFormRef.value || !currentInterview.value) return

  await completeFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        // 更新面试状态为已完成
        const res = await InterviewService.updateInterviewStatus(
          currentInterview.value.id!,
          'COMPLETED',
          completeForm.value.feedback
        )

        if (res.code === 200) {
          ElMessage.success('面试已标记为完成')
          
          // 如果需要更新申请状态
          if (completeForm.value.nextStatus !== 'NONE' && currentInterview.value.application?.id) {
            try {
              await JobApplicationService.updateApplicationStatus(
                currentInterview.value.application.id,
                completeForm.value.nextStatus
              )
              ElMessage.success('求职申请状态已更新')
            } catch (_error) {
              ElMessage.warning('面试状态已更新，但申请状态更新失败')
            }
          }
          
          completeDialogVisible.value = false
          fetchInterviewList()
          if (viewDialogVisible.value) {
            handleView(currentInterview.value)
          }
        } else {
          ElMessage.error(res.message || '操作失败')
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        ElMessage.error('操作失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 取消面试
const handleCancel = (interview: Interview | null) => {
  if (!interview) return

  currentInterview.value = interview
  cancelForm.value = {
    reason: ''
  }
  cancelDialogVisible.value = true
}

// 提交取消面试表单
const submitCancelForm = async () => {
  if (!cancelFormRef.value || !currentInterview.value) return

  await cancelFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        // 更新面试状态为已取消
        const res = await InterviewService.updateInterviewStatus(
          currentInterview.value.id!,
          'CANCELLED',
          cancelForm.value.reason
        )

        if (res.code === 200) {
          ElMessage.success('面试已取消')
          cancelDialogVisible.value = false
          fetchInterviewList()
          if (viewDialogVisible.value) {
            viewDialogVisible.value = false
          }
        } else {
          ElMessage.error(res.message || '操作失败')
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        ElMessage.error('操作失败')
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

// 获取面试状态标签类型
const getStatusType = (status: string | undefined) => {
  if (!status) return 'info'
  const statusMap: Record<string, string> = {
    SCHEDULED: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'info'
  }
  return statusMap[status] || 'info'
}

// 获取面试状态文本
const getStatusText = (status: string | undefined) => {
  if (!status) return '未知'
  const statusMap: Record<string, string> = {
    SCHEDULED: '已安排',
    COMPLETED: '已完成',
    CANCELLED: '已取消'
  }
  return statusMap[status] || '未知'
}

// 获取申请状态标签类型
const getApplicationStatusType = (status: string | undefined) => {
  if (!status) return 'info'
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
  return statusMap[status] || 'info'
}

// 获取申请状态文本
const getApplicationStatusText = (status: string | undefined) => {
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
</script>

<style scoped>
.interview-list-page {
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

.interview-feedback {
  white-space: pre-line;
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}
</style> 