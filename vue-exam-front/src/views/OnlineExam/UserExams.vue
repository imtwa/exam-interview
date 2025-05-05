<template>
  <div class="user-exams-page">
    <div class="user-exams-container">
      <el-card class="table-card">
        <template #header>
          <div class="card-header">
            <h2>我的笔试考试</h2>
            <div class="header-actions">
              <el-button type="primary" @click="goToInvitationPage">
                <el-icon><Ticket /></el-icon>
                <span>输入邀请码</span>
              </el-button>
            </div>
          </div>
        </template>

        <div class="invitation-tips">
          <el-alert type="info" :closable="false" show-icon>
            <div class="tips-content">
              <strong>温馨提示：</strong>
              <p>
                所有笔试邀请码会发送至您的注册邮箱，请及时查收。如果未收到邮件，请检查垃圾邮件箱或联系招聘方。
              </p>
            </div>
          </el-alert>
        </div>

        <div v-loading="loading" class="table-container">
          <template v-if="examList.length > 0">
            <el-table :data="examList" style="width: 100%" border>
              <el-table-column
                prop="companyName"
                label="公司"
                min-width="120"
                show-overflow-tooltip
              >
                <template #default="scope">
                  <div class="company-info">
                    <el-tooltip
                      effect="dark"
                      :content="scope.row.companyName"
                      placement="top"
                      :show-after="1000"
                    >
                      <span class="company-name" @click="viewCompany(scope.row.companyId)">{{
                        scope.row.companyName
                      }}</span>
                    </el-tooltip>
                  </div>
                </template>
              </el-table-column>

              <el-table-column
                prop="positionName"
                label="职位"
                min-width="120"
                show-overflow-tooltip
              >
                <template #default="scope">
                  <div class="position-info">
                    <el-tooltip
                      effect="dark"
                      :content="scope.row.positionName"
                      placement="top"
                      :show-after="1000"
                    >
                      <span class="position-name" @click="viewPosition(scope.row.positionId)">{{
                        scope.row.positionName
                      }}</span>
                    </el-tooltip>
                  </div>
                </template>
              </el-table-column>

              <el-table-column
                prop="examTitle"
                label="试卷标题"
                min-width="150"
                show-overflow-tooltip
              >
                <template #default="scope">
                  <span>{{ scope.row.examTitle }}</span>
                </template>
              </el-table-column>

              <el-table-column prop="examStartTime" label="考试时间" min-width="180">
                <template #default="scope">
                  <div class="time-range">
                    <div>开始：{{ formatDate(scope.row.startTime) }}</div>
                    <div>截止：{{ formatDate(scope.row.endTime) }}</div>
                  </div>
                </template>
              </el-table-column>

              <el-table-column prop="duration" label="时长" min-width="80" align="center">
                <template #default="scope"> {{ scope.row.duration }}分钟 </template>
              </el-table-column>

              <el-table-column prop="status" label="状态" min-width="100" align="center">
                <template #default="scope">
                  <el-tag :type="getStatusTagType(scope.row.status)">
                    {{ getStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column label="操作" fixed="right" min-width="120" align="center">
                <template #default="scope">
                  <div class="action-buttons">
                    <template v-if="scope.row.status === 'PENDING'">
                      <el-button
                        type="primary"
                        size="small"
                        @click="startExam(scope.row)"
                        :disabled="!canStartExam(scope.row)"
                      >
                        开始考试
                      </el-button>
                      <div v-if="!canStartExam(scope.row)" class="not-available-tip">
                        未到考试时间
                      </div>
                    </template>

                    <template v-else-if="scope.row.status === 'COMPLETED'">
                      <el-button type="success" size="small" @click="viewResult(scope.row)">
                        查看结果
                      </el-button>
                    </template>

                    <template v-else-if="scope.row.status === 'EXPIRED'">
                      <el-button type="info" size="small" disabled> 已过期 </el-button>
                    </template>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination-container">
              <el-pagination
                v-model:currentPage="queryParams.page"
                v-model:page-size="queryParams.pageSize"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </template>

          <el-empty v-else description="暂无笔试记录" :image-size="200">
            <el-button type="primary" @click="goToJobs">去浏览职位</el-button>
          </el-empty>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Ticket } from '@element-plus/icons-vue'
import { getUserExams, verifyInvitationCode } from '@/api/exam'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 列表数据
const loading = ref(false)
const examList = ref([])
const total = ref(0)

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10
})

// 获取用户考试列表
const fetchUserExams = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  loading.value = true
  try {
    const response = await getUserExams(queryParams)
    if (response) {
      examList.value = response.items || []
      total.value = response.total || 0
    } else {
      examList.value = []
      total.value = 0
      console.error('获取考试列表响应格式错误:', response)
    }
  } catch (error) {
    console.error('获取考试列表失败:', error)
    ElMessage.error('获取考试列表失败，请稍后重试')
    examList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 判断是否可以开始考试
const canStartExam = exam => {
  const now = new Date()
  return now >= new Date(exam.startTime) && now <= new Date(exam.endTime)
}

// 开始考试
const startExam = exam => {
  if (!canStartExam(exam)) {
    ElMessage.warning('当前不在考试时间范围内')
    return
  }

  ElMessageBox.confirm(
    `您即将开始"${exam.examTitle}"考试，考试时长${exam.duration}分钟，确定现在开始吗？`,
    '开始考试',
    {
      confirmButtonText: '开始考试',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await verifyInvitationCode(exam.invitationCode)
      if (res && res.data) {
        router.push(`/online-exam/session/${res.data.examId}`)
      } else {
        ElMessage.error('验证邀请码失败')
      }
    } catch (error) {
      console.error('进入考试失败:', error)
      ElMessage.error('进入考试失败，请稍后重试')
    }
  })
}

// 查看考试结果
const viewResult = exam => {
  router.push(`/online-exam/result/${exam.invitationCode}`)
}

// 查看公司详情
const viewCompany = companyId => {
  router.push(`/company/${companyId}`)
}

// 查看职位详情
const viewPosition = positionId => {
  router.push(`/job/${positionId}`)
}

// 格式化日期
const formatDate = date => {
  if (!date) return '-'
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 获取状态显示文本
const getStatusText = status => {
  const statusMap = {
    PENDING: '待考试',
    COMPLETED: '已完成',
    EXPIRED: '已过期'
  }
  return statusMap[status] || status
}

// 获取状态标签类型
const getStatusTagType = status => {
  const typeMap = {
    PENDING: 'warning',
    COMPLETED: 'success',
    EXPIRED: 'info'
  }
  return typeMap[status] || ''
}

// 分页处理
const handleSizeChange = size => {
  queryParams.pageSize = size
  queryParams.page = 1
  fetchUserExams()
}

const handleCurrentChange = page => {
  queryParams.page = page
  fetchUserExams()
}

// 跳转到邀请码页面
const goToInvitationPage = () => {
  router.push('/online-exam/invitation')
}

// 跳转到职位列表
const goToJobs = () => {
  router.push('/recruitment')
}

// 页面初始化
onMounted(() => {
  fetchUserExams()
})
</script>

<style lang="less" scoped>
.user-exams-page {
  background-color: #f5f9ff;
  width: 100%;
  min-height: calc(100vh - 72px);
}

.user-exams-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 0 15px;
  }

  @media (max-width: 480px) {
    padding: 0 10px;
  }
}

// 在这里深度覆盖el-card的阴影样式
:deep(.el-card) {
  border-radius: 8px;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  overflow: hidden;

  &:hover {
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  }

  .el-card__header {
    padding: 18px 20px;
    border-bottom: 1px solid #f0f0f0;
    background-color: #ffffff;
  }

  .el-card__body {
    padding: 20px;
  }
}

// 表格卡片样式优化
.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;

    @media (max-width: 480px) {
      font-size: 16px;
    }
  }
}

.header-actions {
  display: flex;
  gap: 15px;

  @media (max-width: 480px) {
    .el-button {
      padding: 8px 15px;
      font-size: 12px;
    }
  }
}

.invitation-tips {
  margin-bottom: 20px;

  .tips-content {
    line-height: 1.5;

    p {
      margin: 5px 0 0;

      @media (max-width: 480px) {
        font-size: 12px;
      }
    }
  }
}

.table-container {
  margin-top: 20px;
  overflow-x: auto;
}

.company-info,
.position-info {
  cursor: pointer;
  color: #409eff;

  .company-name,
  .position-name {
    &:hover {
      text-decoration: underline;
    }
  }
}

.time-range {
  font-size: 14px;
  line-height: 1.5;

  @media (max-width: 480px) {
    font-size: 12px;
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;

  .not-available-tip {
    color: #909399;
    font-size: 12px;
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;

  @media (max-width: 768px) {
    justify-content: center;
  }
}

// Element Plus 表格响应式调整
:deep(.el-table) {
  --el-table-border-color: #ebeef5;
  --el-table-header-background-color: #f5f7fa;

  th {
    background-color: #f5f7fa;
    font-weight: 600;
    color: #606266;
  }

  td {
    padding: 12px 0;
  }

  .el-button--small {
    font-size: 12px;
    padding: 8px 15px;
    border-radius: 4px;
  }

  @media (max-width: 768px) {
    font-size: 13px;

    .el-button--small {
      padding: 6px 12px;
      font-size: 12px;
    }
  }
}

// 分页样式优化
:deep(.el-pagination) {
  justify-content: flex-end;
  margin-top: 20px;
  padding: 0;

  .el-pagination__total {
    margin-right: 16px;
  }

  @media (max-width: 768px) {
    justify-content: center;

    .el-pagination__sizes {
      display: none !important;
    }
  }
}
</style>
