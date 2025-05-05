<template>
  <div class="interviewer-jobs-page">
    <div class="interviewer-jobs-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/profile' }">个人中心</el-breadcrumb-item>
          <el-breadcrumb-item>面试官岗位</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">我的面试官岗位</h1>
        <p class="page-description">这里列出了您担任面试官的所有岗位及相关面试安排</p>
      </div>

      <!-- 筛选区域 -->
      <div class="filter-container">
        <el-form :inline="true" class="filter-form">
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="选择状态" clearable>
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="关键词">
            <el-input v-model="queryParams.keyword" placeholder="岗位/公司" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchJobs">搜索</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton animated :rows="6" :loading="loading" />
      </div>

      <!-- 面试官岗位列表 -->
      <div v-else class="jobs-list">
        <div v-if="jobs.length === 0" class="empty-container">
          <el-empty description="暂无面试官岗位">
            <template #description>
              <p>您还没有担任面试官的岗位</p>
            </template>
            <el-button type="primary" @click="goToRecruitment">查看可申请岗位</el-button>
          </el-empty>
        </div>
        <div v-else>
          <el-row :gutter="24">
            <el-col v-for="job in jobs" :key="job.id" :xs="24" :sm="24" :md="24" :lg="12" :xl="8">
              <el-card class="job-card" shadow="hover">
                <div class="job-header">
                  <h3 class="job-title">{{ job.title }}</h3>
                  <el-tag :type="getStatusType(job.status)">{{
                    getStatusLabel(job.status)
                  }}</el-tag>
                </div>

                <div class="job-company">
                  <div class="company-info">
                    <span class="company-name">{{ job.companyName }}</span>
                    <span class="department">{{ job.department }}</span>
                  </div>
                  <div class="job-meta">
                    <span class="job-location">
                      <el-icon><Location /></el-icon>
                      {{ job.location }}
                    </span>
                    <span class="job-salary">
                      <el-icon><Money /></el-icon>
                      {{ job.salary || '面议' }}
                    </span>
                  </div>
                </div>

                <el-divider></el-divider>

                <div class="interview-stats">
                  <div class="stat-item">
                    <span class="stat-value">{{ job.pendingInterviews || 0 }}</span>
                    <span class="stat-label">待面试</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ job.completedInterviews || 0 }}</span>
                    <span class="stat-label">已完成</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ job.interviewSessions || 0 }}</span>
                    <span class="stat-label">总场次</span>
                  </div>
                </div>

                <div class="job-actions">
                  <el-button type="primary" @click="viewInterviews(job.id)">
                    查看面试列表
                  </el-button>
                  <el-button type="info" @click="viewJobDetail(job.id)"> 岗位详情 </el-button>
                </div>

                <!-- 近期面试提醒 -->
                <div v-if="job.upcomingInterview" class="upcoming-interview">
                  <div class="upcoming-header">
                    <el-icon><Timer /></el-icon>
                    <span>近期面试</span>
                  </div>
                  <div class="upcoming-content">
                    <span class="upcoming-time">{{
                      formatDateTime(job.upcomingInterview.time)
                    }}</span>
                    <span class="upcoming-candidate">{{
                      job.upcomingInterview.candidateName
                    }}</span>
                    <el-button
                      type="success"
                      size="small"
                      @click="enterInterviewRoom(job.upcomingInterview.id)"
                    >
                      进入面试
                    </el-button>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="queryParams.page"
              v-model:page-size="queryParams.pageSize"
              :page-sizes="[6, 12, 24, 48]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Location, Money, Timer } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const jobs = ref([])
const total = ref(0)

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 6,
  status: '',
  keyword: ''
})

// 状态选项
const statusOptions = [
  { label: '进行中', value: 'active' },
  { label: '已结束', value: 'inactive' },
  { label: '待开始', value: 'pending' }
]

// 获取面试官岗位列表
const fetchJobs = async () => {
  loading.value = true
  try {
    // 这里需要实现从API获取面试官岗位列表的功能
    // const response = await getInterviewerJobs(queryParams)
    // jobs.value = response.items || []
    // total.value = response.total || 0

    // 模拟数据，实际项目中应替换为API调用
    setTimeout(() => {
      jobs.value = [
        {
          id: 1,
          title: '前端开发工程师',
          companyName: '腾讯科技有限公司',
          department: '微信事业部',
          location: '深圳',
          salary: '25k-35k',
          status: 'active',
          pendingInterviews: 5,
          completedInterviews: 8,
          interviewSessions: 13,
          upcomingInterview: {
            id: 101,
            time: '2023-08-25T14:30:00',
            candidateName: '张三'
          }
        },
        {
          id: 2,
          title: '高级前端开发工程师',
          companyName: '腾讯科技有限公司',
          department: '腾讯云',
          location: '深圳',
          salary: '30k-45k',
          status: 'active',
          pendingInterviews: 3,
          completedInterviews: 10,
          interviewSessions: 13,
          upcomingInterview: {
            id: 102,
            time: '2023-08-26T10:00:00',
            candidateName: '李四'
          }
        },
        {
          id: 3,
          title: '前端架构师',
          companyName: '阿里巴巴集团',
          department: '淘宝技术部',
          location: '杭州',
          salary: '40k-60k',
          status: 'inactive',
          pendingInterviews: 0,
          completedInterviews: 15,
          interviewSessions: 15,
          upcomingInterview: null
        },
        {
          id: 4,
          title: 'React 开发工程师',
          companyName: '字节跳动',
          department: '抖音技术部',
          location: '北京',
          salary: '25k-40k',
          status: 'active',
          pendingInterviews: 7,
          completedInterviews: 5,
          interviewSessions: 12,
          upcomingInterview: {
            id: 103,
            time: '2023-08-28T16:00:00',
            candidateName: '王五'
          }
        }
      ]
      total.value = 4
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('获取面试官岗位失败:', error)
    ElMessage.error('获取面试官岗位失败，请稍后再试')
    loading.value = false
  }
}

// 分页相关方法
const handleSizeChange = newSize => {
  queryParams.pageSize = newSize
  fetchJobs()
}

const handleCurrentChange = newPage => {
  queryParams.page = newPage
  fetchJobs()
}

// 重置筛选条件
const resetFilters = () => {
  queryParams.status = ''
  queryParams.keyword = ''
  fetchJobs()
}

// 查看面试列表
const viewInterviews = jobId => {
  router.push(`/interviewer/job/${jobId}/interviews`)
}

// 查看岗位详情
const viewJobDetail = jobId => {
  router.push(`/job/${jobId}`)
}

// 进入面试房间
const enterInterviewRoom = interviewId => {
  router.push(`/interviewer/interview/${interviewId}`)
}

// 跳转到招聘页面
const goToRecruitment = () => {
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

// 获取状态类型（用于标签颜色）
const getStatusType = status => {
  const typeMap = {
    active: 'success',
    inactive: 'info',
    pending: 'warning'
  }
  return typeMap[status] || 'info'
}

// 格式化日期时间
const formatDateTime = dateString => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}`
  } catch (error) {
    console.error('日期格式化错误:', error)
    return dateString
  }
}

onMounted(() => {
  fetchJobs()

  // 检查是否从题库选择页面跳转而来
  if (route.query.examId) {
    ElMessage.success(`已选择题库 ID: ${route.query.examId}，可以将其用于面试`)
  }
})
</script>

<style lang="less" scoped>
.interviewer-jobs-page {
  width: 100%;
  background-color: #f5f9ff;
  min-height: calc(100vh - 72px);
}

.interviewer-jobs-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.breadcrumb-container {
  margin-bottom: 20px;
  font-size: 14px;
}

.page-header {
  margin-bottom: 24px;

  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
  }

  .page-description {
    color: #666;
    font-size: 14px;
    margin: 0;
  }
}

.filter-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 20px;
}

.loading-container {
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.empty-container {
  padding: 40px;
  text-align: center;

  p {
    color: #666;
    margin-bottom: 16px;
  }
}

.job-card {
  margin-bottom: 24px;
  height: 100%;

  .job-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .job-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
  }

  .job-company {
    margin-bottom: 16px;

    .company-info {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      .company-name {
        font-weight: 500;
        margin-right: 8px;
      }

      .department {
        color: #888;
        font-size: 13px;
      }
    }

    .job-meta {
      display: flex;
      gap: 16px;

      .job-location,
      .job-salary {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #666;
        font-size: 14px;
      }
    }
  }

  .interview-stats {
    display: flex;
    justify-content: space-around;
    margin-bottom: 16px;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;

      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: #0352c9;
      }

      .stat-label {
        font-size: 14px;
        color: #666;
        margin-top: 4px;
      }
    }
  }

  .job-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  .upcoming-interview {
    background-color: #f0f9eb;
    border-radius: 6px;
    padding: 12px;
    margin-top: 16px;

    .upcoming-header {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #67c23a;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .upcoming-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .upcoming-time {
        font-weight: 500;
      }

      .upcoming-candidate {
        margin: 0 8px;
      }
    }
  }
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}
</style>
