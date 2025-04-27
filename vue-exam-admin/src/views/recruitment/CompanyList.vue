<template>
  <div class="company-list-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>公司管理</span>
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
            <el-input v-model="searchForm.keyword" placeholder="公司名称/描述" clearable />
          </el-form-item>
          <el-form-item label="融资阶段" prop="fundingStage">
            <el-select v-model="searchForm.fundingStage" placeholder="融资阶段" clearable>
              <el-option
                v-for="(label, value) in fundingStageMap"
                :key="value"
                :label="label"
                :value="value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="认证状态" prop="verificationStatus">
            <el-select v-model="searchForm.verificationStatus" placeholder="认证状态" clearable>
              <el-option
                v-for="(label, value) in verificationStatusMap"
                :key="value"
                :label="label"
                :value="value"
              />
            </el-select>
          </el-form-item>
        </template>

        <template #toolbar>
          <el-button type="primary" @click="handleAdd">新增公司</el-button>
        </template>

        <template #operation="{ row }">
          <el-button type="primary" link @click="handleView(row)">查看</el-button>
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          <el-dropdown
            v-if="row.verificationStatus !== 'VERIFIED'"
            @command="(command) => handleVerify(row, command)"
          >
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

    <!-- 新增/编辑公司对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增公司' : '编辑公司'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="company-form"
      >
        <el-form-item label="公司名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入公司名称" />
        </el-form-item>
        <el-form-item label="公司描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入公司描述"
          />
        </el-form-item>
        <el-form-item label="公司规模" prop="size">
          <el-select v-model="formData.size" placeholder="请选择公司规模">
            <el-option label="少于50人" value="LESS_THAN_50" />
            <el-option label="50-200人" value="BETWEEN_50_200" />
            <el-option label="200-500人" value="BETWEEN_200_500" />
            <el-option label="500-1000人" value="BETWEEN_500_1000" />
            <el-option label="1000-5000人" value="BETWEEN_1000_5000" />
            <el-option label="5000人以上" value="MORE_THAN_5000" />
          </el-select>
        </el-form-item>
        <el-form-item label="融资阶段" prop="fundingStage">
          <el-select v-model="formData.fundingStage" placeholder="请选择融资阶段">
            <el-option
              v-for="(label, value) in fundingStageMap"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="公司地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入公司地址" />
        </el-form-item>
        <el-form-item label="公司网站" prop="website">
          <el-input v-model="formData.website" placeholder="请输入公司网站" />
        </el-form-item>
        <el-form-item label="所属行业" prop="industryIds">
          <el-cascader
            v-model="formData.industryIds"
            :options="industryOptions"
            :props="{
              checkStrictly: false,
              label: 'name',
              value: 'id',
              children: 'children'
            }"
            placeholder="请选择行业"
            clearable
          />
        </el-form-item>
        <el-form-item label="认证状态" prop="verificationStatus">
          <el-select v-model="formData.verificationStatus" placeholder="请选择认证状态">
            <el-option
              v-for="(label, value) in verificationStatusMap"
              :key="value"
              :label="label"
              :value="value"
            />
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

    <!-- 查看公司详情对话框 -->
    <el-dialog v-model="viewDialogVisible" title="公司详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="公司名称">{{ viewData.name }}</el-descriptions-item>
        <el-descriptions-item label="公司描述">{{ viewData.description }}</el-descriptions-item>
        <el-descriptions-item label="公司规模">{{
          formatCompanySize(viewData.size)
        }}</el-descriptions-item>
        <el-descriptions-item label="融资阶段">{{
          fundingStageMap[viewData.fundingStage]
        }}</el-descriptions-item>
        <el-descriptions-item label="公司地址">{{ viewData.address || '-' }}</el-descriptions-item>
        <el-descriptions-item label="公司网站">
          <a v-if="viewData.website" :href="viewData.website" target="_blank">{{
            viewData.website
          }}</a>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="行业">
          <span v-if="viewData.industries && viewData.industries.length">
            {{ viewData.industries.map((i) => i.name).join(', ') }}
          </span>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="认证状态">
          <el-tag :type="getStatusTagType(viewData.verificationStatus)">
            {{ verificationStatusMap[viewData.verificationStatus] }}
          </el-tag>
        </el-descriptions-item>
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
  import { CompanyService, IndustryService } from '@/api/userApi'
  import type { Company, Industry } from '@/api/model/userModel'
  import CommonCrudTable from '@/components/CommonCrudTable.vue'

  // 表格数据
  const loading = ref(false)
  const tableData = ref<Company[]>([])
  const total = ref(0)
  const page = ref(1)
  const size = ref(10)

  // 搜索表单
  const searchForm = reactive({
    keyword: '',
    fundingStage: undefined as string | undefined,
    verificationStatus: undefined as string | undefined
  })

  // 公司规模映射
  const companySizeMap = {
    LESS_THAN_50: '少于50人',
    BETWEEN_50_200: '50-200人',
    BETWEEN_200_500: '200-500人',
    BETWEEN_500_1000: '500-1000人',
    BETWEEN_1000_5000: '1000-5000人',
    MORE_THAN_5000: '5000人以上'
  }

  // 融资阶段映射
  const fundingStageMap = {
    SEED: '种子轮',
    ANGEL: '天使轮',
    PRE_A: '天使+轮',
    A: 'A轮',
    A_PLUS: 'A+轮',
    B: 'B轮',
    B_PLUS: 'B+轮',
    C: 'C轮',
    C_PLUS: 'C+轮',
    D: 'D轮及以上',
    IPO: '已上市',
    ACQUIRED: '已被收购',
    STRATEGIC: '战略融资',
    UNDISCLOSED: '未透露'
  }

  // 认证状态映射
  const verificationStatusMap = {
    PENDING: '未认证',
    VERIFIED: '已认证',
    REJECTED: '已拒绝'
  }

  // 表格列配置
  const columns = [
    { prop: 'id', label: 'ID', width: '80px' },
    { prop: 'name', label: '公司名称' },
    {
      prop: 'size',
      label: '公司规模',
      formatter: (row: Company) => formatCompanySize(row.size)
    },
    {
      prop: 'fundingStage',
      label: '融资阶段',
      formatter: (row: Company) => fundingStageMap[row.fundingStage] || '-'
    },
    {
      prop: 'verificationStatus',
      label: '认证状态',
      formatter: (row: Company) => {
        return verificationStatusMap[row.verificationStatus] || '-'
      }
    },
    {
      prop: 'createdAt',
      label: '创建时间',
      formatter: (row: Company) => formatDate(row.createdAt)
    }
  ]

  // 行业选项
  const industryOptions = ref<Industry[]>([])

  // 对话框相关
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const formRef = ref<FormInstance>()
  const formData = reactive({
    id: undefined as number | undefined,
    name: '',
    description: '',
    size: 'LESS_THAN_50',
    fundingStage: 'SEED',
    address: '',
    website: '',
    industryIds: [] as number[],
    verificationStatus: 'PENDING' as 'PENDING' | 'VERIFIED' | 'REJECTED'
  })

  // 表单验证规则
  const formRules = reactive<FormRules>({
    name: [
      { required: true, message: '请输入公司名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    description: [{ required: true, message: '请输入公司描述', trigger: 'blur' }],
    size: [{ required: true, message: '请选择公司规模', trigger: 'change' }],
    fundingStage: [{ required: true, message: '请选择融资阶段', trigger: 'change' }],
    industryIds: [{ required: true, message: '请选择所属行业', trigger: 'change' }],
    verificationStatus: [{ required: true, message: '请选择认证状态', trigger: 'change' }]
  })

  // 查看详情相关
  const viewDialogVisible = ref(false)
  const viewData = reactive<Company>({
    id: 0,
    name: '',
    description: '',
    size: 'LESS_THAN_50',
    fundingStage: 'SEED',
    address: '',
    website: '',
    verificationStatus: 'PENDING',
    industries: []
  })

  // 加载数据
  const fetchCompanies = async () => {
    loading.value = true
    try {
      const params = {
        page: page.value,
        size: size.value,
        keyword: searchForm.keyword || undefined,
        fundingStage: searchForm.fundingStage,
        verificationStatus: searchForm.verificationStatus
      }
      const res = await CompanyService.getCompanyList(params)
      if (res.success) {
        tableData.value = res.data.records || []
        total.value = res.data.total || 0
      } else {
        ElMessage.error(res.message || '获取公司列表失败')
      }
    } catch (error) {
      console.error('获取公司列表错误:', error)
      ElMessage.error('获取公司列表失败')
    } finally {
      loading.value = false
    }
  }

  // 加载行业数据
  const fetchIndustries = async () => {
    try {
      const res = await IndustryService.getIndustryTree()
      if (res.success) {
        industryOptions.value = res.data || []
      }
    } catch (error) {
      console.error('获取行业数据错误:', error)
    }
  }

  // 格式化函数
  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleString()
  }

  const formatCompanySize = (size?: string) => {
    if (!size) return '-'
    return companySizeMap[size] || size
  }

  const getStatusTagType = (status: string) => {
    const map = {
      PENDING: 'warning',
      VERIFIED: 'success',
      REJECTED: 'danger'
    }
    return map[status] || 'info'
  }

  // 事件处理函数
  const handleSearch = () => {
    page.value = 1
    fetchCompanies()
  }

  const handleReset = () => {
    searchForm.keyword = ''
    searchForm.fundingStage = undefined
    searchForm.verificationStatus = undefined
    handleSearch()
  }

  const handleSizeChange = (val: number) => {
    size.value = val
    fetchCompanies()
  }

  const handleCurrentChange = (val: number) => {
    page.value = val
    fetchCompanies()
  }

  const handleAdd = () => {
    dialogType.value = 'add'
    resetForm()
    dialogVisible.value = true
  }

  const handleEdit = (row: Company) => {
    dialogType.value = 'edit'
    resetForm()
    formData.id = row.id
    formData.name = row.name
    formData.description = row.description
    formData.size = row.size
    formData.fundingStage = row.fundingStage
    formData.address = row.address || ''
    formData.website = row.website || ''
    formData.verificationStatus = row.verificationStatus

    // 设置行业ID
    if (row.industries && row.industries.length) {
      formData.industryIds = row.industries.map((industry) => industry.id)
    } else {
      formData.industryIds = []
    }

    dialogVisible.value = true
  }

  const handleView = (row: Company) => {
    Object.assign(viewData, row)
    viewDialogVisible.value = true
  }

  const handleDelete = (row: Company) => {
    ElMessageBox.confirm('确认删除该公司?', '警告', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        try {
          const res = await CompanyService.deleteCompany(row.id!)
          if (res.success) {
            ElMessage.success('删除成功')
            fetchCompanies()
          } else {
            ElMessage.error(res.message || '删除失败')
          }
        } catch (error) {
          console.error('删除公司错误:', error)
          ElMessage.error('删除失败')
        }
      })
      .catch(() => {})
  }

  const handleVerify = async (row: Company, status: string) => {
    try {
      const res = await CompanyService.verifyCompany(row.id!, status as 'VERIFIED' | 'REJECTED')
      if (res.success) {
        ElMessage.success(`${status === 'VERIFIED' ? '认证通过' : '拒绝认证'}成功`)
        fetchCompanies()
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
    formData.name = ''
    formData.description = ''
    formData.size = 'LESS_THAN_50'
    formData.fundingStage = 'SEED'
    formData.address = ''
    formData.website = ''
    formData.industryIds = []
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
          const data = {
            name: formData.name,
            description: formData.description,
            size: formData.size,
            fundingStage: formData.fundingStage,
            address: formData.address,
            website: formData.website,
            industryIds: formData.industryIds,
            verificationStatus: formData.verificationStatus
          }

          if (dialogType.value === 'add') {
            res = await CompanyService.createCompany(data as any)
          } else {
            res = await CompanyService.updateCompany(formData.id!, data as any)
          }

          if (res.success) {
            ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
            dialogVisible.value = false
            fetchCompanies()
          } else {
            ElMessage.error(res.message || (dialogType.value === 'add' ? '添加失败' : '更新失败'))
          }
        } catch (error) {
          console.error(dialogType.value === 'add' ? '添加公司错误:' : '更新公司错误:', error)
          ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败')
        }
      }
    })
  }

  // 初始化
  onMounted(() => {
    fetchIndustries()
    fetchCompanies()
  })
</script>

<style scoped>
  .company-list-container {
    padding: 20px;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .company-form {
    max-height: 60vh;
    overflow-y: auto;
  }
</style>
