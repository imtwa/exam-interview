<template>
  <div class="auth-container">
    <div class="auth-form-container">
      <div class="auth-form-header">
        <h2>找回密码</h2>
        <p>请输入您的邮箱地址，我们将发送验证码帮您重置密码</p>
      </div>

      <div v-if="!resetSuccess" class="auth-form">
        <el-form ref="forgotFormRef" :model="forgotForm" :rules="forgotRules" label-position="top">
          <!-- 邮箱 -->
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="forgotForm.email" placeholder="请输入邮箱" :prefix-icon="Message" />
          </el-form-item>

          <!-- 验证码 -->
          <el-form-item label="邮箱验证码" prop="code">
            <div class="captcha-container">
              <el-input
                v-model="forgotForm.code"
                placeholder="请输入邮箱验证码"
                :prefix-icon="Key"
              />
              <el-button
                type="primary"
                class="captcha-btn"
                :disabled="captchaTimer > 0 || !isEmailValid"
                @click="sendCaptcha"
              >
                {{ captchaTimer > 0 ? `${captchaTimer}秒后重试` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>

          <!-- 提交按钮 -->
          <el-form-item>
            <el-button
              type="primary"
              class="submit-btn"
              :loading="isLoading"
              @click="handleForgotPassword"
            >
              重置密码
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 返回登录 -->
        <div class="auth-footer">
          <p><router-link to="/login" class="login-link">返回登录</router-link></p>
        </div>
      </div>

      <div v-else class="reset-success">
        <el-result icon="success" title="密码重置成功" sub-title="您的默认密码已重置为:">
          <template #extra>
            <div class="default-password">{{ defaultPassword }}</div>
            <p class="password-hint">请使用此密码登录并及时修改</p>
            <el-button type="primary" @click="router.push('/login')"> 返回登录 </el-button>
          </template>
        </el-result>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Key } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { sendEmailCode, resetPassword } from '@/api/auth'

const router = useRouter()
const forgotFormRef = ref(null)
const isLoading = ref(false)
const captchaTimer = ref(0)
const timerInterval = ref(null)
const resetSuccess = ref(false)
const defaultPassword = ref('')

// 表单数据
const forgotForm = reactive({
  email: '',
  code: ''
})

// 检查邮箱是否有效
const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(forgotForm.email)
})

// 表单校验规则
const forgotRules = reactive({
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 6, message: '验证码长度在4-6个字符之间', trigger: 'blur' }
  ]
})

// 发送验证码
const sendCaptcha = async () => {
  if (!isEmailValid.value) {
    ElMessage.warning('请输入有效的邮箱地址')
    return
  }

  try {
    await sendEmailCode(forgotForm.email)
    ElMessage.success('验证码已发送，请查收邮件')

    // 开始倒计时
    captchaTimer.value = 60
    timerInterval.value = setInterval(() => {
      captchaTimer.value--
      if (captchaTimer.value <= 0) {
        clearInterval(timerInterval.value)
      }
    }, 1000)
  } catch (error) {
    // console.error('发送验证码失败:', error)
    ElMessage.error('发送验证码失败，请稍后重试')
  }
}

// 处理重置密码
const handleForgotPassword = () => {
  if (!forgotFormRef.value) return

  forgotFormRef.value.validate(async valid => {
    if (valid) {
      isLoading.value = true

      try {
        // 构造重置密码请求数据
        const resetData = {
          email: forgotForm.email,
          code: forgotForm.code
        }

        const result = await resetPassword(resetData)

        // 重置成功
        resetSuccess.value = true
        defaultPassword.value = result.password || '********'

        ElMessage.success('密码重置成功')
      } catch (error) {
        // console.error('重置密码失败:', error)
        ElMessage.error('重置密码失败，请检查验证码是否正确')
      } finally {
        isLoading.value = false
      }
    }
  })
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

.reset-success {
  text-align: center;

  .default-password {
    font-size: 18px;
    font-weight: bold;
    background-color: #f7f7f7;
    padding: 10px 20px;
    border-radius: 4px;
    display: inline-block;
    margin-bottom: 10px;
    letter-spacing: 1px;
    font-family: monospace;
  }

  .password-hint {
    color: #666;
    margin-bottom: 20px;
  }
}
</style>
