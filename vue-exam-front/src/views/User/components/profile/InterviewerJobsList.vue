<template>
  <div class="interviewer-jobs-list">
    <!-- 标题及功能按钮 -->
    <div class="section-header">
      <h2 class="section-title">面试官岗位</h2>
      <router-link to="/interviewer/jobs" class="view-all-link">
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
        <el-empty description="暂无面试官岗位">
          <template #description>
            <p>您还没有担任面试官的岗位</p>
          </template>
          <el-button type="primary" @click="navigateToJobList">查看可申请岗位</el-button>
        </el-empty>
      </div>
      <div v-else>
        <el-card v-for="job in jobs" :key="job.id" class="job-card" shadow="hover">
          <div class="job-header">
            <h3 class="job-title">{{ job.title }}</h3>
            <el-tag :type="getStatusType(job.status)">{{ getStatusLabel(job.status) }}</el-tag>
          </div>

          <div class="job-company">
            <span class="company-name">{{ job.companyName }}</span>
            <span class="department">{{ job.department }}</span>
          </div>

          <div class="job-info">
            <span class="info-item">
              <el-icon><User /></el-icon>
              待面试: {{ job.pendingInterviews || 0 }}人
            </span>
            <span class="info-item">
              <el-icon><Calendar /></el-icon>
              面试场次: {{ job.interviewSessions || 0 }}场
            </span>
          </div>

          <div class="job-actions">
            <el-button type="primary" size="small" @click="viewInterviewList(job.id)">
              查看面试列表
            </el-button>
            <el-button type="info" size="small" @click="viewJobDetail(job.id)">
              岗位详情
            </el-button>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Calendar, ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const jobs = ref([])

// 获取面试官岗位列表
const fetchInterviewerJobs = async () => {
  loading.value = true
  try {
    // 这里需要实现从API获取面试官岗位的功能
    // const response = await getInterviewerJobs()
    // jobs.value = response.items || []

    // 模拟数据，实际项目中应替换为API调用
    setTimeout(() => {
      jobs.value = [
        {
          id: 1,
          title: '前端开发工程师',
          companyName: '腾讯科技有限公司',
          department: '微信事业部',
          status: 'active',
          pendingInterviews: 5,
          interviewSessions: 8
        },
        {
          id: 2,
          title: '高级前端开发工程师',
          companyName: '腾讯科技有限公司',
          department: '腾讯云',
          status: 'active',
          pendingInterviews: 3,
          interviewSessions: 6
        },
        {
          id: 3,
          title: '前端架构师',
          companyName: '阿里巴巴集团',
          department: '淘宝技术部',
          status: 'inactive',
          pendingInterviews: 0,
          interviewSessions: 12
        }
      ]
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('获取面试官岗位失败:', error)
    ElMessage.error('获取面试官岗位失败，请稍后再试')
    loading.value = false
  }
}

// 查看面试列表
const viewInterviewList = jobId => {
  router.push(`/interviewer/job/${jobId}/interviews`)
}

// 查看岗位详情
const viewJobDetail = jobId => {
  router.push(`/job/${jobId}`)
}

// 导航到岗位列表
const navigateToJobList = () => {
  router.push('/recruitment')
}

// 获取状态标签
const getStatusLabel = status => {
  const statusMap = {
    active: '进行中',
    inactive: '已结束',
    pending: '待开始'
  }
  return statusMap[status] || '未知状态'
}

// 获取状态类型
const getStatusType = status => {
  const typeMap = {
    active: 'success',
    inactive: 'info',
    pending: 'warning'
  }
  return typeMap[status] || 'info'
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
      gap: 6px;
      color: #666;
      font-size: 14px;

      .el-icon {
        color: #0352c9;
      }
    }
  }

  .job-actions {
    display: flex;
    gap: 12px;
  }
}
</style>
