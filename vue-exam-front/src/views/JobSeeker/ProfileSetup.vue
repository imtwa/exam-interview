<template>
  <div class="profile-setup-container">
    <el-card class="setup-card">
      <template #header>
        <div class="card-header">
          <span>完善求职者信息</span>
        </div>
      </template>

      <el-steps :active="activeStep" finish-status="success" simple style="margin-bottom: 20px">
        <el-step title="基本信息" />
        <el-step title="教育经历" />
        <el-step title="工作经验" />
        <el-step title="求职意向" />
        <el-step title="完成" />
      </el-steps>

      <!-- 第一步：基本信息 -->
      <div v-if="activeStep === 0">
        <el-form ref="basicFormRef" :model="basicForm" :rules="basicRules" label-width="100px">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="basicForm.name" placeholder="请输入您的姓名" />
          </el-form-item>

          <el-form-item label="性别" prop="gender">
            <el-select v-model="basicForm.gender" placeholder="请选择性别" style="width: 100%">
              <el-option label="男" value="MALE" />
              <el-option label="女" value="FEMALE" />
              <el-option label="其他" value="OTHER" />
            </el-select>
          </el-form-item>

          <el-form-item label="生日" prop="birthday">
            <el-date-picker
              v-model="basicForm.birthday"
              type="date"
              placeholder="选择出生日期"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="电话" prop="telephone">
            <el-input v-model="basicForm.telephone" placeholder="请输入电话号码" />
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input v-model="basicForm.email" placeholder="请输入电子邮箱" />
          </el-form-item>

          <el-form-item label="地址" prop="address">
            <el-input v-model="basicForm.address" placeholder="请输入居住地址" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="nextStep('basicFormRef')">下一步</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 后续步骤简化，实际应用中可根据需要扩展 -->
      <div v-if="activeStep > 0 && activeStep < 4">
        <p class="setup-placeholder">此部分需要根据实际需求进一步完善</p>
        <div class="action-buttons">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="nextStep()">下一步</el-button>
        </div>
      </div>

      <!-- 最后一步：确认信息 -->
      <div v-if="activeStep === 4" class="confirm-step">
        <div class="confirm-section">
          <h3>基本信息</h3>
          <div class="confirm-item">
            <span class="label">姓名:</span>
            <span class="value">{{ basicForm.name }}</span>
          </div>
          <div class="confirm-item" v-if="basicForm.gender">
            <span class="label">性别:</span>
            <span class="value">{{ genderMap[basicForm.gender] }}</span>
          </div>
          <div class="confirm-item" v-if="basicForm.telephone">
            <span class="label">电话:</span>
            <span class="value">{{ basicForm.telephone }}</span>
          </div>
          <div class="confirm-item" v-if="basicForm.email">
            <span class="label">邮箱:</span>
            <span class="value">{{ basicForm.email }}</span>
          </div>
        </div>

        <div class="action-buttons">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="submitProfile" :loading="loading">提交</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeStep = ref(0)
const loading = ref(false)

// 性别映射
const genderMap = {
  MALE: '男',
  FEMALE: '女',
  OTHER: '其他'
}

// 表单和表单引用
const basicFormRef = ref(null)
const basicForm = reactive({
  name: '',
  gender: '',
  birthday: '',
  telephone: '',
  email: '',
  address: ''
})

// 表单校验规则
const basicRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  telephone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }]
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

  const formRef = formName === 'basicFormRef' ? basicFormRef.value : null

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

    // 这里应该调用API保存求职者信息
    // const response = await saveJobSeekerProfile(profileData);

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('个人资料设置成功')
    // 跳转到首页或仪表板
    router.push('/')
  } catch (error) {
    console.error('提交个人资料失败:', error)
    ElMessage.error('设置失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.profile-setup-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px;
}

.setup-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.setup-placeholder {
  text-align: center;
  color: #909399;
  margin: 40px 0;
  font-size: 16px;
}

.confirm-step {
  padding: 20px 0;
}

.confirm-section {
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
}

.confirm-section h3 {
  margin-bottom: 15px;
  color: #409eff;
}

.confirm-item {
  margin-bottom: 10px;
  display: flex;
}

.confirm-item .label {
  width: 100px;
  color: #606266;
}

.confirm-item .value {
  flex: 1;
  font-weight: 500;
}

.action-buttons {
  margin-top: 30px;
  text-align: center;
}
</style>
