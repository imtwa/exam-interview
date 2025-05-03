<template>
  <div class="company-detail-container">
    <div v-if="loading" class="loading-wrapper">
      <el-card shadow="never" style="background: transparent; border: none" v-loading="true"></el-card>
    </div>

    <div v-else>
      <!-- 公司基本信息卡片 -->
      <el-card class="company-info-card">
        <div class="company-header">
          <h1 class="company-name">{{ company.name }}</h1>
          <div class="company-badges">
            <span class="badge">{{ formatFundingStage(company.fundingStage) }}</span>
            <span class="badge">{{ formatCompanySize(company.size) }}</span>
            <span class="badge" v-if="company.industry">{{ company.industry.name }}</span>
          </div>
        </div>

        <div class="company-meta">
          <div class="meta-item">
            <span class="label">公司地址：</span>
            <span class="value">{{ company.address || '未提供地址' }}</span>
          </div>
          <div class="meta-item" v-if="company.foundedYear">
            <span class="label">成立年份：</span>
            <span class="value">{{ company.foundedYear }}年</span>
          </div>
          <div class="meta-item" v-if="company.website">
            <span class="label">公司官网：</span>
            <a :href="company.website" target="_blank" class="value">{{ company.website }}</a>
          </div>
        </div>

        <div class="company-description" v-if="company.description">
          <h3>公司简介</h3>
          <p>{{ company.description }}</p>
        </div>
      </el-card>

      <!-- 公司职位列表 -->
      <div class="company-jobs-section">
        <div class="section-header">
          <h2>在招职位 ({{ totalJobs }})</h2>
          <div class="filter-tools">
            <el-input
              v-model="jobSearchKeyword"
              placeholder="搜索职位"
              class="search-input"
              clearable
              @keyup.enter="handleJobSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>

        <div class="jobs-list">
          <div v-if="loadingJobs" class="loading-jobs">
            <el-card shadow="never" style="background: transparent; border: none" v-loading="true"></el-card>
          </div>

          <div v-else-if="jobs.length === 0" class="empty-jobs">
            <el-empty description="暂无在招职位" />
          </div>

          <div v-else>
            <div v-for="job in jobs" :key="job.id" class="job-item">
              <div class="job-header">
                <div class="job-title-section">
                  <h3 class="job-title">{{ job.title }}</h3>
                  <div class="job-salary">{{ formatSalary(job.salaryMin, job.salaryMax) }}</div>
                </div>
                <div class="job-actions">
                  <el-button type="primary" size="small" @click="viewJobDetail(job.id)">查看</el-button>
                  <el-button
                    type="success"
                    size="small"
                    @click="applyJob(job.id)"
                    :loading="job.applying"
                  >
                    一键投递
                  </el-button>
                </div>
              </div>

              <div class="job-tags">
                <span class="job-tag">{{ job.city }}</span>
                <span class="job-tag">{{ formatExperience(job.experienceReq) }}经验</span>
                <span class="job-tag">{{ formatEducation(job.educationReq) }}</span>
                <span class="job-tag" v-if="job.isRemote">远程工作</span>
              </div>

              <div class="job-info">
                <div class="info-left">
                  <span>{{ job.applicationsCount || 0 }}人已投递</span>
                  <span>{{ formatDate(job.createdAt) }}</span>
                </div>
                <div class="info-right" v-if="job.subCategory">
                  <span>{{ job.subCategory.category?.name || '' }} / {{ job.subCategory.name }}</span>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div class="pagination-wrapper">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[5, 10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalJobs"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCompany } from '@/api/company'
import { getCompanyJobs, applyForJob } from '@/api/job'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 加载状态
const loading = ref(true)
const loadingJobs = ref(true)

// 公司信息
const company = ref({})
const companyId = ref(0)

// 职位列表相关
const jobs = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalJobs = ref(0)
const jobSearchKeyword = ref('')

// 初始化数据
onMounted(async () => {
  companyId.value = parseInt(route.params.id)
  if (!companyId.value) {
    ElMessage.error('无效的公司ID')
    router.push('/recruitment')
    return
  }

  await Promise.all([fetchCompanyDetail(), fetchCompanyJobs()])
})

// 获取公司详情
const fetchCompanyDetail = async () => {
  try {
    loading.value = true
    const response = await getCompany(companyId.value)
    // 处理API返回的数据，确保我们使用正确的格式
    if (response.data) {
      company.value = response.data
    } else if (response) {
      // 如果response就是数据本身
      company.value = response
    } else {
      company.value = {}
      ElMessage.warning('获取公司信息失败')
    }
    console.log('获取的公司信息:', company.value)
  } catch (error) {
    console.error('获取公司详情失败:', error)
    ElMessage.error('获取公司详情失败')
  } finally {
    loading.value = false
  }
}

// 获取公司职位列表
const fetchCompanyJobs = async () => {
  try {
    loadingJobs.value = true
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: jobSearchKeyword.value
    }
    
    const response = await getCompanyJobs(companyId.value, params)
    // 处理API返回的数据，确保我们使用正确的格式
    if (response.list && typeof response.total === 'number') {
      jobs.value = response.list
      totalJobs.value = response.total
    } else if (response.data) {
      // 如果数据在data属性中
      jobs.value = response.data.list || []
      totalJobs.value = response.data.total || 0
    } else if (response.jobs && typeof response.total === 'number') {
      // 或者可能是这种格式
      jobs.value = response.jobs
      totalJobs.value = response.total
    } else {
      jobs.value = []
      totalJobs.value = 0
      console.warn('未知的响应格式:', response)
    }
    console.log('获取的职位列表:', jobs.value.length, '总数:', totalJobs.value)
  } catch (error) {
    console.error('获取公司职位列表失败:', error)
    ElMessage.error('获取公司职位列表失败')
  } finally {
    loadingJobs.value = false
  }
}

// 搜索职位
const handleJobSearch = () => {
  currentPage.value = 1
  fetchCompanyJobs()
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  fetchCompanyJobs()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchCompanyJobs()
}

// 查看职位详情
const viewJobDetail = (jobId) => {
  router.push(`/job/${jobId}`)
}

// 申请职位
const applyJob = async (jobId) => {
  // 检查是否登录
  if (!userStore.isLoggedIn) {
    ElMessageBox.confirm('请先登录后再投递职位', '提示', {
      confirmButtonText: '去登录',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        router.push({
          path: '/login',
          query: { redirect: router.currentRoute.value.fullPath }
        })
      })
      .catch(() => {})
    return
  }

  // 检查是否为求职者
  if (userStore.userInfo.role !== 'JOB_SEEKER') {
    ElMessage.warning('只有求职者才能投递职位')
    return
  }

  // 找到当前职位并设置为投递中
  const job = jobs.value.find(j => j.id === jobId)
  if (job) {
    job.applying = true
  }

  try {
    // 确认投递
    await ElMessageBox.confirm('确认投递该职位吗？', '一键投递', {
      confirmButtonText: '确认投递',
      cancelButtonText: '取消',
      type: 'info'
    })

    // 调用API投递职位
    await applyForJob(jobId)

    // 投递成功
    ElMessage.success('投递成功！招聘方会尽快查看您的简历')
  } catch (error) {
    // 处理错误
    if (error === 'cancel') return

    if (error.response && error.response.data && error.response.data.message) {
      ElMessage.error(error.response.data.message)
    } else {
      console.error('投递失败:', error)
      ElMessage.error('投递失败，请稍后再试')
    }
  } finally {
    // 重置投递状态
    const job = jobs.value.find(j => j.id === jobId)
    if (job) {
      job.applying = false
    }
  }
}

// 格式化函数
const formatFundingStage = (stage) => {
  const stageMap = {
    'UNFUNDED': '未融资',
    'ANGEL': '天使轮',
    'SERIES_A': 'A轮',
    'SERIES_B': 'B轮',
    'SERIES_C': 'C轮',
    'SERIES_D': 'D轮及以上',
    'IPO': '已上市',
    'SELF_FUNDED': '不需要融资'
  }
  return stageMap[stage] || '未知'
}

const formatCompanySize = (size) => {
  const sizeMap = {
    'TINY': '0-20人',
    'SMALL': '20-99人',
    'MEDIUM': '100-499人',
    'LARGE': '500-999人',
    'XLARGE': '1000-9999人',
    'XXLARGE': '10000+人'
  }
  return sizeMap[size] || '未知规模'
}

const formatSalary = (min, max) => {
  if (!min && !max) return '薪资面议'
  if (min && !max) return `${(min / 1000).toFixed(0)}K以上`
  if (!min && max) return `${(max / 1000).toFixed(0)}K以下`
  return `${(min / 1000).toFixed(0)}K-${(max / 1000).toFixed(0)}K`
}

const formatExperience = (exp) => {
  if (!exp) return '经验不限'

  const experienceMap = {
    'STUDENT': '在校生',
    'FRESH_GRADUATE': '应届生',
    'LESS_THAN_ONE': '1年以内',
    'ONE_TO_THREE': '1-3年',
    'THREE_TO_FIVE': '3-5年',
    'FIVE_TO_TEN': '5-10年',
    'MORE_THAN_TEN': '10年以上'
  }

  return experienceMap[exp] || '经验不限'
}

const formatEducation = (edu) => {
  const educationMap = {
    'HIGH_SCHOOL': '高中学历',
    'ASSOCIATE': '大专学历',
    'BACHELOR': '本科学历',
    'MASTER': '硕士学历',
    'DOCTORATE': '博士学历',
    'OTHER': '其他学历'
  }
  return educationMap[edu] || '学历不限'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
</script>

<style lang="less" scoped>
.company-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading-wrapper {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.company-info-card {
  margin-bottom: 30px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  .company-header {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f0f0f0;

    .company-name {
      font-size: 24px;
      color: #2c3e50;
      margin-bottom: 12px;
      font-weight: 600;
    }

    .company-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      .badge {
        padding: 4px 12px;
        font-size: 13px;
        background-color: #f0f7ff;
        color: #409eff;
        border-radius: 4px;
      }
    }
  }

  .company-meta {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;

    .meta-item {
      display: flex;

      .label {
        width: 100px;
        color: #606266;
        font-weight: 500;
      }

      .value {
        color: #333;
        flex: 1;
      }

      a.value {
        color: #409eff;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .company-description {
    h3 {
      font-size: 18px;
      color: #2c3e50;
      margin-bottom: 15px;
      font-weight: 600;
    }

    p {
      line-height: 1.8;
      color: #333;
      white-space: pre-wrap;
    }
  }
}

.company-jobs-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      font-size: 20px;
      color: #2c3e50;
      font-weight: 600;
      margin: 0;
    }

    .filter-tools {
      display: flex;
      gap: 15px;

      .search-input {
        width: 220px;
      }
    }
  }

  .loading-jobs, .empty-jobs {
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .job-item {
    background-color: #fff;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 15px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }

    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;

      .job-title-section {
        display: flex;
        align-items: center;
        gap: 15px;

        .job-title {
          font-size: 18px;
          color: #2c3e50;
          margin: 0;
        }

        .job-salary {
          font-size: 16px;
          font-weight: 500;
          color: #ff6b6b;
        }
      }

      .job-actions {
        display: flex;
        gap: 10px;
      }
    }

    .job-tags {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      flex-wrap: wrap;

      .job-tag {
        padding: 4px 10px;
        font-size: 13px;
        background-color: #f5f7fa;
        color: #606266;
        border-radius: 4px;
      }
    }

    .job-info {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #909399;

      .info-left {
        display: flex;
        gap: 15px;

        span {
          &:before {
            content: "";
            display: inline-block;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background-color: #c0c4cc;
            margin-right: 8px;
            vertical-align: middle;
          }
        }
      }
    }
  }

  .pagination-wrapper {
    margin-top: 30px;
    display: flex;
    justify-content: flex-end;
  }
}
</style> 