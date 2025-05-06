<template>
  <div class="interview-session">
    <!-- 加载提示 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    
    <template v-else>
      <!-- 面试进行中 -->
      <div class="interview-in-progress">
        <!-- 主视频区域 -->
        <div class="main-video-container">
          <div class="video-list">
            <div v-for="item in selectedVideoList"
                v-bind:video="item"
                v-bind:key="item.id"
                class="main-video-item">
              <video controls autoplay playsinline :height="mainVideoHeight" :muted="item.muted" :id="item.id"></video>
            </div>
          </div>
          <div class="video-overlay">
            <div class="participant-name">{{ selectedStream?.id === 'local' ? '我' : getParticipantName(selectedStream?.id) }}</div>
          </div>
        </div>
        
        <!-- 控制栏 -->
        <div class="control-bar">
          <div class="video-controls">
            <el-button 
              :type="isMicrophoneOn ? 'success' : 'danger'" 
              circle 
              @click="toggleMicrophone"
            >
              <el-icon>
                <Microphone v-if="isMicrophoneOn" />
                <Mute v-else />
              </el-icon>
            </el-button>
            
            <el-button 
              :type="isCameraOn ? 'success' : 'danger'" 
              circle 
              @click="toggleCamera"
            >
              <el-icon>
                <VideoCamera v-if="isCameraOn" />
                <VideoPlay v-else />
              </el-icon>
            </el-button>
            
            <el-button 
              type="primary" 
              circle 
              @click="shareScreen"
            >
              <el-icon><Share /></el-icon>
            </el-button>
            
            <el-button 
              type="danger" 
              @click="exitInterview"
            >
              退出面试
            </el-button>
          </div>
        </div>
        
        <!-- 参与者列表 -->
        <div class="participants-list">
          <!-- 所有参与者视频 -->
          <div 
            v-for="item in videoList"
            :key="item.id"
            class="participant-item" 
            :class="{ active: selectedStream?.id === item.id }"
            @click="selectParticipant(item)"
          >
            <video 
              ref="videos"
              :id="item.id"
              autoplay 
              playsinline
              :muted="item.muted"
              :height="participantVideoHeight"
              class="participant-video">
            </video>
            <div class="participant-info">
              <div class="participant-name">{{ item.isLocal ? '我' : getParticipantName(item.id) }}</div>
              <div class="participant-status" :class="{ muted: item.muted }">
                <el-icon v-if="item.muted"><Mute /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 退出面试确认对话框 -->
      <el-dialog
        v-model="exitDialogVisible"
        title="退出面试"
        width="30%"
        :close-on-click-modal="false"
        :show-close="false"
      >
        <span>确定要退出当前面试吗？</span>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="exitDialogVisible = false">取消</el-button>
            <el-button type="danger" @click="confirmExit">确认退出</el-button>
          </span>
        </template>
      </el-dialog>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
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
  OfficeBuilding,
  Close
} from '@element-plus/icons-vue'
import { startInterview, completeInterview } from '@/api/interview'
import { io } from 'socket.io-client'
import SimpleSignalClient from 'simple-signal-client'

const route = useRoute()
const router = useRouter()
const invitationCode = route.params.id

// 状态变量
const loading = ref(true)
const interviewData = ref({})
const isVideoStarted = ref(false)
const isMicrophoneOn = ref(true)
const isCameraOn = ref(true)
const exitDialogVisible = ref(false)
const videos = ref([])
const mainVideoHeight = ref(500)
const participantVideoHeight = ref(120)

// WebRTC相关变量
const signalClient = ref(null)
const socket = ref(null)
const videoList = ref([])
const selectedStream = ref(null)
const selectedVideoList = computed(() => {
  if (!selectedStream.value) return []
  return videoList.value.filter(item => item.id === selectedStream.value.id)
})

// 加入房间设置
const roomId = computed(() => 'interview-' + invitationCode)
const socketURL = 'https://weston-vue-webrtc-lobby.azurewebsites.net' // 实际环境中应替换为你自己的信令服务器
const ioOptions = {
  rejectUnauthorized: false,
  transports: ['polling', 'websocket']
}
const peerOptions = {}

// 获取参与者名称的辅助函数
const getParticipantName = (id) => {
  // 在实际应用中，这会从服务器获取参与者信息
  const names = {
    'interviewer-1': 'Caroline',
    'interviewer-2': 'Jimmy',
    'interviewer-3': 'Lucy',
    'interviewer-4': 'Alfredo',
    'interviewer-5': 'Allon'
  }
  return names[id] || '未知用户'
}

// 选择要在主视频区域显示的参与者视频
const selectParticipant = (videoItem) => {
  selectedStream.value = videoItem
}

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
    isVideoStarted.value = true
    // 加入WebRTC房间
    await join()
    ElMessage.success('视频面试已开始')
  } catch (error) {
    console.error('启动视频失败:', error)
    ElMessage.error('无法访问摄像头或麦克风，请确保设备连接正常并授予权限')
  }
}

// 加入WebRTC房间
const join = async () => {
  try {
    console.log('加入房间:', roomId.value)
    socket.value = io(socketURL, ioOptions)
    signalClient.value = new SimpleSignalClient(socket.value)
    
    // 获取本地媒体流
    let constraints = {
      video: isCameraOn.value,
      audio: isMicrophoneOn.value
    }
    
    const localStream = await navigator.mediaDevices.getUserMedia(constraints)
    console.log('获取到本地媒体流:', localStream)
    
    // 将本地流添加到视频列表
    joinedRoom(localStream, true)
    
    // 处理发现其他参与者
    signalClient.value.once('discover', (discoveryData) => {
      console.log('发现其他参与者:', discoveryData)
      
      // 连接到房间里的其他参与者
      async function connectToPeer(peerID) {
        if (peerID == socket.value.id) return
        try {
          console.log('连接到参与者:', peerID)
          const { peer } = await signalClient.value.connect(peerID, roomId.value, peerOptions)
          
          // 为所有对等连接添加本地流
          videoList.value.forEach(v => {
            if (v.isLocal) {
              onPeer(peer, v.stream)
            }
          })
        } catch (e) {
          console.error('连接参与者失败:', e)
        }
      }
      
      // 连接到所有已存在的参与者
      discoveryData.peers.forEach((peerID) => connectToPeer(peerID))
    })
    
    // 处理连接请求
    signalClient.value.on('request', async (request) => {
      console.log('收到连接请求:', request)
      const { peer } = await request.accept({}, peerOptions)
      console.log('接受连接请求:', peer)
      
      // 为新建立的对等连接添加本地流
      videoList.value.forEach(v => {
        if (v.isLocal) {
          onPeer(peer, v.stream)
        }
      })
    })
    
    // 开始发现房间中的其他参与者
    signalClient.value.discover(roomId.value)
    
    // 默认选择本地视频作为主显示
    if (videoList.value.length > 0) {
      selectedStream.value = videoList.value[0]
    }
    
  } catch (error) {
    console.error('加入房间失败:', error)
    throw error
  }
}

// 处理对等连接
const onPeer = (peer, localStream) => {
  console.log('处理对等连接:', peer)
  
  // 添加本地流到对等连接
  peer.addStream(localStream)
  
  // 接收远程流
  peer.on('stream', (remoteStream) => {
    // 添加远程流到视频列表
    joinedRoom(remoteStream, false)
    
    // 处理连接关闭
    peer.on('close', () => {
      console.log('对等连接关闭:', remoteStream.id)
      // 从视频列表中移除该流
      videoList.value = videoList.value.filter(item => item.id !== remoteStream.id)
    })
    
    // 处理连接错误
    peer.on('error', (err) => {
      console.error('对等连接错误:', err)
    })
  })
}

// 加入房间并添加视频流
const joinedRoom = (stream, isLocal) => {
  console.log('加入房间:', stream.id, isLocal ? '(本地)' : '(远程)')
  
  // 检查是否已存在相同ID的视频
  let found = videoList.value.find(video => video.id === stream.id)
  
  if (found === undefined) {
    // 添加新视频到列表
    let video = {
      id: stream.id,
      muted: isLocal, // 本地视频静音避免回声
      stream: stream,
      isLocal: isLocal
    }
    videoList.value.push(video)
    
    // 如果是第一个视频，设为主视频
    if (videoList.value.length === 1 || isLocal) {
      selectedStream.value = video
    }
  }
  
  // 设置video元素的srcObject
  setTimeout(() => {
    if (videos.value) {
      for (let i = 0; i < videos.value.length; i++) {
        const videoElement = videos.value[i]
        if (videoElement && videoElement.id === stream.id) {
          videoElement.srcObject = stream
          break
        }
      }
    }
  }, 500)
}

// 切换麦克风状态
const toggleMicrophone = () => {
  const localVideo = videoList.value.find(v => v.isLocal)
  if (localVideo && localVideo.stream) {
    localVideo.stream.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled
      isMicrophoneOn.value = track.enabled
    })
  }
}

// 切换摄像头状态
const toggleCamera = () => {
  const localVideo = videoList.value.find(v => v.isLocal)
  if (localVideo && localVideo.stream) {
    localVideo.stream.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled
      isCameraOn.value = track.enabled
    })
  }
}

// 屏幕共享
const shareScreen = async () => {
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
      video: true, 
      audio: false 
    })
    
    // 添加到视频列表
    joinedRoom(screenStream, true)
    
    // 与其他对等方共享
    signalClient.value.peers().forEach(p => onPeer(p, screenStream))
    
    // 自动切换到屏幕共享视图
    const screenVideo = videoList.value.find(v => v.stream === screenStream)
    if (screenVideo) {
      selectedStream.value = screenVideo
    }
    
    // 监听屏幕共享结束
    screenStream.getVideoTracks()[0].onended = () => {
      // 从视频列表中移除屏幕共享
      videoList.value = videoList.value.filter(v => v.stream !== screenStream)
      // 如果当前选中的是屏幕共享，则切换回本地视频
      if (selectedStream.value.stream === screenStream) {
        const localVideo = videoList.value.find(v => v.isLocal)
        if (localVideo) {
          selectedStream.value = localVideo
        }
      }
    }
    
  } catch (error) {
    console.error('屏幕共享失败:', error)
    ElMessage.error('屏幕共享失败')
  }
}

// 退出面试
const exitInterview = () => {
  exitDialogVisible.value = true
}

// 确认退出
const confirmExit = async () => {
  try {
    // 离开房间，清理资源
    leave()
    
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

// 离开房间
const leave = () => {
  // 停止所有视频流
  videoList.value.forEach(v => {
    if (v.stream) {
      v.stream.getTracks().forEach(t => t.stop())
    }
  })
  
  // 清空视频列表
  videoList.value = []
  
  // 清理信令客户端和连接
  if (signalClient.value) {
    signalClient.value.peers().forEach(peer => peer.removeAllListeners())
    signalClient.value.destroy()
    signalClient.value = null
  }
  
  // 关闭socket连接
  if (socket.value) {
    socket.value.disconnect()
    socket.value = null
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
  // 离开房间，清理资源
  if (isVideoStarted.value) {
    leave()
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
.interview-session {
  width: 100%;
  height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  position: relative;
}

.loading-container {
  padding: 20px;
  width: 100%;
  max-width: 800px;
  margin: 40px auto;
}

/* 面试开始前的样式 */
.interview-start {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.interview-info-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 600px;
}

.interview-info-card h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #409EFF;
}

.interview-details {
  margin-bottom: 30px;
}

.detail-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.detail-item .el-icon {
  margin-right: 10px;
  color: #409EFF;
}

.notice {
  background-color: #f8f8f8;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
}

.notice ul {
  padding-left: 20px;
}

.notice li {
  margin-bottom: 5px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

/* 面试进行中的样式 */
.interview-in-progress {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 200px;
  grid-template-rows: 1fr 80px;
  grid-template-areas:
    "main participants"
    "controls participants";
  height: 100vh;
}

.main-video-container {
  grid-area: main;
  position: relative;
  background-color: #000;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-list {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-video-item {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-video-item video {
  width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.video-overlay {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
}

.control-bar {
  grid-area: controls;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  padding: 10px;
}

.video-controls {
  display: flex;
  gap: 15px;
}

.participants-list {
  grid-area: participants;
  background-color: #2c3e50;
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.participant-item {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  height: 120px;
  border: 3px solid transparent;
  transition: all 0.3s ease;
}

.participant-item.active {
  border-color: #409EFF;
}

.participant-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.participant-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.participant-name {
  font-size: 12px;
  font-weight: bold;
}

.participant-status {
  display: flex;
  align-items: center;
}

.participant-status.muted {
  color: #f56c6c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .interview-in-progress {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto auto;
    grid-template-areas:
      "main"
      "participants"
      "controls";
  }
  
  .participants-list {
    flex-direction: row;
    overflow-x: auto;
    height: 120px;
  }
  
  .participant-item {
    min-width: 160px;
  }
}
</style>

