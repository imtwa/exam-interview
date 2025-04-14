<template>
  <div class="auth-container">
    <div class="auth-form-container">
      <div class="auth-form-header">
        <h2>注册</h2>
        <p>创建一个新账号，享受更多云面官服务</p>
      </div>

      <div class="auth-form">
        <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" label-position="top">
          <!-- 用户名 -->
          <el-form-item label="用户名" prop="username">
            <el-input v-model="registerForm.username" placeholder="请输入用户名" :prefix-icon="User" />
          </el-form-item>

          <!-- 邮箱 -->
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="registerForm.email" placeholder="请输入邮箱" :prefix-icon="Message" />
          </el-form-item>

          <!-- 密码 -->
          <el-form-item label="密码" prop="password">
            <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" :prefix-icon="Lock"
              show-password @input="checkPasswordStrength" />
            <!-- 密码强度指示器 -->
            <div class="password-strength" v-if="registerForm.password">
              <div class="strength-label">密码强度：{{ passwordStrengthText }}</div>
              <div class="strength-meter">
                <div class="strength-indicator" :style="{ width: `${passwordStrength * 25}%` }" :class="strengthClass">
                </div>
              </div>
              <div class="strength-tips">密码必须包含字母、数字，长度至少8位</div>
            </div>
          </el-form-item>

          <!-- 确认密码 -->
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" :prefix-icon="Lock"
              show-password />
          </el-form-item>

          <!-- 验证码 -->
          <el-form-item label="邮箱验证码" prop="code">
            <div class="captcha-container">
              <el-input v-model="registerForm.code" placeholder="请输入邮箱验证码" :prefix-icon="Key" />
              <el-button type="primary" class="captcha-btn" :disabled="captchaTimer > 0 || !isEmailValid"
                @click="sendCaptcha">
                {{ captchaTimer > 0 ? `${captchaTimer}秒后重试` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>

          <!-- 同意条款 -->
          <el-form-item prop="agreement">
            <el-checkbox v-model="registerForm.agreement">
              我已阅读并同意
              <el-button type="text" @click="showTerms">《用户协议》</el-button>
              和
              <el-button type="text" @click="showPrivacy">《隐私政策》</el-button>
            </el-checkbox>
          </el-form-item>

          <!-- 注册按钮 -->
          <el-form-item>
            <el-button type="primary" class="submit-btn" :loading="isLoading" @click="handleRegister">
              注册
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 登录链接 -->
        <div class="auth-footer">
          <p>已有账号？ <router-link to="/login" class="login-link">立即登录</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Message, Lock, Key } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { register, sendEmailCode } from '@/api/auth'

const router = useRouter()
const registerFormRef = ref(null)
const isLoading = ref(false)
const captchaTimer = ref(0)
const timerInterval = ref(null)

// 表单数据
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  code: '',
  agreement: false
})

// 密码强度相关
const passwordStrength = ref(0)
const passwordStrengthText = computed(() => {
  switch (passwordStrength.value) {
    case 0:
      return '弱'
    case 1:
      return '弱'
    case 2:
      return '中'
    case 3:
      return '强'
    case 4:
      return '很强'
    default:
      return '弱'
  }
})

const strengthClass = computed(() => {
  switch (passwordStrength.value) {
    case 0:
    case 1:
      return 'weak'
    case 2:
      return 'medium'
    case 3:
      return 'strong'
    case 4:
      return 'very-strong'
    default:
      return 'weak'
  }
})

// 检查邮箱是否有效
const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(registerForm.email)
})

// 密码强度检测
const checkPasswordStrength = () => {
  const password = registerForm.password
  if (!password) {
    passwordStrength.value = 0
    return
  }

  let strength = 0

  // 检查长度
  if (password.length >= 8) strength++

  // 检查是否包含数字
  if (/\d/.test(password)) strength++

  // 检查是否包含小写字母
  if (/[a-z]/.test(password)) strength++

  // 检查是否包含大写字母
  if (/[A-Z]/.test(password)) strength++

  // 检查是否包含特殊字符
  if (/[^A-Za-z0-9]/.test(password)) strength++

  passwordStrength.value = strength
}

// 表单校验规则
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else if (passwordStrength.value < 2) {
    callback(new Error('密码强度太弱，请包含字母和数字'))
  } else {
    // 如果确认密码已经输入，再次验证
    if (registerForm.confirmPassword !== '') {
      if (registerFormRef.value) {
        registerFormRef.value.validateField('confirmPassword')
      }
    }
    callback()
  }
}

const validateConfirmPass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const registerRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3-20个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPass, trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 6, message: '验证码长度在4-6个字符之间', trigger: 'blur' }
  ],
  agreement: [
    {
      type: 'boolean',
      validator: (rule, value) => value === true,
      message: '请阅读并同意用户协议和隐私政策',
      trigger: 'change'
    }
  ]
})

// 发送验证码
const sendCaptcha = async () => {
  if (!isEmailValid.value) {
    ElMessage.warning('请输入有效的邮箱地址')
    return
  }

  await sendEmailCode(registerForm.email)
  ElMessage.success('验证码已发送，请查收邮件')

  // 开始倒计时
  captchaTimer.value = 60
  timerInterval.value = setInterval(() => {
    captchaTimer.value--
    if (captchaTimer.value <= 0) {
      clearInterval(timerInterval.value)
    }
  }, 1000)
}

// 处理注册
const handleRegister = () => {
  if (!registerFormRef.value) return

  registerFormRef.value.validate(async (valid) => {
    if (valid) {
      isLoading.value = true

      try {
        // 构造注册请求数据
        const registerData = {
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password,
          code: registerForm.code
        }

        const result = await register(registerData)

        ElMessage.success('注册成功，请登录')

        // 注册成功后跳转到登录页
        router.push('/login')
      } finally {
        isLoading.value = false
      }
    }
  })
}

// 展示用户协议
const showTerms = () => {
  ElMessageBox.alert(
    '感谢您使用云面官服务。本协议包含您使用云面官服务的条款和条件，请在使用前仔细阅读。',
    '用户协议',
    {
      confirmButtonText: '我已阅读',
      center: true
    }
  )
}

// 展示隐私政策
const showPrivacy = () => {
  ElMessageBox.alert(
    '本隐私政策详细说明了我们如何收集、使用和保护您的个人信息，以及您对这些信息的权利。',
    '隐私政策',
    {
      confirmButtonText: '我已阅读',
      center: true
    }
  )
}

onMounted(() => {
  // 清除可能存在的定时器
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
})
</script>

<style lang="less" scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 72px);
  background-color: #f7faff;
  padding: 20px;
}

.auth-form-container {
  width: 100%;
  max-width: 460px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(3, 82, 201, 0.1);
  padding: 40px;

  @media (max-width: 576px) {
    padding: 25px;
  }
}

.auth-form-header {
  text-align: center;
  margin-bottom: 30px;

  h2 {
    font-size: 28px;
    color: #333;
    margin-bottom: 10px;
    font-weight: 600;
  }

  p {
    font-size: 16px;
    color: #666;
  }
}

.auth-form {
  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #333;
  }

  :deep(.el-input__inner) {
    height: 45px;
    font-size: 15px;
  }

  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-checkbox__label) {
    color: #666;
  }

  :deep(.el-button--text) {
    padding: 0;
    height: auto;
    font-size: 14px;
    color: #0352c9;

    &:hover {
      color: #0060ff;
    }
  }

  // 覆盖Element Plus的默认按钮间距
  :deep(.el-button + .el-button) {
    margin-left: 0;
  }
}

.password-strength {
  margin-top: 8px;

  .strength-label {
    font-size: 13px;
    color: #666;
    margin-bottom: 5px;
    display: flex;
    justify-content: space-between;
  }

  .strength-meter {
    height: 4px;
    background-color: #e0e0e0;
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 5px;

    .strength-indicator {
      height: 100%;
      transition: all 0.3s;

      &.weak {
        background-color: #ff4d4f;
      }

      &.medium {
        background-color: #faad14;
      }

      &.strong {
        background-color: #52c41a;
      }

      &.very-strong {
        background-color: #13c2c2;
      }
    }
  }

  .strength-tips {
    font-size: 12px;
    color: #999;
    line-height: 1.5;
  }
}

.captcha-container {
  display: flex;
  gap: 10px;

  .captcha-btn {
    flex-shrink: 0;
    min-width: 110px;
    padding: 0 15px;
    height: 45px;
    line-height: 45px;
    color: #0352c9;
    background-color: #f0f7ff;
    border: 1px solid #d4e8ff;
    border-radius: 4px;
    transition: all 0.3s;
    font-size: 14px;

    &:not(:disabled):hover {
      background-color: #e0f0ff;
      border-color: #0352c9;
    }

    &:disabled {
      background-color: #f5f5f5;
      border-color: #e0e0e0;
      color: #aaa;
      cursor: not-allowed;
    }
  }
}

.submit-btn {
  width: 100%;
  height: 45px;
  font-size: 16px;
  background: linear-gradient(135deg, #0352c9, #04aaf7);
  border: none;

  &:hover,
  &:focus {
    background: linear-gradient(135deg, #0244a8, #0499e0);
  }
}

.auth-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;

  .login-link {
    color: #0352c9;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      color: #0060ff;
      text-decoration: underline;
    }
  }
}
</style>
