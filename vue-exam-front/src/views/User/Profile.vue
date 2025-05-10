<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-if="isCurrentUser" :to="{ path: '/profile' }"
            >个人中心</el-breadcrumb-item
          >
          <el-breadcrumb-item v-else>
            <span>用户信息</span>
          </el-breadcrumb-item>
          <el-breadcrumb-item v-if="!isCurrentUser">{{
            userInfo.username || '用户'
          }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton animated :rows="6" />
      </div>

      <!-- 个人信息卡片 -->
      <div v-else class="user-info-card">
        <div class="user-avatar">
          <el-avatar :size="80" :src="avatarUrl" />
        </div>
        <div class="user-details">
          <h1 class="user-name">{{ userInfo.username || '未设置用户名' }}</h1>
          <div class="user-meta">
            <span class="user-role">
              <el-tag size="small" :type="getRoleType(userInfo.role)">{{
                getRoleLabel(userInfo.role)
              }}</el-tag>
            </span>
            <span class="user-email" v-if="userInfo.email">
              <el-icon><Message /></el-icon>
              {{ userInfo.email }}
            </span>
            <span class="join-date" v-if="userInfo.createdAt">
              <el-icon><Calendar /></el-icon>
              注册于 {{ formatDate(userInfo.createdAt) }}
            </span>
          </div>

          <!-- 面试官专属信息 -->
          <div v-if="isInterviewer && companyInfo" class="interviewer-info">
            <span class="company-info">
              <el-icon><OfficeBuilding /></el-icon>
              {{ companyInfo.name }} - {{ userInfo.position || '未设置职位' }}
            </span>
          </div>

          <div class="user-bio" v-if="userInfo.bio">
            {{ userInfo.bio }}
          </div>
        </div>
        <div class="user-actions" v-if="isCurrentUser">
          <el-button type="primary" @click="editProfile">编辑资料</el-button>
        </div>
      </div>

      <!-- 用户组件区域 -->
      <div class="profile-components">
        <!-- 求职者专属组件 -->
        <template v-if="isJobSeeker">
          <!-- 求职者详细资料 -->
          <JobSeekerProfile v-if="jobSeekerData" :jobseeker-data="jobSeekerData" />
          <!-- 求职者的应聘记录 -->
          <UserApplicationsList :user-id="userId" />
        </template>

        <!-- 面试官专属组件 -->
        <template v-if="isInterviewer">
          <InterviewerJobsList :user-id="userId" />
        </template>

        <!-- 所有用户都可以有的收藏列表 -->
        <UserFavoritesList :user-id="userId" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, Calendar, OfficeBuilding } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getUserProfile, getUserProfileById, getUser } from '@/api/user'
import { getInterviewerProfile } from '@/api/interviewer'
import { getJobseeker } from '@/api/jobseeker'
import { getCompany } from '@/api/company'
import { generateAvatar } from '@/utils/utils'

// 动态导入组件
import UserFavoritesList from './components/profile/UserFavoritesList.vue'
import UserApplicationsList from './components/profile/UserApplicationsList.vue'
import InterviewerJobsList from './components/profile/InterviewerJobsList.vue'
import JobSeekerProfile from './components/profile/JobSeekerProfile.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const userInfo = ref({})
const companyInfo = ref(null)
const jobSeekerData = ref(null)
const loading = ref(true)

// 获取URL中的用户ID参数，如果没有则使用当前登录用户的ID
const userId = computed(() => {
  return route.params.id || userStore.userInfo?.id
})

// 监听userId变化和路由变化，重新加载数据
watch([() => route.params.id, () => route.name], () => {
  if (
    ['UserProfile', 'ProfileWithId'].includes(route.name) ||
    (route.name === 'Profile' && route.params.id)
  ) {
    fetchUserInfo()
  }
})

// 判断是否是当前登录用户的资料页
const isCurrentUser = computed(() => {
  // 如果用户未登录，肯定不是查看自己的资料
  if (!userStore.isLoggedIn || !userStore.userInfo) return false

  // 如果URL中有ID参数，检查是否与当前用户ID匹配
  if (route.params.id) {
    return userStore.userInfo.id === parseInt(route.params.id)
  }

  // 如果URL中没有ID参数，且在个人资料页面，则是查看自己的资料
  return route.name === 'Profile'
})

// 计算属性：判断用户角色
const isJobSeeker = computed(() => userInfo.value.role === 'JOB_SEEKER')
const isInterviewer = computed(() => userInfo.value.role === 'INTERVIEWER')

// 用于生成头像URL的计算属性
const avatarUrl = computed(() => {
  // 基于用户名生成
  return generateAvatar(userInfo.value.username || '')
})

// 获取用户信息
const fetchUserInfo = async () => {
  loading.value = true
  try {
    let targetUserId = null

    // 确定要获取的用户ID
    if (route.params.id) {
      // 如果URL中有ID参数，使用该ID
      targetUserId = parseInt(route.params.id)
    } else if (userStore.isLoggedIn && userStore.userInfo?.id) {
      // 如果没有ID参数但用户已登录，使用当前用户ID
      targetUserId = userStore.userInfo.id
    } else {
      // 如果既没有ID参数，用户也未登录，重定向到登录页面
      ElMessage.error('用户ID无效')
      router.push('/login')
      return
    }

    let userData = null

    // 判断是否是当前登录用户
    const isViewingSelf = userStore.isLoggedIn && userStore.userInfo?.id === targetUserId

    if (isViewingSelf) {
      // 查看自己的资料
      if (userStore.userInfo) {
        userData = userStore.userInfo
      } else {
        const response = await getUserProfile()
        userData = response.data || response
      }
    } else {
      // 查看他人资料
      try {
        const response = await getUserProfileById(targetUserId)
        userData = response.data || response
      } catch (error) {
        console.error('获取用户资料失败:', error)
        ElMessage.error('获取用户资料失败，该用户可能不存在')
        router.push('/')
        return
      }
    }

    // 设置用户信息
    if (userData) {
      userInfo.value = userData

      // 如果是面试官，获取公司信息
      if (userData.role === 'INTERVIEWER' && userData.companyId) {
        await fetchCompanyInfo(userData.companyId)
      }
      
      // 如果是求职者，获取求职者详细信息
      if (userData.role === 'JOB_SEEKER') {
        await fetchJobSeekerInfo(targetUserId)
      }
    } else {
      ElMessage.warning('获取用户信息失败')
      if (!isViewingSelf) {
        router.push('/')
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

// 获取面试官的公司信息
const fetchCompanyInfo = async companyId => {
  try {
    const response = await getCompany(companyId)
    companyInfo.value = response
  } catch (error) {
    console.error('获取公司信息失败:', error)
    companyInfo.value = null
  }
}

// 获取求职者详细信息
const fetchJobSeekerInfo = async userId => {
  try {
    const response = await getJobseeker(userId)
    jobSeekerData.value = response
  } catch (error) {
    console.error('获取求职者详细信息失败:', error)
    jobSeekerData.value = null
  }
}

// 编辑个人资料
const editProfile = () => {
  if (!isCurrentUser.value) {
    ElMessage.warning('只能编辑自己的资料')
    return
  }
  router.push('/profile/edit')
}

// 获取角色标签
const getRoleLabel = role => {
  const roleMap = {
    JOB_SEEKER: '求职者',
    INTERVIEWER: '面试官',
    ADMIN: '管理员'
  }
  return roleMap[role] || '用户'
}

// 获取角色标签类型（用于标签颜色）
const getRoleType = role => {
  const typeMap = {
    JOB_SEEKER: '',
    INTERVIEWER: 'warning',
    ADMIN: 'danger'
  }
  return typeMap[role] || 'info'
}

// 格式化日期
const formatDate = dateString => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('日期格式化错误:', error)
    return dateString
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style lang="less" scoped>
.profile-page {
  width: 100%;
  background-color: #f5f9ff;
  min-height: calc(100vh - 72px);
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.breadcrumb-container {
  margin-bottom: 20px;
  font-size: 14px;
}

.loading-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 30px;
  margin-bottom: 20px;
}

.user-info-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 30px;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;

  .user-avatar {
    margin-right: 24px;
  }

  .user-details {
    flex: 1;

    .user-name {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin: 0 0 12px 0;
    }

    .user-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 12px;

      .user-email,
      .join-date {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #666;
        font-size: 14px;
      }
    }

    .interviewer-info {
      margin-bottom: 12px;

      .company-info {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #555;
        font-size: 14px;
        font-weight: 500;
      }
    }

    .user-bio {
      color: #666;
      font-size: 14px;
      line-height: 1.6;
      margin-top: 12px;
    }
  }

  .user-actions {
    margin-left: 16px;
  }
}

.profile-components {
  margin-top: 24px;
}

@media (max-width: 768px) {
  .user-info-card {
    flex-direction: column;

    .user-avatar {
      margin-right: 0;
      margin-bottom: 16px;
      align-self: center;
    }

    .user-details {
      width: 100%;
      text-align: center;
      margin-bottom: 16px;

      .user-meta,
      .interviewer-info {
        justify-content: center;
      }
    }

    .user-actions {
      margin-left: 0;
      align-self: center;
    }
  }
}
</style>
