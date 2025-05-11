<template>
  <div class="invitation-page">
    <div class="invitation-container">
      <el-card class="invitation-card">
        <template #header>
          <div class="card-header">
            <h2>输入考试邀请码</h2>
          </div>
        </template>

        <div class="card-content">
          <div class="icon-container">
            <div class="large-icon">
              <el-icon><Ticket /></el-icon>
            </div>
          </div>

          <p class="guide-text">如果您已收到考试邀请码，请在此处输入以开始考试。</p>

          <div class="invitation-form">
            <el-form ref="formRef" :model="formData" :rules="rules">
              <el-form-item prop="invitationCode">
                <div class="code-input-container">
                  <el-input
                    v-model="formData.invitationCode"
                    placeholder="请输入邀请码"
                    maxlength="20"
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
                    开始考试
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
              <li>考试邀请码通常由招聘方或教育机构通过邮件发送给您。</li>
              <li>邀请码是唯一的，请勿泄露给他人。</li>
              <li>请确保在考试有效期内完成考试，过期将无法进入。</li>
              <li>考试开始后，计时将立即开始，中途退出不会暂停计时。</li>
              <li>如果您尚未收到邀请码，请联系相关负责人。</li>
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
import { Ticket, InfoFilled } from '@element-plus/icons-vue'
import { verifyInvitationCode } from '@/api/exam'

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
      // console.log('提交邀请码:', formData.invitationCode)
      const response = await verifyInvitationCode({
        invitationCode: formData.invitationCode
      })

      // console.log('验证结果:', response)
      if (response) {
        // 获取考试信息
        const examId = response.examId
        const canStart = response.canStart

        if (!canStart) {
          ElMessage.warning(
            `该考试还未开始或已结束，考试有效期为：${new Date(response.examStartTime).toLocaleString()} 至 ${new Date(response.examEndTime).toLocaleString()}`
          )
          loading.value = false
          return
        }

        ElMessage.success('邀请码验证成功，正在进入考试...')
        router.push(`/online-exam/session/${formData.invitationCode}`)
      } else {
        ElMessage.warning('验证成功但未返回考试信息，请联系管理员')
      }
    } catch (error) {
      console.error('邀请码验证失败:', error)
      let errorMsg = '邀请码验证失败，请检查后重试'

      if (error.response && error.response.data && error.response.data.message) {
        errorMsg = error.response.data.message
      } else if (error.message) {
        errorMsg = error.message
      }

      ElMessage.error(errorMsg)
    } finally {
      loading.value = false
    }
  })
}

// 返回首页
const goBack = () => {
  router.push('/online-exam')
}
</script>

<style scoped>
.invitation-page {
  width: 100%;
  background-color: #f5f9ff;
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
  color: #409eff;
  font-weight: 600;
}

.icon-container {
  display: flex;
  justify-content: center;
  margin: 20px 0 30px;
}

.large-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #ecf5ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.large-icon .el-icon {
  font-size: 40px;
  color: #409eff;
}

.guide-text {
  font-size: 16px;
  margin-bottom: 30px;
  color: #606266;
  text-align: center;
}

.invitation-form {
  max-width: 400px;
  margin: 0 auto 30px;
}

.code-input-container {
  margin-bottom: 20px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
}

.info-section {
  background-color: #f0f9eb;
  border-radius: 4px;
  padding: 20px;
  margin-top: 20px;
}

.info-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 0;
  margin-bottom: 15px;
  color: #67c23a;
  font-weight: 600;
}

.notice-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.notice-list li {
  position: relative;
  padding-left: 20px;
  margin-bottom: 10px;
  color: #606266;
  line-height: 1.6;
}

.notice-list li:last-child {
  margin-bottom: 0;
}

.notice-list li:before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #67c23a;
}
</style>
