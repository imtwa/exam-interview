<template>
  <div class="user-applications-list">
    <!-- 标题及功能按钮 -->
    <div class="section-header">
      <h2 class="section-title">应聘记录</h2>
      <router-link v-if="isCurrentUser" to="/applications" class="view-all-link">
        查看全部
        <el-icon><ArrowRight /></el-icon>
      </router-link>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton animated :rows="3" />
    </div>

    <!-- 应聘记录列表 -->
    <div v-else class="applications-list">
      <div v-if="applications.length === 0" class="empty-data">
        <el-empty :description="isCurrentUser ? '暂无应聘记录' : '该用户暂无应聘记录'" />
      </div>
      <div v-else>
        <el-table :data="applications" style="width: 100%">
          <el-table-column prop="jobTitle" label="应聘职位" min-width="160">
            <template #default="{ row }">
              <span class="job-title" @click="viewJobDetail(row.jobId || row.job?.id)">
                {{ row.jobTitle || row.job?.title }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="companyName" label="公司" min-width="150">
            <template #default="{ row }">
              <div class="company-info">
                <span>{{ row.companyName || row.job?.company?.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="applyDate" label="申请时间" width="150">
            <template #default="{ row }">
              {{ formatDate(row.applyDate || row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="120">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="viewApplicationDetail(row.id)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <!-- <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[5, 10, 20]"
            layout="total, sizes, prev, pager, next"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'
import { getJobseekerApplications } from '@/api/job'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  userId: {
    type: [Number, String],
    required: true
  }
})

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const applications = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(5)

// 判断是否是当前登录用户
const isCurrentUser = computed(() => {
  return (
    userStore.isLoggedIn && userStore.userInfo && userStore.userInfo.id === parseInt(props.userId)
  )
})

// 获取应聘记录列表
const fetchApplications = async () => {
  loading.value = true
  try {
    const params = {
      jobseekerId: props.userId,
      page: currentPage.value,
      pageSize: pageSize.value
    }

    const response = await getJobseekerApplications(params)

    // 处理响应数据
    if (response) {
      applications.value = response.list
      total.value = response.total
    } else {
      applications.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取应聘记录失败:', error)
    ElMessage.error('获取应聘记录失败，请稍后再试')
    applications.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 处理分页变化
const handleSizeChange = size => {
  pageSize.value = size
  fetchApplications()
}

const handleCurrentChange = page => {
  currentPage.value = page
  fetchApplications()
}

// 查看职位详情
const viewJobDetail = jobId => {
  if (!jobId) return
  router.push(`/job/${jobId}`)
}

// 查看应聘详情
const viewApplicationDetail = applicationId => {
  router.push(`/application/${applicationId}`)
}

// 获取状态标签
const getStatusLabel = status => {
  const statusMap = {
    RESUME_SCREENING: '简历筛选',
    WRITTEN_TEST: '笔试中',
    FIRST_INTERVIEW: '一面中',
    SECOND_INTERVIEW: '二面中',
    HR_INTERVIEW: 'HR面试',
    OFFER: '已录用',
    REJECTED: '已拒绝'
  }
  return statusMap[status] || '未知状态'
}

// 获取状态类型（用于标签颜色）
const getStatusType = status => {
  const typeMap = {
    RESUME_SCREENING: 'info',
    WRITTEN_TEST: 'warning',
    FIRST_INTERVIEW: 'primary',
    SECOND_INTERVIEW: 'primary',
    HR_INTERVIEW: 'warning',
    OFFER: 'success',
    REJECTED: 'danger'
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
.user-applications-list {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .view-all-link {
    color: #0352c9;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 4px;
    text-decoration: none;

    &:hover {
      opacity: 0.8;
    }
  }
}

.loading-container {
  padding: 16px;
}

.empty-data {
  padding: 20px 0;
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
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
