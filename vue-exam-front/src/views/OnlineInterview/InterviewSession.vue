<template>
  <div class="interview-session-page">
    <div class="interview-container">
      <!-- 面试信息条 -->
      <div class="interview-info-bar">
        <div class="info-left">
          <h1 class="interview-title">{{ interviewData.title || '在线面试' }}</h1>
          <div class="interview-details">
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
      </div>

      <!-- 主要内容区域 -->
      <div class="session-main">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="10" animated />
        </div>
        <div v-else class="interview-layout">
          <!-- 主视频区域 -->
          <div class="main-video-area">
            <div class="main-video-container">
              <div v-if="!isVideoStarted" class="video-placeholder">
                <el-icon><VideoCamera /></el-icon>
                <p>等待开启视频...</p>
                <el-button type="primary" @click="startVideo">开始视频面试</el-button>
              </div>
              <div v-else class="main-video-stream">
                <video 
                  ref="mainVideo" 
                  autoplay 
                  playsinline
                  :srcObject="selectedStream || remoteStream"
                ></video>
                <div class="main-video-overlay">
                  <div class="participant-name">{{ selectedParticipant?.name || '面试官' }}</div>
                </div>
              </div>
            </div>
            
            <!-- 底部控制栏 -->
            <div class="video-controls">
              <el-button-group>
                <el-button
                  :type="isMicrophoneOn ? 'primary' : 'danger'"
                  circle
                  @click="toggleMicrophone"
                >
                  <el-icon v-if="isMicrophoneOn"><Microphone /></el-icon>
                  <el-icon v-else><Mute /></el-icon>
                </el-button>
                <el-button :type="isCameraOn ? 'primary' : 'danger'" circle @click="toggleCamera">
                  <el-icon v-if="isCameraOn"><VideoCamera /></el-icon>
                  <el-icon v-else><VideoPlay /></el-icon>
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
              
              <el-button class="exit-button" type="danger" @click="exitInterview">退出面试</el-button>
            </div>
          </div>
          
          <!-- 右侧参与者列表 -->
          <div class="sidebar">
            <!-- 参与者视频列表 -->
            <div class="participants-list">
              <div class="sidebar-header">参与者</div>
              
              <!-- 本地视频预览 -->
              <div 
                class="participant-video-item"
                :class="{ 'selected': selectedParticipantId === 'local' }"
                @click="selectParticipant('local', localStream, '我')"
              >
                <video ref="localVideo" autoplay playsinline muted></video>
                <div class="participant-info">
                  <div class="participant-name">我</div>
                  <div class="participant-status" v-if="!isMicrophoneOn">
                    <el-icon><Mute /></el-icon>
                  </div>
                </div>
              </div>
              
              <!-- 模拟其他参与者 -->
              <div 
                v-for="(participant, index) in participants" 
                :key="participant.id"
                class="participant-video-item"
                :class="{ 'selected': selectedParticipantId === participant.id }"
                @click="selectParticipant(participant.id, participant.stream, participant.name)"
              >
                <video :ref="`participant-${index}`" autoplay playsinline></video>
                <div class="participant-info">
                  <div class="participant-name">{{ participant.name }}</div>
                  <div class="participant-status" v-if="participant.muted">
                    <el-icon><Mute /></el-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
  VideoCamera,
  Microphone,
  Mute,
  VideoPlay,
  Share,
  MoreFilled,
  Clock,
  User,
  OfficeBuilding
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
const localVideo = ref(null)
const mainVideo = ref(null)
const localStream = ref(null)
const remoteStream = ref(null)
const peerConnection = ref(null)

// 参与者管理
const participants = ref([])
const selectedParticipantId = ref('local') // 默认选中自己
const selectedParticipant = ref(null)
const selectedStream = ref(null)

// 选择要在主视频区域显示的参与者视频
const selectParticipant = (id, stream, name) => {
  selectedParticipantId.value = id
  selectedStream.value = stream
  selectedParticipant.value = { id, name }
}

// 创建模拟参与者
onMounted(() => {
  // 模拟其他参与者（后续可以通过WebRTC信令替换真实的参与者）
  participants.value = [
    {
      id: 'interviewer-1',
      name: 'Caroline',
      stream: null,
      muted: false
    },
    {
      id: 'interviewer-2',
      name: 'Jimmy',
      stream: null,
      muted: true
    },
    {
      id: 'interviewer-3',
      name: 'Lucy',
      stream: null,
      muted: false
    },
    {
      id: 'interviewer-4',
      name: 'Alfredo',
      stream: null,
      muted: true
    },
    {
      id: 'interviewer-5',
      name: 'Allon',
      stream: null,
      muted: false
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
    
    // 默认显示自己的视频在主视频区
    selectedStream.value = localStream.value
    selectedParticipant.value = { id: 'local', name: '我' }

    isVideoStarted.value = true
    isMicrophoneOn.value = true
    isCameraOn.value = true

    // 为模拟参与者创建虚拟视频（实际应通过WebRTC连接）
    createMockParticipantVideos()

    ElMessage.success('视频面试已开始')
  } catch (error) {
    console.error('启动视频失败:', error)
    ElMessage.error('无法访问摄像头或麦克风，请确保设备连接正常并授予权限')
  }
}

// 创建模拟参与者视频（实际项目中应当通过WebRTC连接接收真实视频流）
const createMockParticipantVideos = async () => {
  // 在实际应用中，这部分会被替换为WebRTC连接
  try {
    // 由于浏览器安全限制，我们无法动态创建多个真实的视频流
    // 这里我们假装从其他参与者接收到了视频流
    nextTick(() => {
      participants.value.forEach(async (participant, index) => {
        // 在真实场景中，这会是从远程接收到的流
        // 这里我们仅为布局演示，显示将使用模拟视频
        const video = document.querySelector(`#participant-${index}`)
        if (video) {
          // 设置一个占位图像
          video.poster = `https://via.placeholder.com/160x120/666666/FFFFFF?text=${participant.name}`
        }
      })
    })
  } catch (error) {
    console.error('创建模拟参与者视频失败:', error)
  }
}

// 切换麦克风状态
const toggleMicrophone = () => {
  if (localStream.value) {
    localStream.value.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled
    })
    isMicrophoneOn.value = !isMicrophoneOn.value
  }
}

// 切换摄像头状态
const toggleCamera = () => {
  if (localStream.value) {
    localStream.value.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled
    })
    isCameraOn.value = !isCameraOn.value
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
      
      // 如果主视频区正在显示本地视频，则更新主视频区
      if (selectedParticipantId.value === 'local') {
        selectedStream.value = localStream.value
      }

      isScreenSharing.value = false
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
      
      // 如果主视频区正在显示本地视频，则更新主视频区
      if (selectedParticipantId.value === 'local') {
        selectedStream.value = localStream.value
      }

      isScreenSharing.value = true

      // 监听共享结束事件
      screenStream.getVideoTracks()[0].onended = () => {
        toggleScreenSharing()
      }
    } catch (error) {
      console.error('屏幕共享失败:', error)
      ElMessage.error('屏幕共享失败')
    }
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
  background-color: #f5f9ff;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.interview-container {
  display: flex;
  flex-direction: column;
  max-width: 1600px;
  width: 100%;
  height: calc(100vh - 40px);
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 面试信息条 */
.interview-info-bar {
  background-color: #fff;
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

.info-left {
  display: flex;
  flex-direction: column;
}

.interview-title {
  font-size: 18px;
  margin: 0 0 6px 0;
  color: #303133;
}

.interview-details {
  display: flex;
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  color: #606266;
  font-size: 13px;
}

.info-item .el-icon {
  margin-right: 5px;
  color: #409EFF;
}

.session-main {
  padding: 0;
  overflow: hidden;
  flex: 1;
  position: relative;
}

.loading-container {
  padding: 20px;
  background-color: #fff;
}

/* 新的布局样式 */
.interview-layout {
  display: flex;
  height: 100%;
  width: 100%;
}

/* 主视频区域 */
.main-video-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: #000;
  border-radius: 4px;
  overflow: hidden;
  margin: 20px;
}

.main-video-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  height: 100%;
  width: 100%;
}

.video-placeholder .el-icon {
  font-size: 48px;
  margin-bottom: 15px;
  color: #409EFF;
}

.video-placeholder p {
  margin: 10px 0 20px;
}

.main-video-stream {
  width: 100%;
  height: 100%;
  position: relative;
}

.main-video-stream video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.main-video-overlay {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 5px 10px;
  border-radius: 4px;
}

.participant-name {
  font-size: 14px;
  color: #fff;
}

/* 视频控制 */
.video-controls {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f8f9fa;
  border-top: 1px solid #eee;
  padding: 0 20px;
}

.video-controls .el-button-group {
  display: flex;
  gap: 15px;
}

.exit-button {
  margin-left: 10px;
}

/* 右侧边栏 */
.sidebar {
  width: 250px;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-left: 1px solid #eee;
  margin: 20px 20px 20px 0;
  border-radius: 4px;
  overflow: hidden;
}

/* 参与者列表 */
.participants-list {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  /* 隐藏滚动条但保留滚动功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

/* Chrome, Safari 和 Opera 的滚动条 */
.participants-list::-webkit-scrollbar {
  display: none;
}

.sidebar-header {
  padding: 12px 15px;
  font-weight: 600;
  background-color: #409EFF;
  color: #fff;
}

.participant-video-item {
  width: 100%;
  height: 150px;
  margin-bottom: 1px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.participant-video-item:hover {
  background-color: #ecf5ff;
}

.participant-video-item.selected {
  box-shadow: 0 0 0 2px #409EFF;
}

.participant-video-item video, 
.participant-video-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.participant-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  padding: 5px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.participant-status {
  color: #ff4949;
}

/* 响应式调整 */
@media (max-width: 900px) {
  .interview-session-page {
    padding: 10px;
  }
  
  .interview-container {
    height: calc(100vh - 20px);
  }
  
  .interview-layout {
    flex-direction: column;
  }
  
  .main-video-area {
    margin: 10px;
  }
  
  .sidebar {
    width: auto;
    margin: 0 10px 10px;
  }
  
  .participants-list {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding: 10px;
  }
  
  .participant-video-item {
    width: 160px;
    height: 120px;
    flex-shrink: 0;
    margin-right: 10px;
    margin-bottom: 0;
  }
}
</style>

