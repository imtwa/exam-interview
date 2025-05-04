<template>
  <div class="online-exam-container">
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <h2>在线笔试系统</h2>
        </div>
      </template>

      <div class="card-content">
        <p class="welcome-text">欢迎使用在线笔试系统，您可以通过以下方式开始考试：</p>

        <div class="options-container">
          <el-card class="option-card" shadow="hover" @click="goToInvitationPage">
            <template #header>
              <div class="option-header">
                <el-icon><Ticket /></el-icon>
                <span>输入邀请码</span>
              </div>
            </template>
            <div class="option-content">
              <p>如果您已收到考试邀请码，请点击此处输入邀请码开始考试。</p>
              <el-button type="primary" @click.stop="goToInvitationPage">开始考试</el-button>
            </div>
          </el-card>

          <el-card class="option-card" shadow="hover" @click="goToUserExams">
            <template #header>
              <div class="option-header">
                <el-icon><List /></el-icon>
                <span>我的笔试</span>
              </div>
            </template>
            <div class="option-content">
              <p>查看您的所有笔试记录，包括未完成的和已完成的笔试。</p>
              <el-button type="success" @click.stop="goToUserExams">查看笔试列表</el-button>
            </div>
          </el-card>

          <el-card class="option-card" shadow="hover" @click="goToExamList">
            <template #header>
              <div class="option-header">
                <el-icon><Collection /></el-icon>
                <span>查看试卷列表</span>
              </div>
            </template>
            <div class="option-content">
              <p>查看所有可用的公开试卷，进行练习和自我评估。</p>
              <el-button type="success" @click.stop="goToExamList">浏览试卷</el-button>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>

    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <h3>考试须知</h3>
        </div>
      </template>

      <div class="info-content">
        <ol>
          <li>请确保您的网络连接稳定，避免考试中断。</li>
          <li>考试过程中请勿刷新页面或关闭浏览器，否则可能导致答案丢失。</li>
          <li>系统会自动保存您的答案，但建议您及时提交。</li>
          <li>时间到期后系统将自动提交您的答案。</li>
          <li>考试完成后，您将立即获得分数和评估。</li>
        </ol>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Ticket, Collection, List } from '@element-plus/icons-vue'

const router = useRouter()

// 跳转到邀请码页面
const goToInvitationPage = () => {
  router.push('/online-exam/invitation')
}

// 跳转到试卷列表
const goToExamList = () => {
  router.push('/question-bank')
}

// 跳转到用户笔试列表
const goToUserExams = () => {
  router.push('/online-exam/user-exams')
}
</script>

<style scoped>
.online-exam-container {
  max-width: 1000px;
  margin: 30px auto;
  padding: 0 20px;
}

.welcome-card {
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

.card-header h3 {
  margin: 0;
  color: #67c23a;
}

.welcome-text {
  font-size: 16px;
  margin-bottom: 20px;
  color: #606266;
}

.options-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .options-container {
    grid-template-columns: 1fr;
  }
}

.option-card {
  cursor: pointer;
  transition: transform 0.3s;
  height: 100%;
}

.option-card:hover {
  transform: translateY(-5px);
}

.option-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  font-size: 16px;
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 10px 0;
}

.option-content p {
  color: #606266;
  margin: 0;
}

.info-card {
  margin-top: 30px;
}

.info-content ol {
  padding-left: 20px;
}

.info-content li {
  margin-bottom: 10px;
  color: #606266;
}
</style>
