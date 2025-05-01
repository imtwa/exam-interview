<template>
  <div class="category-management-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
        </div>
      </template>

      <el-row class="mb-4">
        <el-col :span="6">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入分类名称"
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
          <el-button type="primary" @click="handleAddCategory">新增分类</el-button>
        </el-col>
      </el-row>

      <el-table
        :data="categoryList"
        border
        style="width: 100%"
        v-loading="loading"
        row-key="id"
        :expand-row-keys="expandedRows"
        @expand-change="handleExpandChange"
      >
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="subcategory-container">
              <div class="subcategory-header">
                <h4>子分类列表</h4>
                <el-button type="primary" size="small" @click="handleAddSubCategory(row)">
                  添加子分类
                </el-button>
              </div>
              <el-table
                :data="row.children || []"
                border
                style="width: 100%"
                v-loading="subCategoryLoading"
              >
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="子分类名称" />
                <el-table-column prop="description" label="描述" show-overflow-tooltip />
                <el-table-column prop="createdAt" label="创建时间" width="180">
                  <template #default="scope">{{ formatDate(scope.row.createdAt) }}</template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="scope">
                    <el-button
                      type="primary"
                      size="small"
                      @click="handleEditSubCategory(scope.row, row)"
                    >
                      编辑
                    </el-button>
                    <el-button
                      type="danger"
                      size="small"
                      @click="handleDeleteSubCategory(scope.row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div v-if="(row.children || []).length === 0" class="no-data"> 暂无子分类数据 </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="scope">{{ formatDate(scope.row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEditCategory(scope.row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDeleteCategory(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 分类表单对话框 -->
    <el-dialog
      v-model="categoryDialogVisible"
      :title="categoryDialogType === 'add' ? '新增分类' : '编辑分类'"
      width="500px"
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="categoryForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="categoryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCategoryForm" :loading="submitLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 子分类表单对话框 -->
    <el-dialog
      v-model="subCategoryDialogVisible"
      :title="subCategoryDialogType === 'add' ? '新增子分类' : '编辑子分类'"
      width="500px"
    >
      <el-form
        ref="subCategoryFormRef"
        :model="subCategoryForm"
        :rules="subCategoryRules"
        label-width="100px"
      >
        <el-form-item label="所属分类" prop="categoryId">
          <el-select v-model="subCategoryForm.categoryId" placeholder="请选择所属分类" disabled>
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="子分类名称" prop="name">
          <el-input v-model="subCategoryForm.name" placeholder="请输入子分类名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="subCategoryForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="subCategoryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitSubCategoryForm" :loading="submitLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { Search } from '@element-plus/icons-vue'
  import { CategoryService } from '@/api/categoryService'
  import { SubCategoryService } from '@/api/subCategoryService'
  import { CategoryModel, SubCategoryModel } from '@/api/model/examModels'

  // 数据
  const categoryList = ref<CategoryModel[]>([])
  const total = ref(0)
  const loading = ref(false)
  const subCategoryLoading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const expandedRows = ref<string[]>([])

  // 搜索表单
  const searchForm = reactive({
    keyword: ''
  })

  // 分类表单
  const categoryDialogVisible = ref(false)
  const categoryDialogType = ref<'add' | 'edit'>('add')
  const categoryForm = reactive<CategoryModel>({
    name: '',
    description: ''
  })
  const categoryFormRef = ref<FormInstance>()
  const categoryRules = reactive<FormRules>({
    name: [
      { required: true, message: '请输入分类名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    description: [{ required: true, message: '请输入描述', trigger: 'blur' }]
  })

  // 子分类表单
  const subCategoryDialogVisible = ref(false)
  const subCategoryDialogType = ref<'add' | 'edit'>('add')
  const subCategoryForm = reactive<SubCategoryModel>({
    name: '',
    description: '',
    categoryId: 0
  })
  const subCategoryFormRef = ref<FormInstance>()
  const subCategoryRules = reactive<FormRules>({
    categoryId: [{ required: true, message: '请选择所属分类', trigger: 'change' }],
    name: [
      { required: true, message: '请输入子分类名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    description: [{ required: true, message: '请输入描述', trigger: 'blur' }]
  })

  const submitLoading = ref(false)

  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // 获取分类列表
  const fetchCategoryList = async () => {
    loading.value = true
    try {
      const res = await CategoryService.getCategoryList({
        page: currentPage.value,
        size: pageSize.value,
        searchVal: searchForm.keyword
      })

      if (res.code === 200) {
        categoryList.value = res.data || []
        total.value = res.total || 0

        // 预加载每个分类的子分类
        await Promise.all(
          categoryList.value.map(async (category) => {
            await fetchSubCategories(category.id)
          })
        )
      } else {
        ElMessage.error(res.message || '获取分类列表失败')
      }
    } catch (error) {
      console.error('获取分类列表失败:', error)
      ElMessage.error('获取分类列表失败')
    } finally {
      loading.value = false
    }
  }

  // 获取子分类列表
  const fetchSubCategories = async (categoryId: number) => {
    try {
      const res = await SubCategoryService.getSubCategoriesByCategoryId(categoryId)
      if (res.code === 200) {
        // 找到对应的分类并更新其子分类
        const category = categoryList.value.find((item) => item.id === categoryId)
        if (category) {
          category.children = res.data || []
        }
      }
    } catch (error) {
      console.error(`获取分类ID:${categoryId}的子分类失败:`, error)
    }
  }

  // 处理展开行变化
  const handleExpandChange = (row: CategoryModel, expanded: boolean) => {
    if (expanded) {
      expandedRows.value = [row.id.toString()]
      // 如果展开，确保子分类数据已加载
      if (!row.children || row.children.length === 0) {
        subCategoryLoading.value = true
        fetchSubCategories(row.id).finally(() => {
          subCategoryLoading.value = false
        })
      }
    } else {
      expandedRows.value = []
    }
  }

  // 搜索
  const handleSearch = () => {
    currentPage.value = 1
    fetchCategoryList()
  }

  // 分页
  const handleSizeChange = (val: number) => {
    pageSize.value = val
    currentPage.value = 1
    fetchCategoryList()
  }

  const handleCurrentChange = (val: number) => {
    currentPage.value = val
    fetchCategoryList()
  }

  // 分类操作
  const handleAddCategory = () => {
    categoryDialogType.value = 'add'
    categoryForm.id = undefined
    categoryForm.name = ''
    categoryForm.description = ''
    categoryDialogVisible.value = true
  }

  const handleEditCategory = (row: CategoryModel) => {
    categoryDialogType.value = 'edit'
    categoryForm.id = row.id
    categoryForm.name = row.name
    categoryForm.description = row.description
    categoryDialogVisible.value = true
  }

  const handleDeleteCategory = (row: CategoryModel) => {
    ElMessageBox.confirm(
      '确定要删除该分类吗？删除后将无法恢复，且会同时删除其下所有子分类。',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
      .then(async () => {
        try {
          const res = await CategoryService.deleteCategory(row.id)
          if (res.code === 200) {
            ElMessage.success('删除成功')
            fetchCategoryList()
          } else {
            ElMessage.error(res.message || '删除失败')
          }
        } catch (error) {
          console.error('删除分类失败:', error)
          ElMessage.error('删除失败')
        }
      })
      .catch(() => {
        // 用户取消删除
      })
  }

  const submitCategoryForm = async () => {
    if (!categoryFormRef.value) return

    await categoryFormRef.value.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true
        try {
          let res
          if (categoryDialogType.value === 'add') {
            res = await CategoryService.addCategory(categoryForm)
          } else {
            res = await CategoryService.updateCategory(categoryForm.id!, categoryForm)
          }

          if (res.code === 200) {
            ElMessage.success(categoryDialogType.value === 'add' ? '添加成功' : '更新成功')
            categoryDialogVisible.value = false
            fetchCategoryList()
          } else {
            ElMessage.error(
              res.message || (categoryDialogType.value === 'add' ? '添加失败' : '更新失败')
            )
          }
        } catch (error) {
          console.error(
            categoryDialogType.value === 'add' ? '添加分类失败:' : '更新分类失败:',
            error
          )
          ElMessage.error(categoryDialogType.value === 'add' ? '添加失败' : '更新失败')
        } finally {
          submitLoading.value = false
        }
      }
    })
  }

  // 子分类操作
  const handleAddSubCategory = (category: CategoryModel) => {
    subCategoryDialogType.value = 'add'
    subCategoryForm.id = undefined
    subCategoryForm.name = ''
    subCategoryForm.description = ''
    subCategoryForm.categoryId = category.id
    subCategoryDialogVisible.value = true
  }

  const handleEditSubCategory = (row: SubCategoryModel, category: CategoryModel) => {
    subCategoryDialogType.value = 'edit'
    subCategoryForm.id = row.id
    subCategoryForm.name = row.name
    subCategoryForm.description = row.description
    subCategoryForm.categoryId = category.id
    subCategoryDialogVisible.value = true
  }

  const handleDeleteSubCategory = (row: SubCategoryModel) => {
    ElMessageBox.confirm('确定要删除该子分类吗？删除后将无法恢复。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        try {
          const res = await SubCategoryService.deleteSubCategory(row.id)
          if (res.code === 200) {
            ElMessage.success('删除成功')
            // 重新获取该分类的子分类
            const category = categoryList.value.find((item) => item.id === row.categoryId)
            if (category) {
              fetchSubCategories(category.id)
            }
          } else {
            ElMessage.error(res.message || '删除失败')
          }
        } catch (error) {
          console.error('删除子分类失败:', error)
          ElMessage.error('删除失败')
        }
      })
      .catch(() => {
        // 用户取消删除
      })
  }

  const submitSubCategoryForm = async () => {
    if (!subCategoryFormRef.value) return

    await subCategoryFormRef.value.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true
        try {
          let res
          if (subCategoryDialogType.value === 'add') {
            res = await SubCategoryService.addSubCategory(subCategoryForm)
          } else {
            res = await SubCategoryService.updateSubCategory(subCategoryForm.id!, subCategoryForm)
          }

          if (res.code === 200) {
            ElMessage.success(subCategoryDialogType.value === 'add' ? '添加成功' : '更新成功')
            subCategoryDialogVisible.value = false
            // 重新获取该分类的子分类
            fetchSubCategories(subCategoryForm.categoryId)
          } else {
            ElMessage.error(
              res.message || (subCategoryDialogType.value === 'add' ? '添加失败' : '更新失败')
            )
          }
        } catch (error) {
          console.error(
            subCategoryDialogType.value === 'add' ? '添加子分类失败:' : '更新子分类失败:',
            error
          )
          ElMessage.error(subCategoryDialogType.value === 'add' ? '添加失败' : '更新失败')
        } finally {
          submitLoading.value = false
        }
      }
    })
  }

  onMounted(() => {
    fetchCategoryList()
  })
</script>

<style lang="scss" scoped>
  .category-management-container {
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

  .subcategory-container {
    padding: 10px 20px;
  }

  .subcategory-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    h4 {
      margin: 0;
      color: var(--el-text-color-primary);
    }
  }

  .no-data {
    padding: 20px 0;
    text-align: center;
    color: var(--el-text-color-secondary);
  }
</style>
