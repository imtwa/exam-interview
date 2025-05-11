<template>
  <div class="profile-setup-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">HR个人资料设置</h1>
        <p class="page-desc">完善您的个人资料和公司信息，以便开始招聘流程</p>
      </div>

      <!-- 使用NumberSteps组件 -->
      <div class="steps-container">
        <NumberSteps :steps="stepTitles" :active="activeStep + 1" />
      </div>

      <!-- 表单内容区域 -->
      <div class="form-container">
        <el-card class="form-card" shadow="hover">
          <!-- 第一步：个人信息 -->
          <div v-if="activeStep === 0" class="step-content">
            <h2 class="step-content-title">个人信息</h2>
            <p class="step-content-desc">请填写您的个人基本信息和选择您所属的公司</p>

            <el-form
              ref="interviewerFormRef"
              :model="interviewerForm"
              :rules="interviewerRules"
              label-position="top"
              class="setup-form"
            >
              <el-form-item label="职位" prop="position">
                <el-input v-model="interviewerForm.position" placeholder="请输入您的职位" />
              </el-form-item>

              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="interviewerForm.gender">
                  <el-radio label="MALE">男</el-radio>
                  <el-radio label="FEMALE">女</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="选择公司" prop="companyId">
                <div class="company-search-wrapper">
                  <el-select
                    v-model="interviewerForm.companyId"
                    placeholder="请输入公司名称进行搜索"
                    style="width: 100%"
                    filterable
                    :loading="companySearchLoading"
                    @search="searchCompany"
                    clearable
                    popper-class="company-select-dropdown"
                    remote
                    :remote-method="searchCompany"
                    :reserve-keyword="false"
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                    <el-option
                      v-for="company in companies"
                      :key="company.id"
                      :label="company.name"
                      :value="company.id"
                    >
                      <div class="company-option">
                        <span class="company-name">{{ company.name }}</span>
                        <span v-if="company.industry" class="company-industry">{{
                          company.industry.name
                        }}</span>
                      </div>
                    </el-option>
                    <template #empty>
                      <div class="empty-search-result">
                        <p v-if="companySearchLoading">
                          <el-icon class="is-loading"><Loading /></el-icon> 正在搜索...
                        </p>
                        <template v-else>
                          <p v-if="companySearchKeyword">
                            <el-icon><InfoFilled /></el-icon>
                            没有找到匹配"{{ companySearchKeyword }}"的公司
                          </p>
                          <p v-else>
                            <el-icon><Search /></el-icon>
                            请输入公司名称关键词进行搜索
                          </p>
                          <div class="empty-search-tips">
                            您可以尝试输入更简短的关键词，或者<a
                              href="javascript:;"
                              @click="handleCreateCompany"
                              >创建新公司</a
                            >
                          </div>
                        </template>
                      </div>
                    </template>
                  </el-select>
                </div>
                <div class="create-company-link">
                  <a href="javascript:;" @click="handleCreateCompany"
                    >没有找到您的公司？点击创建新公司</a
                  >
                </div>
              </el-form-item>

              <div class="form-actions">
                <el-button type="primary" size="large" @click="nextStep('interviewerFormRef')"
                  >下一步</el-button
                >
              </div>
            </el-form>
          </div>

          <!-- 第二步：公司信息 -->
          <div v-if="activeStep === 1" class="step-content">
            <h2 class="step-content-title">公司信息</h2>
            <p class="step-content-desc">请输入您的公司信息</p>

            <el-form
              ref="companyFormRef"
              :model="companyForm"
              :rules="companyRules"
              label-position="top"
              class="setup-form"
            >
              <!-- 新公司信息 -->
              <template v-if="joinType === 'new'">
                <el-row :gutter="20">
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="公司名称" prop="name">
                      <el-input v-model="companyForm.name" placeholder="请输入公司名称" />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="所属行业" prop="industryId">
                      <el-select
                        v-model="companyForm.industryId"
                        placeholder="请选择所属行业"
                        style="width: 100%"
                      >
                        <el-option
                          v-for="option in industryOptions"
                          :key="option.id"
                          :label="option.name"
                          :value="option.id"
                        >
                          {{ option.name }}
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-form-item label="公司地址" prop="address">
                  <div class="address-select-container">
                    <el-cascader
                      v-model="selectedRegion"
                      :options="regionData"
                      :props="regionProps"
                      placeholder="请选择省/市/区"
                      @change="handleRegionChange"
                      style="width: 100%"
                    />
                  </div>
                  <el-input
                    v-model="companyForm.detailAddress"
                    placeholder="请输入详细地址"
                    style="margin-top: 10px"
                  />
                </el-form-item>

                <el-row :gutter="20">
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="公司规模" prop="size">
                      <el-select
                        v-model="companyForm.size"
                        placeholder="请选择公司规模"
                        style="width: 100%"
                      >
                        <el-option label="0-20人" value="TINY" />
                        <el-option label="20-99人" value="SMALL" />
                        <el-option label="100-499人" value="MEDIUM" />
                        <el-option label="500-999人" value="LARGE" />
                        <el-option label="1000-9999人" value="XLARGE" />
                        <el-option label="10000+人" value="XXLARGE" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="融资阶段" prop="fundingStage">
                      <el-select
                        v-model="companyForm.fundingStage"
                        placeholder="请选择融资阶段"
                        style="width: 100%"
                      >
                        <el-option label="未融资" value="UNFUNDED" />
                        <el-option label="天使轮" value="ANGEL" />
                        <el-option label="A轮" value="SERIES_A" />
                        <el-option label="B轮" value="SERIES_B" />
                        <el-option label="C轮" value="SERIES_C" />
                        <el-option label="D轮及以上" value="SERIES_D" />
                        <el-option label="已上市" value="IPO" />
                        <el-option label="不需要融资" value="SELF_FUNDED" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20">
                  <el-col :xs="24" :sm="12">
                    <el-form-item label="成立年份" prop="foundedYear">
                      <el-date-picker
                        v-model="foundedDate"
                        type="year"
                        placeholder="选择成立年份"
                        format="YYYY"
                        value-format="YYYY"
                        style="width: 100%"
                        @change="onFoundedYearChange"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-form-item label="公司简介" prop="description">
                  <el-input
                    v-model="companyForm.description"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入公司简介"
                  />
                </el-form-item>
              </template>

              <div class="form-actions">
                <el-button @click="prevStep">上一步</el-button>
                <el-button type="primary" @click="nextStep('companyFormRef')">下一步</el-button>
              </div>
            </el-form>
          </div>

          <!-- 第三步：确认信息 -->
          <div v-if="activeStep === 2" class="step-content">
            <h2 class="step-content-title">确认信息</h2>
            <p class="step-content-desc">请确认您填写的信息无误</p>

            <div class="confirm-content">
              <el-row :gutter="30">
                <el-col :xs="24" :md="12">
                  <div class="confirm-card">
                    <div class="confirm-card-header">
                      <i class="el-icon-user"></i>
                      <span>个人信息</span>
                    </div>
                    <div class="confirm-card-body">
                      <div class="confirm-item" v-if="interviewerForm.position">
                        <span class="label">职位:</span>
                        <span class="value">{{ interviewerForm.position }}</span>
                      </div>
                      <div class="confirm-item">
                        <span class="label">性别:</span>
                        <span class="value">{{ genderMap[interviewerForm.gender] }}</span>
                      </div>
                    </div>
                  </div>
                </el-col>
                <el-col :xs="24" :md="12">
                  <div class="confirm-card">
                    <div class="confirm-card-header">
                      <i class="el-icon-office-building"></i>
                      <span>公司信息</span>
                    </div>
                    <div class="confirm-card-body">
                      <template v-if="joinType === 'existing'">
                        <div class="confirm-item">
                          <span class="label">选择的公司:</span>
                          <span class="value highlight">{{
                            getCompanyName(profileSetupForm.existingCompanyId)
                          }}</span>
                        </div>
                        <div
                          class="confirm-item"
                          v-if="getSelectedCompany() && getSelectedCompany().industry"
                        >
                          <span class="label">所属行业:</span>
                          <span class="value">{{ getSelectedCompany().industry.name }}</span>
                        </div>
                        <div
                          class="confirm-item"
                          v-if="getSelectedCompany() && getSelectedCompany().address"
                        >
                          <span class="label">公司地址:</span>
                          <span class="value">{{ getSelectedCompany().address }}</span>
                        </div>
                        <div
                          class="confirm-item"
                          v-if="getSelectedCompany() && getSelectedCompany().size"
                        >
                          <span class="label">公司规模:</span>
                          <span class="value">{{ companySizeMap[getSelectedCompany().size] }}</span>
                        </div>
                        <div
                          class="confirm-item"
                          v-if="getSelectedCompany() && getSelectedCompany().fundingStage"
                        >
                          <span class="label">融资阶段:</span>
                          <span class="value">{{
                            fundingStageMap[getSelectedCompany().fundingStage]
                          }}</span>
                        </div>
                        <div
                          class="confirm-item"
                          v-if="getSelectedCompany() && getSelectedCompany().foundedYear"
                        >
                          <span class="label">成立年份:</span>
                          <span class="value">{{ getSelectedCompany().foundedYear }}</span>
                        </div>
                        <div
                          class="confirm-item"
                          v-if="getSelectedCompany() && getSelectedCompany().description"
                        >
                          <span class="label">公司简介:</span>
                          <span class="value description-text">{{
                            getSelectedCompany().description
                          }}</span>
                        </div>
                      </template>
                      <template v-else>
                        <div class="confirm-item">
                          <span class="label">公司名称:</span>
                          <span class="value highlight">{{ companyForm.name }}</span>
                        </div>
                        <div class="confirm-item" v-if="companyForm.industryId">
                          <span class="label">所属行业:</span>
                          <span class="value">{{ getIndustryName(companyForm.industryId) }}</span>
                        </div>
                        <div class="confirm-item" v-if="companyForm.address">
                          <span class="label">公司地址:</span>
                          <span class="value">{{ companyForm.address }}</span>
                        </div>
                        <div class="confirm-item" v-if="companyForm.size">
                          <span class="label">公司规模:</span>
                          <span class="value">{{ companySizeMap[companyForm.size] }}</span>
                        </div>
                        <div class="confirm-item" v-if="companyForm.fundingStage">
                          <span class="label">融资阶段:</span>
                          <span class="value">{{ fundingStageMap[companyForm.fundingStage] }}</span>
                        </div>
                        <div class="confirm-item" v-if="companyForm.foundedYear">
                          <span class="label">成立年份:</span>
                          <span class="value">{{ companyForm.foundedYear }}</span>
                        </div>
                        <div class="confirm-item" v-if="companyForm.description">
                          <span class="label">公司简介:</span>
                          <span class="value description-text">{{ companyForm.description }}</span>
                        </div>
                      </template>
                    </div>
                  </div>
                </el-col>
              </el-row>

              <div class="form-actions">
                <el-button @click="prevStep">上一步</el-button>
                <el-button type="primary" size="large" @click="submitProfile" :loading="loading"
                  >提交</el-button
                >
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { updateInterviewerProfile } from '@/api/interviewer'
import { getCompanyList } from '@/api/company'
import { getRegionData } from '@/api/region'
import NumberSteps from '@/components/NumberSteps.vue'
import { Search, Loading, InfoFilled } from '@element-plus/icons-vue'
import { getIndustryCategories } from '@/api/industry'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const activeStep = ref(0)
const loading = ref(false)
const companies = ref([])
const joinType = ref('new')
const foundedDate = ref(null)
const skipCompanyStep = ref(false)

// 公司搜索相关
const companySearchKeyword = ref('')
const companySearchLoading = ref(false)
const companySearchTimeout = ref(null)

// 步骤数据
const steps = [{ title: '个人信息' }, { title: '公司信息' }, { title: '确认信息' }]

// 步骤标题数组，用于NumberSteps组件
const stepTitles = computed(() => steps.map(step => step.title))

// 性别映射
const genderMap = {
  MALE: '男',
  FEMALE: '女'
}

// 公司规模映射
const companySizeMap = {
  TINY: '0-20人',
  SMALL: '20-99人',
  MEDIUM: '100-499人',
  LARGE: '500-999人',
  XLARGE: '1000-9999人',
  XXLARGE: '10000+人'
}

// 融资阶段映射
const fundingStageMap = {
  UNFUNDED: '未融资',
  ANGEL: '天使轮',
  SERIES_A: 'A轮',
  SERIES_B: 'B轮',
  SERIES_C: 'C轮',
  SERIES_D: 'D轮及以上',
  IPO: '已上市',
  SELF_FUNDED: '不需要融资'
}

// 个人信息表单
const interviewerFormRef = ref(null)
const interviewerForm = reactive({
  position: '',
  gender: 'MALE', // 默认选择男性
  companyId: null
})

// 地址选择相关
const regionData = ref([])
const selectedRegion = ref([])
const regionProps = {
  value: 'code',
  label: 'name',
  children: 'children',
  checkStrictly: false,
  emitPath: true
}

// 处理地区选择变化
const handleRegionChange = value => {
  if (value && value.length > 0) {
    const selectedLabels = []
    let currentOptions = regionData.value

    value.forEach(code => {
      const selected = currentOptions.find(item => item.code === code)
      if (selected) {
        selectedLabels.push(selected.name)
        currentOptions = selected.children || []
      }
    })

    companyForm.regionCodes = value
    companyForm.regionNames = selectedLabels
    companyForm.address =
      selectedLabels.join(' ') + (companyForm.detailAddress ? ' ' + companyForm.detailAddress : '')
  } else {
    companyForm.regionCodes = []
    companyForm.regionNames = []
    updateFullAddress()
  }
}

// 更新完整地址
const updateFullAddress = () => {
  const regionPart =
    companyForm.regionNames && companyForm.regionNames.length > 0
      ? companyForm.regionNames.join(' ')
      : ''

  companyForm.address =
    regionPart + (companyForm.detailAddress ? ' ' + companyForm.detailAddress : '')
}

// 监听详细地址变化
const watchDetailAddress = val => {
  updateFullAddress()
}

// 公司信息表单
const companyFormRef = ref(null)
const companyForm = reactive({
  name: '',
  description: '',
  address: '',
  detailAddress: '',
  regionCodes: [],
  regionNames: [],
  fundingStage: '',
  size: '',
  industryId: null,
  foundedYear: null
})

// 最终提交的表单数据
const profileSetupForm = reactive({
  interviewer: {},
  company: {},
  useExistingCompany: false,
  existingCompanyId: null
})

// 表单校验规则
const interviewerRules = {
  position: [
    { required: true, message: '请输入职位', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  companyId: [{ required: true, message: '请选择公司', trigger: 'change' }]
}

const companyRules = {
  name: [
    { required: true, message: '请输入公司名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  existingCompanyId: [{ required: true, message: '请选择公司', trigger: 'change' }]
}

// 获取公司名称
const getCompanyName = id => {
  if (!id || !companies.value) return ''
  const company = companies.value.find(company => company.id === id)
  return company ? company.name : ''
}

// 成立年份变更处理
const onFoundedYearChange = value => {
  if (value) {
    companyForm.foundedYear = parseInt(value)
  } else {
    companyForm.foundedYear = null
  }
}

// 前一步
const prevStep = () => {
  if (activeStep.value > 0) {
    activeStep.value--
  }
}

// 处理创建新公司
const handleCreateCompany = async () => {
  // 验证职位是否已输入
  await interviewerFormRef.value.validateField(['position'], valid => {
    if (valid) {
      // 验证通过，设置为创建新公司模式并跳转到第二步
      joinType.value = 'new'
      skipCompanyStep.value = false
      activeStep.value = 1 // 直接跳转到第二步
    } else {
      ElMessage.warning('请先填写职位信息')
    }
  })
}

// 下一步
const nextStep = async formName => {
  if (!formName) {
    activeStep.value++
    return
  }

  const formRef =
    formName === 'interviewerFormRef' ? interviewerFormRef.value : companyFormRef.value

  await formRef.validate(async valid => {
    if (valid) {
      // 如果是第一步且已选择公司，则跳过第二步
      if (formName === 'interviewerFormRef' && interviewerForm.companyId) {
        skipCompanyStep.value = true
        joinType.value = 'existing' // 设置为使用现有公司
        profileSetupForm.useExistingCompany = true
        profileSetupForm.existingCompanyId = interviewerForm.companyId
        // 直接跳到确认信息步骤
        activeStep.value = 2
        prepareSubmitData()
        return
      }

      if (
        formName === 'companyFormRef' &&
        joinType.value === 'existing' &&
        !profileSetupForm.existingCompanyId
      ) {
        ElMessage.error('请选择公司')
        return
      }

      activeStep.value++

      // 如果是最后一步，准备提交数据
      if (activeStep.value === 2) {
        prepareSubmitData()
      }
    } else {
      return false
    }
  })
}

// 准备提交数据
const prepareSubmitData = () => {
  // 面试官信息
  profileSetupForm.interviewer = {
    position: interviewerForm.position,
    gender: interviewerForm.gender,
    companyId: interviewerForm.companyId || null
  }

  // 公司信息
  if (skipCompanyStep.value || joinType.value === 'existing') {
    profileSetupForm.useExistingCompany = true
    profileSetupForm.existingCompanyId =
      interviewerForm.companyId || profileSetupForm.existingCompanyId
    // 确保在确认页面显示选择的公司
    // console.log('选择的公司ID:', profileSetupForm.existingCompanyId);
  } else {
    profileSetupForm.useExistingCompany = false
    profileSetupForm.company = {
      ...companyForm,
      // 确保使用行业ID
      industryId: companyForm.industryId
    }
    // 删除不需要的字段
    delete profileSetupForm.company.industry
  }
}

// 提交个人资料
const submitProfile = async () => {
  try {
    loading.value = true
    const response = await updateInterviewerProfile(profileSetupForm)

    if (response) {
      // console.log('面试官资料设置成功，返回数据:', response)

      // 在资料设置成功后直接更新存储
      // 保存面试官信息到Pinia store
      const userStore = useUserStore()
      userStore.setInterviewerInfo(response)

      ElMessage.success('个人资料设置成功')
      // 跳转到主页或仪表板
      router.push('/profile')
    } else {
      ElMessage.error('设置失败，请重试')
    }
  } finally {
    loading.value = false
  }
}

// 获取区域数据
const fetchRegionData = async () => {
  try {
    const response = await getRegionData()
    // 确保数据是数组格式
    if (response) {
      // 确保regionData始终是数组
      regionData.value = Array.isArray(response) ? response : []
      if (!Array.isArray(response) && response.data && Array.isArray(response.data)) {
        regionData.value = response.data
      }
      // console.log('地区数据格式:', regionData.value);
    } else {
      console.error('获取地区数据失败')
      regionData.value = [] // 确保即使失败也是空数组
    }
  } catch (error) {
    console.error('获取地区数据失败:', error)
    ElMessage.warning('地区数据加载失败，请刷新页面重试')
    regionData.value = [] // 确保异常时也是空数组
  }
}

// 获取选中公司的详细信息
const getSelectedCompany = () => {
  if (!profileSetupForm.existingCompanyId || !companies.value.length) return null
  return companies.value.find(company => company.id === profileSetupForm.existingCompanyId)
}

// 搜索公司
const searchCompany = async query => {
  companySearchKeyword.value = query

  // 使用防抖处理输入
  if (companySearchTimeout.value) {
    clearTimeout(companySearchTimeout.value)
  }

  companySearchTimeout.value = setTimeout(async () => {
    try {
      companySearchLoading.value = true
      const response = await getCompanyList({
        name: query || '',
        page: 1,
        pageSize: 20
      })

      // 直接处理response，因为响应拦截器已经处理了状态码
      if (response && response.list) {
        companies.value = response.list
        // console.log('加载的公司列表:', companies.value);
      } else {
        // console.error('获取公司列表数据格式不正确:', response)
        ElMessage.error('获取公司列表失败')
        companies.value = []
      }
    } catch (error) {
      console.error('搜索公司失败:', error)
      ElMessage.error('搜索公司失败，请稍后重试')
      companies.value = []
    } finally {
      companySearchLoading.value = false
    }
  }, 300)
}

// 添加行业数据
const industryOptions = ref([])
const fetchIndustries = async () => {
  try {
    const response = await getIndustryCategories()
    if (response && response.list) {
      industryOptions.value = response.list.map(category => ({
        id: category.id,
        name: category.name,
        subCategories: category.subCategories || []
      }))
    }
  } catch (error) {
    console.error('获取行业数据失败:', error)
    ElMessage.warning('行业数据加载失败，请刷新页面重试')
  }
}

// 获取行业名称
const getIndustryName = id => {
  if (!id || !industryOptions.value) return ''
  const industry = industryOptions.value.find(item => item.id === id)
  return industry ? industry.name : ''
}

onMounted(() => {
  fetchRegionData()
  fetchIndustries() // 加载行业数据

  // 初始化时加载一些默认公司
  setTimeout(() => {
    searchCompany('')
  }, 500)
})

// 监听detailAddress变化
watch(() => companyForm.detailAddress, watchDetailAddress)
</script>

<style lang="less" scoped>
.profile-setup-page {
  background-color: #f5f9ff;
  width: 100%;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 28px;
  color: #303133;
  margin-bottom: 8px;
  font-weight: 600;
}

.page-desc {
  font-size: 16px;
  color: #606266;
}

.steps-container {
  margin-bottom: 30px;
}

.number-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  cursor: pointer;
  z-index: 2;
}

.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f0f2f5;
  color: #909399;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s;
  margin-bottom: 8px;
  border: 2px solid #e4e7ed;
}

.step-title {
  font-size: 14px;
  color: #909399;
  transition: all 0.3s;
}

.step-line {
  position: absolute;
  height: 2px;
  background-color: #e4e7ed;
  width: 100%;
  top: 18px;
  left: 50%;
  z-index: 1;
}

.step-item.active .step-number,
.step-item.completed .step-number {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}

.step-item.active .step-title,
.step-item.completed .step-title {
  color: #409eff;
  font-weight: 500;
}

.step-item.completed .step-line {
  background-color: #409eff;
}

.form-container {
  margin-bottom: 40px;
}

.form-card {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background: white;
  padding: 10px;
}

.step-content {
  padding: 20px;
}

.step-content-title {
  font-size: 22px;
  color: #303133;
  margin-bottom: 10px;
  font-weight: 600;
}

.step-content-desc {
  font-size: 14px;
  color: #909399;
  margin-bottom: 30px;
}

.setup-form {
  .el-form-item__label {
    font-weight: 500;
  }
}

.join-type-selector {
  margin-bottom: 30px;
  text-align: center;
}

.join-type-group {
  width: 100%;
  max-width: 400px;
}

.form-actions {
  text-align: center;
  margin-top: 40px;

  .el-button {
    min-width: 120px;
  }
}

.confirm-content {
  padding: 10px;
}

.confirm-card {
  border-radius: 8px;
  border: 1px solid #ebeef5;
  margin-bottom: 30px;
  overflow: hidden;
}

.confirm-card-header {
  background-color: #f5f7fa;
  padding: 15px 20px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;

  i {
    font-size: 18px;
    margin-right: 8px;
    color: #409eff;
  }
}

.confirm-card-body {
  padding: 20px;
}

.confirm-item {
  display: flex;
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.5;
}

.confirm-item .label {
  width: 100px;
  color: #909399;
  flex-shrink: 0;
}

.confirm-item .value {
  flex: 1;
  color: #303133;
}

.confirm-item .highlight {
  color: #409eff;
  font-weight: 500;
}

.company-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  white-space: normal;
  line-height: 1.5;
}

.company-name {
  font-weight: 500;
  color: #303133;
  flex: 1;
  margin-right: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.company-industry {
  color: #909399;
  font-size: 12px;
  flex-shrink: 0;
}

.create-company-link {
  margin-top: 8px;
  font-size: 13px;

  a {
    color: #409eff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.address-select-container {
  margin-bottom: 20px;
}

.empty-search-result {
  padding: 15px;
  text-align: center;
  color: #909399;

  p {
    margin: 0 0 10px;
    display: flex;
    align-items: center;
    justify-content: center;

    .el-icon {
      margin-right: 8px;
      font-size: 16px;
    }
  }

  .empty-search-tips {
    font-size: 12px;
    color: #a0a0a0;
    margin-top: 8px;

    a {
      color: #409eff;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.company-search-wrapper {
  width: 100%;

  :deep(.el-input__wrapper) {
    padding-left: 15px;
  }

  :deep(.el-input__prefix) {
    margin-right: 8px;
  }

  :deep(.el-select .el-input .el-select__caret) {
    color: #c0c4cc;
  }
}

.description-text {
  white-space: pre-line;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .profile-setup-page {
    padding: 20px 0;
  }

  .page-title {
    font-size: 24px;
  }

  .step-number {
    width: 30px;
    height: 30px;
    font-size: 14px;
  }

  .step-title {
    font-size: 12px;
  }

  .step-line {
    top: 15px;
  }

  .step-content {
    padding: 15px;
  }

  .step-content-title {
    font-size: 20px;
  }

  .confirm-item .label {
    width: 80px;
  }
}

.el-radio-group {
  display: flex;
  gap: 20px;
}
</style>

<style>
/* 全局样式，解决下拉框宽度问题 */
.company-select-dropdown {
  width: auto !important;
  min-width: 200px !important;
}

.company-select-dropdown .el-select-dropdown__item {
  height: auto;
  padding: 8px 12px;
  line-height: 1.5;
  white-space: normal;
}
</style>
