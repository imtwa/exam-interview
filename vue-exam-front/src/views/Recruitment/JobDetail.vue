<template>
  <div class="job-detail-container">
    <!-- 返回按钮和面包屑导航 -->
    <div class="breadcrumb-section">
      <el-button class="back-button" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回职位列表
      </el-button>
      
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/recruitment' }">招聘信息</el-breadcrumb-item>
        <el-breadcrumb-item>职位详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton animated :rows="15" :loading="loading" />
    </div>
    
    <!-- 职位详情内容 -->
    <template v-else-if="job.id">
      <div class="job-header">
        <div class="job-header-left">
          <h1 class="job-title">{{ job.title }}</h1>
          <div class="company-info">
            <span class="company-name">{{ job.company?.name }}</span>
            <el-tag 
              v-if="job.status" 
              :type="getStatusType(job.status)" 
              class="status-tag"
            >
              {{ getStatusLabel(job.status) }}
            </el-tag>
          </div>
        </div>
        <div class="job-header-right">
          <div class="salary">{{ formatSalary(job.salaryMin, job.salaryMax) }}</div>
          <el-button 
            type="primary" 
            size="large" 
            class="apply-button" 
            @click="applyJobDirectly"
            :disabled="job.status !== 'ACTIVE' || applying"
            :loading="applying"
          >
            {{ applying ? '投递中...' : '一键投递' }}
          </el-button>
        </div>
      </div>
      
      <div class="job-content">
        <div class="job-main">
          <el-card class="job-card">
            <template #header>
              <div class="card-header">
                <h3>职位信息</h3>
              </div>
            </template>
            
            <div class="job-meta">
              <div class="meta-row">
                <div class="meta-item">
                  <div class="meta-icon">
                    <el-icon><Location /></el-icon>
                  </div>
                  <div class="meta-content">
                    <div class="meta-label">工作地点</div>
                    <div class="meta-value">{{ job.city }}{{ job.address ? ' - ' + job.address : '' }}</div>
                  </div>
                </div>
                
                <div class="meta-item">
                  <div class="meta-icon">
                    <el-icon><Collection /></el-icon>
                  </div>
                  <div class="meta-content">
                    <div class="meta-label">学历要求</div>
                    <div class="meta-value">{{ formatEducation(job.educationReq) }}</div>
                  </div>
                </div>
              </div>
              
              <div class="meta-row">
                <div class="meta-item">
                  <div class="meta-icon">
                    <el-icon><Timer /></el-icon>
                  </div>
                  <div class="meta-content">
                    <div class="meta-label">工作经验</div>
                    <div class="meta-value">{{ formatExperience(job.experienceReq) }}</div>
                  </div>
                </div>
                
                <div class="meta-item">
                  <div class="meta-icon">
                    <el-icon><OfficeBuilding /></el-icon>
                  </div>
                  <div class="meta-content">
                    <div class="meta-label">行业分类</div>
                    <div class="meta-value">{{ job.subCategory?.category?.name || '-' }} / {{ job.subCategory?.name || '-' }}</div>
                  </div>
                </div>
              </div>
              
              <div class="meta-row">
                <div class="meta-item">
                  <div class="meta-icon">
                    <el-icon><Calendar /></el-icon>
                  </div>
                  <div class="meta-content">
                    <div class="meta-label">发布时间</div>
                    <div class="meta-value">{{ formatDate(job.createdAt) }}</div>
                  </div>
                </div>
                
                <div class="meta-item">
                  <div class="meta-icon">
                    <el-icon><VideoPlay /></el-icon>
                  </div>
                  <div class="meta-content">
                    <div class="meta-label">远程工作</div>
                    <div class="meta-value">{{ job.isRemote ? '支持' : '不支持' }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="job-description">
              <div class="description-section">
                <h3 class="section-title">职位描述</h3>
                <div class="section-content" v-html="formattedDescription"></div>
              </div>
              
              <div class="description-section">
                <h3 class="section-title">职位要求</h3>
                <div class="section-content" v-html="formattedRequirements"></div>
              </div>
            </div>
          </el-card>
          
          <el-card class="job-card">
            <template #header>
              <div class="card-header">
                <h3>工作地点</h3>
              </div>
            </template>
            
            <div class="location-info">
              <div class="location-address">
                <el-icon><Location /></el-icon>
                {{ job.city }}{{ job.address ? ' - ' + job.address : '' }}
              </div>
              <!-- 可以添加地图组件 -->
            </div>
          </el-card>
        </div>
        
        <div class="job-sidebar">
          <el-card class="company-card">
            <template #header>
              <div class="card-header">
                <h3>公司信息</h3>
              </div>
            </template>
            
            <div class="company-content">
              <h4 class="company-name">{{ job.company?.name }}</h4>
              
              <div class="company-meta">
                <div class="company-meta-item">
                  <span class="label">融资阶段：</span>
                  <span class="value">{{ formatFundingStage(job.company?.fundingStage) }}</span>
                </div>
                
                <div class="company-meta-item">
                  <span class="label">公司规模：</span>
                  <span class="value">{{ formatCompanySize(job.company?.size) }}</span>
                </div>
                
                <div class="company-meta-item">
                  <span class="label">行业分类：</span>
                  <span class="value">{{ job.subCategory?.category?.name || '-' }}</span>
                </div>
              </div>
              
              <div class="company-description" v-if="job.company?.description">
                {{ job.company.description }}
              </div>
            </div>
          </el-card>
          
          <el-card class="related-jobs-card">
            <template #header>
              <div class="card-header">
                <h3>相似职位</h3>
              </div>
            </template>
            
            <div class="related-jobs-list" v-if="relatedJobs.length">
              <div v-for="(item, index) in relatedJobs" :key="index" class="related-job-item" @click="viewJob(item.id)">
                <div class="related-job-info">
                  <div class="related-job-title">{{ item.title }}</div>
                  <div class="related-job-company">{{ item.company?.name }}</div>
                </div>
                <div class="related-job-salary">{{ formatSalary(item.salaryMin, item.salaryMax) }}</div>
              </div>
            </div>
            <div v-else class="no-related-jobs">
              暂无相似职位
            </div>
          </el-card>
        </div>
      </div>
    </template>
    
    <!-- 无数据状态 -->
    <div v-else class="empty-container">
      <el-empty description="职位不存在或已下线" />
      <el-button class="back-to-list" @click="goBack">返回职位列表</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Location, Collection, Timer, OfficeBuilding, Calendar, VideoPlay } from '@element-plus/icons-vue'
import { getJob, getJobList, applyJob as apiApplyJob } from '@/api/job'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const loading = ref(true)
const applying = ref(false)
const job = ref({})
const relatedJobs = ref([])

// 获取职位详情
const fetchJobDetail = async () => {
  const jobId = route.params.id
  if (!jobId) {
    ElMessage.error('缺少职位ID参数')
    loading.value = false
    return
  }
  
  console.log('获取职位详情，ID:', jobId)
  
  try {
    const result = await getJob(jobId)
    console.log('API 返回结果:', result)
    
    if (result && result.id) {
      job.value = result
      fetchRelatedJobs(result.subCategoryId, result.id)
    } else {
      console.warn('职位数据为空或格式不正确:', result)
      ElMessage.warning('职位不存在或已下线')
    }
  } catch (error) {
    console.error('获取职位详情失败:', error)
    ElMessage.error('获取职位详情失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

// 获取相关职位
const fetchRelatedJobs = async (subCategoryId, currentJobId) => {
  if (!subCategoryId) return
  
  try {
    const params = {
      subCategoryId,
      page: 1,
      pageSize: 5
    }
    
    const result = await getJobList(params)
    if (result && result.list) {
      // 过滤掉当前职位
      relatedJobs.value = result.list
        .filter(item => item.id !== currentJobId)
        .slice(0, 4) // 最多显示4个相关职位
    }
  } catch (error) {
    console.error('获取相关职位失败:', error)
  }
}

// 格式化描述(将换行符转为<br>)
const formattedDescription = computed(() => {
  if (!job.value.description) return ''
  return job.value.description.replace(/\n/g, '<br>')
})

// 格式化要求(将换行符转为<br>)
const formattedRequirements = computed(() => {
  if (!job.value.requirements) return ''
  return job.value.requirements.replace(/\n/g, '<br>')
})

// 格式化薪资
const formatSalary = (min, max) => {
  if (!min && !max) return '薪资面议'
  if (min && !max) return `${(min / 1000).toFixed(0)}K以上`
  if (!min && max) return `${(max / 1000).toFixed(0)}K以下`
  return `${(min / 1000).toFixed(0)}K-${(max / 1000).toFixed(0)}K`
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 格式化工作经验
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

// 格式化学历要求
const formatEducation = (edu) => {
  if (!edu) return '学历不限'
  
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

// 格式化融资阶段
const formatFundingStage = (stage) => {
  if (!stage) return '未知'
  
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

// 格式化公司规模
const formatCompanySize = (size) => {
  if (!size) return '未知'
  
  const sizeMap = {
    'TINY': '0-20人',
    'SMALL': '20-99人',
    'MEDIUM': '100-499人',
    'LARGE': '500-999人',
    'XLARGE': '1000-9999人',
    'XXLARGE': '10000+人'
  }
  
  return sizeMap[size] || '未知'
}

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'success'
    case 'FILLED':
      return 'warning'
    case 'EXPIRED':
      return 'info'
    default:
      return ''
  }
}

// 获取状态文本
const getStatusLabel = (status) => {
  switch (status) {
    case 'ACTIVE':
      return '招聘中'
    case 'FILLED':
      return '已招满'
    case 'EXPIRED':
      return '已过期'
    default:
      return '未知'
  }
}

// 返回职位列表
const goBack = () => {
  router.push('/recruitment')
}

// 一键投递职位
const applyJobDirectly = async () => {
  // 检查是否登录
  if (!userStore.isLoggedIn) {
    ElMessageBox.confirm('请先登录后再投递职位', '提示', {
      confirmButtonText: '去登录',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      router.push({
        path: '/login',
        query: { redirect: route.fullPath }
      })
    }).catch(() => {})
    return
  }
  
  // 检查是否为求职者
  if (userStore.userInfo.role !== 'JOB_SEEKER') {
    ElMessage.warning('只有求职者才能投递职位')
    return
  }
  
  try {
    applying.value = true
    
    // 确认投递
    await ElMessageBox.confirm(
      `确认投递职位：${job.value.title}？`, 
      '一键投递', 
      {
        confirmButtonText: '确认投递',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    // 调用API投递职位
    await apiApplyJob(job.value.id)
    
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
    applying.value = false
  }
}

// 查看相关职位
const viewJob = (id) => {
  router.push({
    name: 'RecruitmentJobDetail',
    params: { id }
  })
}

onMounted(() => {
  fetchJobDetail()
})
</script>

<style lang="less" scoped>
.job-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
}

.breadcrumb-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .back-button {
    display: flex;
    align-items: center;
    gap: 5px;
  }
}

.loading-container, .empty-container {
  margin: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .back-to-list {
    margin-top: 20px;
  }
}

.job-header {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  padding: 32px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    padding: 24px;
  }
  
  &-left {
    flex: 1;
    min-width: 0;
    
    .job-title {
      font-size: 28px;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 16px 0;
      line-height: 1.3;
      
      @media (max-width: 576px) {
        font-size: 22px;
      }
    }
    
    .company-info {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .company-name {
        font-size: 16px;
        color: #606266;
      }
      
      .status-tag {
        font-size: 12px;
      }
    }
  }
  
  &-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    gap: 16px;
    
    @media (max-width: 768px) {
      align-items: flex-start;
    }
    
    .salary {
      font-size: 24px;
      font-weight: 600;
      color: #ff6b6b;
      white-space: nowrap;
    }
    
    .apply-button {
      min-width: 120px;
    }
  }
}

.job-content {
  display: flex;
  gap: 24px;
  
  @media (max-width: 992px) {
    flex-direction: column;
  }
  
  .job-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .job-sidebar {
    width: 320px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 24px;
    
    @media (max-width: 992px) {
      width: 100%;
    }
  }
}

.job-card {
  margin-bottom: 0;
  overflow: hidden;
  transition: box-shadow 0.3s;
  border-radius: 12px;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
    }
  }
}

.job-meta {
  padding: 16px 0;
  
  .meta-row {
    display: flex;
    margin-bottom: 24px;
    gap: 40px;
    
    @media (max-width: 576px) {
      flex-direction: column;
      gap: 20px;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .meta-item {
    display: flex;
    align-items: flex-start;
    flex: 1;
    
    .meta-icon {
      margin-right: 12px;
      padding: 8px;
      background-color: rgba(3, 82, 201, 0.05);
      border-radius: 8px;
      color: #0352c9;
    }
    
    .meta-content {
      flex: 1;
      min-width: 0;
      
      .meta-label {
        font-size: 13px;
        color: #909399;
        margin-bottom: 4px;
      }
      
      .meta-value {
        font-size: 15px;
        font-weight: 500;
        color: #2c3e50;
      }
    }
  }
}

.job-description {
  margin-top: 24px;
  
  .description-section {
    margin-bottom: 32px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 16px 0;
      padding-bottom: 12px;
      border-bottom: 1px solid #f0f0f0;
      position: relative;
      
      &:before {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 40px;
        height: 2px;
        background-color: #0352c9;
      }
    }
    
    .section-content {
      font-size: 14px;
      line-height: 1.8;
      color: #606266;
      white-space: pre-line;
    }
  }
}

.location-info {
  padding: 16px 0;
  
  .location-address {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    color: #2c3e50;
  }
}

.company-card {
  .company-content {
    padding: 16px 0;
    
    .company-name {
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 16px 0;
    }
    
    .company-meta {
      margin-bottom: 16px;
      
      &-item {
        display: flex;
        margin-bottom: 8px;
        font-size: 14px;
        
        .label {
          color: #909399;
          width: 80px;
          flex-shrink: 0;
        }
        
        .value {
          color: #606266;
          flex: 1;
        }
      }
    }
    
    .company-description {
      font-size: 14px;
      color: #606266;
      line-height: 1.6;
    }
  }
}

.related-jobs-list {
  .related-job-item {
    display: flex;
    justify-content: space-between;
    padding: 16px 0;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: all 0.3s;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:hover {
      background-color: #f5f9ff;
      
      .related-job-title {
        color: #0352c9;
      }
    }
    
    .related-job-info {
      flex: 1;
      min-width: 0;
      
      .related-job-title {
        font-size: 15px;
        font-weight: 500;
        color: #2c3e50;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .related-job-company {
        font-size: 13px;
        color: #909399;
      }
    }
    
    .related-job-salary {
      font-size: 14px;
      font-weight: 500;
      color: #ff6b6b;
      white-space: nowrap;
    }
  }
}

.no-related-jobs {
  padding: 24px 0;
  text-align: center;
  color: #909399;
  font-size: 14px;
}
</style> 