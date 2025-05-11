<template>
  <div class="interviewer-jobs-list">
    <!-- 标题及功能按钮 -->
    <div class="section-header">
      <h2 class="section-title">发布的职位</h2>
      <router-link v-if="isCurrentUser" to="/job-management" class="view-all-link">
        查看全部
        <el-icon><ArrowRight /></el-icon>
      </router-link>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton animated :rows="3" />
    </div>

    <!-- 面试官岗位列表 -->
    <div v-else class="jobs-list">
      <div v-if="jobs.length === 0" class="empty-data">
        <el-empty description="暂无发布的职位">
          <template #description>
            <p>{{ isCurrentUser ? '您还没有发布任何职位' : '该用户暂未发布任何职位' }}</p>
          </template>
          <el-button v-if="isCurrentUser" type="primary" @click="navigateToJobsManagement"
            >发布新职位</el-button
          >
        </el-empty>
      </div>
      <div v-else>
        <el-card v-for="job in jobs" :key="job.id" class="job-card" shadow="hover">
          <div class="job-header">
            <h3 class="job-title">{{ job.title }}</h3>
            <el-tag :type="getStatusType(job.status)">{{ getStatusLabel(job.status) }}</el-tag>
          </div>

          <div class="job-company">
            <span class="company-name">{{ job.company?.name || '未知公司' }}</span>
            <span class="department">{{ job.subCategory?.name || '未知部门' }}</span>
          </div>

          <div class="job-info">
            <span class="info-item">
              <el-icon><Location /></el-icon>
              {{ job.city || '地区不限' }}
            </span>
            <span class="info-item">
              <el-icon><Money /></el-icon>
              {{ formatSalary(job.salaryMin, job.salaryMax) }}
            </span>
          </div>

          <div class="job-actions">
            <el-button type="primary" size="small" @click="viewJobDetail(job.id)">
              查看详情
            </el-button>
            <el-button
              v-if="isCurrentUser"
              type="info"
              size="small"
              @click="viewApplications(job.id)"
            >
              查看申请
            </el-button>
          </div>
        </el-card>
      </div>

      <!-- 分页 -->
      <div v-if="jobs.length > 0" class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20]"
          layout="total, sizes, prev, pager, next"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowRight, Location, Money } from '@element-plus/icons-vue'
import { getInterviewerJobs } from '@/api/job'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  userId: {
    type: [Number, String],
    required: true
  }
})

const userStore = useUserStore()
const router = useRouter()
const loading = ref(false)
const jobs = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(5)

// 判断是否是当前登录用户
const isCurrentUser = computed(() => {
  return (
    userStore.isLoggedIn && userStore.userInfo && userStore.userInfo.id === parseInt(props.userId)
  )
})

// 获取面试官岗位列表
const fetchInterviewerJobs = async () => {
  loading.value = true
  try {
    const params = {
      interviewerId: props.userId,
      page: currentPage.value,
      pageSize: pageSize.value
    }

    const response = await getInterviewerJobs(params)

    // 处理响应数据
    if (response.data && response.data.list) {
      jobs.value = response.data.list
      total.value = response.data.total
    } else if (response.list) {
      jobs.value = response.list
      total.value = response.total
    } else {
      jobs.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取面试官岗位失败:', error)
    ElMessage.error('获取面试官岗位失败，请稍后再试')
    jobs.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 处理分页变化
const handleSizeChange = size => {
  pageSize.value = size
  fetchInterviewerJobs()
}

const handleCurrentChange = page => {
  currentPage.value = page
  fetchInterviewerJobs()
}

// 查看面试列表
const viewApplications = jobId => {
  router.push(`/candidate-management?jobId=${jobId}`)
}

// 查看岗位详情
const viewJobDetail = jobId => {
  router.push(`/job/${jobId}`)
}

// 导航到职位管理页面
const navigateToJobsManagement = () => {
  router.push('/interviewer/jobs')
}

// 获取状态标签
const getStatusLabel = status => {
  const statusMap = {
    ACTIVE: '招聘中',
    FILLED: '已招满',
    EXPIRED: '已过期'
  }
  return statusMap[status] || '未知状态'
}

// 获取状态类型
const getStatusType = status => {
  const typeMap = {
    ACTIVE: 'success',
    FILLED: 'warning',
    EXPIRED: 'info'
  }
  return typeMap[status] || 'info'
}

// 格式化薪资显示
const formatSalary = (min, max) => {
  if (min === 0 && max === 0) return '面议'
  if (min === 0) return `${max}K以下`
  if (max === 0) return `${min}K以上`
  return `${min}-${max}K`
}

onMounted(() => {
  fetchInterviewerJobs()
})
</script>

<style lang="less" scoped>
.interviewer-jobs-list {
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

  p {
    color: #666;
    margin-bottom: 16px;
  }
}

.job-card {
  margin-bottom: 16px;

  .job-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .job-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
  }

  .job-company {
    margin-bottom: 12px;
    color: #666;

    .company-name {
      font-weight: 500;
      margin-right: 8px;
    }

    .department {
      color: #888;
      font-size: 13px;
    }
  }

  .job-info {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;

    .info-item {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #666;
      font-size: 14px;
    }
  }

  .job-actions {
    display: flex;
    gap: 8px;
  }
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
