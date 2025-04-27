<template>
  <div class="interview-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>面试管理</span>
        </div>
      </template>

      <CommonCrudTable
        ref="crudTable"
        :data="interviewList"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        @search="handleSearch"
      >
        <!-- 搜索区域 -->
        <template #search>
          <el-form :inline="true" :model="searchParams" ref="searchForm">
            <el-form-item label="职位" prop="jobId">
              <el-select v-model="searchParams.jobId" placeholder="选择职位" clearable>
                <el-option
                  v-for="job in jobOptions"
                  :key="job.id"
                  :label="job.title"
                  :value="job.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="面试官" prop="interviewerId">
              <el-select v-model="searchParams.interviewerId" placeholder="选择面试官" clearable>
                <el-option
                  v-for="interviewer in interviewerOptions"
                  :key="interviewer.id"
                  :label="interviewer.name"
                  :value="interviewer.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="searchParams.status" placeholder="面试状态" clearable>
                <el-option label="待面试" value="PENDING" />
                <el-option label="已完成" value="COMPLETED" />
                <el-option label="已取消" value="CANCELED" />
              </el-select>
            </el-form-item>
            <el-form-item label="面试日期">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-form>
        </template>

        <!-- 表格操作列 -->
        <template #operation="{ row }">
          <el-button type="primary" size="small" @click="handleView(row)">查看</el-button>
          <el-button
            v-if="row.status === 'PENDING'"
            type="success"
            size="small"
            @click="handleFeedback(row)"
          >
            提交反馈
          </el-button>
          <el-button
            v-if="row.status === 'PENDING'"
            type="danger"
            size="small"
            @click="handleCancel(row)"
          >
            取消面试
          </el-button>
        </template>
      </CommonCrudTable>
    </el-card>

    <!-- 查看面试详情 -->
    <el-dialog v-model="viewDialogVisible" title="面试详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="职位">{{ currentInterview.jobTitle }}</el-descriptions-item>
        <el-descriptions-item label="公司">{{ currentInterview.companyName }}</el-descriptions-item>
        <el-descriptions-item label="应聘者">{{
          currentInterview.applicantName
        }}</el-descriptions-item>
        <el-descriptions-item label="面试官">{{
          currentInterview.interviewerName
        }}</el-descriptions-item>
        <el-descriptions-item label="面试时间">
          {{ formatDateTime(currentInterview.scheduledTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="面试地点">{{
          currentInterview.location
        }}</el-descriptions-item>
        <el-descriptions-item label="面试类型">{{
          interviewTypeMap[currentInterview.type]
        }}</el-descriptions-item>
        <el-descriptions-item label="面试状态">{{
          statusMap[currentInterview.status]
        }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ currentInterview.notes }}</el-descriptions-item>
      </el-descriptions>

      <template v-if="currentInterview.feedback && currentInterview.status === 'COMPLETED'">
        <div class="feedback-section">
          <h3>面试反馈</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="技术评分">
              {{ currentInterview.feedback.technicalScore }} / 5
            </el-descriptions-item>
            <el-descriptions-item label="沟通评分">
              {{ currentInterview.feedback.communicationScore }} / 5
            </el-descriptions-item>
            <el-descriptions-item label="文化匹配度">
              {{ currentInterview.feedback.cultureFitScore }} / 5
            </el-descriptions-item>
            <el-descriptions-item label="推荐结果">
              {{ recommendationMap[currentInterview.feedback.recommendation] }}
            </el-descriptions-item>
            <el-descriptions-item label="评价">
              {{ currentInterview.feedback.comments }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </template>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 面试反馈表单 -->
    <el-dialog v-model="feedbackDialogVisible" title="提交面试反馈" width="600px">
      <el-form
        :model="feedbackForm"
        label-width="120px"
        :rules="feedbackRules"
        ref="feedbackFormRef"
      >
        <el-form-item label="技术评分" prop="technicalScore">
          <el-rate v-model="feedbackForm.technicalScore" :max="5" />
        </el-form-item>
        <el-form-item label="沟通评分" prop="communicationScore">
          <el-rate v-model="feedbackForm.communicationScore" :max="5" />
        </el-form-item>
        <el-form-item label="文化匹配度" prop="cultureFitScore">
          <el-rate v-model="feedbackForm.cultureFitScore" :max="5" />
        </el-form-item>
        <el-form-item label="推荐结果" prop="recommendation">
          <el-select v-model="feedbackForm.recommendation" placeholder="请选择推荐结果">
            <el-option label="强烈推荐" value="STRONG_YES" />
            <el-option label="推荐" value="YES" />
            <el-option label="待定" value="MAYBE" />
            <el-option label="不推荐" value="NO" />
            <el-option label="强烈不推荐" value="STRONG_NO" />
          </el-select>
        </el-form-item>
        <el-form-item label="评价" prop="comments">
          <el-input
            v-model="feedbackForm.comments"
            type="textarea"
            :rows="4"
            placeholder="请输入面试评价"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="feedbackDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitFeedback">提交</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 取消面试 -->
    <el-dialog v-model="cancelDialogVisible" title="取消面试" width="500px">
      <el-form :model="cancelForm" label-width="100px" :rules="cancelRules" ref="cancelFormRef">
        <el-form-item label="取消原因" prop="reason">
          <el-input
            v-model="cancelForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入取消面试的原因"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmCancel">确认取消面试</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, computed } from 'vue'
  import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
  import { useRouter } from 'vue-router'
  import { InterviewService, InterviewListParams } from '@/api/interview'
  import { JobService } from '@/api/job'
  import { UserService } from '@/api/user'
  import type { Interview, InterviewFeedback } from '@/api/model/userModel'
  import CommonCrudTable from '@/components/CommonCrudTable.vue'

  // 表格列配置
  const columns = [
    { prop: 'id', label: 'ID', width: '80' },
    { prop: 'jobTitle', label: '职位', minWidth: '120' },
    { prop: 'companyName', label: '公司', minWidth: '120' },
    { prop: 'applicantName', label: '应聘者', minWidth: '120' },
    { prop: 'interviewerName', label: '面试官', minWidth: '120' },
    {
      prop: 'scheduledTime',
      label: '面试时间',
      minWidth: '150',
      formatter: (row: Interview) => formatDateTime(row.scheduledTime)
    },
    {
      prop: 'type',
      label: '面试类型',
      width: '100',
      formatter: (row: Interview) => interviewTypeMap[row.type]
    },
    {
      prop: 'status',
      label: '状态',
      width: '100',
      formatter: (row: Interview) => statusMap[row.status]
    },
    { slot: 'operation', label: '操作', fixed: 'right', width: '240' }
  ]

  // 状态映射
  const statusMap = {
    PENDING: '待面试',
    COMPLETED: '已完成',
    CANCELED: '已取消'
  }

  // 面试类型映射
  const interviewTypeMap = {
    ONSITE: '现场面试',
    PHONE: '电话面试',
    VIDEO: '视频面试'
  }

  // 推荐结果映射
  const recommendationMap = {
    STRONG_YES: '强烈推荐',
    YES: '推荐',
    MAYBE: '待定',
    NO: '不推荐',
    STRONG_NO: '强烈不推荐'
  }

  // 数据
  const interviewList = ref<Interview[]>([])
  const loading = ref(false)
  const pagination = reactive({
    total: 0,
    page: 1,
    size: 10
  })

  // 下拉选项
  const jobOptions = ref<{ id: number; title: string }[]>([])
  const interviewerOptions = ref<{ id: number; name: string }[]>([])

  // 搜索参数
  const searchParams = reactive<InterviewListParams>({
    page: 1,
    size: 10,
    jobId: undefined,
    interviewerId: undefined,
    status: undefined,
    fromDate: undefined,
    toDate: undefined
  })

  const dateRange = ref<[string, string] | null>(null)

  // 当前选中的面试
  const currentInterview = ref<Interview>({} as Interview)

  // 对话框显示状态
  const viewDialogVisible = ref(false)
  const feedbackDialogVisible = ref(false)
  const cancelDialogVisible = ref(false)

  // 反馈表单
  const feedbackFormRef = ref<FormInstance>()
  const feedbackForm = reactive<InterviewFeedback>({
    technicalScore: 0,
    communicationScore: 0,
    cultureFitScore: 0,
    recommendation: 'MAYBE',
    comments: ''
  })

  const feedbackRules = {
    technicalScore: [{ required: true, message: '请评分', trigger: 'change' }],
    communicationScore: [{ required: true, message: '请评分', trigger: 'change' }],
    cultureFitScore: [{ required: true, message: '请评分', trigger: 'change' }],
    recommendation: [{ required: true, message: '请选择推荐结果', trigger: 'change' }]
  }

  // 取消面试表单
  const cancelFormRef = ref<FormInstance>()
  const cancelForm = reactive({
    reason: ''
  })

  const cancelRules = {
    reason: [
      { required: true, message: '请输入取消原因', trigger: 'blur' },
      { min: 5, message: '取消原因不能少于5个字符', trigger: 'blur' }
    ]
  }

  // 监听日期范围变化
  const watchDateRange = computed(() => {
    if (dateRange.value) {
      searchParams.fromDate = dateRange.value[0]
      searchParams.toDate = dateRange.value[1]
    } else {
      searchParams.fromDate = undefined
      searchParams.toDate = undefined
    }
    return dateRange.value
  })

  // 初始化
  onMounted(async () => {
    await Promise.all([fetchInterviewList(), fetchJobOptions(), fetchInterviewerOptions()])
  })

  // 获取面试列表
  const fetchInterviewList = async () => {
    loading.value = true
    try {
      const res = await InterviewService.getInterviewList(searchParams)
      if (res.success) {
        interviewList.value = res.data.items
        pagination.total = res.data.total
      }
    } catch (error) {
      console.error('获取面试列表失败', error)
      ElMessage.error('获取面试列表失败')
    } finally {
      loading.value = false
    }
  }

  // 获取职位选项
  const fetchJobOptions = async () => {
    try {
      const res = await JobService.getJobList({ page: 1, size: 100 })
      if (res.success) {
        jobOptions.value = res.data.items.map((job) => ({
          id: job.id,
          title: job.title
        }))
      }
    } catch (error) {
      console.error('获取职位选项失败', error)
    }
  }

  // 获取面试官选项
  const fetchInterviewerOptions = async () => {
    try {
      const res = await UserService.getInterviewerList({ page: 1, size: 100 })
      if (res.success) {
        interviewerOptions.value = res.data.items.map((interviewer) => ({
          id: interviewer.id,
          name: interviewer.name
        }))
      }
    } catch (error) {
      console.error('获取面试官选项失败', error)
    }
  }

  // 处理分页变化
  const handlePageChange = (page: number) => {
    searchParams.page = page
    fetchInterviewList()
  }

  // 处理搜索
  const handleSearch = () => {
    searchParams.page = 1
    fetchInterviewList()
  }

  // 查看面试详情
  const handleView = async (row: Interview) => {
    try {
      const res = await InterviewService.getInterviewDetail(row.id)
      if (res.success) {
        currentInterview.value = res.data
        viewDialogVisible.value = true

        // 如果有反馈，获取反馈信息
        if (res.data.status === 'COMPLETED') {
          try {
            const feedbackRes = await InterviewService.getFeedback(row.id)
            if (feedbackRes.success) {
              currentInterview.value.feedback = feedbackRes.data
            }
          } catch (error) {
            console.error('获取面试反馈失败', error)
          }
        }
      }
    } catch (error) {
      console.error('获取面试详情失败', error)
      ElMessage.error('获取面试详情失败')
    }
  }

  // 提交反馈对话框
  const handleFeedback = (row: Interview) => {
    currentInterview.value = row

    // 重置表单
    Object.assign(feedbackForm, {
      technicalScore: 0,
      communicationScore: 0,
      cultureFitScore: 0,
      recommendation: 'MAYBE',
      comments: ''
    })

    feedbackDialogVisible.value = true
  }

  // 提交反馈
  const submitFeedback = async () => {
    if (!feedbackFormRef.value) return

    await feedbackFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const res = await InterviewService.submitFeedback(currentInterview.value.id, feedbackForm)
          if (res.success) {
            // 更新面试状态为已完成
            await InterviewService.updateInterviewStatus(currentInterview.value.id, 'COMPLETED')

            ElMessage.success('反馈提交成功')
            feedbackDialogVisible.value = false
            fetchInterviewList()
          }
        } catch (error) {
          console.error('提交反馈失败', error)
          ElMessage.error('提交反馈失败')
        }
      }
    })
  }

  // 取消面试对话框
  const handleCancel = (row: Interview) => {
    currentInterview.value = row
    cancelForm.reason = ''
    cancelDialogVisible.value = true
  }

  // 确认取消面试
  const confirmCancel = async () => {
    if (!cancelFormRef.value) return

    await cancelFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const res = await InterviewService.cancelInterview(
            currentInterview.value.id,
            cancelForm.reason
          )
          if (res.success) {
            ElMessage.success('面试已取消')
            cancelDialogVisible.value = false
            fetchInterviewList()
          }
        } catch (error) {
          console.error('取消面试失败', error)
          ElMessage.error('取消面试失败')
        }
      }
    })
  }

  // 格式化日期时间
  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return '-'
    const date = new Date(dateTime)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
</script>

<style scoped>
  .interview-container {
    padding: 20px;
  }

  .box-card {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .feedback-section {
    margin-top: 20px;
    border-top: 1px solid #eee;
    padding-top: 20px;
  }

  .feedback-section h3 {
    margin-bottom: 15px;
    font-weight: 500;
    color: #303133;
  }
</style>
