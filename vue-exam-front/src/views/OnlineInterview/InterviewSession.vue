<template>
  <div class="interview-session-page">
    <el-container class="session-container">
      <!-- 头部信息 -->
      <el-header class="session-header">
        <div class="header-left">
          <h1 class="interview-title">{{ interviewData.title || '在线面试' }}</h1>
          <div class="interview-info">
            <span class="info-item">
              <el-icon><Clock /></el-icon>
              {{ interviewData.duration || '--' }} 分钟
            </span>
            <span class="info-item">
              <el-icon><User /></el-icon>
              {{ interviewData.interviewer?.name || '面试官' }}
            </span>
            <span class="info-item">
              <el-icon><OfficeBuilding /></el-icon>
              {{ interviewData.company?.name || '公司' }}
            </span>
          </div>
        </div>
        <div class="header-right">
          <el-button type="danger" @click="exitInterview">退出面试</el-button>
        </div>
      </el-header>

      <!-- 主要内容区域 -->
      <el-main class="session-main">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="10" animated />
        </div>
        <el-row :gutter="20" v-else>
          <!-- 视频区域 -->
          <el-col :span="18">
            <div class="video-container">
              <div class="main-video">
                <div v-if="!isVideoStarted" class="video-placeholder">
                  <el-icon><VideoCamera /></el-icon>
                  <p>等待开启视频...</p>
                  <el-button type="primary" @click="startVideo">开始视频面试</el-button>
                </div>
                <div v-else class="video-stream" ref="remoteVideoContainer">
                  <!-- 面试官视频将在此显示 -->
                  <video ref="remoteVideo" autoplay playsinline></video>
                </div>
              </div>
              <div class="video-controls">
                <el-button-group>
                  <el-button
                    :type="isMicrophoneOn ? 'primary' : 'danger'"
                    circle
                    @click="toggleMicrophone"
                  >
                    <el-icon v-if="isMicrophoneOn"><Microphone /></el-icon>
                    <el-icon v-else><MicrophoneOff /></el-icon>
                  </el-button>
                  <el-button :type="isCameraOn ? 'primary' : 'danger'" circle @click="toggleCamera">
                    <el-icon v-if="isCameraOn"><VideoCamera /></el-icon>
                    <el-icon v-else><VideoCameraOff /></el-icon>
                  </el-button>
                  <el-button
                    :type="isScreenSharing ? 'danger' : 'primary'"
                    circle
                    @click="toggleScreenSharing"
                  >
                    <el-icon v-if="isScreenSharing"><Share /></el-icon>
                    <el-icon v-else><Share /></el-icon>
                  </el-button>
                </el-button-group>
              </div>
              <div class="self-video-container">
                <div class="self-video" ref="localVideoContainer">
                  <!-- 自己的视频将在此显示 -->
                  <video ref="localVideo" autoplay playsinline muted></video>
                </div>
              </div>
            </div>
          </el-col>

          <!-- 面试信息和备注 -->
          <el-col :span="6">
            <div class="info-sidebar">
              <el-card class="info-card">
                <template #header>
                  <div class="card-header">
                    <span>面试详情</span>
                  </div>
                </template>
                <div class="info-content">
                  <div class="info-item">
                    <span class="label">职位：</span>
                    <span class="value">{{ interviewData.job?.title || '暂无信息' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">部门：</span>
                    <span class="value">{{ interviewData.job?.department || '暂无信息' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">面试轮次：</span>
                    <span class="value">{{ getInterviewRoundText(interviewData.round) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">面试时间：</span>
                    <span class="value">{{ formatDateTime(interviewData.scheduleTime) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">面试时长：</span>
                    <span class="value">{{ interviewData.duration }} 分钟</span>
                  </div>
                </div>
              </el-card>
              <el-card class="notes-card">
                <template #header>
                  <div class="card-header">
                    <span>面试备注</span>
                  </div>
                </template>
                <div class="notes-content">
                  <p v-if="interviewData.notes">{{ interviewData.notes }}</p>
                  <p v-else class="empty-notes">暂无面试备注信息</p>
                </div>
              </el-card>
              <el-card class="chat-card">
                <template #header>
                  <div class="card-header">
                    <span>聊天</span>
                  </div>
                </template>
                <div class="chat-container">
                  <div class="chat-messages" ref="chatMessages">
                    <div
                      v-for="(message, index) in chatMessages"
                      :key="index"
                      :class="['message', message.isSelf ? 'self-message' : 'other-message']"
                    >
                      <div class="message-sender">{{ message.sender }}</div>
                      <div class="message-content">{{ message.content }}</div>
                      <div class="message-time">{{ formatTime(message.time) }}</div>
                    </div>
                  </div>
                  <div class="chat-input">
                    <el-input
                      v-model="chatInput"
                      placeholder="输入消息..."
                      @keyup.enter="sendMessage"
                    />
                    <el-button type="primary" @click="sendMessage">发送</el-button>
                  </div>
                </div>
              </el-card>
            </div>
          </el-col>
        </el-row>
      </el-main>
    </el-container>

    <!-- 退出确认弹窗 -->
    <el-dialog v-model="exitDialogVisible" title="确认退出面试" width="30%">
      <span>面试尚未结束，确定要退出吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="exitDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmExit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Clock,
  User,
  OfficeBuilding,
  VideoCamera,
  Microphone,
  MicrophoneOff,
  VideoCameraOff,
  Share,
  MoreFilled
} from '@element-plus/icons-vue'
import { startInterview, completeInterview } from '@/api/interview'

const route = useRoute()
const router = useRouter()
const invitationCode = route.params.id

// 状态变量
const loading = ref(true)
const interviewData = ref({})
const isVideoStarted = ref(false)
const isMicrophoneOn = ref(true)
const isCameraOn = ref(true)
const isScreenSharing = ref(false)
const exitDialogVisible = ref(false)
const localVideoContainer = ref(null)
const remoteVideoContainer = ref(null)
const localVideo = ref(null)
const remoteVideo = ref(null)
const localStream = ref(null)
const remoteStream = ref(null)
const peerConnection = ref(null)
const chatMessages = ref([])
const chatInput = ref('')

// 创建示例消息
onMounted(() => {
  chatMessages.value = [
    {
      sender: '系统',
      content: '欢迎参加在线面试，请保持良好的网络环境',
      time: new Date(),
      isSelf: false
    }
  ]
})

// 获取面试数据
const fetchInterviewData = async () => {
  loading.value = true
  try {
    // 调用API获取面试数据
    const response = await startInterview(invitationCode)
    console.log('获取到的面试数据:', response)

    if (response) {
      interviewData.value = response
    } else {
      throw new Error('无法获取面试数据')
    }
  } catch (error) {
    console.error('获取面试数据失败:', error)
    ElMessage.error('获取面试数据失败: ' + (error.message || '请稍后重试'))
  } finally {
    loading.value = false
  }
}

// 开始视频面试
const startVideo = async () => {
  try {
    // 获取本地媒体流
    localStream.value = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })

    // 显示本地视频
    if (localVideo.value) {
      localVideo.value.srcObject = localStream.value
    }

    isVideoStarted.value = true
    isMicrophoneOn.value = true
    isCameraOn.value = true

    // 发送系统消息
    chatMessages.value.push({
      sender: '系统',
      content: '您已加入视频面试',
      time: new Date(),
      isSelf: false
    })

    // 这里应该有WebRTC连接逻辑
    // setupPeerConnection()

    ElMessage.success('视频面试已开始')
  } catch (error) {
    console.error('启动视频失败:', error)
    ElMessage.error('无法访问摄像头或麦克风，请确保设备连接正常并授予权限')
  }
}

// 切换麦克风状态
const toggleMicrophone = () => {
  if (localStream.value) {
    localStream.value.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled
    })
    isMicrophoneOn.value = !isMicrophoneOn.value

    // 发送系统消息
    chatMessages.value.push({
      sender: '系统',
      content: isMicrophoneOn.value ? '您已开启麦克风' : '您已关闭麦克风',
      time: new Date(),
      isSelf: false
    })
  }
}

// 切换摄像头状态
const toggleCamera = () => {
  if (localStream.value) {
    localStream.value.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled
    })
    isCameraOn.value = !isCameraOn.value

    // 发送系统消息
    chatMessages.value.push({
      sender: '系统',
      content: isCameraOn.value ? '您已开启摄像头' : '您已关闭摄像头',
      time: new Date(),
      isSelf: false
    })
  }
}

// 切换屏幕共享
const toggleScreenSharing = async () => {
  if (isScreenSharing.value) {
    // 停止屏幕共享，恢复摄像头
    if (localStream.value) {
      localStream.value.getTracks().forEach(track => track.stop())
    }

    try {
      localStream.value = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      if (localVideo.value) {
        localVideo.value.srcObject = localStream.value
      }

      isScreenSharing.value = false

      // 发送系统消息
      chatMessages.value.push({
        sender: '系统',
        content: '您已停止屏幕共享',
        time: new Date(),
        isSelf: false
      })
    } catch (error) {
      console.error('恢复摄像头失败:', error)
      ElMessage.error('恢复摄像头失败')
    }
  } else {
    // 开始屏幕共享
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      })

      // 保留原始音频轨道
      if (localStream.value) {
        const audioTrack = localStream.value.getAudioTracks()[0]
        if (audioTrack) {
          screenStream.addTrack(audioTrack)
        }

        // 停止原视频轨道
        localStream.value.getVideoTracks().forEach(track => track.stop())
      }

      localStream.value = screenStream

      if (localVideo.value) {
        localVideo.value.srcObject = localStream.value
      }

      isScreenSharing.value = true

      // 监听共享结束事件
      screenStream.getVideoTracks()[0].onended = () => {
        toggleScreenSharing()
      }

      // 发送系统消息
      chatMessages.value.push({
        sender: '系统',
        content: '您已开始屏幕共享',
        time: new Date(),
        isSelf: false
      })
    } catch (error) {
      console.error('屏幕共享失败:', error)
      ElMessage.error('屏幕共享失败')
    }
  }
}

// 发送聊天消息
const sendMessage = () => {
  if (!chatInput.value.trim()) return

  chatMessages.value.push({
    sender: '我',
    content: chatInput.value,
    time: new Date(),
    isSelf: true
  })

  // 清空输入框
  chatInput.value = ''

  // 滚动到底部
  nextTick(() => {
    if (document.querySelector('.chat-messages')) {
      document.querySelector('.chat-messages').scrollTop =
        document.querySelector('.chat-messages').scrollHeight
    }
  })
}

// 退出面试
const exitInterview = () => {
  exitDialogVisible.value = true
}

// 确认退出
const confirmExit = async () => {
  try {
    // 停止所有媒体流
    if (localStream.value) {
      localStream.value.getTracks().forEach(track => track.stop())
    }

    if (remoteStream.value) {
      remoteStream.value.getTracks().forEach(track => track.stop())
    }

    // 关闭对等连接
    if (peerConnection.value) {
      peerConnection.value.close()
    }

    // 调用API完成面试
    await completeInterview(invitationCode)

    ElMessage.success('已成功退出面试')
    router.push('/online-interview')
  } catch (error) {
    console.error('退出面试失败:', error)
    // 即使API调用失败也允许用户退出
    router.push('/online-interview')
  }
}

// 辅助函数 - 格式化日期时间
const formatDateTime = dateTime => {
  if (!dateTime) return '--'
  try {
    const date = new Date(dateTime)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  } catch (error) {
    return '--'
  }
}

// 辅助函数 - 格式化时间
const formatTime = time => {
  if (!time) return '--'
  try {
    const date = new Date(time)
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  } catch (error) {
    return '--'
  }
}

// 辅助函数 - 获取面试轮次文本
const getInterviewRoundText = round => {
  const roundMap = {
    FIRST_INTERVIEW: '一面',
    SECOND_INTERVIEW: '二面',
    HR_INTERVIEW: 'HR面试'
  }
  return roundMap[round] || round || '未知'
}

// 组件挂载
onMounted(() => {
  // 获取面试数据
  fetchInterviewData()

  // 页面离开警告
  window.addEventListener('beforeunload', handleBeforeUnload)
})

// 组件卸载
onBeforeUnmount(() => {
  // 停止所有媒体流
  if (localStream.value) {
    localStream.value.getTracks().forEach(track => track.stop())
  }

  if (remoteStream.value) {
    remoteStream.value.getTracks().forEach(track => track.stop())
  }

  // 关闭对等连接
  if (peerConnection.value) {
    peerConnection.value.close()
  }

  // 移除事件监听器
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

// 处理页面刷新或关闭
const handleBeforeUnload = e => {
  e.preventDefault()
  e.returnValue = ''
}
</script>

<style scoped>
.interview-session-page {
  background-color: #f5f8fb;
  min-height: 100vh;
}

.session-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.session-header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: auto;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.interview-title {
  font-size: 20px;
  margin: 0 0 8px 0;
  color: #303133;
}

.interview-info {
  display: flex;
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  color: #606266;
  font-size: 14px;
}

.info-item i {
  margin-right: 5px;
}

.session-main {
  padding: 20px;
  overflow: auto;
  flex: 1;
}

.video-container {
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  height: calc(100vh - 180px);
  min-height: 400px;
}

.main-video {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
}

.video-placeholder .el-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.video-placeholder p {
  margin: 10px 0 20px;
}

.video-stream {
  width: 100%;
  height: 100%;
}

.video-stream video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 15px;
}

.self-video-container {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 160px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid #fff;
  z-index: 5;
}

.self-video {
  width: 100%;
  height: 100%;
}

.self-video video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-sidebar {
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
}

.info-card,
.notes-card,
.chat-card {
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.info-content {
  padding: 10px 0;
}

.info-item {
  margin-bottom: 10px;
  display: flex;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  width: 80px;
  color: #909399;
}

.info-item .value {
  flex: 1;
  color: #303133;
}

.notes-content {
  max-height: 120px;
  overflow-y: auto;
}

.empty-notes {
  color: #909399;
  font-style: italic;
}

.chat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  max-height: 200px;
}

.message {
  margin-bottom: 12px;
  max-width: 80%;
}

.self-message {
  margin-left: auto;
  background-color: #ecf5ff;
  border-radius: 12px 2px 12px 12px;
  padding: 8px 12px;
}

.other-message {
  margin-right: auto;
  background-color: #f5f7fa;
  border-radius: 2px 12px 12px 12px;
  padding: 8px 12px;
}

.message-sender {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.message-content {
  font-size: 14px;
  color: #303133;
  word-break: break-all;
}

.message-time {
  font-size: 11px;
  color: #c0c4cc;
  text-align: right;
  margin-top: 4px;
}

.chat-input {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

.loading-container {
  padding: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .session-main {
    padding: 10px;
  }

  .self-video-container {
    width: 100px;
    height: 75px;
    bottom: 70px;
  }

  .video-controls {
    bottom: 10px;
  }
}
</style>
