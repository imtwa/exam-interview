<template>
  <div class="company-list-page">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>公司管理</span>
        </div>
      </template>

      <CommonCrudTable
        :data="companyList"
        :total="total"
        :loading="loading"
        search-placeholder="输入公司名称/行业搜索"
        add-button-text="新增公司"
        @search="handleSearch"
        @add="handleAdd"
        @edit="handleEdit"
        @delete="handleDelete"
        @view="handleView"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="公司名称" />
        <el-table-column prop="industry" label="行业" />
        <el-table-column prop="size" label="规模" width="120">
          <template #default="scope">
            {{ getCompanySizeText(scope.row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="foundedYear" label="成立年份" width="100" />
        <el-table-column prop="verificationStatus" label="验证状态" width="120">
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
            通过验证
          </el-button>
          <el-button
            v-if="row.verificationStatus === 'PENDING'"
            type="danger"
            size="small"
            @click="handleVerify(row, 'REJECTED')"
            link
          >
            拒绝验证
          </el-button>
        </template>
      </CommonCrudTable>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增公司' : '编辑公司'"
      width="50%"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" label-width="100px">
        <el-form-item label="公司名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入公司名称" />
        </el-form-item>
        <el-form-item label="行业" prop="industry">
          <el-input v-model="form.industry" placeholder="请输入所属行业" />
        </el-form-item>
        <el-form-item label="公司规模" prop="size">
          <el-select v-model="form.size" placeholder="请选择公司规模" style="width: 100%">
            <el-option label="0-20人" value="TINY" />
            <el-option label="20-99人" value="SMALL" />
            <el-option label="100-499人" value="MEDIUM" />
            <el-option label="500-999人" value="LARGE" />
            <el-option label="1000-9999人" value="XLARGE" />
            <el-option label="10000+人" value="XXLARGE" />
          </el-select>
        </el-form-item>
        <el-form-item label="融资阶段" prop="fundingStage">
          <el-select v-model="form.fundingStage" placeholder="请选择融资阶段" style="width: 100%">
            <el-option label="未融资" value="UNFUNDED" />
            <el-option label="天使轮" value="ANGEL" />
            <el-option label="A轮" value="SERIES_A" />
            <el-option label="B轮" value="SERIES_B" />
            <el-option label="C轮" value="SERIES_C" />
            <el-option label="D轮及以上" value="SERIES_D" />
            <el-option label="已上市" value="IPO" />
            <el-option label="不需要融资" value="SELF_FUNDED" />
          </el-select>
        </el-form-item>
        <el-form-item label="成立年份" prop="foundedYear">
          <el-date-picker
            v-model="foundedDate"
            type="year"
            placeholder="选择年份"
            style="width: 100%"
            @change="handleYearChange"
          />
        </el-form-item>
        <el-form-item label="公司地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入公司地址" />
        </el-form-item>
        <el-form-item label="公司简介" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入公司简介"
          />
        </el-form-item>
        <el-form-item label="验证状态" prop="verificationStatus">
          <el-select
            v-model="form.verificationStatus"
            placeholder="请选择验证状态"
            style="width: 100%"
          >
            <el-option label="待验证" value="PENDING" />
            <el-option label="已验证" value="VERIFIED" />
            <el-option label="已拒绝" value="REJECTED" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看详情弹窗 -->
    <el-dialog v-model="viewDialogVisible" title="公司详情" width="50%">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="公司ID">{{ currentCompany?.id }}</el-descriptions-item>
        <el-descriptions-item label="公司名称">{{ currentCompany?.name }}</el-descriptions-item>
        <el-descriptions-item label="行业">{{
          currentCompany?.industry || '未设置'
        }}</el-descriptions-item>
        <el-descriptions-item label="公司规模">
          {{ getCompanySizeText(currentCompany?.size) }}
        </el-descriptions-item>
        <el-descriptions-item label="融资阶段">
          {{ getFundingStageText(currentCompany?.fundingStage) }}
        </el-descriptions-item>
        <el-descriptions-item label="成立年份">
          {{ currentCompany?.foundedYear || '未设置' }}
        </el-descriptions-item>
        <el-descriptions-item label="公司地址">
          {{ currentCompany?.address || '未设置' }}
        </el-descriptions-item>
        <el-descriptions-item label="验证状态">
          <el-tag
            :type="
              getStatusType(currentCompany?.verificationStatus) as
                | 'success'
                | 'warning'
                | 'info'
                | 'danger'
            "
          >
            {{ getStatusText(currentCompany?.verificationStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDate(currentCompany?.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatDate(currentCompany?.updatedAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="公司简介">
          {{ currentCompany?.description || '暂无简介' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import CommonCrudTable from '@/components/CommonCrudTable.vue'
  import { CompanyService } from '@/api/userApi'
  import { Company } from '@/api/model/userModel'
  import { ElMessage, FormInstance, FormRules } from 'element-plus'

  // 数据列表
  const companyList = ref<Company[]>([])
  const total = ref(0)
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchKeyword = ref('')

  // 表单
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const form = ref<Company>({
    name: '',
    industry: '',
    size: undefined,
    fundingStage: undefined,
    foundedYear: undefined,
    address: '',
    description: '',
    verificationStatus: 'PENDING'
  })
  const foundedDate = ref<Date | null>(null)
  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  // 查看详情
  const viewDialogVisible = ref(false)
  const currentCompany = ref<Company | null>(null)

  // 表单规则
  const rules = ref<FormRules>({
    name: [
      { required: true, message: '请输入公司名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    industry: [{ required: true, message: '请输入行业', trigger: 'blur' }],
    verificationStatus: [{ required: true, message: '请选择验证状态', trigger: 'change' }]
  })

  // 获取数据
  onMounted(() => {
    fetchCompanyList()
  })

  const fetchCompanyList = async () => {
    loading.value = true
    try {
      const res = await CompanyService.getCompanyList({
        page: currentPage.value,
        size: pageSize.value,
        keyword: searchKeyword.value
      })

      if (res.code === 200) {
        companyList.value = res.data || []
        total.value = res.total || 0
      } else {
        ElMessage.error(res.message || '获取公司列表失败')
      }
    } catch (_error) {
      ElMessage.error('获取公司列表失败')
    } finally {
      loading.value = false
    }
  }

  // 处理搜索
  const handleSearch = (params: { keyword: string; page: number; pageSize: number }) => {
    searchKeyword.value = params.keyword
    currentPage.value = params.page
    pageSize.value = params.pageSize
    fetchCompanyList()
  }

  // 处理分页
  const handlePageChange = (params: { page: number; pageSize: number }) => {
    currentPage.value = params.page
    pageSize.value = params.pageSize
    fetchCompanyList()
  }

  const handleSizeChange = (params: { page: number; pageSize: number }) => {
    currentPage.value = params.page
    pageSize.value = params.pageSize
    fetchCompanyList()
  }

  // 新增
  const handleAdd = () => {
    dialogType.value = 'add'
    form.value = {
      name: '',
      industry: '',
      size: undefined,
      fundingStage: undefined,
      foundedYear: undefined,
      address: '',
      description: '',
      verificationStatus: 'PENDING'
    }
    foundedDate.value = null
    dialogVisible.value = true
  }

  // 编辑
  const handleEdit = (row: Company) => {
    dialogType.value = 'edit'
    form.value = { ...row }

    // 设置年份选择器
    if (row.foundedYear) {
      foundedDate.value = new Date(row.foundedYear, 0, 1)
    } else {
      foundedDate.value = null
    }

    dialogVisible.value = true
  }

  // 查看
  const handleView = (row: Company) => {
    currentCompany.value = row
    viewDialogVisible.value = true
  }

  // 删除
  const handleDelete = async (row: Company) => {
    try {
      const res = await CompanyService.deleteCompany(row.id!)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchCompanyList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (_error) {
      ElMessage.error('删除失败')
    }
  }

  // 处理年份变更
  const handleYearChange = (date: Date | null) => {
    if (date) {
      form.value.foundedYear = date.getFullYear()
    } else {
      form.value.foundedYear = undefined
    }
  }

  // 处理验证状态更新
  const handleVerify = async (row: Company, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await CompanyService.updateVerificationStatus(row.id!, status)
      if (res.code === 200) {
        ElMessage.success(status === 'VERIFIED' ? '已通过验证' : '已拒绝验证')
        fetchCompanyList()
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    } catch (_error) {
      ElMessage.error('操作失败')
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
          if (dialogType.value === 'add') {
            // 创建新公司
            res = await CompanyService.createCompany(form.value)
          } else {
            // 更新公司
            const { id, ...updateData } = form.value
            res = await CompanyService.updateCompany(id!, updateData)
          }

          if (res.code === 200) {
            ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
            dialogVisible.value = false
            fetchCompanyList()
          } else {
            ElMessage.error(res.message || (dialogType.value === 'add' ? '添加失败' : '更新失败'))
          }
        } catch (_error) {
          ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败')
        } finally {
          submitLoading.value = false
        }
      }
    })
  }

  // 格式化日期
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-'
    if (typeof date === 'string') {
      return new Date(date).toLocaleString()
    }
    return date.toLocaleString()
  }

  // 获取公司规模文本
  const getCompanySizeText = (size: string | undefined) => {
    if (!size) return '未设置'
    const sizeMap: Record<string, string> = {
      TINY: '0-20人',
      SMALL: '20-99人',
      MEDIUM: '100-499人',
      LARGE: '500-999人',
      XLARGE: '1000-9999人',
      XXLARGE: '10000+人'
    }
    return sizeMap[size] || '未知'
  }

  // 获取融资阶段文本
  const getFundingStageText = (fundingStage: string | undefined) => {
    if (!fundingStage) return '未设置'
    const fundingMap: Record<string, string> = {
      UNFUNDED: '未融资',
      ANGEL: '天使轮',
      SERIES_A: 'A轮',
      SERIES_B: 'B轮',
      SERIES_C: 'C轮',
      SERIES_D: 'D轮及以上',
      IPO: '已上市',
      SELF_FUNDED: '不需要融资'
    }
    return fundingMap[fundingStage] || '未知'
  }

  // 获取验证状态类型
  const getStatusType = (status: string | undefined) => {
    if (!status) return ''
    const statusMap: Record<string, string> = {
      PENDING: 'warning',
      VERIFIED: 'success',
      REJECTED: 'danger'
    }
    return statusMap[status] || ''
  }

  // 获取验证状态文本
  const getStatusText = (status: string | undefined) => {
    if (!status) return '未知'
    const statusMap: Record<string, string> = {
      PENDING: '待验证',
      VERIFIED: '已验证',
      REJECTED: '已拒绝'
    }
    return statusMap[status] || '未知'
  }
</script>

<style scoped>
  .company-list-page {
    padding: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }
</style>
