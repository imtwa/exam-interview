<template>
  <div class="invitation-page">
    <div class="invitation-container">
      <el-card class="invitation-card">
        <template #header>
          <div class="card-header">
            <h2>输入面试邀请码</h2>
          </div>
        </template>

        <div class="card-content">
          <div class="icon-container">
            <div class="large-icon">
              <el-icon><VideoCamera /></el-icon>
            </div>
          </div>

          <p class="guide-text">如果您已收到面试邀请码，请在此处输入以参加在线面试。</p>

          <div class="invitation-form">
            <el-form ref="formRef" :model="formData" :rules="rules">
              <el-form-item prop="invitationCode">
                <div class="code-input-container">
                  <el-input
                    v-model="formData.invitationCode"
                    placeholder="请输入邀请码"
                    maxlength="60"
                    :prefix-icon="Ticket"
                    size="large"
                    @keyup.enter="handleSubmit"
                  />
                </div>
              </el-form-item>

              <el-form-item>
                <div class="actions">
                  <el-button @click="goBack" size="large">返回</el-button>
                  <el-button type="primary" @click="handleSubmit" :loading="loading" size="large">
                    进入面试室
                  </el-button>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="info-section">
            <h4>
              <el-icon><InfoFilled /></el-icon> 请注意
            </h4>
            <ul class="notice-list">
              <li>面试邀请码由HR或招聘方通过邮件发送给您。</li>
              <li>邀请码是唯一的，请勿泄露给他人。</li>
              <li>请确保在面试时间前提前5-10分钟进入面试室。</li>
              <li>请检查您的设备摄像头和麦克风是否正常工作。</li>
              <li>如果您尚未收到邀请码，请联系相关招聘负责人。</li>
            </ul>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Ticket, InfoFilled, VideoCamera } from '@element-plus/icons-vue'
import { verifyInterviewInvitationCode } from '@/api/interview'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

const formData = reactive({
  invitationCode: ''
})

const rules = {
  invitationCode: [
    { required: true, message: '请输入邀请码', trigger: 'blur' },
    { min: 6, message: '邀请码长度不能少于6个字符', trigger: 'blur' }
  ]
}

// 确认邀请码
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async valid => {
    if (!valid) return

    loading.value = true
    try {
      const response = await verifyInterviewInvitationCode({
        invitationCode: formData.invitationCode
      })
      if (response) {
        // 获取面试信息
        const canStart = response.canStart

        if (!canStart) {
          const scheduleTime = response.scheduleTime
          ElMessage.warning(`该面试尚未开始或已结束，面试时间为：${scheduleTime}`)
          loading.value = false
          return
        }

        ElMessage.success('邀请码验证成功，正在进入面试室...')
        router.push(`/online-interview/session/${formData.invitationCode}`)
      } else {
        ElMessage.warning('验证成功但未返回面试信息，请联系招聘方')
      }
    } catch (error) {
      ElMessage.error('邀请码验证失败，请检查后重试')
    } finally {
      loading.value = false
    }
  })
}

// 返回首页
const goBack = () => {
  router.push('/online-interview')
}
</script>

<style scoped>
.invitation-page {
  width: 100%;
  background-color: #f5f9ff;
  min-height: calc(100vh - 72px);
  padding: 40px 0;
}

.invitation-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.invitation-card {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: #303133;
  font-size: 1.5rem;
}

.icon-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.large-icon {
  font-size: 64px;
  color: #409eff;
}

.guide-text {
  text-align: center;
  color: #606266;
  margin-bottom: 20px;
  font-size: 16px;
}

.invitation-form {
  max-width: 400px;
  margin: 0 auto 30px;
}

.code-input-container {
  margin-bottom: 4px;
  width: 100%;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
}

.info-section {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px 20px;
  margin-top: 4px;
}

.info-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409eff;
  margin-top: 0;
}

.notice-list {
  margin: 10px 0 0;
  padding-left: 20px;
  color: #606266;
}

.notice-list li {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.5;
}

.notice-list li:last-child {
  margin-bottom: 0;
}
</style>
