<template>
  <div class="interviewer-list-page">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>面试官管理</span>
        </div>
      </template>

      <CommonCrudTable
        :data="interviewerList"
        :total="total"
        :loading="loading"
        search-placeholder="输入面试官姓名/公司名称搜索"
        @search="handleSearch"
        @add="handleAdd"
        @edit="handleEdit"
        @view="handleView"
        @delete="handleDelete"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户名" min-width="120">
          <template #default="scope">
            {{ scope.row.user?.username }}
          </template>
        </el-table-column>
        <el-table-column label="邮箱" min-width="180">
          <template #default="scope">
            {{ scope.row.user?.email }}
          </template>
        </el-table-column>
        <el-table-column prop="position" label="职位" min-width="120" />
        <el-table-column label="公司" min-width="150">
          <template #default="scope">
            {{ scope.row.company?.name }}
          </template>
        </el-table-column>
        <el-table-column label="认证状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.verificationStatus) || 'info'">
              {{ getStatusText(scope.row.verificationStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <template #extraActions="{ row }">
          <el-button
            v-if="row.verificationStatus === 'PENDING'"
            type="success"
            size="small"
            @click="handleVerify(row, 'VERIFIED')"
            link
          >
            通过
          </el-button>
          <el-button
            v-if="row.verificationStatus === 'PENDING'"
            type="danger"
            size="small"
            @click="handleVerify(row, 'REJECTED')"
            link
          >
            拒绝
          </el-button>
        </template>
      </CommonCrudTable>
    </el-card>

    <!-- 添加/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑面试官' : '添加面试官'"
      width="50%"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="form.gender" placeholder="请选择性别" style="width: 100%">
            <el-option label="男" value="MALE" />
            <el-option label="女" value="FEMALE" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="form.position" />
        </el-form-item>
        <el-form-item label="所属公司" prop="companyId">
          <el-select v-model="form.companyId" placeholder="请选择公司" style="width: 100%">
            <el-option
              v-for="item in companies"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="认证状态" prop="verificationStatus">
          <el-select v-model="form.verificationStatus" placeholder="请选择认证状态" style="width: 100%">
            <el-option label="待认证" value="PENDING" />
            <el-option label="已认证" value="VERIFIED" />
            <el-option label="已拒绝" value="REJECTED" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看详情弹窗 -->
    <el-dialog v-model="viewDialogVisible" title="面试官详情" width="60%">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID" :span="1">{{ currentInterviewer?.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名" :span="1">
          {{ currentInterviewer?.user?.username }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱" :span="1">
          {{ currentInterviewer?.user?.email }}
        </el-descriptions-item>
        <el-descriptions-item label="性别" :span="1">
          {{ getGenderText(currentInterviewer?.gender) }}
        </el-descriptions-item>
        <el-descriptions-item label="职位" :span="1">
          {{ currentInterviewer?.position }}
        </el-descriptions-item>
        <el-descriptions-item label="所属公司" :span="1">
          {{ currentInterviewer?.company?.name }}
        </el-descriptions-item>
        <el-descriptions-item label="认证状态" :span="1">
          <el-tag :type="getStatusType(currentInterviewer?.verificationStatus) || 'info'">
            {{ getStatusText(currentInterviewer?.verificationStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="1">
          {{ formatDate(currentInterviewer?.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="最后更新" :span="1">
          {{ formatDate(currentInterviewer?.updatedAt) }}
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleViewDetails">查看详细</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import CommonCrudTable from '@/components/CommonCrudTable.vue'
import { InterviewerService, CompanyService } from '@/api/userApi'
import { Interviewer, Company } from '@/api/model/userModel'

const router = useRouter()

// 数据列表
const interviewerList = ref<Interviewer[]>([])
const total = ref(0)
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')

// 公司列表
const companies = ref<Company[]>([])

// 表单数据
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({
  id: '',
  username: '',
  email: '',
  password: '',
  gender: '',
  position: '',
  companyId: '',
  verificationStatus: 'PENDING'
})

// 表单验证规则
const rules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  position: [{ required: true, message: '请输入职位', trigger: 'blur' }],
  companyId: [{ required: true, message: '请选择公司', trigger: 'change' }],
  verificationStatus: [{ required: true, message: '请选择认证状态', trigger: 'change' }]
})

// 详情弹窗
const viewDialogVisible = ref(false)
const currentInterviewer = ref<Interviewer | null>(null)

// 初始化
onMounted(() => {
  fetchData()
  fetchCompanies()
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await InterviewerService.getInterviewerList({
      page: currentPage.value,
      size: pageSize.value,
      keyword: searchKeyword.value
    })

    if (res.code === 200) {
      interviewerList.value = res.data || []
      total.value = res.total || 0
    } else {
      ElMessage.error(res.message || '获取面试官列表失败')
    }
  } catch (error) {
    console.error('获取面试官列表失败', error)
    ElMessage.error('获取面试官列表失败')
  } finally {
    loading.value = false
  }
}

// 获取公司列表
const fetchCompanies = async () => {
  try {
    const res = await CompanyService.getCompanyList({
      page: 1,
      size: 100
    })

    if (res.code === 200) {
      companies.value = res.data || []
    }
  } catch (error) {
    console.error('获取公司列表失败', error)
  }
}

// 处理搜索
const handleSearch = (keyword: string) => {
  searchKeyword.value = keyword
  currentPage.value = 1
  fetchData()
}

// 处理分页
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchData()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchData()
}

// 添加面试官
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑面试官
const handleEdit = (row: Interviewer) => {
  isEdit.value = true
  resetForm()

  form.id = row.id?.toString() || ''
  form.username = row.user?.username || ''
  form.email = row.user?.email || ''
  form.gender = row.gender || ''
  form.position = row.position || ''
  form.companyId = row.companyId?.toString() || ''
  form.verificationStatus = row.verificationStatus || 'PENDING'

  dialogVisible.value = true
}

// 查看面试官
const handleView = (row: Interviewer) => {
  currentInterviewer.value = row
  viewDialogVisible.value = true
}

// 查看详细信息
const handleViewDetails = () => {
  if (!currentInterviewer.value?.id) return
  router.push(`/user/interviewer/${currentInterviewer.value.id}`)
  viewDialogVisible.value = false
}

// 删除面试官
const handleDelete = (row: Interviewer) => {
  ElMessageBox.confirm('确定要删除此面试官吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await InterviewerService.deleteInterviewer(row.id!)
        if (res.code === 200) {
          ElMessage.success('删除成功')
          fetchData()
        } else {
          ElMessage.error(res.message || '删除失败')
        }
      } catch (error) {
        console.error('删除面试官失败', error)
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {
      // 用户取消删除
    })
}

// 认证处理
const handleVerify = async (row: Interviewer, status: 'VERIFIED' | 'REJECTED') => {
  try {
    const res = await InterviewerService.updateVerificationStatus(row.id!, status)
    if (res.code === 200) {
      ElMessage.success(status === 'VERIFIED' ? '已通过认证' : '已拒绝认证')
      fetchData()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('更新认证状态失败', error)
    ElMessage.error('操作失败')
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      let res
      const data = {
        username: form.username,
        email: form.email,
        password: isEdit.value ? undefined : form.password,
        gender: form.gender,
        position: form.position,
        companyId: Number(form.companyId),
        verificationStatus: form.verificationStatus
      }

      if (isEdit.value) {
        res = await InterviewerService.updateInterviewer(Number(form.id), data)
      } else {
        res = await InterviewerService.createInterviewer(data)
      }

      if (res.code === 200) {
        ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
        dialogVisible.value = false
        fetchData()
      } else {
        ElMessage.error(res.message || (isEdit.value ? '更新失败' : '添加失败'))
      }
    } catch (error) {
      console.error('保存面试官失败', error)
      ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  form.id = ''
  form.username = ''
  form.email = ''
  form.password = ''
  form.gender = ''
  form.position = ''
  form.companyId = ''
  form.verificationStatus = 'PENDING'
}

// 格式化日期
const formatDate = (date: string | undefined) => {
  if (!date) return '--'
  return new Date(date)
    .toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    .replace(/\//g, '-')
}

// 获取性别文本
const getGenderText = (gender: string | undefined) => {
  if (!gender) return '--'
  const map: Record<string, string> = {
    MALE: '男',
    FEMALE: '女',
    OTHER: '其他'
  }
  return map[gender] || '--'
}

// 获取状态文本
const getStatusText = (status: string | undefined) => {
  if (!status) return '--'
  const map: Record<string, string> = {
    PENDING: '待认证',
    VERIFIED: '已认证',
    REJECTED: '已拒绝'
  }
  return map[status] || '--'
}

// 获取状态类型
const getStatusType = (status: string | undefined) => {
  if (!status) return ''
  const map: Record<string, string> = {
    PENDING: 'warning',
    VERIFIED: 'success',
    REJECTED: 'danger'
  }
  return map[status] || ''
}
</script>

<style scoped>
.interviewer-list-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 