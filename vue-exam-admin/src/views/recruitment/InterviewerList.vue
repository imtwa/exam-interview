<template>
  <div class="interviewer-list-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>面试官管理</span>
        </div>
      </template>

      <el-row class="mb-4">
        <el-col :span="6">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入姓名/职位/邮箱"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4" class="ml-4">
          <el-select
            v-model="searchForm.verificationStatus"
            placeholder="认证状态"
            clearable
            @change="handleSearch"
          >
            <el-option label="待认证" value="PENDING" />
            <el-option label="已认证" value="VERIFIED" />
            <el-option label="已拒绝" value="REJECTED" />
          </el-select>
        </el-col>
        <el-col :span="4" class="ml-4">
          <el-select
            v-model="searchForm.companyId"
            placeholder="选择公司"
            clearable
            @change="handleSearch"
          >
            <el-option
              v-for="company in companyOptions"
              :key="company.id"
              :label="company.name"
              :value="company.id"
            />
          </el-select>
        </el-col>
        <el-col :span="6" class="ml-4">
          <el-button type="primary" @click="handleAdd">新增面试官</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-col>
      </el-row>

      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户名" min-width="120">
          <template #default="{ row }">
            {{ row.user?.username || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="邮箱" min-width="180">
          <template #default="{ row }">
            {{ row.user?.email || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="position" label="职位" min-width="120" />
        <el-table-column label="公司" min-width="150">
          <template #default="{ row }">
            {{ row.company?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="性别" width="80">
          <template #default="{ row }">
            {{ formatGender(row.gender) }}
          </template>
        </el-table-column>
        <el-table-column label="认证状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.verificationStatus)">
              {{ formatVerificationStatus(row.verificationStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button type="success" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              v-if="row.verificationStatus === 'PENDING'"
              type="warning"
              size="small"
              @click="handleVerify(row)"
            >
              认证
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑面试官对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增面试官' : '编辑面试官'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
        class="interviewer-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input v-model="formData.password" placeholder="请输入密码" type="password" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="formData.gender" placeholder="请选择性别">
            <el-option label="男" value="MALE" />
            <el-option label="女" value="FEMALE" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="formData.position" placeholder="请输入职位" />
        </el-form-item>
        <el-form-item label="公司" prop="companyId">
          <el-select v-model="formData.companyId" placeholder="请选择公司">
            <el-option
              v-for="company in companyOptions"
              :key="company.id"
              :label="company.name"
              :value="company.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="认证状态" prop="verificationStatus">
          <el-select v-model="formData.verificationStatus" placeholder="认证状态">
            <el-option label="未认证" value="PENDING" />
            <el-option label="已认证" value="VERIFIED" />
            <el-option label="已拒绝" value="REJECTED" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看面试官详情对话框 -->
    <el-dialog v-model="viewDialogVisible" title="面试官详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ viewData.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ viewData.username }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ viewData.email }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{
          formatGender(viewData.gender)
        }}</el-descriptions-item>
        <el-descriptions-item label="职位">{{ viewData.position }}</el-descriptions-item>
        <el-descriptions-item label="公司">{{ viewData.company?.name }}</el-descriptions-item>
        <el-descriptions-item label="认证状态">
          <el-tag :type="getStatusType(viewData.verificationStatus)">
            {{ formatVerificationStatus(viewData.verificationStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{
          formatDate(viewData.createdAt)
        }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{
          formatDate(viewData.updatedAt)
        }}</el-descriptions-item>
      </el-descriptions>
      <div class="action-buttons">
        <el-button type="primary" @click="handleViewJobs">查看发布的职位</el-button>
        <el-button type="success" @click="handleViewApplications">查看收到的申请</el-button>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 认证对话框 -->
    <el-dialog v-model="verifyDialogVisible" title="面试官认证" width="500px">
      <el-form ref="verifyFormRef" :model="verifyForm" label-width="100px">
        <el-form-item label="认证结果" prop="status">
          <el-radio-group v-model="verifyForm.status">
            <el-radio label="VERIFIED">通过</el-radio>
            <el-radio label="REJECTED">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="原因" prop="reason" v-if="verifyForm.status === 'REJECTED'">
          <el-input
            v-model="verifyForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="verifyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitVerify" :loading="submitLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { Search } from '@element-plus/icons-vue'
  import { InterviewerService } from '@/api/interviewerService'
import { CompanyService } from '@/api/companyService'
  import type { Interviewer, Company } from '@/api/model/userModel'

  // 表格数据
  const loading = ref(false)
  const tableData = ref<Interviewer[]>([])
  const total = ref(0)
  const page = ref(1)
  const size = ref(10)

  // 搜索表单
  const searchForm = reactive({
    keyword: '',
    companyId: undefined as number | undefined,
    verificationStatus: undefined as 'VERIFIED' | 'REJECTED' | 'PENDING' | undefined
  })

  // 路由
  const router = useRouter()

  // 提交加载状态
  const submitLoading = ref(false)

  // 认证相关
  const verifyDialogVisible = ref(false)
  const verifyForm = reactive({
    id: undefined as number | undefined,
    status: 'VERIFIED' as 'VERIFIED' | 'REJECTED',
    reason: ''
  })
  const verifyFormRef = ref<FormInstance>()

  // 公司选项
  const companyOptions = ref<Company[]>([])

  // 对话框相关
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const formRef = ref<FormInstance>()
  const formData = reactive({
    id: undefined as number | undefined,
    userId: undefined as number | undefined,
    username: '',
    email: '',
    password: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    position: '',
    companyId: undefined as number | undefined,
    verificationStatus: 'PENDING' as 'PENDING' | 'VERIFIED' | 'REJECTED'
  })

  // 表单验证规则
  const formRules = reactive<FormRules>({
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
    ],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
    ],
    position: [{ required: true, message: '请输入职位', trigger: 'blur' }],
    companyId: [{ required: true, message: '请选择公司', trigger: 'change' }],
    verificationStatus: [{ required: true, message: '请选择认证状态', trigger: 'change' }]
  })

  // 查看详情相关
  const viewDialogVisible = ref(false)
  const viewData = reactive<Interviewer & { username?: string; email?: string }>({
    id: 0,
    userId: 0,
    position: '',
    companyId: 0,
    company: undefined,
    verificationStatus: 'PENDING',
    username: '',
    email: ''
  })

  // 加载数据
  const fetchInterviewers = async () => {
    loading.value = true
    try {
      const params: any = {
        page: page.value,
        keyword: searchForm.keyword || undefined,
        companyId: searchForm.companyId,
        verificationStatus: searchForm.verificationStatus
      }
      const res = await InterviewerService.getInterviewerList(params)
      if (res.code === 200) {
        tableData.value = res.data.list || []
        total.value = res.data.total || 0
      } else {
        ElMessage.error(res.message || '获取面试官列表失败')
      }
    } catch (error) {
      console.error('获取面试官列表错误:', error)
      ElMessage.error('获取面试官列表失败')
    } finally {
      loading.value = false
    }
  }

  // 修复类型错误的函数
  const fixTypeErrors = () => {
    // 修复搜索下拉框中的公司选项
    const searchCompanyOptions = document.querySelectorAll(
      '.el-select[placeholder="选择公司"] .el-option'
    )
    searchCompanyOptions.forEach((option) => {
      const id = option.getAttribute('value')
      if (id === 'undefined') {
        option.setAttribute('value', '0')
      }
    })

    // 修复表单中的公司选项
    const formCompanyOptions = document.querySelectorAll(
      '.el-select[placeholder="请选择公司"] .el-option'
    )
    formCompanyOptions.forEach((option) => {
      const id = option.getAttribute('value')
      if (id === 'undefined') {
        option.setAttribute('value', '0')
      }
    })
  }

  // 加载公司下拉选项
  const fetchCompanies = async () => {
    try {
      const params: any = {
        page: 1,
        keyword: ''
      }
      const res = await CompanyService.getCompanyList(params)
      if (res.code === 200) {
        companyOptions.value = res.data.list || []
      }
    } catch (error) {
      console.error('获取公司列表错误:', error)
    }
  }

  // 格式化函数
  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleString()
  }

  const formatGender = (gender?: string) => {
    if (!gender) return '-'
    const map: Record<string, string> = {
      MALE: '男',
      FEMALE: '女',
      OTHER: '其他'
    }
    return map[gender] || gender
  }

  const formatVerificationStatus = (status?: string) => {
    if (!status) return '-'
    const map: Record<string, string> = {
      PENDING: '待认证',
      VERIFIED: '已认证',
      REJECTED: '已拒绝'
    }
    return map[status] || status
  }

  // 获取状态标签类型
  const getStatusType = (
    status?: string
  ): 'success' | 'warning' | 'info' | 'primary' | 'danger' => {
    if (!status) return 'info'

    switch (status) {
      case 'PENDING':
        return 'warning'
      case 'VERIFIED':
        return 'success'
      case 'REJECTED':
        return 'danger'
      default:
        return 'info'
    }
  }

  // 查看面试官发布的职位
  const handleViewJobs = () => {
    if (!viewData.id) return
    router.push({
      path: '/recruitment/jobs',
      query: { interviewerId: viewData.id.toString() }
    })
    viewDialogVisible.value = false
  }

  // 查看面试官收到的申请
  const handleViewApplications = () => {
    if (!viewData.id) return
    router.push({
      path: '/recruitment/applications',
      query: { interviewerId: viewData.id.toString() }
    })
    viewDialogVisible.value = false
  }

  // 处理认证
  const handleVerify = (row: Interviewer) => {
    verifyForm.id = row.id
    verifyForm.status = 'VERIFIED'
    verifyForm.reason = ''
    verifyDialogVisible.value = true
  }

  // 提交认证
  const submitVerify = async () => {
    if (!verifyForm.id) return

    submitLoading.value = true
    try {
      const res = await InterviewerService.updateVerificationStatus(
        verifyForm.id,
        verifyForm.status
      )

      if (res.code === 200) {
        ElMessage.success('认证操作成功')
        verifyDialogVisible.value = false
        fetchInterviewers()
      } else {
        ElMessage.error(res.message || '认证操作失败')
      }
    } catch (error) {
      console.error('认证面试官失败:', error)
      ElMessage.error('认证操作失败')
    } finally {
      submitLoading.value = false
    }
  }

  // 事件处理函数
  const handleSearch = () => {
    page.value = 1
    fetchInterviewers()
  }

  const handleReset = () => {
    searchForm.keyword = ''
    searchForm.companyId = undefined
    searchForm.verificationStatus = undefined
    handleSearch()
  }

  const handleSizeChange = (val: number) => {
    size.value = val
    fetchInterviewers()
  }

  const handleCurrentChange = (val: number) => {
    page.value = val
    fetchInterviewers()
  }

  const handleAdd = () => {
    dialogType.value = 'add'
    resetForm()
    dialogVisible.value = true
  }

  const handleEdit = (row: Interviewer) => {
    dialogType.value = 'edit'
    resetForm()
    formData.id = row.id
    formData.userId = row.userId
    formData.username = row.user?.username || ''
    formData.email = row.user?.email || ''
    formData.gender = row.gender || 'MALE'
    formData.position = row.position
    formData.companyId = row.companyId
    formData.verificationStatus = row.verificationStatus
    dialogVisible.value = true
  }

  const handleView = (row: Interviewer) => {
    Object.assign(viewData, row)
    viewData.username = row.user?.username || ''
    viewData.email = row.user?.email || ''
    viewDialogVisible.value = true
  }

  const handleDelete = (row: Interviewer) => {
    ElMessageBox.confirm('确认删除该面试官?', '警告', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        try {
          const res = await InterviewerService.deleteInterviewer(row.id!)
          if (res.code === 200) {
            ElMessage.success('删除成功')
            fetchInterviewers()
          } else {
            ElMessage.error(res.message || '删除失败')
          }
        } catch (error) {
          console.error('删除面试官错误:', error)
          ElMessage.error('删除失败')
        }
      })
      .catch(() => {})
  }

  // 此函数已在上面重新实现

  const resetForm = () => {
    formData.id = undefined
    formData.userId = undefined
    formData.username = ''
    formData.email = ''
    formData.password = ''
    formData.gender = 'MALE'
    formData.position = ''
    formData.companyId = undefined
    formData.verificationStatus = 'PENDING'
    if (formRef.value) {
      formRef.value.resetFields()
    }
  }

  const submitForm = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          let res
          if (dialogType.value === 'add') {
            // 创建新面试官
            const data = {
              user: {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: 'INTERVIEWER'
              },
              gender: formData.gender,
              position: formData.position,
              companyId: formData.companyId!,
              verificationStatus: formData.verificationStatus
            }
            res = await InterviewerService.createInterviewer(data as any)
          } else {
            // 更新面试官
            const data = {
              gender: formData.gender,
              position: formData.position,
              companyId: formData.companyId!,
              verificationStatus: formData.verificationStatus,
              user: {
                id: formData.userId,
                username: formData.username,
                email: formData.email,
                role: 'INTERVIEWER'
              }
            }
            res = await InterviewerService.updateInterviewer(formData.id!, data as any)
          }

          if (res.code === 200) {
            ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
            dialogVisible.value = false
            fetchInterviewers()
          } else {
            ElMessage.error(res.message || (dialogType.value === 'add' ? '添加失败' : '更新失败'))
          }
        } catch (error) {
          console.error(dialogType.value === 'add' ? '添加面试官错误:' : '更新面试官错误:', error)
          ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败')
        }
      }
    })
  }

  // 初始化
  onMounted(() => {
    fetchCompanies()
    fetchInterviewers()

    // 在DOM渲染完成后修复类型错误
    setTimeout(fixTypeErrors, 500)
  })
</script>

<style scoped>
  .interviewer-list-container {
    padding: 20px;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .interviewer-form {
    max-height: 60vh;
    overflow-y: auto;
  }
</style>
