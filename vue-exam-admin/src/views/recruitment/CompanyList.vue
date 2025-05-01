<template>
  <div class="company-list-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>公司管理</span>
        </div>
      </template>

      <el-row class="mb-4">
        <el-col :span="6">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入公司名称/描述"
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
        <el-col :span="16" class="ml-4">
          <el-button type="primary" @click="handleAdd">新增公司</el-button>
        </el-col>
      </el-row>

      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="公司名称" />
        <el-table-column prop="size" label="公司规模">
          <template #default="{ row }">
            {{ formatCompanySize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="fundingStage" label="融资阶段">
          <template #default="{ row }">
            {{ fundingStageMap[row.fundingStage] || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="verificationStatus" label="认证状态">
          <template #default="{ row }">
            {{ verificationStatusMap[row.verificationStatus] || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="{ row }">
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
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
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
          <span v-if="viewData.industry">{{ viewData.industry }}</span>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="认证状态">
          <el-tag type="success">
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
  import { Search } from '@element-plus/icons-vue'
  import { CompanyService } from '@/api/companyService'
  import { IndustryService } from '@/api/industryService'
  import type { Industry } from '@/api/model/userModel'

  // 定义一个新的Company接口，与后端返回的数据结构一致
  interface Company {
    id: number
    name: string
    description: string
    address: string
    fundingStage: string
    size: string
    industry: string
    foundedYear?: number
    verificationStatus: string
    createdAt?: string
    updatedAt?: string
    deletedAt?: string | null
    website?: string
    industryIds?: number[]
  }

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
  const companySizeMap: Record<string, string> = {
    LESS_THAN_50: '少于50人',
    BETWEEN_50_200: '50-200人',
    BETWEEN_200_500: '200-500人',
    BETWEEN_500_1000: '500-1000人',
    BETWEEN_1000_5000: '1000-5000人',
    MORE_THAN_5000: '5000人以上',
    TINY: '少于50人',
    SMALL: '50-200人',
    MEDIUM: '200-500人',
    LARGE: '500-1000人',
    XLARGE: '1000-5000人',
    XXLARGE: '5000人以上'
  }

  // 融资阶段映射
  const fundingStageMap: Record<string, string> = {
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
    SELF_FUNDED: '自筹资金',
    UNDISCLOSED: '未透露'
  }

  // 认证状态映射
  const verificationStatusMap: Record<string, string> = {
    PENDING: '未认证',
    VERIFIED: '已认证',
    REJECTED: '已拒绝'
  }

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
    verificationStatus: 'PENDING'
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
    size: '',
    fundingStage: '',
    address: '',
    industry: '',
    verificationStatus: '',
    website: ''
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
      if (res.code === 200) {
        tableData.value = res.data.list || []
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
      if (res.code === 200) {
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
    const map: Record<string, string> = {
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
    formData.description = row.description || ''
    formData.size = row.size || 'LESS_THAN_50'
    formData.fundingStage = row.fundingStage || 'SEED'
    formData.address = row.address || ''
    formData.website = row.website || ''
    formData.verificationStatus = row.verificationStatus || 'PENDING'

    // 设置行业ID
    if (row.industryIds && row.industryIds.length) {
      formData.industryIds = row.industryIds.filter((id) => id !== undefined) as number[]
    } else {
      formData.industryIds = []
    }

    dialogVisible.value = true
  }

  const handleView = (row: Company) => {
    // 复制对象，避免直接引用导致的问题
    viewData.id = row.id
    viewData.name = row.name
    viewData.description = row.description || ''
    viewData.size = row.size || ''
    viewData.fundingStage = row.fundingStage || ''
    viewData.address = row.address || ''
    viewData.industry = row.industry || ''
    viewData.verificationStatus = row.verificationStatus
    viewData.createdAt = row.createdAt
    viewData.updatedAt = row.updatedAt
    viewData.website = row.website

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
          const res = await CompanyService.deleteCompany(row.id)
          if (res.code === 200) {
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
      const res = await CompanyService.verifyCompany(row.id, status)
      if (res.code === 200) {
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
            res = await CompanyService.createCompany(data)
          } else {
            res = await CompanyService.updateCompany(formData.id!, data)
          }

          if (res.code === 200) {
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
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  .mb-4 {
    margin-bottom: 16px;
  }
  .ml-4 {
    margin-left: 16px;
  }
</style>
