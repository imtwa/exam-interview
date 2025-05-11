<template>
  <div class="auth-container">
    <div class="auth-form-container">
      <div class="auth-form-header">
        <h2>登录</h2>
        <p>欢迎回来，请登录您的账号</p>
      </div>

      <div class="auth-form">
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-position="top">
          <!-- 邮箱 -->
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="loginForm.email" placeholder="请输入邮箱" :prefix-icon="Message" />
          </el-form-item>

          <!-- 密码 -->
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <!-- 验证码 -->
          <el-form-item label="验证码" prop="captcha">
            <div class="captcha-container">
              <el-input v-model="loginForm.captcha" placeholder="请输入验证码" :prefix-icon="Key" />
              <div class="captcha-img" @click="refreshCaptcha">
                <img v-if="captchaImg" :src="captchaImg" alt="验证码" />
                <div v-else class="loading-captcha">加载中...</div>
              </div>
            </div>
          </el-form-item>

          <!-- 记住我 -->
          <el-form-item>
            <div class="remember-forgot">
              <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
              <el-button type="text" @click="goToForgotPassword">忘记密码？</el-button>
            </div>
          </el-form-item>

          <!-- 登录按钮 -->
          <el-form-item>
            <el-button type="primary" class="submit-btn" :loading="isLoading" @click="handleLogin">
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 注册链接 -->
        <div class="auth-footer">
          <p>
            还没有账号？ <router-link to="/register" class="register-link">立即注册</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Lock, Key } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getCaptcha, login } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)
const isLoading = ref(false)
const captchaImg = ref('')
const captchaId = ref('')

// 表单数据
const loginForm = reactive({
  email: '',
  password: '',
  captcha: '',
  captchaId: '',
  remember: false
})

// 表单校验规则
const loginRules = reactive({
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 6, message: '验证码长度在4-6个字符之间', trigger: 'blur' }
  ]
})

// 刷新验证码
const refreshCaptcha = async () => {
  try {
    const res = await getCaptcha()

    captchaId.value = res.id
    // 安全处理SVG字符串，避免特殊字符导致错误
    if (res.img) {
      try {
        captchaImg.value = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(res.img)))}`
      } catch (e) {
        // console.error('验证码编码失败:', e)
        // 降级方案，直接使用URI编码
        captchaImg.value = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(res.img)}`
      }
    } else {
      captchaImg.value = ''
    }

    loginForm.captchaId = captchaId.value
  } catch (error) {
    // console.error('获取验证码失败:', error)
    ElMessage.error('获取验证码失败，请稍后重试')
  }
}

// 登录处理
const handleLogin = () => {
  if (!loginFormRef.value) return

  loginFormRef.value.validate(async valid => {
    if (valid) {
      isLoading.value = true

      try {
        // 直接使用登录表单数据，包含验证码信息
        const loginData = {
          email: loginForm.email,
          password: loginForm.password,
          captchaId: loginForm.captchaId,
          captcha: loginForm.captcha
        }

        // 使用Pinia store进行登录
        await userStore.userLogin(loginData)

        // 登录成功处理
        ElMessage.success('登录成功')

        // 如果勾选了记住我，可以存储登录状态
        if (loginForm.remember) {
          localStorage.setItem('rememberEmail', loginForm.email)
        } else {
          localStorage.removeItem('rememberEmail')
        }

        // 登录成功后，获取用户详细信息
        await userStore.getInfo()

        // 检查用户个人信息完善状态
        try {
          let profileResult

          // 根据角色调用不同的资料获取方法
          if (userStore.isInterviewer) {
            // 直接获取面试官详细资料
            profileResult = await userStore.fetchInterviewerProfile()
          } else {
            // 使用通用的资料检查方法
            profileResult = await userStore.checkUserProfile()
          }

          // 根据资料完善状态决定跳转
          if (!profileResult || !profileResult.profileCompleted) {
            ElMessage.info('请先完善您的个人资料')
            if (userStore.isInterviewer) {
              router.push('/interviewer/profile-setup')
            } else if (userStore.isJobSeeker) {
              router.push('/job-seeker/profile-setup')
            }
          } else {
            // 已完善资料，跳转到首页
            router.push('/')
          }
        } catch (error) {
          // console.error('检查个人资料失败:', error)
          // 检查失败也让用户继续使用，跳转到首页
          router.push('/')
        }
      } catch (error) {
        // console.error('登录失败:', error)
        // 登录失败时刷新验证码
        refreshCaptcha()
      } finally {
        isLoading.value = false
      }
    }
  })
}

// 跳转到忘记密码页面
const goToForgotPassword = () => {
  router.push('/forgot-password')
}

onMounted(() => {
  // 如果之前勾选了记住我，自动填充邮箱
  const rememberedEmail = localStorage.getItem('rememberEmail')
  if (rememberedEmail) {
    loginForm.email = rememberedEmail
    loginForm.remember = true
  }

  // 初始化验证码
  refreshCaptcha()
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
}

.captcha-container {
  display: flex;
  gap: 10px;

  .captcha-img {
    height: 45px;
    min-width: 120px;
    cursor: pointer;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      box-shadow: 0 3px 8px rgba(3, 82, 201, 0.2);
    }

    img {
      height: 100%;
      width: 100%;
      object-fit: cover;
    }

    .loading-captcha {
      font-size: 12px;
      color: #999;
    }
  }
}

.remember-forgot {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  :deep(.el-checkbox__label) {
    color: #666;
  }

  :deep(.el-button) {
    padding: 0;
    height: auto;
    font-size: 14px;
    color: #0352c9;

    &:hover {
      color: #0060ff;
    }
  }
}

.submit-btn {
  width: 100%;
  height: 45px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 10px;
}

.auth-footer {
  text-align: center;
  margin-top: 25px;
  color: #666;

  .register-link {
    color: #0352c9;
    font-weight: 500;
    text-decoration: none;

    &:hover {
      color: #0060ff;
      text-decoration: underline;
    }
  }
}
</style>
