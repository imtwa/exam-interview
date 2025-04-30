<template>
  <div class="subcategory-list-page">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>子分类管理</span>
        </div>
      </template>

      <div class="filter-row">
        <el-select
          v-model="selectedCategoryId"
          placeholder="选择父分类"
          clearable
          @change="handleCategoryChange"
          style="width: 200px"
        >
          <el-option
            v-for="item in categoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>

      <CommonCrudTable
        :data="subCategoryList"
        :total="total"
        :loading="loading"
        search-placeholder="输入子分类名称搜索"
        add-button-text="新增子分类"
        @search="handleSearch"
        @add="handleAdd"
        @edit="handleEdit"
        @delete="handleDelete"
        @view="handleView"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="子分类名称" />
        <el-table-column prop="category.name" label="所属分类" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="scope">{{ formatDate(scope.row.createdAt) }}</template>
        </el-table-column>
      </CommonCrudTable>
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增子分类' : '编辑子分类'"
      width="50%"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" label-width="100px">
        <el-form-item label="所属分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="选择所属分类" style="width: 100%">
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="子分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入子分类名称" />
        </el-form-item>
        <el-form-item label="子分类描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入子分类描述"
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
    <el-dialog v-model="viewDialogVisible" title="子分类详情" width="50%">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ currentSubCategory?.id }}</el-descriptions-item>
        <el-descriptions-item label="子分类名称">{{
          currentSubCategory?.name
        }}</el-descriptions-item>
        <el-descriptions-item label="所属分类">{{
          currentSubCategory?.category?.name
        }}</el-descriptions-item>
        <el-descriptions-item label="子分类描述">{{
          currentSubCategory?.description
        }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{
          formatDate(currentSubCategory?.createdAt)
        }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{
          formatDate(currentSubCategory?.updatedAt)
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
import { SubCategoryService } from '@/api/subCategoryService'
  import { CategoryModel, SubCategoryModel } from '@/api/model/examModels'
  import { ElMessage, FormInstance, FormRules } from 'element-plus'

  // Data
  const subCategoryList = ref<SubCategoryModel[]>([])
  const total = ref(0)
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchKeyword = ref('')

  // Category Filter
  const selectedCategoryId = ref<number | null>(null)
  const categoryOptions = ref<Array<{ label: string; value: number }>>([])

  // Form
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const form = ref<SubCategoryModel>({
    name: '',
    description: '',
    categoryId: 0
  })
  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  // View Dialog
  const viewDialogVisible = ref(false)
  const currentSubCategory = ref<SubCategoryModel | null>(null)

  // Form Rules
  const rules = ref<FormRules>({
    name: [
      { required: true, message: '请输入子分类名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    categoryId: [{ required: true, message: '请选择所属分类', trigger: 'change' }]
  })

  // Fetch Data
  onMounted(async () => {
    await fetchCategories()
    fetchSubCategoryList()
  })

  const fetchCategories = async () => {
    try {
      const res = await CategoryService.getAllCategories()
      if (res.code === 200 && res.data) {
        categoryOptions.value = res.data.map((category: CategoryModel) => ({
          label: category.name,
          value: category.id!
        }))
      }
    } catch (error) {
      ElMessage.error('获取分类列表失败')
    }
  }

  const fetchSubCategoryList = async () => {
    loading.value = true
    try {
      const res = await SubCategoryService.getSubCategoryList({
        page: currentPage.value,
        size: pageSize.value,
        searchVal: searchKeyword.value,
        categoryId: selectedCategoryId.value
      })

      if (res.code === 200) {
        subCategoryList.value = res.data || []
        total.value = res.total || 0
      } else {
        ElMessage.error(res.message || '获取子分类列表失败')
      }
    } catch (error) {
      ElMessage.error('获取子分类列表失败')
    } finally {
      loading.value = false
    }
  }

  // Handlers
  const handleCategoryChange = () => {
    currentPage.value = 1
    fetchSubCategoryList()
  }

  const handleSearch = (params: { keyword: string; page: number; pageSize: number }) => {
    searchKeyword.value = params.keyword
    currentPage.value = params.page
    pageSize.value = params.pageSize
    fetchSubCategoryList()
  }

  const handlePageChange = (params: { page: number; pageSize: number }) => {
    currentPage.value = params.page
    pageSize.value = params.pageSize
    fetchSubCategoryList()
  }

  const handleSizeChange = (params: { page: number; pageSize: number }) => {
    currentPage.value = params.page
    pageSize.value = params.pageSize
    fetchSubCategoryList()
  }

  const handleAdd = () => {
    dialogType.value = 'add'
    form.value = {
      name: '',
      description: '',
      categoryId: selectedCategoryId.value || 0
    }
    dialogVisible.value = true
  }

  const handleEdit = (row: SubCategoryModel) => {
    dialogType.value = 'edit'
    form.value = {
      id: row.id,
      name: row.name,
      description: row.description,
      categoryId: row.categoryId
    }
    dialogVisible.value = true
  }

  const handleView = (row: SubCategoryModel) => {
    currentSubCategory.value = row
    viewDialogVisible.value = true
  }

  const handleDelete = async (row: SubCategoryModel) => {
    try {
      const res = await SubCategoryService.deleteSubCategory(row.id!)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchSubCategoryList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
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
              ? SubCategoryService.addSubCategory
              : SubCategoryService.updateSubCategory

          const res =
            dialogType.value === 'add'
              ? await service(form.value)
              : await service(form.value.id!, form.value)

          if (res.code === 200) {
            ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
            dialogVisible.value = false
            fetchSubCategoryList()
          } else {
            ElMessage.error(res.message || (dialogType.value === 'add' ? '添加失败' : '更新失败'))
          }
        } catch (error) {
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
  .subcategory-list-page {
    padding: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .filter-row {
    margin-bottom: 20px;
  }
</style>
