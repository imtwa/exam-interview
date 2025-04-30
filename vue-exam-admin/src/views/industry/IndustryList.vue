<template>
  <div class="industry-list-page">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>行业分类管理</span>
        </div>
      </template>

      <CommonCrudTable
        :data="industryList"
        :total="total"
        :loading="loading"
        search-placeholder="输入行业名称搜索"
        add-button-text="新增行业"
        @search="handleSearch"
        @add="handleAdd"
        @edit="handleEdit"
        @delete="handleDelete"
        @view="handleView"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="行业名称" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="parentId" label="父级行业" width="120">
          <template #default="scope">
            <span>{{ getParentName(scope.row.parentId) || '无' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="scope">{{ formatDate(scope.row.createdAt) }}</template>
        </el-table-column>
      </CommonCrudTable>
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增行业' : '编辑行业'"
      width="50%"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" label-width="100px">
        <el-form-item label="行业名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入行业名称" />
        </el-form-item>
        <el-form-item label="行业描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入行业描述"
          />
        </el-form-item>
        <el-form-item label="父级行业" prop="parentId">
          <el-select
            v-model="form.parentId"
            placeholder="请选择父级行业"
            clearable
            style="width: 100%"
          >
            <el-option label="无" :value="null" />
            <el-option
              v-for="item in parentIndustries"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
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

    <!-- View Dialog -->
    <el-dialog v-model="viewDialogVisible" title="行业详情" width="50%">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ currentIndustry?.id }}</el-descriptions-item>
        <el-descriptions-item label="行业名称">{{ currentIndustry?.name }}</el-descriptions-item>
        <el-descriptions-item label="行业描述">{{
          currentIndustry?.description
        }}</el-descriptions-item>
        <el-descriptions-item label="父级行业">
          {{ getParentName(currentIndustry?.parentId) || '无' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDate(currentIndustry?.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatDate(currentIndustry?.updatedAt) }}
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
  import { ref, onMounted, computed } from 'vue'
  import CommonCrudTable from '@/components/CommonCrudTable.vue'
  import { IndustryService } from '@/api/industryService'
  import { Industry } from '@/api/model/userModel'
  import { ElMessage, FormInstance, FormRules } from 'element-plus'

  // Data
  const industryList = ref<Industry[]>([])
  const total = ref(0)
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchKeyword = ref('')
  const parentIndustries = ref<Industry[]>([])

  // Form
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const form = ref<Partial<Industry>>({
    name: '',
    description: '',
    parentId: null
  })
  const formRef = ref<FormInstance | null>(null)
  const submitLoading = ref(false)

  // View Dialog
  const viewDialogVisible = ref(false)
  const currentIndustry = ref<Industry | null>(null)

  // Rules
  const rules = ref<FormRules>({
    name: [
      { required: true, message: '请输入行业名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    description: [{ max: 500, message: '长度不能超过 500 个字符', trigger: 'blur' }]
  })

  // Methods
  const loadIndustryList = async () => {
    loading.value = true
    try {
      const res = await IndustryService.getIndustryList()
      if (res.code === 0) {
        industryList.value = res.data || []
        total.value = industryList.value.length
      } else {
        ElMessage.error(res.message || '获取行业列表失败')
      }
    } catch (error) {
      console.error('获取行业列表失败', error)
      ElMessage.error('获取行业列表失败')
    } finally {
      loading.value = false
    }
  }

  const loadParentIndustries = async () => {
    try {
      const res = await IndustryService.getIndustryList()
      if (res.code === 0) {
        // 过滤掉当前编辑的行业（如果是编辑模式）
        parentIndustries.value =
          dialogType.value === 'edit'
            ? (res.data || []).filter((item) => item.id !== form.value.id)
            : res.data || []
      }
    } catch (error) {
      console.error('获取父级行业列表失败', error)
    }
  }

  const getParentName = (parentId: number | null | undefined) => {
    if (!parentId) return ''
    const parent = parentIndustries.value.find((item) => item.id === parentId)
    return parent ? parent.name : ''
  }

  const handleSearch = (keyword: string) => {
    searchKeyword.value = keyword
    currentPage.value = 1
    loadIndustryList()
  }

  const handleAdd = () => {
    dialogType.value = 'add'
    form.value = {
      name: '',
      description: '',
      parentId: null
    }
    loadParentIndustries()
    dialogVisible.value = true
  }

  const handleEdit = (row: Industry) => {
    dialogType.value = 'edit'
    form.value = { ...row }
    loadParentIndustries()
    dialogVisible.value = true
  }

  const handleDelete = async (row: Industry) => {
    try {
      const res = await IndustryService.deleteIndustry(row.id!)
      if (res.code === 0) {
        ElMessage.success('删除成功')
        loadIndustryList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除行业失败', error)
      ElMessage.error('删除行业失败')
    }
  }

  const handleView = (row: Industry) => {
    currentIndustry.value = row
    viewDialogVisible.value = true
  }

  const handlePageChange = (page: number) => {
    currentPage.value = page
    loadIndustryList()
  }

  const handleSizeChange = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
    loadIndustryList()
  }

  const submitForm = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true
        try {
          let res
          if (dialogType.value === 'add') {
            res = await IndustryService.createIndustry(
              form.value as Omit<Industry, 'id' | 'children'>
            )
          } else {
            res = await IndustryService.updateIndustry(form.value.id!, form.value)
          }

          if (res.code === 0) {
            ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
            dialogVisible.value = false
            loadIndustryList()
          } else {
            ElMessage.error(res.message || (dialogType.value === 'add' ? '添加失败' : '更新失败'))
          }
        } catch (error) {
          console.error(dialogType.value === 'add' ? '添加行业失败' : '更新行业失败', error)
          ElMessage.error(dialogType.value === 'add' ? '添加行业失败' : '更新行业失败')
        } finally {
          submitLoading.value = false
        }
      }
    })
  }

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return ''
    return new Date(date).toLocaleString()
  }

  // Lifecycle
  onMounted(() => {
    loadIndustryList()
    loadParentIndustries()
  })
</script>

<style scoped>
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-form {
    margin-bottom: 20px;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
</style>
