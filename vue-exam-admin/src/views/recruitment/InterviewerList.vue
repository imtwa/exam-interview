<template>
  <div class="interviewer-list-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>面试官管理</span>
        </div>
      </template>

      <CommonCrudTable
        :loading="loading"
        :data="tableData"
        :total="total"
        :columns="columns"
        :searchForm="searchForm"
        :page="page"
        :size="size"
        @search="handleSearch"
        @reset="handleReset"
        @sizeChange="handleSizeChange"
        @currentChange="handleCurrentChange"
        @add="handleAdd"
      >
        <template #searchItems>
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="searchForm.keyword" placeholder="姓名/职位/邮箱" clearable />
          </el-form-item>
          <el-form-item label="公司" prop="companyId">
            <el-select v-model="searchForm.companyId" placeholder="请选择公司" clearable>
              <el-option
                v-for="company in companyOptions"
                :key="company.id"
                :label="company.name"
                :value="company.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="认证状态" prop="verificationStatus">
            <el-select v-model="searchForm.verificationStatus" placeholder="认证状态" clearable>
              <el-option label="未认证" value="PENDING" />
              <el-option label="已认证" value="VERIFIED" />
              <el-option label="已拒绝" value="REJECTED" />
            </el-select>
          </el-form-item>
        </template>

        <template #toolbar>
          <el-button type="primary" @click="handleAdd">新增面试官</el-button>
        </template>

        <template #operation="{ row }">
          <el-button type="primary" link @click="handleView(row)">查看</el-button>
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          <el-dropdown @command="(command) => handleVerify(row, command)">
            <el-button type="warning" link>认证</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="VERIFIED">通过认证</el-dropdown-item>
                <el-dropdown-item command="REJECTED">拒绝认证</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </CommonCrudTable>
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
    <el-dialog v-model="viewDialogVisible" title="面试官详情" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户名">{{ viewData.username }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ viewData.email }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{
          formatGender(viewData.gender)
        }}</el-descriptions-item>
        <el-descriptions-item label="职位">{{ viewData.position }}</el-descriptions-item>
        <el-descriptions-item label="公司">{{ viewData.company?.name }}</el-descriptions-item>
        <el-descriptions-item label="认证状态">{{
          formatVerificationStatus(viewData.verificationStatus)
        }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{
          formatDate(viewData.createdAt)
        }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{
          formatDate(viewData.updatedAt)
        }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { InterviewerService, CompanyService } from '@/api/userApi'
  import type { Interviewer, Company } from '@/api/model/userModel'
  import CommonCrudTable from '@/components/CommonCrudTable.vue'

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
    verificationStatus: undefined as string | undefined
  })

  // 表格列配置
  const columns = [
    { prop: 'id', label: 'ID', width: '80px' },
    { prop: 'user.username', label: '用户名' },
    { prop: 'user.email', label: '邮箱' },
    { prop: 'position', label: '职位' },
    {
      prop: 'company.name',
      label: '公司',
      formatter: (row: Interviewer) => row.company?.name || '-'
    },
    {
      prop: 'verificationStatus',
      label: '认证状态',
      formatter: (row: Interviewer) => formatVerificationStatus(row.verificationStatus)
    },
    {
      prop: 'createdAt',
      label: '创建时间',
      formatter: (row: Interviewer) => formatDate(row.createdAt)
    }
  ]

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
      const params = {
        page: page.value,
        size: size.value,
        keyword: searchForm.keyword || undefined,
        companyId: searchForm.companyId,
        verificationStatus: searchForm.verificationStatus
      }
      const res = await InterviewerService.getInterviewerList(params)
      if (res.code === 200) {
        tableData.value = res.data || []
        total.value = res.total || 0
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

  // 加载公司下拉选项
  const fetchCompanies = async () => {
    try {
      const res = await CompanyService.getCompanyList({ page: 1, size: 100 })
      if (res.code === 200) {
        companyOptions.value = res.data || []
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
      PENDING: '未认证',
      VERIFIED: '已认证',
      REJECTED: '已拒绝'
    }
    return map[status] || status
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

  const handleVerify = async (row: Interviewer, status: string) => {
    try {
      const res = await InterviewerService.updateVerificationStatus(
        row.id!,
        status as 'VERIFIED' | 'REJECTED'
      )
      if (res.code === 200) {
        ElMessage.success(`${status === 'VERIFIED' ? '认证通过' : '拒绝认证'}成功`)
        fetchInterviewers()
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    } catch (error) {
      console.error('更新认证状态错误:', error)
      ElMessage.error('操作失败')
    }
  }

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
