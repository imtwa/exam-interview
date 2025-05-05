<template>
  <div class="online-exam-page">
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
            <div class="option-item" @click="goToInvitationPage">
              <div class="option-icon">
                <el-icon><Ticket /></el-icon>
              </div>
              <div class="option-title">输入邀请码</div>
              <div class="option-desc">如果您已收到考试邀请码，请点击此处输入邀请码开始考试。</div>
              <el-button type="primary" class="option-button" @click.stop="goToInvitationPage"
                >开始考试</el-button
              >
            </div>

            <div class="option-item" @click="goToUserExams">
              <div class="option-icon">
                <el-icon><List /></el-icon>
              </div>
              <div class="option-title">我的笔试</div>
              <div class="option-desc">查看您的所有笔试记录，包括未完成的和已完成的笔试。</div>
              <el-button type="success" class="option-button" @click.stop="goToUserExams"
                >查看笔试列表</el-button
              >
            </div>

            <div class="option-item" @click="goToExamList">
              <div class="option-icon">
                <el-icon><Collection /></el-icon>
              </div>
              <div class="option-title">查看试卷列表</div>
              <div class="option-desc">查看所有可用的公开试卷，进行练习和自我评估。</div>
              <el-button type="success" class="option-button" @click.stop="goToExamList"
                >浏览试卷</el-button
              >
            </div>
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
          <ul class="notice-list">
            <li>请确保您的网络连接稳定，避免考试中断。</li>
            <li>考试过程中请勿刷新页面或关闭浏览器，否则可能导致答案丢失。</li>
            <li>系统会自动保存您的答案，但建议您及时提交。</li>
            <li>时间到期后系统将自动提交您的答案。</li>
            <li>考试完成后，您将立即获得分数和评估。</li>
          </ul>
        </div>
      </el-card>
    </div>
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

<style lang="less" scoped>
.online-exam-page {
  width: 100%;
  background-color: #f5f9ff;
  min-height: calc(100vh - 60px);
  padding: 20px 0;
}

.online-exam-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.welcome-card,
.info-card {
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
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

.card-header h3 {
  margin: 0;
  color: #67c23a;
  font-weight: 600;
}

.welcome-text {
  font-size: 16px;
  margin-bottom: 30px;
  color: #606266;
}

.options-container {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: space-between;
}

@media (max-width: 768px) {
  .options-container {
    flex-direction: column;
  }
}

.option-item {
  flex: 1;
  min-width: 300px;
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.option-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.option-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #ecf5ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.option-icon .el-icon {
  font-size: 28px;
  color: #409eff;
}

.option-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px;
}

.option-desc {
  color: #606266;
  margin-bottom: 20px;
  flex-grow: 1;
}

.option-button {
  width: 100%;
}

.notice-list {
  list-style-type: none;
  padding: 0;
}

.notice-list li {
  position: relative;
  padding-left: 20px;
  margin-bottom: 15px;
  color: #606266;
  line-height: 1.6;
}

.notice-list li:before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #409eff;
}
</style>
