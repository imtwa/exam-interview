<template>
  <div class="profile-setup-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">求职者资料设置</h1>
        <p class="page-desc">完善您的个人资料，帮助您更快找到合适的工作</p>
      </div>

      <!-- 使用NumberSteps组件 -->
      <div class="steps-container">
        <NumberSteps :steps="stepTitles" :active="activeStep + 1" />
      </div>

      <!-- 表单内容区域 -->
      <div class="form-container">
        <el-card class="form-card" shadow="hover">
          <!-- 第一步：基本信息 -->
          <div v-if="activeStep === 0" class="step-content">
            <h2 class="step-content-title">基本信息</h2>
            <p class="step-content-desc">请填写您的个人基本信息，带 * 号的为必填项</p>

            <el-form
              ref="basicFormRef"
              :model="basicForm"
              :rules="basicRules"
              label-position="top"
              class="setup-form"
            >
              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="basicForm.gender">
                  <el-radio label="MALE">男</el-radio>
                  <el-radio label="FEMALE">女</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="出生日期" prop="birthday">
                <el-date-picker
                  v-model="basicForm.birthday"
                  type="date"
                  placeholder="选择出生日期"
                  style="width: 100%"
                />
              </el-form-item>

              <el-form-item label="居住地址" prop="address">
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
                  v-model="basicForm.detailAddress"
                  placeholder="请输入详细地址"
                  style="margin-top: 10px"
                />
              </el-form-item>

              <div class="form-actions">
                <el-button type="primary" size="large" @click="nextStep('basicFormRef')"
                  >下一步</el-button
                >
              </div>
            </el-form>
          </div>

          <!-- 第二步：教育经历 -->
          <div v-if="activeStep === 1" class="step-content">
            <h2 class="step-content-title">教育经历</h2>
            <p class="step-content-desc">请填写您的最高学历信息（可选）</p>

            <el-form
              ref="educationFormRef"
              :model="educationForm"
              :rules="educationRules"
              label-position="top"
              class="setup-form"
            >
              <el-form-item label="最高学历" prop="degree">
                <el-select
                  v-model="educationForm.degree"
                  placeholder="请选择学历"
                  style="width: 100%"
                >
                  <el-option label="高中" value="HIGH_SCHOOL" />
                  <el-option label="大专" value="ASSOCIATE" />
                  <el-option label="本科" value="BACHELOR" />
                  <el-option label="硕士" value="MASTER" />
                  <el-option label="博士" value="DOCTORATE" />
                  <el-option label="其他" value="OTHER" />
                </el-select>
              </el-form-item>

              <el-form-item label="院校名称" prop="school">
                <el-input v-model="educationForm.school" placeholder="请输入院校名称" />
              </el-form-item>

              <el-form-item label="专业" prop="major">
                <el-input v-model="educationForm.major" placeholder="请输入专业名称" />
              </el-form-item>

              <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                  <el-form-item label="入学时间" prop="startDate">
                    <el-date-picker
                      v-model="educationForm.startDate"
                      type="date"
                      placeholder="选择入学时间"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item label="毕业时间" prop="endDate">
                    <el-date-picker
                      v-model="educationForm.endDate"
                      type="date"
                      placeholder="选择毕业时间"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <div class="form-actions">
                <el-button @click="prevStep">上一步</el-button>
                <el-button type="primary" @click="nextStep('educationFormRef')">下一步</el-button>
              </div>
            </el-form>
          </div>

          <!-- 第三步：工作经验 -->
          <div v-if="activeStep === 2" class="step-content">
            <h2 class="step-content-title">工作经验</h2>
            <p class="step-content-desc">请填写您的工作经验（可选）</p>

            <el-form
              ref="experienceFormRef"
              :model="experienceForm"
              :rules="experienceRules"
              label-position="top"
              class="setup-form"
            >
              <el-form-item label="公司名称" prop="company">
                <el-input v-model="experienceForm.company" placeholder="请输入公司名称" />
              </el-form-item>

              <el-form-item label="职位" prop="position">
                <el-input v-model="experienceForm.position" placeholder="请输入职位名称" />
              </el-form-item>

              <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                  <el-form-item label="入职时间" prop="startDate">
                    <el-date-picker
                      v-model="experienceForm.startDate"
                      type="date"
                      placeholder="选择入职时间"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item label="离职时间" prop="endDate">
                    <el-date-picker
                      v-model="experienceForm.endDate"
                      type="date"
                      placeholder="选择离职时间"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="工作内容" prop="description">
                <el-input
                  v-model="experienceForm.description"
                  type="textarea"
                  :rows="4"
                  placeholder="请简述您的工作内容和职责"
                />
              </el-form-item>

              <div class="form-actions">
                <el-button @click="prevStep">上一步</el-button>
                <el-button type="info" @click="skipCurrentStep">跳过</el-button>
                <el-button type="primary" @click="nextStep('experienceFormRef')">下一步</el-button>
              </div>
            </el-form>
          </div>

          <!-- 第四步：求职意向 -->
          <div v-if="activeStep === 3" class="step-content">
            <h2 class="step-content-title">求职意向</h2>
            <p class="step-content-desc">告诉我们您的求职意向，匹配最合适的职位</p>

            <el-form
              ref="jobIntentionFormRef"
              :model="jobIntentionForm"
              :rules="jobIntentionRules"
              label-position="top"
              class="setup-form"
            >
              <el-form-item label="期望职位" prop="jobTitle">
                <el-input v-model="jobIntentionForm.jobTitle" placeholder="请输入期望职位" />
              </el-form-item>

              <el-form-item label="期望城市" prop="city">
                <el-cascader
                  v-model="jobIntentionForm.cityCode"
                  :options="regionData"
                  :props="{ ...regionProps, checkStrictly: true }"
                  placeholder="请选择期望工作城市"
                  style="width: 100%"
                />
              </el-form-item>

              <el-form-item label="当前薪资" prop="currentSalary">
                <el-input-number
                  v-model="jobIntentionForm.currentSalary"
                  :min="0"
                  :step="1000"
                  controls-position="right"
                  style="width: 25%"
                />
              </el-form-item>

              <el-form-item label="期望薪资" prop="salary">
                <el-row :gutter="20">
                  <el-col :xs="24" :sm="11">
                    <el-input-number
                      v-model="jobIntentionForm.salaryMin"
                      :min="0"
                      :step="1000"
                      controls-position="right"
                      style="width: 100%"
                    />
                  </el-col>
                  <el-col :xs="24" :sm="2" style="text-align: center">
                    <span>至</span>
                  </el-col>
                  <el-col :xs="24" :sm="11">
                    <el-input-number
                      v-model="jobIntentionForm.salaryMax"
                      :min="0"
                      :step="1000"
                      controls-position="right"
                      style="width: 100%"
                    />
                  </el-col>
                </el-row>
              </el-form-item>

              <div class="form-actions">
                <el-button @click="prevStep">上一步</el-button>
                <el-button type="primary" @click="nextStep('jobIntentionFormRef')"
                  >下一步</el-button
                >
              </div>
            </el-form>
          </div>

          <!-- 第五步：确认信息 -->
          <div v-if="activeStep === 4" class="step-content">
            <h2 class="step-content-title">确认信息</h2>
            <p class="step-content-desc">请确认您填写的信息无误</p>

            <div class="confirm-content">
              <el-row :gutter="30">
                <el-col :xs="24" :md="12">
                  <div class="confirm-card">
                    <div class="confirm-card-header">
                      <i class="el-icon-user"></i>
                      <span>基本信息</span>
                    </div>
                    <div class="confirm-card-body">
                      <div class="confirm-item" v-if="basicForm.gender">
                        <span class="label">性别:</span>
                        <span class="value">{{ genderMap[basicForm.gender] }}</span>
                      </div>
                      <div class="confirm-item" v-if="basicForm.birthday">
                        <span class="label">出生日期:</span>
                        <span class="value">{{ formatDate(basicForm.birthday) }}</span>
                      </div>
                      <div class="confirm-item" v-if="basicForm.address">
                        <span class="label">居住地址:</span>
                        <span class="value">{{ basicForm.address }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="confirm-card">
                    <div class="confirm-card-header">
                      <i class="el-icon-office-building"></i>
                      <span>工作经验</span>
                    </div>
                    <div class="confirm-card-body">
                      <div class="confirm-item" v-if="experienceForm.company">
                        <span class="label">公司名称:</span>
                        <span class="value">{{ experienceForm.company }}</span>
                      </div>
                      <div class="confirm-item" v-if="experienceForm.position">
                        <span class="label">职位:</span>
                        <span class="value">{{ experienceForm.position }}</span>
                      </div>
                      <div class="confirm-item" v-if="experienceForm.description">
                        <span class="label">工作内容:</span>
                        <span class="value description-text">{{ experienceForm.description }}</span>
                      </div>
                    </div>
                  </div>
                </el-col>

                <el-col :xs="24" :md="12">
                  <div class="confirm-card">
                    <div class="confirm-card-header">
                      <i class="el-icon-school"></i>
                      <span>教育经历</span>
                    </div>
                    <div class="confirm-card-body">
                      <div class="confirm-item" v-if="educationForm.degree">
                        <span class="label">最高学历:</span>
                        <span class="value">{{ degreeMap[educationForm.degree] }}</span>
                      </div>
                      <div class="confirm-item" v-if="educationForm.school">
                        <span class="label">院校名称:</span>
                        <span class="value highlight">{{ educationForm.school }}</span>
                      </div>
                      <div class="confirm-item" v-if="educationForm.major">
                        <span class="label">专业:</span>
                        <span class="value">{{ educationForm.major }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="confirm-card">
                    <div class="confirm-card-header">
                      <i class="el-icon-aim"></i>
                      <span>求职意向</span>
                    </div>
                    <div class="confirm-card-body">
                      <div class="confirm-item" v-if="jobIntentionForm.jobTitle">
                        <span class="label">期望职位:</span>
                        <span class="value highlight">{{ jobIntentionForm.jobTitle }}</span>
                      </div>
                      <div class="confirm-item" v-if="jobIntentionForm.cityName">
                        <span class="label">期望城市:</span>
                        <span class="value">{{ jobIntentionForm.cityName }}</span>
                      </div>
                      <div class="confirm-item" v-if="jobIntentionForm.currentSalary">
                        <span class="label">当前薪资:</span>
                        <span class="value">{{ jobIntentionForm.currentSalary }}</span>
                      </div>
                      <div
                        class="confirm-item"
                        v-if="jobIntentionForm.salaryMin || jobIntentionForm.salaryMax"
                      >
                        <span class="label">期望薪资:</span>
                        <span class="value">
                          {{ jobIntentionForm.salaryMin }} - {{ jobIntentionForm.salaryMax }}
                        </span>
                      </div>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import NumberSteps from '@/components/NumberSteps.vue'
import { getRegionData } from '@/api/region'
import { syncJobseekerProfile } from '@/api/jobseeker'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const activeStep = ref(0)
const loading = ref(false)
const regionData = ref([])
const userStore = useUserStore()

// 地址选择相关
const selectedRegion = ref([])
const regionProps = {
  value: 'code',
  label: 'name',
  children: 'children',
  checkStrictly: false,
  emitPath: true
}

// 步骤标题
const stepTitles = computed(() => ['基本信息', '教育经历', '工作经验', '求职意向', '确认信息'])

// 性别映射
const genderMap = {
  MALE: '男',
  FEMALE: '女'
}

// 学历映射
const degreeMap = {
  HIGH_SCHOOL: '高中',
  ASSOCIATE: '大专',
  BACHELOR: '本科',
  MASTER: '硕士',
  DOCTORATE: '博士',
  OTHER: '其他'
}

// 表单和表单引用
const basicFormRef = ref(null)
const basicForm = reactive({
  gender: 'MALE',
  birthday: '',
  address: '',
  detailAddress: '',
  regionCodes: [],
  regionNames: []
})

const educationFormRef = ref(null)
const educationForm = reactive({
  degree: '',
  school: '',
  major: '',
  startDate: '',
  endDate: ''
})

const experienceFormRef = ref(null)
const experienceForm = reactive({
  company: '',
  position: '',
  startDate: '',
  endDate: '',
  description: ''
})

const jobIntentionFormRef = ref(null)
const jobIntentionForm = reactive({
  jobTitle: '',
  cityCode: [],
  cityName: '',
  currentSalary: 0,
  salaryMin: 0,
  salaryMax: 0
})

// 表单校验规则
const basicRules = {
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }]
}

const educationRules = {
  degree: [{ required: true, message: '请选择学历', trigger: 'change' }],
  school: [{ required: true, message: '请输入院校名称', trigger: 'blur' }],
  major: [{ required: true, message: '请输入专业名称', trigger: 'blur' }]
}

const experienceRules = {
  // 工作经验可选填，但如果填写公司，则职位也必填
  company: [{ required: false, message: '请输入公司名称', trigger: 'blur' }],
  position: [{ required: false, message: '请输入职位名称', trigger: 'blur' }]
}

const jobIntentionRules = {
  jobTitle: [{ required: true, message: '请输入期望职位', trigger: 'blur' }],
  cityCode: [{ required: true, message: '请选择期望工作城市', trigger: 'change' }]
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

    basicForm.regionCodes = value
    basicForm.regionNames = selectedLabels
    basicForm.address =
      selectedLabels.join(' ') + (basicForm.detailAddress ? ' ' + basicForm.detailAddress : '')
  } else {
    basicForm.regionCodes = []
    basicForm.regionNames = []
    updateFullAddress()
  }
}

// 更新完整地址
const updateFullAddress = () => {
  const regionPart =
    basicForm.regionNames && basicForm.regionNames.length > 0 ? basicForm.regionNames.join(' ') : ''

  basicForm.address = regionPart + (basicForm.detailAddress ? ' ' + basicForm.detailAddress : '')
}

// 上一步
const prevStep = () => {
  if (activeStep.value > 0) {
    activeStep.value--
  }
}

// 下一步
const nextStep = async formName => {
  if (!formName) {
    activeStep.value++
    return
  }

  const formRef =
    formName === 'basicFormRef'
      ? basicFormRef.value
      : formName === 'educationFormRef'
        ? educationFormRef.value
        : formName === 'experienceFormRef'
          ? experienceFormRef.value
          : formName === 'jobIntentionFormRef'
            ? jobIntentionFormRef.value
            : null

  if (formRef) {
    await formRef.validate(valid => {
      if (valid) {
        activeStep.value++
      } else {
        return false
      }
    })
  } else {
    activeStep.value++
  }
}

// 提交个人资料
const submitProfile = async () => {
  try {
    loading.value = true

    // 准备提交数据，处理可能为空的字段
    const submitData = {
      basic: basicForm,
      jobIntention: jobIntentionForm
    }

    // 检查教育信息是否已填写
    if (educationForm.degree && educationForm.school) {
      submitData.education = educationForm
    } else {
      // 如果未填写教育信息，发送空对象
      submitData.education = {}
    }

    // 检查工作经验是否已填写
    if (experienceForm.company && experienceForm.position) {
      submitData.experience = experienceForm
    } else {
      // 如果未填写工作经验，发送对象
      submitData.experience = {}
    }
    
    // 调用API保存求职者信息
    const response = await syncJobseekerProfile(submitData)

    if (response) {
      ElMessage.success('个人资料设置成功')
      // 跳转到首页或仪表板
      router.push('/')
    } else {
      ElMessage.error('设置失败，请重试')
    }
  } catch (error) {
    console.error('提交个人资料失败:', error)
    // 显示具体错误信息，帮助用户理解问题
    if (error.response && error.response.data && error.response.data.message) {
      ElMessage.error(`设置失败: ${error.response.data.message}`)
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

// 添加格式化日期的辅助函数
const formatDate = date => {
  if (!date) return ''

  if (typeof date === 'string') {
    date = new Date(date)
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// 跳过当前步骤
const skipCurrentStep = () => {
  // 直接进入下一步，不做表单验证
  activeStep.value++
}

onMounted(() => {
  fetchRegionData()
})
</script>

<style lang="less" scoped>
.profile-setup-page {
  background-color: #f5f7fa;
  min-height: calc(100vh - 72px);
  padding: 40px 0;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
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
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
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

.address-select-container {
  margin-bottom: 10px;
}

.description-text {
  white-space: pre-line;
  line-height: 1.6;
}

.el-radio-group {
  display: flex;
  gap: 20px;
}

@media (max-width: 768px) {
  .profile-setup-page {
    padding: 20px 0;
  }

  .page-title {
    font-size: 24px;
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
</style>
