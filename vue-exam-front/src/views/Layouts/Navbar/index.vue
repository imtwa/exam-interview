<template>
  <div class="navbar" :class="{ 'navbar--with-bg': backgroundFlag, 'navbar--hidden': !isNavbar }">
    <div class="navbar__container">
      <div class="navbar__content">
        <!-- Logo and navigation links -->
        <div class="navbar__left">
          <!-- Logo -->
          <div class="navbar__logo" @click="router.push('/')">
            <span class="navbar__logo-text">云面官</span>
          </div>

          <!-- Desktop Navigation Menu -->
          <div class="navbar__links">
            <router-link
              to="/"
              class="navbar__link"
              :class="{ 'navbar__link--active': route.path === '/' }"
            >
              首页
            </router-link>
            <router-link
              to="/question-bank"
              class="navbar__link"
              :class="{ 'navbar__link--active': route.path === '/question-bank' }"
            >
              题库
            </router-link>

            <!-- 求职者导航链接 -->
            <template v-if="isJobSeeker">
              <router-link
                to="/recruitment"
                class="navbar__link"
                :class="{ 'navbar__link--active': route.path === '/recruitment' }"
              >
                招聘
              </router-link>
              <router-link
                to="/online-exam"
                class="navbar__link"
                :class="{ 'navbar__link--active': route.path === '/online-exam' }"
              >
                在线考试
              </router-link>
            </template>

            <!-- 面试官导航链接 -->
            <template v-else-if="isInterviewer">
              <router-link
                to="/job-management"
                class="navbar__link"
                :class="{ 'navbar__link--active': route.path.includes('/job-management') }"
              >
                岗位管理
              </router-link>
              <router-link
                to="/candidate-management"
                class="navbar__link"
                :class="{ 'navbar__link--active': route.path.includes('/candidate') }"
              >
                候选人
              </router-link>
              <router-link
                to="/exam-management"
                class="navbar__link"
                :class="{ 'navbar__link--active': route.path.includes('/exam-management') }"
              >
                考试管理
              </router-link>
            </template>
          </div>
        </div>

        <!-- Search and User Controls -->
        <div class="navbar__right">
          <!-- Search Box -->
          <div class="navbar__search">
            <div class="search-box">
              <el-input v-model="searchQuery" placeholder="搜索" class="search-input" clearable>
                <template #suffix>
                  <el-icon class="search-icon"><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </div>

          <!-- Login/User Profile -->
          <div class="navbar__user">
            <template v-if="isLoggedIn">
              <el-dropdown trigger="click">
                <div class="navbar__user-info">
                  <el-avatar :size="32" :src="userAvatar" />
                  <span class="navbar__username">{{ userName }}</span>
                  <span class="role-tag" :class="isJobSeeker ? 'seeker' : 'interviewer'">
                    {{ isJobSeeker ? '求职者' : '面试官' }}
                  </span>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="router.push('/profile')">个人中心</el-dropdown-item>

                    <!-- 求职者菜单项 -->
                    <template v-if="isJobSeeker">
                      <el-dropdown-item @click="router.push('/my-exams')"
                        >我的考试</el-dropdown-item
                      >
                      <el-dropdown-item @click="router.push('/favorites')"
                        >我的收藏</el-dropdown-item
                      >
                      <el-dropdown-item @click="router.push('/resume')">我的简历</el-dropdown-item>
                      <el-dropdown-item @click="router.push('/applications')"
                        >应聘进度</el-dropdown-item
                      >
                    </template>

                    <!-- 面试官菜单项 -->
                    <template v-else>
                      <el-dropdown-item @click="router.push('/job-management')"
                        >岗位管理</el-dropdown-item
                      >
                      <el-dropdown-item @click="router.push('/candidate-management')"
                        >候选人管理</el-dropdown-item
                      >
                      <el-dropdown-item @click="router.push('/exam-management')"
                        >考试管理</el-dropdown-item
                      >
                      <el-dropdown-item @click="router.push('/private-exams')"
                        >专属试卷管理</el-dropdown-item
                      >
                      <el-dropdown-item @click="router.push('/interview-schedule')"
                        >面试安排</el-dropdown-item
                      >
                    </template>

                    <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
            <template v-else>
              <div class="login-register-btn" @click="goToLogin">
                <span>登录 / 注册</span>
              </div>
            </template>
          </div>

          <!-- Mobile menu button -->
          <div class="navbar__mobile-menu">
            <el-button type="text" @click="toggleMobileMenu" class="navbar__hamburger">
              <el-icon><Menu /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div class="navbar__mobile-dropdown" v-show="mobileMenuOpen">
      <div class="navbar__mobile-links">
        <router-link
          to="/"
          class="navbar__mobile-link"
          :class="{ 'navbar__mobile-link--active': route.path === '/' }"
        >
          首页
        </router-link>
        <router-link
          to="/question-bank"
          class="navbar__mobile-link"
          :class="{ 'navbar__mobile-link--active': route.path === '/question-bank' }"
        >
          题库
        </router-link>

        <!-- 求职者导航链接 -->
        <template v-if="isJobSeeker">
          <router-link
            to="/recruitment"
            class="navbar__mobile-link"
            :class="{ 'navbar__mobile-link--active': route.path === '/recruitment' }"
          >
            招聘
          </router-link>
          <router-link
            to="/online-exam"
            class="navbar__mobile-link"
            :class="{ 'navbar__mobile-link--active': route.path === '/online-exam' }"
          >
            在线考试
          </router-link>
        </template>

        <!-- 面试官导航链接 -->
        <template v-else-if="isInterviewer">
          <router-link
            to="/job-management"
            class="navbar__mobile-link"
            :class="{ 'navbar__mobile-link--active': route.path.includes('/job-management') }"
          >
            岗位管理
          </router-link>
          <router-link
            to="/candidate-management"
            class="navbar__mobile-link"
            :class="{ 'navbar__mobile-link--active': route.path.includes('/candidate') }"
          >
            候选人
          </router-link>
          <router-link
            to="/exam-management"
            class="navbar__mobile-link"
            :class="{ 'navbar__mobile-link--active': route.path.includes('/exam-management') }"
          >
            考试管理
          </router-link>
          <router-link
            to="/private-exams"
            class="navbar__mobile-link"
            :class="{ 'navbar__mobile-link--active': route.path.includes('/private-exams') }"
          >
            专属试卷
          </router-link>
        </template>

        <!-- Mobile search -->
        <div class="navbar__mobile-search">
          <div class="search-box">
            <el-input v-model="searchQuery" placeholder="搜索" class="search-input" clearable>
              <template #suffix>
                <el-icon class="search-icon"><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Page content -->
  <div class="main-content">
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search, Menu } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { isLoggedIn, userInfo, userRole, isJobSeeker, isInterviewer } = storeToRefs(userStore)

// 使用 Pinia store 的状态
const userName = computed(() => userStore.userInfo?.username || '')
// 头像使用纯前端生成的SVG，不需要后端存储，根据用户名动态生成
const userAvatar = computed(() => userStore.avatarUrl)

const searchQuery = ref('')
const mobileMenuOpen = ref(false)

// 导航菜单类型
const navActiveIndex = ref('/')

// 导航菜单项
const navItems = computed(() => {
  // 基本菜单项
  const baseItems = [{ index: '/', name: '首页' }]

  // 根据用户登录状态添加不同菜单
  if (isLoggedIn.value) {
    // 所有用户都可以看到题库
    baseItems.push({ index: '/question-bank', name: '题库' })

    // 添加特定用户菜单
    if (isJobSeeker.value) {
      baseItems.push(
        { index: '/my-exams', name: '我的考试' },
        { index: '/recruitment', name: '招聘岗位' }
      )
    } else if (isInterviewer.value) {
      baseItems.push(
        { index: '/job-management', name: '岗位管理' },
        { index: '/candidate-management', name: '候选人管理' },
        { index: '/exam-management', name: '考试管理' },
        { index: '/private-exams', name: '专属试卷管理' }
      )
    }
  }

  return baseItems
})

// 处理菜单点击
const handleSelect = key => {
  navActiveIndex.value = key
  router.push(key)
}

// 检查用户是否已登录
const checkLoginStatus = async () => {
  if (userStore.token && !userStore.userInfo?.id) {
    try {
      await userStore.getInfo()
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果获取用户信息失败，清除token避免反复请求
      userStore.clearToken()
      userStore.clearUserInfo()
    }
  }
}

// Toggle mobile menu
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

// Logout function - 使用 Pinia store 的登出方法
const logout = () => {
  userStore.logout() // 这个方法会清除token并重定向
}

// 去登录页
const goToLogin = () => {
  router.push('/login')
}

// Navigation bar scroll animation
const isNavbar = ref(true) // Control navbar visibility
const lastScrollTop = ref(0) // Record last scroll position
const backgroundFlag = ref(false) // Control navbar background color

const handleScroll = () => {
  const scrollTop = window.scrollY
  if (scrollTop > lastScrollTop.value) {
    isNavbar.value = false
  } else {
    isNavbar.value = true
    if (scrollTop > 50) {
      backgroundFlag.value = true
    } else {
      backgroundFlag.value = false
    }
  }
  lastScrollTop.value = scrollTop
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)

  // 检查登录状态
  checkLoginStatus()

  navActiveIndex.value = router.currentRoute.value.path
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="less" scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  transition: all 0.3s ease;
  background-color: transparent;

  &--with-bg {
    background-color: #fff;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }

  &--hidden {
    transform: translateY(-100%);
  }

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;

    @media (max-width: 1200px) {
      padding: 0 2rem;
    }
  }

  &__content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 72px;
  }

  &__left {
    display: flex;
    align-items: center;
  }

  &__logo {
    display: flex;
    align-items: center;
    cursor: pointer;

    img {
      height: 36px;
      width: auto;
    }

    &-text {
      font-size: 1.35rem;
      font-weight: 600;
      margin-left: 10px;
      background: linear-gradient(120deg, #0047ff, #00b7ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  &__links {
    display: flex;
    margin-left: 48px;

    @media (max-width: 768px) {
      display: none;
    }
  }

  &__link {
    position: relative;
    padding: 0 20px;
    font-size: 16px;
    color: #333;
    line-height: 72px;
    text-decoration: none;
    transition: all 0.3s;

    &:hover {
      color: #0060ff;
    }

    &--active {
      color: #0060ff;
      font-weight: 500;

      &:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 20px;
        right: 20px;
        height: 3px;
        background: #0060ff;
        border-radius: 3px 3px 0 0;
      }
    }
  }

  &__right {
    display: flex;
    align-items: center;
  }

  &__search {
    margin-right: 20px;
    width: 240px;

    @media (max-width: 1024px) {
      width: 200px;
    }

    @media (max-width: 768px) {
      display: none;
    }

    .search-box {
      width: 100%;

      .search-input {
        :deep(.el-input__suffix) {
          right: 5px;

          .search-icon {
            cursor: pointer;

            &:hover {
              color: #409eff;
            }
          }
        }
      }
    }
  }

  &__user {
    display: flex;
    align-items: center;

    &-info {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    &name {
      margin-left: 8px;
      font-size: 14px;
      color: #333;
    }
  }

  .login-register-btn {
    padding: 8px 20px;
    border-radius: 20px;
    font-size: 14px;
    color: #333;
    border: 1px solid #666;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;

    i {
      margin-right: 5px;
      font-size: 16px;
    }

    &:hover {
      color: #0060ff;
      border-color: #0060ff;
      background-color: rgba(0, 96, 255, 0.05);

      i {
        color: #0060ff;
      }
    }
  }

  &__mobile-menu {
    display: none;
    margin-left: 16px;

    @media (max-width: 768px) {
      display: block;
    }
  }

  &__hamburger {
    font-size: 24px;
    color: #333;
  }

  &__mobile-dropdown {
    width: 100%;
    background: white;
    border-top: 1px solid #eee;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    @media (min-width: 769px) {
      display: none;
    }
  }

  &__mobile-links {
    padding: 12px 0;
  }

  &__mobile-link {
    display: block;
    padding: 12px 1.5rem;
    font-size: 16px;
    color: #333;
    text-decoration: none;
    border-left: 3px solid transparent;
    transition: all 0.3s;

    &:hover {
      background-color: #f5f7fa;
      color: #0060ff;
    }

    &--active {
      color: #0060ff;
      font-weight: 500;
      border-left-color: #0060ff;
      background-color: #f0f7ff;
    }
  }

  &__mobile-search {
    padding: 12px 1.5rem;

    .search-box {
      width: 100%;

      .search-input {
        :deep(.el-input__inner) {
          height: 36px;
          border-radius: 8px;
          background-color: #f5f7fa;
          border: none;
          padding-right: 35px;
          transition: all 0.3s;

          &:focus,
          &:hover {
            background-color: #edf2fc;
            box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.2);
          }
        }

        :deep(.el-input__suffix) {
          right: 5px;

          .search-icon {
            font-size: 16px;
            color: #909399;
            cursor: pointer;
            padding: 0 8px;

            &:hover {
              color: #409eff;
            }
          }
        }
      }
    }
  }
}

.main-content {
  padding-top: 72px;
}

.role-tag {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 6px;

  &.seeker {
    background-color: #e6f7ff;
    color: #1890ff;
    border: 1px solid #91d5ff;
  }

  &.interviewer {
    background-color: #f6ffed;
    color: #52c41a;
    border: 1px solid #b7eb8f;
  }
}
</style>
