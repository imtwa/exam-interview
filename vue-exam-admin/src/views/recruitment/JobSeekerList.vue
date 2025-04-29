<template>
  <div class="job-seeker-list-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>求职者管理</span>
        </div>
      </template>

      <el-row class="mb-4">
        <el-col :span="6">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入姓名/邮箱/期望职位"
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
            v-model="searchForm.gender"
            placeholder="性别"
            clearable
            @change="handleSearch"
          >
            <el-option label="男" value="MALE" />
            <el-option label="女" value="FEMALE" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </el-col>
        <el-col :span="4" class="ml-4">
          <el-select
            v-model="searchForm.expectedWorkCity"
            placeholder="期望工作城市"
            clearable
            @change="handleSearch"
          >
            <el-option v-for="city in cityOptions" :key="city" :label="city" :value="city" />
          </el-select>
        </el-col>
        <el-col :span="6" class="ml-4">
          <el-button type="primary" @click="handleAdd">新增求职者</el-button>
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
        <el-table-column label="性别" width="80">
          <template #default="{ row }">
            {{ formatGender(row.gender) }}
          </template>
        </el-table-column>
        <el-table-column label="期望职位" min-width="150">
          <template #default="{ row }">
            {{ row.expectedPosition || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="期望薪资" width="120">
          <template #default="{ row }">
            {{ row.expectedSalary ? `${row.expectedSalary}K` : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="期望城市" width="120">
          <template #default="{ row }">
            {{ row.expectedWorkCity || '-' }}
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

    <!-- 新增/编辑求职者对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑求职者' : '新增求职者'" width="600px">
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
        class="job-seeker-form"
      >
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item label="密码" prop="password" v-if="!isEdit">
              <el-input v-model="form.password" type="password" placeholder="请输入密码" />
            </el-form-item>
            <el-form-item label="性别" prop="gender">
              <el-select v-model="form.gender" placeholder="请选择性别">
                <el-option label="男" value="MALE" />
                <el-option label="女" value="FEMALE" />
                <el-option label="其他" value="OTHER" />
              </el-select>
            </el-form-item>
            <el-form-item label="出生日期" prop="birthday">
              <el-date-picker
                v-model="form.birthday"
                type="date"
                placeholder="请选择出生日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            <el-form-item label="地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入地址" />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="求职意向" name="intention">
            <el-form-item label="期望职位" prop="expectedPosition">
              <el-input v-model="form.expectedPosition" placeholder="请输入期望职位" />
            </el-form-item>
            <el-form-item label="期望薪资" prop="expectedSalary">
              <el-input-number
                v-model="form.expectedSalary"
                :min="0"
                :precision="1"
                :step="1"
                placeholder="请输入期望薪资(K)"
              />
            </el-form-item>
            <el-form-item label="当前薪资" prop="currentSalary">
              <el-input-number
                v-model="form.currentSalary"
                :min="0"
                :precision="1"
                :step="1"
                placeholder="请输入当前薪资(K)"
              />
            </el-form-item>
            <el-form-item label="期望城市" prop="expectedWorkCity">
              <el-select
                v-model="form.expectedWorkCity"
                placeholder="请选择期望工作城市"
                filterable
              >
                <el-option v-for="city in cityOptions" :key="city" :label="city" :value="city" />
              </el-select>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看求职者详情对话框 -->
    <el-dialog v-model="viewDialogVisible" title="求职者详情" width="700px">
      <el-tabs v-model="viewActiveTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID">{{ viewData.id }}</el-descriptions-item>
            <el-descriptions-item label="用户名">{{ viewData.username }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ viewData.email }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{
              formatGender(viewData.gender)
            }}</el-descriptions-item>
            <el-descriptions-item label="出生日期">{{
              formatDate(viewData.birthday)
            }}</el-descriptions-item>
            <el-descriptions-item label="地址">{{ viewData.address || '-' }}</el-descriptions-item>
            <el-descriptions-item label="期望职位">{{
              viewData.expectedPosition || '-'
            }}</el-descriptions-item>
            <el-descriptions-item label="期望薪资">
              {{ viewData.expectedSalary ? `${viewData.expectedSalary}K` : '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="当前薪资">
              {{ viewData.currentSalary ? `${viewData.currentSalary}K` : '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="期望城市">{{
              viewData.expectedWorkCity || '-'
            }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{
              formatDate(viewData.createdAt)
            }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{
              formatDate(viewData.updatedAt)
            }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
        <el-tab-pane label="教育经历" name="education">
          <div v-if="viewData.education && viewData.education.length > 0">
            <el-timeline>
              <el-timeline-item
                v-for="edu in viewData.education"
                :key="edu.id"
                :timestamp="`${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`"
                placement="top"
              >
                <el-card>
                  <h4>{{ edu.school }}</h4>
                  <p>专业: {{ edu.major }}</p>
                  <p>学历: {{ edu.degree }}</p>
                  <p>描述: {{ edu.description || '-' }}</p>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
          <el-empty v-else description="暂无教育经历" />
        </el-tab-pane>
        <el-tab-pane label="工作经历" name="work">
          <div v-if="viewData.workExperience && viewData.workExperience.length > 0">
            <el-timeline>
              <el-timeline-item
                v-for="work in viewData.workExperience"
                :key="work.id"
                :timestamp="`${formatDate(work.startDate)} - ${formatDate(work.endDate)}`"
                placement="top"
              >
                <el-card>
                  <h4>{{ work.company }}</h4>
                  <p>职位: {{ work.position }}</p>
                  <p>描述: {{ work.description || '-' }}</p>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
          <el-empty v-else description="暂无工作经历" />
        </el-tab-pane>
        <el-tab-pane label="申请记录" name="applications">
          <el-table :data="viewData.applications || []" border style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column label="职位" min-width="150">
              <template #default="{ row }">
                {{ row.job?.title || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="公司" min-width="150">
              <template #default="{ row }">
                {{ row.job?.company?.name || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getApplicationStatusType(row.status)">
                  {{ formatApplicationStatus(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="appliedAt" label="申请时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.appliedAt) }}
              </template>
            </el-table-column>
          </el-table>
          <el-empty
            v-if="!viewData.applications || viewData.applications.length === 0"
            description="暂无申请记录"
          />
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleViewResume">查看简历</el-button>
        </div>
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
  import { JobSeekerService, UserService } from '@/api/userApi'
  import type { JobSeeker, WorkExperience, Education, JobApplication } from '@/api/model/userModel'

  const router = useRouter()

  // 数据列表
  const tableData = ref<JobSeeker[]>([])
  const total = ref(0)
  const loading = ref(false)
  const page = ref(1)
  const size = ref(10)

  // 搜索表单
  const searchForm = reactive({
    keyword: '',
    gender: undefined as 'MALE' | 'FEMALE' | 'OTHER' | undefined,
    expectedWorkCity: undefined as string | undefined
  })

  // 城市选项
  const cityOptions = ref([
    '北京',
    '上海',
    '广州',
    '深圳',
    '杭州',
    '南京',
    '成都',
    '武汉',
    '西安',
    '重庆',
    '苏州',
    '天津',
    '长沙',
    '郑州',
    '青岛',
    '宁波',
    '东莞',
    '无锡',
    '厦门',
    '福州'
  ])

  // 表单相关
  const dialogVisible = ref(false)
  const isEdit = ref(false)
  const activeTab = ref('basic')
  const form = reactive({
    id: undefined as number | undefined,
    userId: undefined as number | undefined,
    username: '',
    email: '',
    password: '',
    gender: undefined as 'MALE' | 'FEMALE' | 'OTHER' | undefined,
    birthday: undefined as string | undefined,
    address: '',
    expectedPosition: '',
    expectedSalary: undefined as number | undefined,
    currentSalary: undefined as number | undefined,
    expectedWorkCity: undefined as string | undefined
  })
  const formRef = ref<FormInstance>()
  const formRules = reactive<FormRules>({
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
    ],
    gender: [{ required: true, message: '请选择性别', trigger: 'change' }]
  })
  const submitLoading = ref(false)

  // 查看详情相关
  const viewDialogVisible = ref(false)
  const viewActiveTab = ref('basic')
  const viewData = reactive({
    id: undefined as number | undefined,
    username: '',
    email: '',
    gender: undefined as string | undefined,
    birthday: undefined as string | undefined,
    address: '',
    expectedPosition: '',
    expectedSalary: undefined as number | undefined,
    currentSalary: undefined as number | undefined,
    expectedWorkCity: '',
    createdAt: undefined as string | undefined,
    updatedAt: undefined as string | undefined,
    education: [] as Education[],
    workExperience: [] as WorkExperience[],
    applications: [] as JobApplication[]
  })

  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // 格式化性别
  const formatGender = (gender?: string) => {
    const genderMap: Record<string, string> = {
      MALE: '男',
      FEMALE: '女',
      OTHER: '其他'
    }
    return gender ? genderMap[gender] || '-' : '-'
  }

  // 格式化申请状态
  const formatApplicationStatus = (status?: string) => {
    const statusMap: Record<string, string> = {
      RESUME_SCREENING: '简历筛选',
      WRITTEN_TEST: '笔试',
      FIRST_INTERVIEW: '一面',
      SECOND_INTERVIEW: '二面',
      HR_INTERVIEW: 'HR面试',
      SCHEDULED: '已安排',
      OFFER: 'Offer',
      REJECTED: '已拒绝'
    }
    return status ? statusMap[status] || '-' : '-'
  }

  // 获取申请状态标签类型
  const getApplicationStatusType = (
    status?: string
  ): 'success' | 'warning' | 'info' | 'primary' | 'danger' => {
    if (!status) return 'info'

    switch (status) {
      case 'RESUME_SCREENING':
        return 'info'
      case 'WRITTEN_TEST':
      case 'FIRST_INTERVIEW':
      case 'SECOND_INTERVIEW':
      case 'HR_INTERVIEW':
        return 'primary'
      case 'SCHEDULED':
        return 'warning'
      case 'OFFER':
        return 'success'
      case 'REJECTED':
        return 'danger'
      default:
        return 'info'
    }
  }

  // 获取数据
  const fetchData = async () => {
    loading.value = true
    try {
      const params = {
        page: page.value,
        size: size.value,
        keyword: searchForm.keyword || undefined,
        gender: searchForm.gender,
        expectedWorkCity: searchForm.expectedWorkCity
      }
      const res = await JobSeekerService.getJobSeekerList(params)
      if (res.code === 200) {
        tableData.value = res.data.list || []
        total.value = res.data.total || 0
      } else {
        ElMessage.error(res.message || '获取求职者列表失败')
      }
    } catch (error) {
      console.error('获取求职者列表失败', error)
      ElMessage.error('获取求职者列表失败')
    } finally {
      loading.value = false
    }
  }

  // 处理搜索
  const handleSearch = () => {
    page.value = 1
    fetchData()
  }

  // 重置搜索
  const handleReset = () => {
    searchForm.keyword = ''
    searchForm.gender = undefined
    searchForm.expectedWorkCity = undefined
    handleSearch()
  }

  // 处理分页
  const handleSizeChange = (val: number) => {
    size.value = val
    fetchData()
  }

  const handleCurrentChange = (val: number) => {
    page.value = val
    fetchData()
  }

  // 添加求职者
  const handleAdd = () => {
    isEdit.value = false
    activeTab.value = 'basic'
    resetForm()
    dialogVisible.value = true
  }

  // 编辑求职者
  const handleEdit = async (row: JobSeeker) => {
    isEdit.value = true
    activeTab.value = 'basic'
    resetForm()

    try {
      const res = await JobSeekerService.getJobSeekerById(row.id!)
      if (res.code === 200) {
        const data = res.data
        form.id = data.id
        form.userId = data.userId
        form.username = data.user?.username || ''
        form.email = data.user?.email || ''
        form.gender = data.gender
        form.birthday = data.birthday
        form.address = data.address || ''
        form.expectedPosition = data.expectedPosition || ''
        form.expectedSalary = data.expectedSalary
        form.currentSalary = data.currentSalary
        form.expectedWorkCity = data.expectedWorkCity
        dialogVisible.value = true
      } else {
        ElMessage.error(res.message || '获取求职者详情失败')
      }
    } catch (error) {
      console.error('获取求职者详情失败:', error)
      ElMessage.error('获取求职者详情失败')
    }
  }

  // 查看求职者
  const handleView = async (row: JobSeeker) => {
    try {
      const res = await JobSeekerService.getJobSeekerById(row.id!)
      if (res.code === 200) {
        const data = res.data
        viewData.id = data.id
        viewData.username = data.user?.username || ''
        viewData.email = data.user?.email || ''
        viewData.gender = data.gender
        viewData.birthday = data.birthday
        viewData.address = data.address || ''
        viewData.expectedPosition = data.expectedPosition || ''
        viewData.expectedSalary = data.expectedSalary
        viewData.currentSalary = data.currentSalary
        viewData.expectedWorkCity = data.expectedWorkCity || ''
        viewData.createdAt = data.createdAt
        viewData.updatedAt = data.updatedAt
        viewData.education = data.education || []
        viewData.workExperience = data.workExperience || []
        viewData.applications = data.applications || []
        viewDialogVisible.value = true
      } else {
        ElMessage.error(res.message || '获取求职者详情失败')
      }
    } catch (error) {
      console.error('获取求职者详情失败:', error)
      ElMessage.error('获取求职者详情失败')
    }
  }

  // 查看简历
  const handleViewResume = () => {
    if (!viewData.id) return
    router.push({
      path: `/recruitment/resume/${viewData.id}`
    })
    viewDialogVisible.value = false
  }

  // 删除求职者
  const handleDelete = (row: JobSeeker) => {
    ElMessageBox.confirm('确定要删除该求职者吗？删除后将无法恢复。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        try {
          const res = await JobSeekerService.deleteJobSeeker(row.id!)
          if (res.code === 200) {
            ElMessage.success('删除成功')
            fetchData()
          } else {
            ElMessage.error(res.message || '删除失败')
          }
        } catch (error) {
          console.error('删除求职者失败:', error)
          ElMessage.error('删除失败')
        }
      })
      .catch(() => {
        // 用户取消删除
      })
  }

  // 重置表单
  const resetForm = () => {
    form.id = undefined
    form.userId = undefined
    form.username = ''
    form.email = ''
    form.password = ''
    form.gender = undefined
    form.birthday = undefined
    form.address = ''
    form.expectedPosition = ''
    form.expectedSalary = undefined
    form.currentSalary = undefined
    form.expectedWorkCity = undefined
    if (formRef.value) {
      formRef.value.resetFields()
    }
  }

  // 提交表单
  const submitForm = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true
        try {
          let res
          if (isEdit.value) {
            // 更新求职者
            const data = {
              id: form.id,
              userId: form.userId,
              gender: form.gender,
              birthday: form.birthday,
              address: form.address,
              expectedPosition: form.expectedPosition,
              expectedSalary: form.expectedSalary,
              currentSalary: form.currentSalary,
              expectedWorkCity: form.expectedWorkCity,
              user: {
                id: form.userId,
                username: form.username,
                email: form.email
              }
            }
            res = await JobSeekerService.updateJobSeeker(form.id!, data)
          } else {
            // 创建求职者
            // 先创建用户
            const userRes = await UserService.createUser({
              username: form.username,
              email: form.email,
              password: form.password,
              role: 'JOB_SEEKER'
            })

            if (userRes.code === 200) {
              // 创建求职者信息
              const data = {
                userId: userRes.data.id,
                gender: form.gender,
                birthday: form.birthday,
                address: form.address,
                expectedPosition: form.expectedPosition,
                expectedSalary: form.expectedSalary,
                currentSalary: form.currentSalary,
                expectedWorkCity: form.expectedWorkCity
              }
              res = await JobSeekerService.createJobSeeker(data)
            } else {
              ElMessage.error(userRes.message || '创建用户失败')
              submitLoading.value = false
              return
            }
          }

          if (res.code === 200) {
            ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
            dialogVisible.value = false
            fetchData()
          } else {
            ElMessage.error(res.message || (isEdit.value ? '更新失败' : '添加失败'))
          }
        } catch (error) {
          console.error(isEdit.value ? '更新求职者失败:' : '添加求职者失败:', error)
          ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
        } finally {
          submitLoading.value = false
        }
      }
    })
  }

  onMounted(() => {
    fetchData()
  })
</script>

<style lang="scss" scoped>
  .job-seeker-list-container {
    padding: 20px;
  }

  .mb-4 {
    margin-bottom: 16px;
  }

  .ml-4 {
    margin-left: 16px;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .job-seeker-form {
    max-width: 500px;
    margin: 0 auto;
  }
</style>
