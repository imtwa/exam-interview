<template>
  <div class="user-applications-list">
    <!-- 标题及功能按钮 -->
    <div class="section-header">
      <h2 class="section-title">应聘记录</h2>
      <router-link to="/applications" class="view-all-link">
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
        <el-empty description="暂无应聘记录" />
      </div>
      <div v-else>
        <el-table :data="applications" style="width: 100%">
          <el-table-column prop="jobTitle" label="应聘职位" min-width="160">
            <template #default="{ row }">
              <span class="job-title" @click="viewJobDetail(row.jobId)">{{ row.jobTitle }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="companyName" label="公司" min-width="150">
            <template #default="{ row }">
              <div class="company-info">
                <span>{{ row.companyName }}</span>
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
              {{ formatDate(row.applyDate) }}
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const applications = ref([])

// 获取应聘记录列表
const fetchApplications = async () => {
  loading.value = true
  try {
    // 这里需要实现从API获取应聘记录的功能
    // const response = await getApplications({ page: 1, pageSize: 5 })
    // applications.value = response.items || []

    // 模拟数据，实际项目中应替换为API调用
    setTimeout(() => {
      applications.value = [
        {
          id: 1,
          jobId: 101,
          jobTitle: '前端开发工程师',
          companyName: '腾讯科技有限公司',
          status: 'pending',
          applyDate: '2023-08-15T08:30:00'
        },
        {
          id: 2,
          jobId: 102,
          jobTitle: '后端开发工程师',
          companyName: '字节跳动有限公司',
          status: 'interview',
          applyDate: '2023-08-10T14:20:00'
        },
        {
          id: 3,
          jobId: 103,
          jobTitle: '全栈开发工程师',
          companyName: '百度科技有限公司',
          status: 'rejected',
          applyDate: '2023-08-05T09:15:00'
        }
      ]
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('获取应聘记录失败:', error)
    ElMessage.error('获取应聘记录失败，请稍后再试')
    loading.value = false
  }
}

// 查看职位详情
const viewJobDetail = jobId => {
  router.push(`/job/${jobId}`)
}

// 查看应聘详情
const viewApplicationDetail = applicationId => {
  router.push(`/application/${applicationId}`)
}

// 获取状态标签
const getStatusLabel = status => {
  const statusMap = {
    pending: '待处理',
    screening: '筛选中',
    interview: '面试中',
    offer: '已录用',
    rejected: '已拒绝',
    withdrawn: '已撤回'
  }
  return statusMap[status] || '未知状态'
}

// 获取状态类型（用于标签颜色）
const getStatusType = status => {
  const typeMap = {
    pending: 'info',
    screening: 'warning',
    interview: 'primary',
    offer: 'success',
    rejected: 'danger',
    withdrawn: 'info'
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

  .company-logo {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    margin-right: 8px;
    object-fit: contain;
  }
}
</style>
