<template>
  <div class="recruitment-container">
    <!-- 招聘筛选区域 -->
    <div class="filter-section">
      <div class="filter-wrapper">
        <!-- 一级行业筛选 -->
        <div class="filter-group">
          <div class="filter-label">一级行业：</div>
          <div class="filter-options">
            <div
              v-for="(item, index) in industryCategories"
              :key="index"
              :class="['filter-option', { active: selectedIndustry === item.id }]"
              @click="handleIndustryChange(item.id)"
            >
              {{ item.name }}
            </div>
          </div>
        </div>

        <!-- 二级行业筛选 -->
        <div class="filter-group">
          <div class="filter-label">二级行业：</div>
          <div class="filter-options">
            <div
              v-for="(item, index) in industrySubCategories"
              :key="index"
              :class="['filter-option', { active: selectedSubIndustry === item.id }]"
              @click="handleSubIndustryChange(item.id)"
            >
              {{ item.name }}
            </div>
          </div>
        </div>

        <!-- 工作城市筛选 -->
        <div class="filter-group">
          <div class="filter-label">工作城市：</div>
          <div class="filter-options">
            <div
              :class="['filter-option', { active: selectedCity === 'all' }]"
              @click="handleCityChange('all')"
            >
              全部
            </div>
            <!-- 热门城市 - 只显示少量热门城市 -->
            <div
              v-for="(item, index) in hotCities"
              :key="'hot-' + index"
              :class="['filter-option', { active: selectedCity === item.value }]"
              @click="handleCityChange(item.value)"
            >
              {{ item.label }}
            </div>
            <!-- 更多城市按钮 -->
            <div class="filter-option more-btn" @click="showMoreCities = !showMoreCities">
              {{ showMoreCities ? '收起' : '更多' }}
              <el-icon class="icon-arrow">
                <component :is="showMoreCities ? ArrowUp : ArrowDown" />
              </el-icon>
            </div>
          </div>
        </div>

        <!-- 薪资范围筛选 -->
        <div class="filter-group">
          <div class="filter-label">薪资范围：</div>
          <div class="filter-options">
            <div
              v-for="(item, index) in salaryRanges"
              :key="index"
              :class="['filter-option', { active: selectedSalary === item.value }]"
              @click="handleSalaryChange(item.value)"
            >
              {{ item.label }}
            </div>
          </div>
        </div>

        <!-- 工作经验筛选 -->
        <div class="filter-group">
          <div class="filter-label">工作经验：</div>
          <div class="filter-options">
            <div
              v-for="(item, index) in experienceRanges"
              :key="index"
              :class="['filter-option', { active: selectedExperience === item.value }]"
              @click="handleExperienceChange(item.value)"
            >
              {{ item.label }}
            </div>
          </div>
        </div>

        <!-- 学历要求筛选 -->
        <div class="filter-group">
          <div class="filter-label">学历要求：</div>
          <div class="filter-options">
            <div
              v-for="(item, index) in educationLevels"
              :key="index"
              :class="['filter-option', { active: selectedEducation === item.value }]"
              @click="handleEducationChange(item.value)"
            >
              {{ item.label }}
            </div>
          </div>
        </div>

        <!-- 关键字搜索 -->
        <div class="search-wrapper">
          <el-input v-model="searchKeyword" placeholder="输入关键词搜索" class="search-input" @keyup.enter="handleSearch">
            <template #append>
              <el-button @click="handleSearch">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
    </div>

    <!-- 招聘信息列表 -->
    <div class="recruitment-list">
      <div v-for="(item, index) in jobList" :key="index" class="job-item">
        <div class="job-header">
          <div class="job-title-section">
            <div class="job-title">{{ item.title }}</div>
            <div class="job-company">{{ item.company?.name }}</div>
          </div>
          <div class="job-salary">{{ formatSalary(item.salaryMin, item.salaryMax) }}</div>
        </div>
        <div class="job-middle">
          <div class="job-tags">
            <span class="job-tag">{{ item.city }}</span>
            <span class="job-tag">{{ formatExperience(item.experienceReq) }}经验</span>
            <span class="job-tag">{{ formatEducation(item.educationReq) }}</span>
            <span class="job-tag" v-if="item.isRemote">远程工作</span>
          </div>
          <div class="job-category">
            <span>{{ item.subCategory?.category?.name }} / {{ item.subCategory?.name }}</span>
          </div>
        </div>
        <div class="job-footer">
          <div class="job-info">
            <span>{{ item.views || 0 }}次浏览</span>
            <span>{{ formatDate(item.createdAt) }}</span>
          </div>
          <div class="job-actions">
            <el-button type="primary" size="small" @click="viewDetail(item.id)">查看</el-button>
            <el-button 
              type="success" 
              size="small" 
              @click="applyJobDirectly(item)"
              :loading="item.applying"
              :disabled="item.status !== 'ACTIVE'"
            >
              {{ item.applying ? '投递中...' : '一键投递' }}
            </el-button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <el-card shadow="never" style="background: transparent; border: none; height: 100px" v-loading="true"></el-card>
      </div>

      <div v-if="!loading && jobList.length === 0" class="empty-state">
        <el-empty description="暂无符合条件的职位" />
      </div>

      <!-- 分页 -->
      <div v-if="jobList.length > 0" class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalItems"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 更多城市弹出层 -->
    <div v-if="showMoreCities" class="more-cities-panel" @click.self="showMoreCities = false">
      <div class="cities-container">
        <div class="cities-header">
          <h3>选择城市</h3>
          <span class="close-btn" @click="showMoreCities = false">×</span>
        </div>
        <div class="provinces-container">
          <div v-for="(province, index) in regionData" :key="'province-' + index" class="province-group">
            <div class="province-name">{{ province.name }}</div>
            <div class="cities-list">
              <div
                v-for="(city, cityIndex) in province.children"
                :key="'city-' + cityIndex"
                :class="['city-item', { active: selectedCity === city.name.replace('市', '') }]"
                @click="handleCityChange(city.name.replace('市', '')); showMoreCities = false"
              >
                {{ city.name.replace('市', '') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getJobList, getJobById, applyJob as apiApplyJob } from '@/api/job'
import { getIndustryCategories, getSubCategoriesByCategoryId } from '@/api/industry'
import { getRegionData } from '@/api/region'
import { ElMessage, ElLoading, ElMessageBox } from 'element-plus'
import { ArrowDown, ArrowUp, Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 一级行业分类
const industryCategories = ref([
  { id: 'all', name: '全部' },
])

// 二级行业分类
const industrySubCategories = ref([
  { id: 'all', name: '全部' },
])

// 城市选项
const cities = ref([
  { value: 'all', label: '全部' }
])

// 薪资范围
const salaryRanges = ref([
  { value: 'all', label: '全部' },
  { value: '0-5000', label: '5K以下' },
  { value: '5000-10000', label: '5K-10K' },
  { value: '10000-15000', label: '10K-15K' },
  { value: '15000-20000', label: '15K-20K' },
  { value: '20000-30000', label: '20K-30K' },
  { value: '30000-50000', label: '30K-50K' },
  { value: '50000-0', label: '50K以上' },
])

// 工作经验枚举(对应ExperienceLevel)
const experienceRanges = ref([
  { value: 'all', label: '全部' },
  { value: 'STUDENT', label: '在校生' },
  { value: 'FRESH_GRADUATE', label: '应届生' },
  { value: 'LESS_THAN_ONE', label: '1年以内' },
  { value: 'ONE_TO_THREE', label: '1-3年' },
  { value: 'THREE_TO_FIVE', label: '3-5年' },
  { value: 'FIVE_TO_TEN', label: '5-10年' },
  { value: 'MORE_THAN_TEN', label: '10年以上' },
])

// 学历要求(对应Degree)
const educationLevels = ref([
  { value: 'all', label: '全部' },
  { value: 'HIGH_SCHOOL', label: '高中学历' },
  { value: 'ASSOCIATE', label: '大专学历' },
  { value: 'BACHELOR', label: '本科学历' },
  { value: 'MASTER', label: '硕士学历' },
  { value: 'DOCTORATE', label: '博士学历' },
  { value: 'OTHER', label: '其他学历' },
])

// 地区数据
const regionData = ref([])

// 筛选状态
const selectedIndustry = ref('all')
const selectedSubIndustry = ref('all')
const selectedCity = ref('all')
const selectedSalary = ref('all')
const selectedExperience = ref('all')
const selectedEducation = ref('all')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const loading = ref(false)
const showMoreCities = ref(false)

// 招聘信息列表
const jobList = ref([])

// 所有城市
const allCities = ref([])
// 热门城市
const hotCities = ref([
  { value: '北京', label: '北京' },
  { value: '上海', label: '上海' },
  { value: '广州', label: '广州' },
  { value: '深圳', label: '深圳' },
  { value: '杭州', label: '杭州' },
  { value: '成都', label: '成都' },
  { value: '武汉', label: '武汉' },
  { value: '南京', label: '南京' },
  { value: '西安', label: '西安' },
  { value: '重庆', label: '重庆' }
])

// 监听行业分类变化，更新二级分类
watch(selectedIndustry, async (newVal) => {
  if (newVal !== 'all') {
    await fetchSubCategories(newVal)
  } else {
    industrySubCategories.value = [{ id: 'all', name: '全部' }]
  }
  selectedSubIndustry.value = 'all'
})

// 获取二级分类
const fetchSubCategories = async (categoryId) => {
  try {
    // 如果categoryId是'all'，直接返回全部选项
    if (categoryId === 'all') {
      industrySubCategories.value = [{ id: 'all', name: '全部' }]
      return
    }
    
    // 转换为数字类型确保比较正确
    const categoryIdNum = parseInt(categoryId)
    
    // 查找选中的一级分类
    const selectedCategory = industryCategories.value.find(cat => cat.id === categoryIdNum)
    
    if (selectedCategory && selectedCategory.subCategories) {
      // 使用一级分类中已包含的子分类数据
      industrySubCategories.value = [
        { id: 'all', name: '全部' },
        ...selectedCategory.subCategories
      ]
    } else {
      // 如果没有子分类，显示空列表
      industrySubCategories.value = [{ id: 'all', name: '全部' }]
    }
  } catch (error) {
    console.error('获取二级分类失败:', error)
  }
}

// 获取城市数据 - 从本地JSON文件
const fetchCityData = async () => {
  try {
    const response = await getRegionData()
    if (Array.isArray(response)) {
      // 省级数据
      regionData.value = response
      
      // 从省级数据中提取出所有城市
      const cityList = []
      response.forEach(province => {
        if (Array.isArray(province.children)) {
          province.children.forEach(city => {
            cityList.push({
              value: city.name.replace('市', ''), // 去掉"市"字
              label: city.name.replace('市', '')
            })
          })
        }
      })
      
      // 按照城市名称排序
      cityList.sort((a, b) => a.label.localeCompare(b.label, 'zh'))
      
      // 更新所有城市列表
      allCities.value = cityList
    }
  } catch (error) {
    console.error('获取城市数据失败:', error)
    useDefaultCities()
  }
}

// 使用默认城市列表
const useDefaultCities = () => {
  allCities.value = [
    { value: '北京', label: '北京' },
    { value: '上海', label: '上海' },
    { value: '广州', label: '广州' },
    { value: '深圳', label: '深圳' },
    { value: '杭州', label: '杭州' },
    { value: '成都', label: '成都' },
    { value: '武汉', label: '武汉' },
    { value: '南京', label: '南京' },
    { value: '西安', label: '西安' },
    { value: '重庆', label: '重庆' },
    { value: '天津', label: '天津' },
    { value: '苏州', label: '苏州' },
    { value: '长沙', label: '长沙' },
    { value: '郑州', label: '郑州' },
    { value: '青岛', label: '青岛' },
    { value: '宁波', label: '宁波' },
    { value: '厦门', label: '厦门' },
    { value: '福州', label: '福州' },
    { value: '大连', label: '大连' },
    { value: '合肥', label: '合肥' }
  ]
}

// 筛选事件处理
const handleIndustryChange = (id) => {
  // 将字符串类型的'all'保持不变，但数字ID需要转换为数字类型
  selectedIndustry.value = id === 'all' ? 'all' : parseInt(id)
  // 重置分页
  currentPage.value = 1
  // 重新加载数据
  fetchJobList()
}

const handleSubIndustryChange = (id) => {
  // 将字符串类型的'all'保持不变，但数字ID需要转换为数字类型
  selectedSubIndustry.value = id === 'all' ? 'all' : parseInt(id)
  // 重置分页
  currentPage.value = 1
  // 重新加载数据
  fetchJobList()
}

const handleCityChange = (city) => {
  selectedCity.value = city
  // 重置分页
  currentPage.value = 1
  // 重新加载数据
  fetchJobList()
}

const handleSalaryChange = (salary) => {
  selectedSalary.value = salary
  // 重置分页
  currentPage.value = 1
  // 重新加载数据
  fetchJobList()
}

const handleExperienceChange = (experience) => {
  selectedExperience.value = experience
  // 重置分页
  currentPage.value = 1
  // 重新加载数据
  fetchJobList()
}

const handleEducationChange = (education) => {
  selectedEducation.value = education
  // 重置分页
  currentPage.value = 1
  // 重新加载数据
  fetchJobList()
}

// 搜索处理
const handleSearch = () => {
  // 搜索重置分页
  currentPage.value = 1
  // 重新加载数据
  fetchJobList()
}

// 分页事件处理
const handleSizeChange = (size) => {
  pageSize.value = size
  fetchJobList()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchJobList()
}

// 获取招聘列表数据
const fetchJobList = async () => {
  loading.value = true
  
  // 构建查询参数
  const params = {
    page: currentPage.value,
    pageSize: pageSize.value,
    keyword: searchKeyword.value,
  }
  
  // 添加筛选条件 - 确保ID类型正确
  if (selectedIndustry.value !== 'all') {
    params.categoryId = parseInt(selectedIndustry.value)
  }
  
  if (selectedSubIndustry.value !== 'all') {
    params.subCategoryId = parseInt(selectedSubIndustry.value)
  }
  
  if (selectedCity.value !== 'all') {
    params.city = selectedCity.value
  }
  
  if (selectedSalary.value !== 'all') {
    const [min, max] = selectedSalary.value.split('-')
    if (min) params.salaryMin = min
    if (max) params.salaryMax = max
  }
  
  if (selectedExperience.value !== 'all') {
    params.experienceReq = selectedExperience.value
  }
  
  if (selectedEducation.value !== 'all') {
    params.educationReq = selectedEducation.value
  }

  try {
    const data = await getJobList(params)
    // 响应拦截器已经处理过返回数据
    jobList.value = data?.list || []
    totalItems.value = data?.total || 0
  } catch (error) {
    console.error('获取招聘列表失败:', error)
    ElMessage.error('获取招聘列表失败')
  } finally {
    loading.value = false
  }
}

// 获取行业分类数据
const fetchIndustryCategories = async () => {
  try {
    const data = await getIndustryCategories()
    // 响应拦截器已经处理过返回数据，直接使用返回的data
    industryCategories.value = [
      { id: 'all', name: '全部' },
      ...data.list
    ]
  } catch (error) {
    console.error('获取行业分类失败:', error)
  }
}

// 格式化薪资显示
const formatSalary = (min, max) => {
  if (!min && !max) return '薪资面议'
  if (min && !max) return `${(min / 1000).toFixed(0)}K以上`
  if (!min && max) return `${(max / 1000).toFixed(0)}K以下`
  return `${(min / 1000).toFixed(0)}K-${(max / 1000).toFixed(0)}K`
}

// 格式化工作经验显示
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

// 格式化学历要求显示
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

// 格式化日期显示
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 详情页和一键投递按钮处理
const viewDetail = (id) => {
  router.push({
    name: 'RecruitmentJobDetail',
    params: { id }
  })
}

// 一键投递职位
const applyJobDirectly = async (job) => {
  // 检查是否登录
  if (!userStore.isLoggedIn) {
    ElMessageBox.confirm('请先登录后再投递职位', '提示', {
      confirmButtonText: '去登录',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      router.push({
        path: '/login',
        query: { redirect: router.currentRoute.value.fullPath }
      })
    }).catch(() => {})
    return
  }
  
  // 检查是否为求职者
  if (userStore.userInfo.role !== 'JOB_SEEKER') {
    ElMessage.warning('只有求职者才能投递职位')
    return
  }
  
  // 设置该职位为投递中状态
  job.applying = true
  
  try {
    // 确认投递
    await ElMessageBox.confirm(
      `确认投递职位：${job.title}？`, 
      '一键投递', 
      {
        confirmButtonText: '确认投递',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    // 调用API投递职位
    await apiApplyJob(job.id)
    
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
    job.applying = false
  }
}

onMounted(async () => {
  await Promise.all([
    fetchIndustryCategories(),
    fetchCityData(),
  fetchJobList()
  ])
})
</script>

<style lang="less" scoped>
.recruitment-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h1 {
    font-size: 24px;
    color: #2c3e50;
    margin: 0;
    font-weight: 600;
  }
  
  .stats {
    font-size: 14px;
    color: #606266;
    
    span {
      color: #0352c9;
      font-weight: 600;
      font-size: 16px;
    }
  }
}

// 筛选区域样式
.filter-section {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  margin-bottom: 24px;
  overflow: hidden;
}

.filter-wrapper {
  padding: 20px 24px;
}

.filter-group {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .filter-label {
    width: 84px;
    font-size: 14px;
    color: #606266;
    line-height: 32px;
    flex-shrink: 0;
    font-weight: 500;
  }

  .filter-options {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
  }

  .filter-option {
    padding: 6px 12px;
    margin-right: 12px;
    margin-bottom: 10px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;

    &:hover {
      color: #0352c9;
      background-color: #f5f9ff;
    }

    &.active {
      color: #fff;
      background-color: #0352c9;
      font-weight: 500;
    }
  }
}

.search-wrapper {
  padding: 15px 0 5px;

  .search-input {
    width: 360px;
    
    .el-input__wrapper {
      box-shadow: 0 0 0 1px #dcdfe6 inset;
      border-radius: 6px;
      
      &:hover {
        box-shadow: 0 0 0 1px #c0c4cc inset;
      }
      
      &.is-focus {
        box-shadow: 0 0 0 1px #0352c9 inset;
      }
    }
    
    .el-input-group__append {
      background-color: #0352c9;
      box-shadow: 0 0 0 1px #0352c9 inset;
      color: white;
      
      .el-button {
        color: white;
        border: none;
        
        &:hover {
          background-color: darken(#0352c9, 5%);
        }
      }
    }
  }
}

// 招聘列表样式
.recruitment-list {
  margin-top: 20px;
}

.job-item {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  padding: 28px 24px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: all 0.3s;
  border: 1px solid transparent;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    border-color: rgba(3, 82, 201, 0.1);
  }

  .job-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 4px 0 12px 0;
  }

  .job-title-section {
    .job-title {
      font-size: 18px;
      color: #2c3e50;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .job-company {
      font-size: 14px;
      color: #666;
      display: flex;
      align-items: center;
      
      &:before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background-color: #0352c9;
        margin-right: 8px;
      }
    }
  }

  .job-salary {
    font-size: 18px;
    color: #ff6b6b;
    font-weight: 600;
    padding: 4px 10px;
    background-color: rgba(255, 107, 107, 0.08);
    border-radius: 6px;
  }

  .job-middle {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .job-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .job-tag {
      padding: 5px 12px;
      background-color: #f5f7fa;
      color: #606266;
      border-radius: 6px;
      font-size: 13px;
      transition: all 0.2s;
      
      &:hover {
        background-color: #eef2fd;
        color: #0352c9;
      }
    }
  }

  .job-category {
    font-size: 13px;
    color: #909399;
    background-color: #f8f9fc;
    padding: 5px 12px;
    border-radius: 6px;
  }

  .job-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px dashed #f0f0f0;
    padding-top: 18px;
    margin-top: 10px;
  }

  .job-info {
    display: flex;
    color: #909399;
    font-size: 13px;

    span {
      margin-right: 15px;
      display: flex;
      align-items: center;

      &:last-child {
        margin-right: 0;
      }
      
      &:before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background-color: #c0c4cc;
        margin-right: 8px;
      }
    }
  }

  .job-actions {
    display: flex;
    gap: 12px;
    
    .el-button {
      padding: 8px 16px;
      border-radius: 6px;
      transition: all 0.3s;
      
      &--primary {
        background-color: rgba(3, 82, 201, 0.05);
        color: #0352c9;
        border-color: rgba(3, 82, 201, 0.2);
        
        &:hover {
          background-color: #0352c9;
          color: white;
          border-color: #0352c9;
        }
      }
      
      &--success {
        background-color: rgba(64, 158, 255, 0.05);
        color: #409EFF;
        border-color: rgba(64, 158, 255, 0.2);
        
        &:hover {
          background-color: #409EFF;
          color: white;
          border-color: #409EFF;
        }
      }
    }
  }
}

.loading-state, .empty-state {
  padding: 40px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

// 分页样式
.pagination-wrapper {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  
  .el-pagination {
    --el-pagination-button-color: #606266;
    --el-pagination-button-bg-color: #f4f4f5;
    --el-pagination-button-size: 32px;
    --el-pagination-button-margin: 0 4px;
    --el-pagination-button-border-radius: 6px;
    --el-pagination-hover-color: #0352c9;
    --el-pagination-font-size: 14px;
  }
}

// 更多城市弹出层样式
.more-cities-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(2px);

  .cities-container {
    background-color: #fff;
    border-radius: 12px;
    width: 80%;
    max-width: 900px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }

  .cities-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #f0f0f0;

    h3 {
      font-size: 18px;
      margin: 0;
      color: #2c3e50;
      font-weight: 600;
    }

    .close-btn {
      font-size: 24px;
      cursor: pointer;
      color: #909399;
      transition: all 0.3s;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;

      &:hover {
        color: #f56c6c;
        background-color: rgba(245, 108, 108, 0.1);
      }
    }
  }

  .provinces-container {
    padding: 24px;
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    max-height: 60vh;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #c0c4cc #f4f4f5;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background-color: #f4f4f5;
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: #c0c4cc;
      border-radius: 3px;
    }

    .province-group {
      width: calc(50% - 12px);
      margin-bottom: 20px;

      .province-name {
        font-size: 16px;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #f0f0f0;
      }

      .cities-list {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }
    }
  }
}

.city-item {
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 6px;
  font-size: 14px;
  background-color: #f5f7fa;

  &:hover {
    color: #0352c9;
    background-color: #eef2fd;
  }

  &.active {
    color: #fff;
    background-color: #0352c9;
    font-weight: 500;
  }
}

// "更多"按钮样式
.more-btn {
  color: #0352c9;
  background-color: rgba(3, 82, 201, 0.05);
  border: 1px solid rgba(3, 82, 201, 0.1);
  display: flex;
  align-items: center;
  
  .icon-arrow {
    margin-left: 4px;
    font-size: 12px;
  }
  
  &:hover {
    background-color: rgba(3, 82, 201, 0.1);
    border-color: rgba(3, 82, 201, 0.2);
  }
}
</style>
