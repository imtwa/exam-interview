<template>
  <div class="job-seeker-list-page">
    <el-card class="filter-container">
      <div class="filter-item">
        <el-input
          v-model="queryParams.keyword"
          placeholder="搜索用户名/邮箱/手机号"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>
      <div class="filter-item">
        <el-select
          v-model="queryParams.jobStatus"
          placeholder="求职状态"
          clearable
          @change="handleSearch"
        >
          <el-option label="求职中" value="ACTIVE" />
          <el-option label="未求职" value="INACTIVE" />
          <el-option label="已就业" value="EMPLOYED" />
        </el-select>
      </div>
      <div class="filter-right">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon> 新增求职者
        </el-button>
      </div>
    </el-card>

    <el-card class="table-container">
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        v-loading="loading"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="手机号" min-width="120" />
        <el-table-column label="性别" width="80">
          <template #default="scope">
            {{
              scope.row.gender === 'MALE' ? '男' : scope.row.gender === 'FEMALE' ? '女' : '未设置'
            }}
          </template>
        </el-table-column>
        <el-table-column label="年龄" width="80">
          <template #default="scope">
            {{ scope.row.birthday ? calculateAge(scope.row.birthday) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="求职状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.jobStatus)">
              {{ getStatusText(scope.row.jobStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" min-width="160">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleView(scope.row)"> 查看 </el-button>
            <el-button type="primary" link @click="handleEdit(scope.row)"> 编辑 </el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)"> 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增求职者' : '编辑求职者'"
      width="50%"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
        label-position="right"
        style="max-width: 600px; margin: 0 auto"
      >
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-form-item label="用户名" prop="username" v-if="dialogType === 'add'">
              <el-input v-model="form.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email" v-if="dialogType === 'add'">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
              <el-input
                v-model="form.password"
                placeholder="请输入密码"
                type="password"
                show-password
              />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio label="MALE">男</el-radio>
                <el-radio label="FEMALE">女</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="出生日期" prop="birthday">
              <el-date-picker
                v-model="form.birthday"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入地址" />
            </el-form-item>
            <el-form-item label="求职状态" prop="jobStatus">
              <el-select v-model="form.jobStatus" placeholder="请选择求职状态" style="width: 100%">
                <el-option label="求职中" value="ACTIVE" />
                <el-option label="未求职" value="INACTIVE" />
                <el-option label="已就业" value="EMPLOYED" />
              </el-select>
            </el-form-item>
            <el-form-item label="期望薪资" prop="expectedSalary">
              <el-input-number
                v-model="form.expectedSalary"
                :min="0"
                :step="1000"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="个人简介" prop="bio">
              <el-input v-model="form.bio" type="textarea" :rows="4" placeholder="请输入个人简介" />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="工作经历" name="work" v-if="dialogType === 'edit'">
            <div v-for="(exp, index) in form.workExperiences" :key="index" class="experience-item">
              <div class="experience-header">
                <h4>工作经历 #{{ index + 1 }}</h4>
                <el-button type="danger" size="small" @click="removeWorkExperience(index)" circle>
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-form-item :label="'公司名称'" :prop="`workExperiences.${index}.companyName`">
                <el-input v-model="exp.companyName" placeholder="请输入公司名称" />
              </el-form-item>
              <el-form-item :label="'职位'" :prop="`workExperiences.${index}.position`">
                <el-input v-model="exp.position" placeholder="请输入职位" />
              </el-form-item>
              <el-form-item :label="'起止时间'" :prop="`workExperiences.${index}.duration`">
                <el-date-picker
                  v-model="exp.duration"
                  type="daterange"
                  range-separator="-"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  style="width: 100%"
                  @change="handleWorkDurationChange(index, $event)"
                />
              </el-form-item>
              <el-form-item :label="'工作描述'" :prop="`workExperiences.${index}.description`">
                <el-input
                  v-model="exp.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入工作描述"
                />
              </el-form-item>
              <el-divider />
            </div>
            <div class="add-experience">
              <el-button type="primary" @click="addWorkExperience" plain>
                <el-icon><Plus /></el-icon> 添加工作经历
              </el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane label="教育经历" name="education" v-if="dialogType === 'edit'">
            <div v-for="(edu, index) in form.educations" :key="index" class="experience-item">
              <div class="experience-header">
                <h4>教育经历 #{{ index + 1 }}</h4>
                <el-button type="danger" size="small" @click="removeEducation(index)" circle>
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-form-item :label="'学校名称'" :prop="`educations.${index}.schoolName`">
                <el-input v-model="edu.schoolName" placeholder="请输入学校名称" />
              </el-form-item>
              <el-form-item :label="'专业'" :prop="`educations.${index}.major`">
                <el-input v-model="edu.major" placeholder="请输入专业" />
              </el-form-item>
              <el-form-item :label="'学位'" :prop="`educations.${index}.degree`">
                <el-select v-model="edu.degree" placeholder="请选择学位" style="width: 100%">
                  <el-option label="高中" value="HIGH_SCHOOL" />
                  <el-option label="专科" value="COLLEGE" />
                  <el-option label="本科" value="BACHELOR" />
                  <el-option label="硕士" value="MASTER" />
                  <el-option label="博士" value="PHD" />
                </el-select>
              </el-form-item>
              <el-form-item :label="'起止时间'" :prop="`educations.${index}.duration`">
                <el-date-picker
                  v-model="edu.duration"
                  type="daterange"
                  range-separator="-"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  style="width: 100%"
                  @change="handleEducationDurationChange(index, $event)"
                />
              </el-form-item>
              <el-form-item :label="'描述'" :prop="`educations.${index}.description`">
                <el-input
                  v-model="edu.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入描述"
                />
              </el-form-item>
              <el-divider />
            </div>
            <div class="add-experience">
              <el-button type="primary" @click="addEducation" plain>
                <el-icon><Plus /></el-icon> 添加教育经历
              </el-button>
            </div>
          </el-tab-pane>
        </el-tabs>

        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确认</el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, computed } from 'vue'
  import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
  import { Search, Plus, Delete } from '@element-plus/icons-vue'
  import { useRouter } from 'vue-router'
  import { JobSeekerService, UserService } from '@/api/userApi'
  import {
    JobSeeker,
    FrontUser,
    WorkExperience,
    Education,
    JobSeekerListParams
  } from '@/api/model/userModel'

  const router = useRouter()

  // 查询参数
  const queryParams = reactive<JobSeekerListParams>({
    page: 1,
    size: 10,
    keyword: '',
    jobStatus: undefined
  })

  // 表格数据
  const tableData = ref<any[]>([])
  const loading = ref(false)
  const total = ref(0)

  // 表单相关
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const activeTab = ref('basic')
  const formRef = ref<FormInstance>()

  // 表单数据
  const initialForm = {
    id: '',
    userId: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    gender: 'MALE',
    birthday: '',
    address: '',
    jobStatus: 'INACTIVE',
    expectedSalary: 0,
    bio: '',
    workExperiences: [] as any[],
    educations: [] as any[]
  }

  const form = reactive({ ...initialForm })

  // 表单校验规则
  const formRules = reactive({
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    jobStatus: [{ required: true, message: '请选择求职状态', trigger: 'change' }]
  })

  // 初始化
  onMounted(() => {
    fetchData()
  })

  // 获取数据
  const fetchData = async () => {
    loading.value = true
    try {
      const res = await JobSeekerService.getJobSeekerList(queryParams)
      if (res.code === 200) {
        tableData.value = res.data || []
        total.value = res.total || 0
      } else {
        ElMessage.error(res.message || '获取求职者列表失败')
      }
    } catch (error) {
      ElMessage.error('获取求职者列表失败')
    } finally {
      loading.value = false
    }
  }

  // 搜索
  const handleSearch = () => {
    queryParams.page = 1
    fetchData()
  }

  // 分页
  const handleSizeChange = (size: number) => {
    queryParams.size = size
    fetchData()
  }

  const handleCurrentChange = (page: number) => {
    queryParams.page = page
    fetchData()
  }

  // 新增
  const handleAdd = () => {
    dialogType.value = 'add'
    activeTab.value = 'basic'
    Object.assign(form, initialForm)
    dialogVisible.value = true
  }

  // 编辑
  const handleEdit = async (row: any) => {
    dialogType.value = 'edit'
    activeTab.value = 'basic'

    try {
      // 获取求职者详情
      const res = await JobSeekerService.getJobSeekerById(row.id)
      if (res.code === 200 && res.data) {
        // 获取用户基本信息
        const userRes = await UserService.getUserById(res.data.userId)

        if (userRes.code === 200) {
          Object.assign(form, {
            ...res.data,
            username: userRes.data.username,
            email: userRes.data.email
          })

          // 获取工作经历
          const workRes = await JobSeekerService.getWorkExperience(row.id)
          if (workRes.code === 200) {
            const workExps = workRes.data || []
            form.workExperiences = workExps.map((exp: WorkExperience) => ({
              ...exp,
              duration: exp.startDate && [
                new Date(exp.startDate),
                exp.endDate ? new Date(exp.endDate) : null
              ]
            }))
          }

          // 获取教育经历
          const eduRes = await JobSeekerService.getEducation(row.id)
          if (eduRes.code === 200) {
            const educations = eduRes.data || []
            form.educations = educations.map((edu: Education) => ({
              ...edu,
              duration: edu.startDate && [
                new Date(edu.startDate),
                edu.endDate ? new Date(edu.endDate) : null
              ]
            }))
          }

          dialogVisible.value = true
        } else {
          ElMessage.error(userRes.message || '获取用户信息失败')
        }
      } else {
        ElMessage.error(res.message || '获取求职者信息失败')
      }
    } catch (error) {
      ElMessage.error('获取求职者信息失败')
    }
  }

  // 查看
  const handleView = (row: any) => {
    router.push(`/user/job-seeker-detail/${row.id}`)
  }

  // 删除
  const handleDelete = (row: any) => {
    ElMessageBox.confirm('确认删除该求职者吗？', '警告', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        try {
          const res = await JobSeekerService.deleteJobSeeker(row.id)
          if (res.code === 200) {
            ElMessage.success('删除成功')
            fetchData()
          } else {
            ElMessage.error(res.message || '删除失败')
          }
        } catch (error) {
          ElMessage.error('删除失败')
        }
      })
      .catch(() => {})
  }

  // 工作经历
  const addWorkExperience = () => {
    form.workExperiences.push({
      jobSeekerId: form.id,
      companyName: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      duration: null
    })
  }

  const removeWorkExperience = (index: number) => {
    form.workExperiences.splice(index, 1)
  }

  const handleWorkDurationChange = (index: number, dates: any) => {
    if (dates && dates.length === 2) {
      form.workExperiences[index].startDate = dates[0]
      form.workExperiences[index].endDate = dates[1]
    } else {
      form.workExperiences[index].startDate = ''
      form.workExperiences[index].endDate = ''
    }
  }

  // 教育经历
  const addEducation = () => {
    form.educations.push({
      jobSeekerId: form.id,
      schoolName: '',
      major: '',
      degree: 'BACHELOR',
      startDate: '',
      endDate: '',
      description: '',
      duration: null
    })
  }

  const removeEducation = (index: number) => {
    form.educations.splice(index, 1)
  }

  const handleEducationDurationChange = (index: number, dates: any) => {
    if (dates && dates.length === 2) {
      form.educations[index].startDate = dates[0]
      form.educations[index].endDate = dates[1]
    } else {
      form.educations[index].startDate = ''
      form.educations[index].endDate = ''
    }
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (!valid) return

      try {
        if (dialogType.value === 'add') {
          // 创建用户
          const userRes = await UserService.createUser({
            username: form.username,
            email: form.email,
            password: form.password,
            role: 'JOB_SEEKER'
          })

          if (userRes.code === 200 && userRes.data) {
            // 创建求职者信息
            const jobSeekerRes = await JobSeekerService.createJobSeeker({
              userId: userRes.data.id,
              phone: form.phone,
              gender: form.gender,
              birthday: form.birthday,
              address: form.address,
              jobStatus: form.jobStatus,
              expectedSalary: form.expectedSalary,
              bio: form.bio
            })

            if (jobSeekerRes.code === 200) {
              ElMessage.success('创建成功')
              dialogVisible.value = false
              fetchData()
            } else {
              ElMessage.error(jobSeekerRes.message || '创建求职者信息失败')
            }
          } else {
            ElMessage.error(userRes.message || '创建用户失败')
          }
        } else {
          // 更新求职者信息
          const jobSeekerRes = await JobSeekerService.updateJobSeeker({
            id: form.id,
            phone: form.phone,
            gender: form.gender,
            birthday: form.birthday,
            address: form.address,
            jobStatus: form.jobStatus,
            expectedSalary: form.expectedSalary,
            bio: form.bio
          })

          if (jobSeekerRes.code === 200) {
            // 更新工作经历
            if (form.workExperiences.length > 0) {
              for (const exp of form.workExperiences) {
                if (exp.id) {
                  // 更新已有工作经历
                  await JobSeekerService.updateWorkExperience({
                    id: exp.id,
                    jobSeekerId: form.id,
                    companyName: exp.companyName,
                    position: exp.position,
                    startDate: exp.startDate,
                    endDate: exp.endDate,
                    description: exp.description
                  })
                } else {
                  // 新增工作经历
                  await JobSeekerService.addWorkExperience({
                    jobSeekerId: form.id,
                    companyName: exp.companyName,
                    position: exp.position,
                    startDate: exp.startDate,
                    endDate: exp.endDate,
                    description: exp.description
                  })
                }
              }
            }

            // 更新教育经历
            if (form.educations.length > 0) {
              for (const edu of form.educations) {
                if (edu.id) {
                  // 更新已有教育经历
                  await JobSeekerService.updateEducation({
                    id: edu.id,
                    jobSeekerId: form.id,
                    schoolName: edu.schoolName,
                    major: edu.major,
                    degree: edu.degree,
                    startDate: edu.startDate,
                    endDate: edu.endDate,
                    description: edu.description
                  })
                } else {
                  // 新增教育经历
                  await JobSeekerService.addEducation({
                    jobSeekerId: form.id,
                    schoolName: edu.schoolName,
                    major: edu.major,
                    degree: edu.degree,
                    startDate: edu.startDate,
                    endDate: edu.endDate,
                    description: edu.description
                  })
                }
              }
            }

            ElMessage.success('更新成功')
            dialogVisible.value = false
            fetchData()
          } else {
            ElMessage.error(jobSeekerRes.message || '更新失败')
          }
        }
      } catch (error) {
        ElMessage.error('操作失败，请稍后重试')
      }
    })
  }

  // 工具函数
  const formatDate = (date: Date | string) => {
    if (!date) return '-'
    return new Date(date).toLocaleString()
  }

  const calculateAge = (birthday: Date | string) => {
    if (!birthday) return '-'
    const birthDate = new Date(birthday)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const getStatusType = (status: string) => {
    if (!status) return 'info'
    const map: Record<string, string> = {
      ACTIVE: 'success',
      INACTIVE: 'info',
      EMPLOYED: 'danger'
    }
    return map[status] || 'info'
  }

  const getStatusText = (status: string) => {
    if (!status) return '未设置'
    const map: Record<string, string> = {
      ACTIVE: '求职中',
      INACTIVE: '未求职',
      EMPLOYED: '已就业'
    }
    return map[status] || '未设置'
  }
</script>

<style scoped>
  .job-seeker-list-page {
    padding: 20px;
  }

  .filter-container {
    margin-bottom: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }

  .filter-item {
    width: 300px;
  }

  .filter-right {
    margin-left: auto;
  }

  .table-container {
    margin-bottom: 20px;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .dialog-footer {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .experience-item {
    margin-bottom: 15px;
  }

  .experience-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .experience-header h4 {
    margin: 0;
    color: #606266;
  }

  .add-experience {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
</style>
