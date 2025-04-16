<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>个人中心</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 个人信息卡片 -->
      <div class="user-info-card">
        <div class="user-avatar">
          <el-avatar :size="80" :src="userStore.avatarUrl">
            {{ userInfo.username?.charAt(0).toUpperCase() }}
          </el-avatar>
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
          <div class="user-bio" v-if="userInfo.bio">
            {{ userInfo.bio }}
          </div>
        </div>
        <div class="user-actions">
          <el-button type="primary" @click="editProfile">编辑资料</el-button>
        </div>
      </div>

      <!-- 用户组件区域 -->
      <div class="profile-components">
        <!-- 所有用户都显示的收藏列表 -->
        <UserFavoritesList />

        <!-- 求职者专属组件 -->
        <UserApplicationsList v-if="isJobSeeker" />

        <!-- 面试官专属组件 -->
        <template v-if="isInterviewer">
          <InterviewerJobsList />
          <InterviewerFavoritesList />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, Calendar } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

// 动态导入组件
import UserFavoritesList from './components/profile/UserFavoritesList.vue'
import UserApplicationsList from './components/profile/UserApplicationsList.vue'
import InterviewerJobsList from './components/profile/InterviewerJobsList.vue'
import InterviewerFavoritesList from './components/profile/InterviewerFavoritesList.vue'

const router = useRouter()
const userStore = useUserStore()
const userInfo = ref({})

// 计算属性：判断用户角色
const isJobSeeker = computed(() => userInfo.value.role === 'JOB_SEEKER' || userStore.isJobSeeker)

const isInterviewer = computed(
  () => userInfo.value.role === 'INTERVIEWER' || userStore.isInterviewer
)

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    // 如果Pinia已有用户信息，优先使用
    if (userStore.userInfo) {
      userInfo.value = userStore.userInfo
      return
    }

    // 如果没有，从API获取
    await userStore.getInfo()
    userInfo.value = userStore.userInfo || {}
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败，请稍后再试')
  }
}

// 编辑个人资料
const editProfile = () => {
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
  min-height: calc(100vh - 60px);
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

    .user-bio {
      color: #666;
      font-size: 14px;
      line-height: 1.6;
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

      .user-meta {
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
