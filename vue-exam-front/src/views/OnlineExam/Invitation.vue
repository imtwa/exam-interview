<template>
  <div class="invitation-container">
    <el-card class="invitation-card">
      <template #header>
        <div class="card-header">
          <h2>输入考试邀请码</h2>
        </div>
      </template>

      <div class="card-content">
        <p class="guide-text">请输入您收到的考试邀请码以开始考试。</p>

        <div class="invitation-form">
          <el-form ref="formRef" :model="formData" :rules="rules">
            <el-form-item prop="invitationCode">
              <div class="code-input-container">
                <el-input
                  v-model="formData.invitationCode"
                  placeholder="请输入邀请码"
                  maxlength="20"
                  :prefix-icon="Ticket"
                  @keyup.enter="handleSubmit"
                />
              </div>
            </el-form-item>

            <el-form-item>
              <div class="actions">
                <el-button @click="goBack">返回</el-button>
                <el-button type="primary" @click="handleSubmit" :loading="loading">
                  确认邀请码
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <div class="info-section">
          <h4>
            <el-icon><InfoFilled /></el-icon> 如何获取邀请码？
          </h4>
          <p>
            考试邀请码通常由招聘方或教育机构通过邮件发送给您。如果您尚未收到邀请码，请联系相关负责人。
          </p>
        </div>
      </div>
    </el-card>
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
      // TODO: 替换为实际API调用
      // const response = await verifyInvitationCode(formData.invitationCode)
      // if (response && response.data) {
      //   router.push(`/online-exam/session/${response.data.examId}`)
      // }

      // 模拟API调用
      setTimeout(() => {
        // 假设验证成功
        const mockExamId = 'exam123'
        ElMessage.success('邀请码验证成功，正在进入考试...')
        router.push(`/online-exam/session/${mockExamId}`)

        loading.value = false
      }, 1500)
    } catch (error) {
      ElMessage.error(error.message || '邀请码验证失败，请检查后重试')
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
.invitation-container {
  max-width: 600px;
  margin: 50px auto;
  padding: 0 20px;
}

.invitation-card {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
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
  padding: 15px;
  margin-top: 20px;
}

.info-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 0;
  margin-bottom: 10px;
  color: #67c23a;
}

.info-section p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}
</style>
