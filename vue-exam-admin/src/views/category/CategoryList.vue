<template>
  <div class="category-list-page">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
        </div>
      </template>

      <div class="category-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="输入分类名称搜索"
          style="width: 250px"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><i class="iconfont-sys">&#xe628;</i></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleAdd">新增一级分类</el-button>
      </div>

      <el-table
        :data="categoryList"
        border
        style="width: 100%"
        row-key="id"
        :expand-row-keys="expandedRows"
        :tree-props="{ children: 'children', hasChildren: 'hasSubCategories' }"
        v-loading="loading"
      >
        <el-table-column type="expand">
          <template #default="props">
            <div
              class="subcategory-wrapper"
              v-if="props.row.children && props.row.children.length > 0"
            >
              <el-table :data="props.row.children" border style="width: 100%; margin-bottom: 10px">
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
                      @click="handleEditSubCategory(scope.row, props.row.id)"
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
            </div>
            <div class="empty-subcategory" v-else>
              <el-empty description="暂无子分类" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="scope">{{ formatDate(scope.row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)"> 编辑 </el-button>
            <el-button type="success" size="small" @click="handleAddSubCategory(scope.row)">
              添加子分类
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">
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
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 一级分类 Add/Edit Dialog -->
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

    <!-- 二级分类 Add/Edit Dialog -->
    <el-dialog
      v-model="subDialogVisible"
      :title="subDialogType === 'add' ? '新增子分类' : '编辑子分类'"
      width="50%"
      :close-on-click-modal="false"
    >
      <el-form
        ref="subFormRef"
        :model="subForm"
        :rules="rules"
        label-position="top"
        label-width="100px"
      >
        <el-form-item label="所属分类" prop="categoryId">
          <el-select
            v-model="subForm.categoryId"
            placeholder="选择所属分类"
            style="width: 100%"
            :disabled="subDialogType === 'edit'"
          >
            <el-option
              v-for="item in categoryList"
              :key="item.id!"
              :label="item.name"
              :value="item.id!"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="子分类名称" prop="name">
          <el-input v-model="subForm.name" placeholder="请输入子分类名称" />
        </el-form-item>
        <el-form-item label="子分类描述" prop="description">
          <el-input
            v-model="subForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入子分类描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="subDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitSubForm" :loading="submitLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import CommonCrudTable from '@/components/CommonCrudTable.vue'
  import { CategoryService } from '@/api/categoryService'
  import { SubCategoryService } from '@/api/subCategoryService'
  import {
    Category as CategoryModel,
    SubCategory as SubCategoryModel
  } from '@/api/model/examModels'
  import { ElMessage, FormInstance, FormRules } from 'element-plus'

  // Setup router
  const router = useRouter()

  // Data
  const categoryList = ref<CategoryModel[]>([])
  const expandedRows = ref<string[]>([])
  const total = ref(0)
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchKeyword = ref('')

  // Main Category Form
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const form = ref<CategoryModel>({
    name: '',
    description: ''
  })
  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  // Sub Category Form
  const subDialogVisible = ref(false)
  const subDialogType = ref<'add' | 'edit'>('add')
  const subForm = ref<SubCategoryModel>({
    name: '',
    description: '',
    categoryId: 0
  })
  const subFormRef = ref<FormInstance>()

  // Form Rules
  const rules = ref<FormRules>({
    name: [
      { required: true, message: '请输入分类名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    categoryId: [{ required: true, message: '请选择所属分类', trigger: 'change' }]
  })

  // Fetch Data
  onMounted(() => {
    fetchCategoryList()
  })

  const fetchCategoryList = async () => {
    loading.value = true
    try {
      const res = await CategoryService.getAllCategories()

      if (res.code === 200) {
        // 处理数据，确保每个分类都有subCategories属性
        let categoryData = res.data || []
        categoryData = categoryData.map((category: CategoryModel) => ({
          ...category,
          hasSubCategories: category.children && category.children.length > 0
        }))

        // 如果有搜索关键词，进行过滤
        if (searchKeyword.value) {
          const keyword = searchKeyword.value.toLowerCase()
          categoryData = categoryData.filter(
            (item: CategoryModel) =>
              item.name.toLowerCase().includes(keyword) ||
              (item.description && item.description.toLowerCase().includes(keyword))
          )
        }

        // 计算总数
        total.value = categoryData.length

        // 分页处理
        const start = (currentPage.value - 1) * pageSize.value
        const end = start + pageSize.value
        categoryList.value = categoryData.slice(start, end)
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

  // Handlers
  const handleSearch = () => {
    currentPage.value = 1
    fetchCategoryList()
  }

  const handlePageChange = (page: number) => {
    currentPage.value = page
    fetchCategoryList()
  }

  const handleSizeChange = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
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

  const handleAddSubCategory = (row: CategoryModel) => {
    if (!row.id) {
      ElMessage.error('分类ID不存在')
      return
    }

    subDialogType.value = 'add'
    subForm.value = {
      name: '',
      description: '',
      categoryId: row.id
    }
    subDialogVisible.value = true

    // Expand the row after dialog is shown
    if (!expandedRows.value.includes(row.id!.toString())) {
      expandedRows.value.push(row.id!.toString())
    }
  }

  const handleEditSubCategory = (row: SubCategoryModel, parentId?: number) => {
    subDialogType.value = 'edit'
    subForm.value = {
      id: row.id,
      name: row.name,
      description: row.description,
      categoryId: row.categoryId || (parentId as number)
    }
    subDialogVisible.value = true
  }

  const handleDelete = async (row: CategoryModel) => {
    try {
      // 检查是否有子分类
      if (row.children && row.children.length > 0) {
        ElMessage.warning('请先删除该分类下的所有子分类')
        return
      }

      const res = await CategoryService.deleteCategory(row.id!)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchCategoryList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }

  const handleDeleteSubCategory = async (row: SubCategoryModel) => {
    try {
      const res = await SubCategoryService.deleteSubCategory(row.id!)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchCategoryList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }

  const submitForm = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true
        try {
          let res
          if (dialogType.value === 'add') {
            // 创建一级分类
            res = await CategoryService.createCategory({
              name: form.value.name,
              description: form.value.description
            })
          } else {
            // 更新一级分类
            res = await CategoryService.updateCategory(form.value.id!, {
              name: form.value.name,
              description: form.value.description
            })
          }

          if (res.code === 200) {
            ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
            dialogVisible.value = false
            fetchCategoryList()
          } else {
            ElMessage.error(res.message || (dialogType.value === 'add' ? '添加失败' : '更新失败'))
          }
        } catch (error) {
          console.error('提交表单失败:', error)
          ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败')
        } finally {
          submitLoading.value = false
        }
      }
    })
  }

  const submitSubForm = async () => {
    if (!subFormRef.value) return

    await subFormRef.value.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true
        try {
          let res
          if (subDialogType.value === 'add') {
            // 创建二级分类
            res = await SubCategoryService.createSubCategory({
              name: subForm.value.name,
              description: subForm.value.description,
              categoryId: subForm.value.categoryId
            })
          } else {
            // 更新二级分类
            res = await SubCategoryService.updateSubCategory(subForm.value.id!, {
              name: subForm.value.name,
              description: subForm.value.description,
              categoryId: subForm.value.categoryId
            })
          }

          if (res.code === 200) {
            ElMessage.success(subDialogType.value === 'add' ? '添加成功' : '更新成功')
            subDialogVisible.value = false
            fetchCategoryList()
          } else {
            ElMessage.error(
              res.message || (subDialogType.value === 'add' ? '添加失败' : '更新失败')
            )
          }
        } catch (error) {
          console.error('提交表单失败:', error)
          ElMessage.error(subDialogType.value === 'add' ? '添加失败' : '更新失败')
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

  .category-actions {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .subcategory-wrapper {
    padding: 20px;
    background-color: #f8f8f8;
  }

  .empty-subcategory {
    padding: 20px;
    background-color: #f8f8f8;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
</style>
