<template>
  <div class="exam-paper-list-page">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>试卷管理</span>
        </div>
      </template>

      <div class="filter-row">
        <el-select
          v-model="selectedCategoryId"
          placeholder="选择分类"
          clearable
          @change="handleCategoryChange"
          style="width: 180px"
        >
          <el-option
            v-for="item in categoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <el-select
          v-model="selectedSubCategoryId"
          placeholder="选择子分类"
          clearable
          :disabled="!selectedCategoryId"
          @change="handleFilterChange"
          style="width: 180px; margin-left: 10px"
        >
          <el-option
            v-for="item in subCategoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>

      <CommonCrudTable
        :data="examPaperList"
        :total="total"
        :loading="loading"
        search-placeholder="输入试卷名称搜索"
        add-button-text="新增试卷"
        @search="handleSearch"
        @add="handleAdd"
        @edit="handleEdit"
        @delete="handleDelete"
        @view="handleView"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      >
        <template #extraButtons>
          <el-button type="success" plain @click="openGenerateDialog">AI生成试卷</el-button>
        </template>

        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="试卷名称" />
        <el-table-column prop="category.name" label="分类" />
        <el-table-column prop="subCategory.name" label="子分类" />
        <el-table-column prop="favoriteCount" label="收藏数" width="100" />
        <el-table-column prop="isPublic" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isPublic ? 'success' : 'info'">
              {{ scope.row.isPublic ? '公开' : '私有' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="scope">{{ formatDate(scope.row.createdAt) }}</template>
        </el-table-column>

        <template #extraActions="{ row }">
          <el-button type="success" size="small" @click.stop="manageQuestions(row)" link>
            管理题目
          </el-button>
        </template>
      </CommonCrudTable>
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增试卷' : '编辑试卷'"
      width="60%"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" label-width="100px">
        <el-form-item label="试卷名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入试卷名称" />
        </el-form-item>

        <el-form-item label="分类" prop="categoryId">
          <el-select
            v-model="form.categoryId"
            placeholder="选择分类"
            style="width: 100%"
            @change="handleFormCategoryChange"
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="子分类" prop="subCategoryId">
          <el-select
            v-model="form.subCategoryId"
            placeholder="选择子分类"
            style="width: 100%"
            :disabled="!form.categoryId"
          >
            <el-option
              v-for="item in formSubCategoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="试卷描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入试卷描述"
          />
        </el-form-item>

        <el-form-item label="发布状态" prop="isPublic">
          <el-switch v-model="form.isPublic" :active-text="'公开'" :inactive-text="'私有'" />
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
    <el-dialog v-model="viewDialogVisible" title="试卷详情" width="60%">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ currentExamPaper?.id }}</el-descriptions-item>
        <el-descriptions-item label="试卷名称">{{ currentExamPaper?.name }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{
          currentExamPaper?.category?.name
        }}</el-descriptions-item>
        <el-descriptions-item label="子分类">{{
          currentExamPaper?.subCategory?.name
        }}</el-descriptions-item>
        <el-descriptions-item label="试卷描述">{{
          currentExamPaper?.description
        }}</el-descriptions-item>
        <el-descriptions-item label="发布状态">
          <el-tag :type="currentExamPaper?.isPublic ? 'success' : 'info'">
            {{ currentExamPaper?.isPublic ? '公开' : '私有' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="收藏数">{{
          currentExamPaper?.favoriteCount
        }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{
          formatDate(currentExamPaper?.createdAt)
        }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{
          formatDate(currentExamPaper?.updatedAt)
        }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- AI Generate Dialog -->
    <el-dialog
      v-model="generateDialogVisible"
      title="AI生成试卷"
      width="50%"
      :close-on-click-modal="false"
    >
      <el-form
        ref="generateFormRef"
        :model="generateForm"
        :rules="generateRules"
        label-position="top"
        label-width="100px"
      >
        <el-form-item label="试卷名称" prop="name">
          <el-input v-model="generateForm.name" placeholder="请输入试卷名称" />
        </el-form-item>

        <el-form-item label="分类" prop="categoryId">
          <el-select
            v-model="generateForm.categoryId"
            placeholder="选择分类"
            style="width: 100%"
            @change="handleGenerateFormCategoryChange"
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="子分类" prop="subCategoryId">
          <el-select
            v-model="generateForm.subCategoryId"
            placeholder="选择子分类（可选）"
            style="width: 100%"
            :disabled="!generateForm.categoryId"
            clearable
          >
            <el-option
              v-for="item in generateFormSubCategoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="题目数量" prop="questionCount">
          <el-input-number
            v-model="generateForm.questionCount"
            :min="5"
            :max="50"
            :step="5"
            style="width: 180px"
          />
        </el-form-item>

        <el-form-item label="试卷难度" prop="difficulty">
          <el-rate
            v-model="generateForm.difficulty"
            :max="3"
            :texts="['简单', '中等', '困难']"
            show-text
          />
        </el-form-item>

        <el-form-item label="试卷描述" prop="description">
          <el-input
            v-model="generateForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入试卷描述（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="generateDialogVisible = false">取消</el-button>
          <el-button type="success" @click="generateExamPaper" :loading="generatingExamPaper">
            生成试卷
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
  import { ExamPaperService } from '@/api/examPaperService'
  import { CategoryService } from '@/api/categoryService'
  import { SubCategoryService } from '@/api/subCategoryService'
  import { CategoryModel, SubCategoryModel, ExamPaperModel } from '@/api/model/examModels'
  import { ElMessage, FormInstance, FormRules } from 'element-plus'

  const router = useRouter()

  // Data
  const examPaperList = ref<ExamPaperModel[]>([])
  const total = ref(0)
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchKeyword = ref('')

  // Category Filters
  const selectedCategoryId = ref<number | null>(null)
  const selectedSubCategoryId = ref<number | null>(null)
  const categoryOptions = ref<Array<{ label: string; value: number }>>([])
  const subCategoryOptions = ref<Array<{ label: string; value: number }>>([])

  // Form
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const form = ref<ExamPaperModel>({
    name: '',
    description: '',
    categoryId: 0,
    subCategoryId: undefined,
    userId: 1, // This would typically come from user store
    isPublic: true
  })
  const formSubCategoryOptions = ref<Array<{ label: string; value: number }>>([])
  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  // View Dialog
  const viewDialogVisible = ref(false)
  const currentExamPaper = ref<ExamPaperModel | null>(null)

  // Generate Dialog
  const generateDialogVisible = ref(false)
  const generateForm = ref({
    name: '',
    categoryId: 0,
    subCategoryId: undefined as number | undefined,
    questionCount: 10,
    difficulty: 1,
    description: ''
  })
  const generateFormSubCategoryOptions = ref<Array<{ label: string; value: number }>>([])
  const generateFormRef = ref<FormInstance>()
  const generatingExamPaper = ref(false)

  // Form Rules
  const rules = ref<FormRules>({
    name: [
      { required: true, message: '请输入试卷名称', trigger: 'blur' },
      { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
    ],
    categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }]
  })

  // Generate Form Rules
  const generateRules = ref<FormRules>({
    name: [
      { required: true, message: '请输入试卷名称', trigger: 'blur' },
      { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
    ],
    categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
    questionCount: [{ required: true, message: '请设置题目数量', trigger: 'change' }]
  })

  // Fetch Data
  onMounted(async () => {
    await fetchCategories()
    fetchExamPaperList()
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

  const fetchSubCategories = async (categoryId: number) => {
    try {
      const res = await SubCategoryService.getSubCategoriesByCategoryId(categoryId)
      if (res.code === 200 && res.data) {
        return res.data.map((subCategory: SubCategoryModel) => ({
          label: subCategory.name,
          value: subCategory.id!
        }))
      }
      return []
    } catch (error) {
      ElMessage.error('获取子分类列表失败')
      return []
    }
  }

  const fetchExamPaperList = async () => {
    loading.value = true
    try {
      const res = await ExamPaperService.getExamPaperList({
        page: currentPage.value,
        size: pageSize.value,
        searchVal: searchKeyword.value,
        categoryId: selectedCategoryId.value,
        subCategoryId: selectedSubCategoryId.value
      })

      if (res.code === 200) {
        examPaperList.value = res.data || []
        total.value = res.total || 0
      } else {
        ElMessage.error(res.message || '获取试卷列表失败')
      }
    } catch (error) {
      ElMessage.error('获取试卷列表失败')
    } finally {
      loading.value = false
    }
  }

  // Handlers
  const handleCategoryChange = async () => {
    selectedSubCategoryId.value = null
    subCategoryOptions.value = []

    if (selectedCategoryId.value) {
      subCategoryOptions.value = await fetchSubCategories(selectedCategoryId.value)
    }

    currentPage.value = 1
    fetchExamPaperList()
  }

  const handleFilterChange = () => {
    currentPage.value = 1
    fetchExamPaperList()
  }

  const handleFormCategoryChange = async () => {
    form.value.subCategoryId = undefined
    formSubCategoryOptions.value = []

    if (form.value.categoryId) {
      formSubCategoryOptions.value = await fetchSubCategories(form.value.categoryId)
    }
  }

  const handleGenerateFormCategoryChange = async () => {
    generateForm.value.subCategoryId = undefined
    generateFormSubCategoryOptions.value = []

    if (generateForm.value.categoryId) {
      generateFormSubCategoryOptions.value = await fetchSubCategories(generateForm.value.categoryId)
    }
  }

  const handleSearch = (params: { keyword: string; page: number; pageSize: number }) => {
    searchKeyword.value = params.keyword
    currentPage.value = params.page
    pageSize.value = params.pageSize
    fetchExamPaperList()
  }

  const handlePageChange = (params: { page: number; pageSize: number }) => {
    currentPage.value = params.page
    pageSize.value = params.pageSize
    fetchExamPaperList()
  }

  const handleSizeChange = (params: { page: number; pageSize: number }) => {
    currentPage.value = params.page
    pageSize.value = params.pageSize
    fetchExamPaperList()
  }

  const handleAdd = () => {
    dialogType.value = 'add'
    form.value = {
      name: '',
      description: '',
      categoryId: 0,
      subCategoryId: undefined,
      userId: 1, // This would typically come from user store
      isPublic: true
    }
    formSubCategoryOptions.value = []
    dialogVisible.value = true
  }

  const handleEdit = (row: ExamPaperModel) => {
    dialogType.value = 'edit'
    form.value = {
      id: row.id,
      name: row.name,
      description: row.description,
      categoryId: row.categoryId,
      subCategoryId: row.subCategoryId,
      userId: row.userId,
      isPublic: row.isPublic
    }

    handleFormCategoryChange()
    dialogVisible.value = true
  }

  const handleView = (row: ExamPaperModel) => {
    currentExamPaper.value = row
    viewDialogVisible.value = true
  }

  const handleDelete = async (row: ExamPaperModel) => {
    try {
      const res = await ExamPaperService.deleteExamPaper(row.id!)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchExamPaperList()
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
              ? ExamPaperService.addExamPaper
              : ExamPaperService.updateExamPaper

          const res =
            dialogType.value === 'add'
              ? await service(form.value)
              : await service(form.value.id!, form.value)

          if (res.code === 200) {
            ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
            dialogVisible.value = false
            fetchExamPaperList()
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

  const manageQuestions = (row: ExamPaperModel) => {
    router.push({
      path: `/exam-paper/questions/${row.id}`,
      query: { name: row.name }
    })
  }

  const openGenerateDialog = () => {
    generateForm.value = {
      name: '',
      categoryId: 0,
      subCategoryId: undefined,
      questionCount: 10,
      difficulty: 1,
      description: ''
    }
    generateDialogVisible.value = true
  }

  const generateExamPaper = async () => {
    if (!generateFormRef.value) return

    await generateFormRef.value.validate(async (valid) => {
      if (valid) {
        generatingExamPaper.value = true
        try {
          const res = await ExamPaperService.generateExamPaper(generateForm.value)

          if (res.code === 200) {
            ElMessage.success('试卷生成成功')
            generateDialogVisible.value = false
            fetchExamPaperList()
          } else {
            ElMessage.error(res.message || '试卷生成失败')
          }
        } catch (error) {
          ElMessage.error('试卷生成失败')
        } finally {
          generatingExamPaper.value = false
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
  .exam-paper-list-page {
    padding: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .filter-row {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
  }
</style>
