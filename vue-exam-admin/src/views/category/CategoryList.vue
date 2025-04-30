<template>
  <div class="category-list-page">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
        </div>
      </template>

      <CommonCrudTable
        :data="categoryList"
        :total="total"
        :loading="loading"
        search-placeholder="输入分类名称搜索"
        add-button-text="新增分类"
        @search="handleSearch"
        @add="handleAdd"
        @edit="handleEdit"
        @delete="handleDelete"
        @view="handleView"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="scope">{{ formatDate(scope.row.createdAt) }}</template>
        </el-table-column>
      </CommonCrudTable>
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增分类' : '编辑分类'"
      width="50%"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入分类描述"
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
    <el-dialog v-model="viewDialogVisible" title="分类详情" width="50%">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ currentCategory?.id }}</el-descriptions-item>
        <el-descriptions-item label="分类名称">{{ currentCategory?.name }}</el-descriptions-item>
        <el-descriptions-item label="分类描述">{{
          currentCategory?.description
        }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{
          formatDate(currentCategory?.createdAt)
        }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{
          formatDate(currentCategory?.updatedAt)
        }}</el-descriptions-item>
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
  import { CategoryService } from '@/api/categoryService'
  import { CategoryModel } from '@/api/model/examModels'
  import { ElMessage, FormInstance, FormRules } from 'element-plus'

  // Data
  const categoryList = ref<CategoryModel[]>([])
  const total = ref(0)
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchKeyword = ref('')

  // Form
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const form = ref<CategoryModel>({
    name: '',
    description: ''
  })
  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  // View Dialog
  const viewDialogVisible = ref(false)
  const currentCategory = ref<CategoryModel | null>(null)

  // Form Rules
  const rules = ref<FormRules>({
    name: [
      { required: true, message: '请输入分类名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ]
  })

  // Fetch Data
  onMounted(() => {
    fetchCategoryList()
  })

  const fetchCategoryList = async () => {
    loading.value = true
    try {
      const res = await CategoryService.getCategoryList({
        page: currentPage.value,
        size: pageSize.value,
        searchVal: searchKeyword.value
      })

      if (res.code === 200) {
        categoryList.value = res.data || []
        total.value = res.total || 0
      } else {
        ElMessage.error(res.message || '获取分类列表失败')
      }
    } catch (_) {
      ElMessage.error('获取分类列表失败')
    } finally {
      loading.value = false
    }
  }

  // Handlers
  const handleSearch = (params: { keyword: string; page: number; pageSize: number }) => {
    searchKeyword.value = params.keyword
    currentPage.value = params.page
    pageSize.value = params.pageSize
    fetchCategoryList()
  }

  const handlePageChange = (params: { page: number; pageSize: number }) => {
    currentPage.value = params.page
    pageSize.value = params.pageSize
    fetchCategoryList()
  }

  const handleSizeChange = (params: { page: number; pageSize: number }) => {
    currentPage.value = params.page
    pageSize.value = params.pageSize
    fetchCategoryList()
  }

  const handleAdd = () => {
    dialogType.value = 'add'
    form.value = {
      name: '',
      description: ''
    }
    dialogVisible.value = true
  }

  const handleEdit = (row: CategoryModel) => {
    dialogType.value = 'edit'
    form.value = {
      id: row.id,
      name: row.name,
      description: row.description
    }
    dialogVisible.value = true
  }

  const handleView = (row: CategoryModel) => {
    currentCategory.value = row
    viewDialogVisible.value = true
  }

  const handleDelete = async (row: CategoryModel) => {
    try {
      const res = await CategoryService.deleteCategory(row.id!)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchCategoryList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (_) {
      ElMessage.error('删除失败')
    }
  }

  const submitForm = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true
        try {
          const service =
            dialogType.value === 'add'
              ? CategoryService.addCategory
              : CategoryService.updateCategory

          const res =
            dialogType.value === 'add'
              ? await service(form.value)
              : await service(form.value.id!, form.value)

          if (res.code === 200) {
            ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
            dialogVisible.value = false
            fetchCategoryList()
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
  .category-list-page {
    padding: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
