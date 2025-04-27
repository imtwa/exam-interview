<template>
  <div class="front-user-list-page">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>前台用户管理</span>
        </div>
      </template>

      <CommonCrudTable
        :data="userList"
        :total="total"
        :loading="loading"
        search-placeholder="输入用户名/邮箱搜索"
        add-button-text="新增用户"
        @search="handleSearch"
        @add="handleAdd"
        @edit="handleEdit"
        @delete="handleDelete"
        @view="handleView"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.role === 'JOB_SEEKER' ? 'success' : 'primary'">
              {{ scope.row.role === 'JOB_SEEKER' ? '求职者' : '面试官' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="scope">{{ formatDate(scope.row.createdAt) }}</template>
        </el-table-column>
        <template #extraActions="{ row }">
          <el-button type="warning" size="small" @click="handleResetPassword(row)" :icon="Key" link>
            重置密码
          </el-button>
        </template>
      </CommonCrudTable>
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="50%"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="求职者" value="JOB_SEEKER" />
            <el-option label="面试官" value="INTERVIEWER" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="dialogType === 'add'" label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- View Dialog -->
    <el-dialog v-model="viewDialogVisible" title="用户详情" width="50%">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ currentUser?.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentUser?.username }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentUser?.email }}</el-descriptions-item>
        <el-descriptions-item label="角色">
          <el-tag :type="currentUser?.role === 'JOB_SEEKER' ? 'success' : 'primary'">
            {{ currentUser?.role === 'JOB_SEEKER' ? '求职者' : '面试官' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{
          formatDate(currentUser?.createdAt)
        }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{
          formatDate(currentUser?.updatedAt)
        }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Password Reset Dialog -->
    <el-dialog v-model="resetPasswordVisible" title="重置密码" width="30%">
      <p>确定要重置 {{ currentUser?.username }} 的密码吗？</p>
      <p v-if="newPassword" class="password-reset-result">
        新密码: <span class="new-password">{{ newPassword }}</span>
      </p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetPasswordVisible = false">取消</el-button>
          <el-button type="warning" @click="confirmResetPassword" :loading="resetPasswordLoading">
            确认重置
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { ElMessage, FormInstance, FormRules } from 'element-plus'
  import CommonCrudTable from '@/components/CommonCrudTable.vue'
  import { UserService } from '@/api/user'
  import { FrontUser } from '@/api/model/userModel'
  import { Key } from '@element-plus/icons-vue'

  // Data
  const userList = ref<FrontUser[]>([])
  const total = ref(0)
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchKeyword = ref('')

  // Form
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const form = ref<FrontUser>({
    username: '',
    email: '',
    role: 'JOB_SEEKER',
    password: ''
  })
  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  // View Dialog
  const viewDialogVisible = ref(false)
  const currentUser = ref<FrontUser | null>(null)

  // Password Reset
  const resetPasswordVisible = ref(false)
  const resetPasswordLoading = ref(false)
  const newPassword = ref('')

  // Form Rules
  const rules = ref<FormRules>({
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
    ],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
    ],
    role: [{ required: true, message: '请选择角色', trigger: 'change' }],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
    ]
  })

  // Fetch Data
  onMounted(() => {
    fetchUserList()
  })

  const fetchUserList = async () => {
    loading.value = true
    try {
      const res = await UserService.getUserList({
        page: currentPage.value,
        size: pageSize.value,
        keyword: searchKeyword.value
      })

      if (res.code === 200) {
        userList.value = res.data || []
        total.value = res.total || 0
      } else {
        ElMessage.error(res.message || '获取用户列表失败')
      }
    } catch (_) {
      ElMessage.error('获取用户列表失败')
    } finally {
      loading.value = false
    }
  }

  // Handlers
  const handleSearch = (params: { keyword: string; page: number; pageSize: number }) => {
    searchKeyword.value = params.keyword
    currentPage.value = params.page
    pageSize.value = params.pageSize
    fetchUserList()
  }

  const handlePageChange = (params: { page: number; pageSize: number }) => {
    currentPage.value = params.page
    pageSize.value = params.pageSize
    fetchUserList()
  }

  const handleSizeChange = (params: { page: number; pageSize: number }) => {
    currentPage.value = params.page
    pageSize.value = params.pageSize
    fetchUserList()
  }

  const handleAdd = () => {
    dialogType.value = 'add'
    form.value = {
      username: '',
      email: '',
      role: 'JOB_SEEKER',
      password: ''
    }
    dialogVisible.value = true
  }

  const handleEdit = (row: FrontUser) => {
    dialogType.value = 'edit'
    form.value = {
      id: row.id,
      username: row.username,
      email: row.email,
      role: row.role
    }
    dialogVisible.value = true
  }

  const handleView = (row: FrontUser) => {
    currentUser.value = row
    viewDialogVisible.value = true
  }

  const handleDelete = async (row: FrontUser) => {
    try {
      const res = await UserService.deleteUser(row.id!)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchUserList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (_) {
      ElMessage.error('删除失败')
    }
  }

  const handleResetPassword = (row: FrontUser) => {
    currentUser.value = row
    newPassword.value = ''
    resetPasswordVisible.value = true
  }

  const confirmResetPassword = async () => {
    if (!currentUser.value?.id) return

    resetPasswordLoading.value = true
    try {
      const res = await UserService.resetPassword(currentUser.value.id)
      if (res.code === 200) {
        ElMessage.success('密码重置成功')
        newPassword.value = res.data
      } else {
        ElMessage.error(res.message || '密码重置失败')
      }
    } catch (_) {
      ElMessage.error('密码重置失败')
    } finally {
      resetPasswordLoading.value = false
    }
  }

  const submitForm = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true
        try {
          let res
          if (dialogType.value === 'add') {
            // 创建新用户
            res = await UserService.createUser(form.value)
          } else {
            // 更新用户
            const { id, ...updateData } = form.value
            res = await UserService.updateUser(id!, updateData)
          }

          if (res.code === 200) {
            ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
            dialogVisible.value = false
            fetchUserList()
          } else {
            ElMessage.error(res.message || (dialogType.value === 'add' ? '添加失败' : '更新失败'))
          }
        } catch (_) {
          ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败')
        } finally {
          submitLoading.value = false
        }
      }
    })
  }

  // Utils
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-'
    if (typeof date === 'string') {
      return new Date(date).toLocaleString()
    }
    return date.toLocaleString()
  }
</script>

<style scoped>
  .front-user-list-page {
    padding: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .password-reset-result {
    margin-top: 20px;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 4px;
  }

  .new-password {
    font-weight: bold;
    color: #409eff;
  }
</style>
