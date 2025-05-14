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
              {{ interviewData.interviewer?.username || '面试官' }}
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
                <!-- 添加视频显示模式控制按钮 -->
                <div class="video-display-controls">
                  <el-tooltip content="切换视频显示模式" placement="bottom">
                    <el-button type="text" class="mode-toggle-btn" @click="toggleVideoDisplayMode">
                      <el-icon v-if="videoDisplayMode === 'contain'"><FullScreen /></el-icon>
                      <el-icon v-else><ScaleToOriginal /></el-icon>
                    </el-button>
                  </el-tooltip>
                </div>

                <video
                  ref="mainVideo"
                  autoplay
                  playsinline
                  :muted="selectedStream?.isLocal"
                  :srcObject="selectedStream?.stream"
                  :class="{ 'fill-mode': videoDisplayMode === 'cover' }"
                ></video>
                <div class="main-video-overlay">
                  <div class="participant-name">
                    {{ selectedStream?.isLocal ? '我' : getParticipantName(selectedStream?.id) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 底部控制栏 -->
            <div class="video-controls">
              <div class="control-buttons">
                <button
                  class="control-btn"
                  :class="{ active: isMicrophoneOn, inactive: !isMicrophoneOn }"
                  @click="toggleMicrophone"
                >
                  <el-icon v-if="isMicrophoneOn"><Microphone /></el-icon>
                  <el-icon v-else><Mute /></el-icon>
                  <span>{{ isMicrophoneOn ? '麦克风开启' : '麦克风关闭' }}</span>
                </button>

                <button
                  class="control-btn"
                  :class="{ active: isCameraOn, inactive: !isCameraOn }"
                  @click="toggleCamera"
                >
                  <el-icon v-if="isCameraOn"><VideoCamera /></el-icon>
                  <el-icon v-else><VideoPlay /></el-icon>
                  <span>{{ isCameraOn ? '摄像头开启' : '摄像头关闭' }}</span>
                </button>

                <button
                  class="control-btn"
                  :class="{ sharing: isScreenSharing }"
                  @click="shareScreen"
                >
                  <el-icon><Share /></el-icon>
                  <span>{{ isScreenSharing ? '停止共享' : '屏幕共享' }}</span>
                </button>

                <button
                  v-if="videoDevices.length > 1 && isCameraOn"
                  class="control-btn secondary"
                  @click="deviceSelectDialogVisible = true"
                >
                  <el-icon><Switch /></el-icon>
                  <span>切换摄像头</span>
                </button>
              </div>

              <button class="control-btn exit-btn" @click="exitInterview">
                <el-icon><Close /></el-icon>
                <span>退出面试</span>
              </button>
            </div>
          </div>

          <!-- 右侧参与者列表 -->
          <div class="sidebar">
            <!-- 参与者视频列表 -->
            <div class="participants-list">
              <div class="sidebar-header">参与者</div>

              <!-- 本地视频预览 -->
              <div
                v-for="item in videoList"
                :key="item.id"
                class="participant-video-item"
                :class="{ selected: selectedStream?.id === item.id }"
                @click="selectParticipant(item)"
              >
                <video
                  :ref="
                    el => {
                      if (el) videos[item.id] = el
                    }
                  "
                  :id="item.id"
                  autoplay
                  playsinline
                  :muted="item.isLocal || item.muted"
                  :srcObject="item.stream"
                ></video>
                <div class="participant-info">
                  <div class="participant-name">
                    {{ item.isLocal ? '我' : getParticipantName(item.id) }}
                  </div>
                  <div class="participant-status" :class="{ muted: !item.isLocal && item.muted }">
                    <el-icon v-if="item.isLocal ? !isMicrophoneOn : item.muted">
                      <Mute />
                    </el-icon>
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

    <!-- 添加摄像头选择器对话框 -->
    <el-dialog v-model="deviceSelectDialogVisible" title="选择摄像头" width="360px">
      <div class="camera-select-list">
        <div v-if="videoDevices.length === 0" class="no-device-tip">未检测到摄像头设备</div>
        <el-radio-group v-model="selectedVideoDeviceId" @change="switchCamera">
          <el-radio
            v-for="device in videoDevices"
            :key="device.deviceId"
            :label="device.deviceId"
            class="camera-option"
          >
            {{ device.label || `摄像头 ${videoDevices.indexOf(device) + 1}` }}
          </el-radio>
        </el-radio-group>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deviceSelectDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
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
  Close,
  Switch,
  FullScreen,
  ScaleToOriginal
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { startInterview, completeInterview, verifyInterviewInvitationCode } from '@/api/interview'
import { io } from 'socket.io-client'
import SimpleSignalClient from 'simple-signal-client'
// const SimpleSignalClient = require('simple-signal-client')

const route = useRoute()
const router = useRouter()
const invitationCode = route.params.id

const userStore = useUserStore()

// 状态变量
const loading = ref(true)
const interviewData = ref({
  title: '',
  duration: 0,
  interviewer: null,
  company: null,
  job: null,
  jobSeeker: null,
  scheduleTime: null,
  canStart: false
})
const isVideoStarted = ref(false)
const isMicrophoneOn = ref(true)
const isCameraOn = ref(true)
const isScreenSharing = ref(false)
const exitDialogVisible = ref(false)
const videos = ref({})
const mainVideoHeight = ref(500)
const participantVideoHeight = ref(120)
const videoDisplayMode = ref('contain') // 'contain' 或 'cover'

// 设备选择相关变量
const videoDevices = ref([])
const selectedVideoDeviceId = ref('')
const deviceSelectDialogVisible = ref(false)

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
const peerOptions = {
  // trickle: true,
  // sdpTransform: function (sdp) {
  //   return sdp
  // }
}

// 获取参与者名称的辅助函数
const getParticipantName = id => {
  // 使用实际的面试参与者信息
  if (id === 'local') return '我'
  if (userStore.isInterviewer) return interviewData.value.jobSeeker.username
  if (userStore.isJobSeeker) return interviewData.value.interviewer.username
  return '未知用户'
}

// 验证面试邀请码
const verifyInvitationCode = async () => {
  try {
    loading.value = true
    const response = await verifyInterviewInvitationCode({
      invitationCode
    })

    if (response) {
      // 更新面试数据
      interviewData.value = {
        ...response,
        title: response.title || `${response.job.title} - 在线面试`,
        interviewer: response.interviewer,
        company: response.company,
        job: response.job,
        jobSeeker: response.jobSeeker,
        duration: response.duration,
        scheduleTime: new Date(response.scheduleTime),
        canStart: response.canStart
      }

      // console.log('面试数据:', interviewData.value)

      // 检查是否可以开始面试
      if (!interviewData.value.canStart) {
        const now = new Date()
        const scheduleTime = new Date(interviewData.value.scheduleTime)
        if (now < scheduleTime) {
          ElMessage.warning(`面试将在 ${scheduleTime.toLocaleString()} 开始，请稍后再试`)
        } else {
          ElMessage.warning('面试已结束或已取消')
        }
        router.push('/online-interview')
        return
      }

      ElMessage.success('验证成功，可以开始面试')
    }
  } catch (error) {
    console.error('验证面试邀请码失败:', error)
    router.push('/online-interview')
  } finally {
    loading.value = false
  }
}

// 选择要在主视频区域显示的参与者视频
const selectParticipant = videoItem => {
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
  if (!interviewData.value.canStart) {
    ElMessage.warning('当前时间不在面试时间范围内')
    return
  }

  try {
    isVideoStarted.value = true
    // 加入WebRTC房间
    await join()
    ElMessage.success('视频面试已开始')
  } catch (error) {
    console.error('启动视频失败:', error)
    isVideoStarted.value = false
    // 显示更具体的错误信息
    if (error.name === 'AbortError' && error.message.includes('Timeout')) {
      ElMessage.error('无法访问摄像头（超时）。请检查设备连接并确保授予了摄像头权限。')
    } else {
      ElMessage.error('无法访问摄像头或麦克风，请确保设备连接正常并授予权限')
    }
  }
}

// 获取所有可用的媒体设备
const getMediaDevices = async () => {
  try {
    // 请求权限
    await navigator.mediaDevices.getUserMedia({ audio: true, video: true })

    const devices = await navigator.mediaDevices.enumerateDevices()
    videoDevices.value = devices.filter(device => device.kind === 'videoinput')
    console.log('视频设备列表:', videoDevices.value)

    // 如果有设备，设置默认选中的设备
    if (videoDevices.value.length > 0) {
      selectedVideoDeviceId.value = videoDevices.value[0].deviceId
    }
  } catch (error) {
    console.error('获取媒体设备失败:', error)
    ElMessage.warning('无法获取摄像头列表')
  }
}

// 切换摄像头
const switchCamera = async () => {
  if (!isCameraOn.value || !selectedVideoDeviceId.value) return

  try {
    // 停止当前视频流
    const localVideo = videoList.value.find(v => v.isLocal && !v.isScreenShare)
    if (localVideo) {
      // 停止当前视频流的所有轨道
      localVideo.stream.getVideoTracks().forEach(track => track.stop())
    }

    // 获取新的视频流
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: selectedVideoDeviceId.value },
        width: { ideal: 640 },
        height: { ideal: 480 }
      },
      audio: false // 保留现有音频流
    })

    // 如果本地视频存在，替换视频轨道
    if (localVideo) {
      // 获取现有的音频轨道
      const audioTracks = localVideo.stream.getAudioTracks()

      // 创建一个新的媒体流，包含新的视频轨道和现有的音频轨道
      const combinedStream = new MediaStream([...newStream.getVideoTracks(), ...audioTracks])

      // 更新流对象
      localVideo.stream = combinedStream

      // 更新UI上的视频元素
      setTimeout(() => {
        nextTick(() => {
          if (videos.value[localVideo.id]) {
            videos.value[localVideo.id].srcObject = combinedStream
          }

          // 如果当前选中的是本地视频，也更新主视频
          if (selectedStream.value && selectedStream.value.id === localVideo.id) {
            selectedStream.value.stream = combinedStream
          }

          // 通知对等方更新视频轨道
          if (signalClient.value) {
            signalClient.value.peers().forEach(peer => {
              // 替换现有轨道
              const senders = peer.getSenders()
              const videoSender = senders.find(
                sender => sender.track && sender.track.kind === 'video'
              )

              if (videoSender && newStream.getVideoTracks().length > 0) {
                videoSender.replaceTrack(newStream.getVideoTracks()[0])
              }
            })
          }
        })
      }, 500)

      ElMessage.success('摄像头已切换')
    }

    deviceSelectDialogVisible.value = false
  } catch (error) {
    console.error('切换摄像头失败:', error)
    ElMessage.error('切换摄像头失败: ' + error.message)
  }
}

// 加入WebRTC房间
const join = async () => {
  try {
    console.log('加入房间:', roomId.value)
    socket.value = io(socketURL, ioOptions)
    signalClient.value = new SimpleSignalClient(socket.value)

    // 获取可用的媒体设备
    await getMediaDevices()

    // 获取本地媒体流 - 优化后的方法
    try {
      // 基本约束条件
      let constraints = {
        video: isCameraOn.value,
        audio: isMicrophoneOn.value
      }

      // 如果有视频设备可用且需要启用摄像头，使用选择的设备或第一个设备
      if (videoDevices.value.length > 0 && isCameraOn.value) {
        constraints.video = {
          deviceId: { ideal: selectedVideoDeviceId.value || videoDevices.value[0].deviceId },
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      }

      console.log('使用媒体约束:', constraints)
      const localStream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log('获取到本地媒体流:', localStream)

      // 将本地流添加到视频列表
      joinedRoom(localStream, true)
    } catch (mediaError) {
      console.warn('获取视频流失败，尝试备用方案:', mediaError)

      try {
        // 仅尝试获取音频
        if (isMicrophoneOn.value) {
          const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true
          })

          console.log('获取到仅音频流')
          isCameraOn.value = false
          joinedRoom(audioOnlyStream, true)
          ElMessage.warning('摄像头不可用，仅使用麦克风继续面试')
        } else {
          // 创建一个空的媒体流，作为观众模式
          const emptyStream = new MediaStream()
          joinedRoom(emptyStream, true)
          isCameraOn.value = false
          ElMessage.warning('摄像头不可用，以观众模式加入面试')
        }
      } catch (fallbackError) {
        console.error('备用方案也失败:', fallbackError)
        throw new Error('无法访问任何媒体设备，请检查设备连接和权限设置')
      }
    }

    // 处理发现其他参与者
    signalClient.value.once('discover', discoveryData => {
      console.log('发现其他参与者:', discoveryData)

      // 连接到房间里的其他参与者
      async function connectToPeer(peerID) {
        if (peerID == socket.value.id) return
        try {
          console.log('连接到参与者:', peerID)
          console.log('连接到参与者:', roomId.value, peerOptions)
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
      discoveryData.peers.forEach(peerID => connectToPeer(peerID))
    })

    // 处理连接请求
    signalClient.value.on('request', async request => {
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
  peer.on('stream', remoteStream => {
    // 添加远程流到视频列表
    joinedRoom(remoteStream, false)

    // 处理连接关闭
    peer.on('close', () => {
      console.log('对等连接关闭:', remoteStream.id)
      // 从视频列表中移除该流
      videoList.value = videoList.value.filter(item => item.id !== remoteStream.id)
    })

    // 处理连接错误
    peer.on('error', err => {
      console.error('对等连接错误:', err)
    })
  })
}

// 修改加入房间方法
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

  // 延迟设置视频元素的srcObject以确保DOM已更新
  setTimeout(() => {
    nextTick(() => {
      for (const id in videos.value) {
        if (id === stream.id && videos.value[id]) {
          videos.value[id].srcObject = stream
          console.log('设置视频源成功:', id)
        }
      }
    })
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
    if (isScreenSharing.value) {
      // 如果已经在共享屏幕，则停止共享
      const screenVideo = videoList.value.find(v => v.isScreenShare)
      if (screenVideo) {
        screenVideo.stream.getTracks().forEach(track => track.stop())
        videoList.value = videoList.value.filter(v => !v.isScreenShare)

        // 切换回本地视频
        const localVideo = videoList.value.find(v => v.isLocal)
        if (localVideo) {
          selectedStream.value = localVideo
        }
      }
      isScreenSharing.value = false
    } else {
      // 开始新的屏幕共享
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      })

      // 添加到视频列表
      const screenVideo = {
        id: 'screen-share',
        stream: screenStream,
        isLocal: true,
        isScreenShare: true,
        muted: true
      }
      videoList.value.push(screenVideo)

      // 与其他对等方共享
      if (signalClient.value) {
        signalClient.value.peers().forEach(p => onPeer(p, screenStream))
      }

      // 自动切换到屏幕共享视图
      selectedStream.value = screenVideo
      isScreenSharing.value = true

      // 监听屏幕共享结束
      screenStream.getVideoTracks()[0].onended = () => {
        videoList.value = videoList.value.filter(v => !v.isScreenShare)
        if (selectedStream.value.isScreenShare) {
          const localVideo = videoList.value.find(v => v.isLocal)
          if (localVideo) {
            selectedStream.value = localVideo
          }
        }
        isScreenSharing.value = false
      }
    }
  } catch (error) {
    console.error('屏幕共享失败:', error)
    ElMessage.error('屏幕共享失败')
    isScreenSharing.value = false
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

// 辅助函数 - 获取面试轮次文本
const getInterviewRoundText = round => {
  const roundMap = {
    FIRST_INTERVIEW: '一面',
    SECOND_INTERVIEW: '二面',
    HR_INTERVIEW: 'HR面试'
  }
  return roundMap[round] || round || '未知'
}

// 切换视频显示模式
const toggleVideoDisplayMode = () => {
  videoDisplayMode.value = videoDisplayMode.value === 'contain' ? 'cover' : 'contain'
}

// 组件挂载
onMounted(async () => {
  // 验证面试邀请码
  await verifyInvitationCode()
})

// 组件卸载
onBeforeUnmount(() => {
  // 离开房间，清理资源
  if (isVideoStarted.value) {
    leave()
  }
})
</script>

<style scoped>
.interview-session-page {
  background-color: #f5f9ff;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 20px 80px;
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
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
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
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  color: #606266;
  font-size: 13px;
}

.info-item .el-icon {
  margin-right: 5px;
  color: #409eff;
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
  overflow: hidden; /* 确保内容不会溢出 */
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
  color: #409eff;
}

.video-placeholder p {
  margin: 10px 0 20px;
}

.main-video-stream {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden; /* 防止视频溢出 */
}

.main-video-stream video {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 改为 contain 以保持比例且确保完全可见 */
  max-height: 100%; /* 确保不超过容器高度 */
  max-width: 100%; /* 确保不超过容器宽度 */
  background-color: #000; /* 背景色填充空白区域 */
}

/* 填充模式 */
.main-video-stream video.fill-mode {
  object-fit: cover;
}

.main-video-overlay {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 5px 10px;
  border-radius: 4px;
  z-index: 5;
}

.participant-name {
  font-size: 14px;
  color: #fff;
}

/* 视频显示模式控制 */
.video-display-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.mode-toggle-btn {
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  color: #fff;
  transition: all 0.3s;
}

.mode-toggle-btn:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

.mode-toggle-btn .el-icon {
  font-size: 16px;
}

/* 参与者视频项样式调整 */
.participant-video-item video {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 对小视频使用 cover 以填充整个空间 */
}

/* 视频控制 */
.video-controls {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 0 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.control-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #606266;
  position: relative;
  min-width: 65px;
}

.control-btn:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.control-btn .el-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.control-btn span {
  font-size: 12px;
  white-space: nowrap;
}

.control-btn.active {
  color: #409eff;
}

.control-btn.inactive {
  color: #f56c6c;
}

.control-btn.sharing {
  color: #e6a23c;
}

.control-btn.secondary {
  color: #909399;
  margin-left: 5px;
}

.exit-btn {
  background-color: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s;
}

.exit-btn:hover {
  background-color: rgba(245, 108, 108, 0.2);
}

/* 摄像头选择对话框 */
.camera-select-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 0;
}

.camera-option {
  padding: 10px;
  margin: 5px 0;
  border-radius: 4px;
  display: block;
  transition: all 0.2s;
}

.camera-option:hover {
  background-color: #f5f7fa;
}

.no-device-tip {
  text-align: center;
  color: #909399;
  padding: 20px 0;
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
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.1);
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
  background-color: #409eff;
  color: #fff;
  text-align: center;
  letter-spacing: 1px;
}

.participant-video-item {
  width: 100%;
  height: 150px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #f0f0f0;
  overflow: hidden;
}

.participant-video-item:hover {
  background-color: #ecf5ff;
}

.participant-video-item.selected {
  box-shadow: 0 0 0 1px rgba(3, 100, 197, 0.08);
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
  padding: 4px 10px;
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
    flex: 1;
  }

  .sidebar {
    width: auto;
    height: 120px;
    margin: 0 10px 10px;
    box-shadow: 0 0 8px rgba(64, 158, 255, 0.08);
  }

  .participants-list {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    height: calc(100% - 40px);
  }

  .sidebar-header {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(64, 158, 255, 0.9);
  }

  .participant-video-item {
    width: 160px;
    height: 100%;
    flex-shrink: 0;
    margin-right: 8px;
    border-bottom: none;
    border-right: 1px solid #f0f0f0;
  }

  .participant-video-item:last-child {
    margin-right: 0;
    border-right: none;
  }
}

/* 超小屏幕调整 */
@media (max-width: 480px) {
  .interview-session-page {
    padding: 5px;
  }

  .interview-container {
    height: calc(100vh - 10px);
  }

  .interview-info-bar {
    padding: 10px;
  }

  .interview-title {
    font-size: 16px;
  }

  .interview-details {
    gap: 10px;
  }

  .main-video-area {
    margin: 5px;
  }

  .video-controls {
    height: 60px;
    padding: 0 10px;
  }

  .sidebar {
    height: 150px;
    margin: 0 5px 5px;
  }

  .participant-video-item {
    width: 120px;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .control-btn {
    padding: 8px 10px;
    min-width: auto;
  }

  .control-btn span {
    display: none;
  }

  .control-btn .el-icon {
    margin-bottom: 0;
  }
}
</style>
