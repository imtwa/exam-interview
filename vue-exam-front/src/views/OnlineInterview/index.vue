<template>
  <div class="online-interview-page">
    <div class="online-interview-container">
      <el-card class="welcome-card">
        <template #header>
          <div class="card-header">
            <h2>在线面试系统</h2>
          </div>
        </template>

        <div class="card-content">
          <p class="welcome-text">欢迎使用在线面试系统，您可以通过以下方式开始面试：</p>

          <div class="options-container">
            <div class="option-item" @click="goToInvitationPage">
              <div class="option-icon">
                <el-icon><Ticket /></el-icon>
              </div>
              <div class="option-title">输入邀请码</div>
              <div class="option-desc">如果您已收到面试邀请码，请点击此处输入邀请码进入面试室。</div>
              <el-button type="primary" class="option-button" @click.stop="goToInvitationPage">进入面试室</el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Ticket } from '@element-plus/icons-vue'

const router = useRouter()

// 跳转到邀请码页面
const goToInvitationPage = () => {
  router.push('/online-interview/invitation')
}
</script>

<style scoped>
.online-interview-page {
  width: 100%;
  min-height: calc(100vh - 72px);
  background-color: #f5f9ff;
}

.online-interview-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

:deep(.el-card) {
  border-radius: 8px;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  overflow: hidden;

  &:hover {
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  }

  .el-card__header {
    padding: 18px 20px;
    border-bottom: 1px solid #f0f0f0;
    background-color: #ffffff;
  }

  .el-card__body {
    padding: 20px;
  }
}

.welcome-card {
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 40px;
  transition: all 0.3s;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
  color: #303133;
}

.welcome-text {
  font-size: 16px;
  color: #606266;
  margin-bottom: 30px;
  text-align: center;
}

.options-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 30px;
  margin-bottom: 20px;
}

.option-item {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #eaeaea;
  transition: all 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.option-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  border-color: #d4e3ff;
}

.option-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 16px;
}

.option-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.option-desc {
  font-size: 14px;
  color: #606266;
  margin-bottom: 24px;
  line-height: 1.5;
}

.option-button {
  width: 60%;
}

@media (max-width: 768px) {
  .online-interview-container {
    padding: 0 15px;
  }

  .option-item {
    padding: 20px;
  }

  .option-button {
    width: 100%;
  }
}
</style> 