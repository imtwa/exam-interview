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
        <el-table-column prop="questionsCount" label="题目数量" width="100" />
        <el-table-column prop="user.username" label="创建者" width="120">
          <template #default="scope">
            <span>
              {{ scope.row.user?.username || '-' }}
              <el-tag v-if="scope.row.user?.role" size="small" type="info">
                {{ getUserRoleText(scope.row.user.role) }}
              </el-tag>
            </span>
          </template>
        </el-table-column>
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
          <el-button type="primary" size="small" @click.stop="viewExamQuestions(row)" link>
            查看题目
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
    <el-dialog v-model="viewDialogVisible" title="试卷详情" width="800px">
      <el-descriptions border :column="1">
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
        <el-descriptions-item label="题目数量">{{
          currentExamPaper?.questionsCount || 0
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
        <div class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="viewExamQuestions(currentExamPaper)">
            查看试卷题目
          </el-button>
          <el-button v-if="returnPath" type="info" @click="handleReturn"> 返回题目列表 </el-button>
        </div>
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
  import { ExamPaperService, CategoryService, SubCategoryService } from '@/api/examPaperService'
  import { Category, SubCategory, ExamPaper, ExamPaperListParams } from '@/api/model/examModels'
  import { ElMessage, FormInstance, FormRules } from 'element-plus'

  const router = useRouter()

  // Data
  const examPaperList = ref<ExamPaper[]>([])
  const total = ref(0)
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchKeyword = ref('')

  // Category Filters
  const selectedCategoryId = ref<number | undefined>(undefined)
  const selectedSubCategoryId = ref<number | undefined>(undefined)
  const categoryOptions = ref<Array<{ label: string; value: number }>>([])
  const subCategoryOptions = ref<Array<{ label: string; value: number }>>([])
  const categoriesCache = ref<any[]>([]) // 缓存分类数据

  // Form
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const form = ref<ExamPaper>({
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
  const currentExamPaper = ref<ExamPaper | null>(null)

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

  // 添加返回路径变量和处理方法
  const returnPath = ref<string | null>(null)

  // Fetch Data
  onMounted(async () => {
    await fetchCategories()

    // 检查URL参数，如果有view参数，则查看试卷详情
    const viewExamId = router.currentRoute.value.query.view
    if (viewExamId) {
      const examId = Number(viewExamId)
      const examName = router.currentRoute.value.query.name as string
      // 保存返回路径
      returnPath.value = (router.currentRoute.value.query.returnPath as string) || null
      await fetchExamPaperDetail(examId, examName)
    } else {
      fetchExamPaperList()
    }
  })

  const fetchCategories = async () => {
    try {
      const res = await CategoryService.getCategoryList({ page: 1, size: 999 })
      console.log('分类数据返回:', res)
      if (res.code === 200 && res.data) {
        // 根据API实际返回的数据结构调整
        const categories = Array.isArray(res.data) ? res.data : res.data.items || []
        categoriesCache.value = categories // 存储完整分类数据，包括子分类
        categoryOptions.value = categories.map((category) => ({
          label: category.name,
          value: category.id
        }))
      }
    } catch (error: any) {
      console.error('获取分类列表失败:', error)
      ElMessage.error('获取分类列表失败')
    }
  }

  // 从缓存中获取子分类，不再发送请求
  const getSubCategoriesFromCache = (categoryId: number) => {
    const category = categoriesCache.value.find((cat) => cat.id === categoryId)
    if (category && Array.isArray(category.children)) {
      return category.children.map((subCat) => ({
        label: subCat.name,
        value: subCat.id
      }))
    }
    return []
  }

  const fetchExamPaperList = async () => {
    loading.value = true
    try {
      const params: ExamPaperListParams = {
        page: currentPage.value,
        size: pageSize.value,
        keyword: searchKeyword.value
      }

      if (selectedCategoryId.value) {
        params.categoryId = selectedCategoryId.value
      }

      if (selectedSubCategoryId.value) {
        params.subCategoryId = selectedSubCategoryId.value
      }

      const res = await ExamPaperService.getExamPaperList(params)

      if (res.code === 200) {
        examPaperList.value = res.data.items || []
        total.value = res.data.total || 0

        // Make sure each item has a questionsCount
        examPaperList.value = examPaperList.value.map((paper) => ({
          ...paper,
          questionsCount: paper.questionsCount || 0
        }))
      } else {
        ElMessage.error(res.message || '获取试卷列表失败')
      }
    } catch (error: any) {
      console.error('获取试卷列表失败:', error)
      ElMessage.error('获取试卷列表失败')
    } finally {
      loading.value = false
    }
  }

  // Handlers
  const handleCategoryChange = () => {
    selectedSubCategoryId.value = undefined
    subCategoryOptions.value = []

    if (selectedCategoryId.value) {
      // 直接从缓存中获取子分类
      subCategoryOptions.value = getSubCategoriesFromCache(selectedCategoryId.value)
    }

    currentPage.value = 1
    fetchExamPaperList()
  }

  const handleFilterChange = () => {
    currentPage.value = 1
    fetchExamPaperList()
  }

  const handleFormCategoryChange = () => {
    form.value.subCategoryId = undefined
    formSubCategoryOptions.value = []

    if (form.value.categoryId) {
      // 直接从缓存中获取子分类
      formSubCategoryOptions.value = getSubCategoriesFromCache(form.value.categoryId)
    }
  }

  const handleGenerateFormCategoryChange = () => {
    generateForm.value.subCategoryId = undefined
    generateFormSubCategoryOptions.value = []

    if (generateForm.value.categoryId) {
      // 直接从缓存中获取子分类
      generateFormSubCategoryOptions.value = getSubCategoriesFromCache(
        generateForm.value.categoryId
      )
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

  const handleEdit = (row: ExamPaper) => {
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

  const handleView = (row: ExamPaper) => {
    currentExamPaper.value = row
    viewDialogVisible.value = true
  }

  const handleDelete = async (row: ExamPaper) => {
    try {
      const res = await ExamPaperService.deleteExamPaper(row.id!)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchExamPaperList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error: any) {
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
            // Create new exam paper
            res = await ExamPaperService.addExamPaper(form.value)
          } else {
            // Update existing exam paper
            res = await ExamPaperService.updateExamPaper(form.value.id!, form.value)
          }

          if (res.code === 200) {
            ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
            dialogVisible.value = false
            fetchExamPaperList()
          } else {
            ElMessage.error(res.message || (dialogType.value === 'add' ? '添加失败' : '更新失败'))
          }
        } catch (error: any) {
          console.error(dialogType.value === 'add' ? '添加失败:' : '更新失败:', error)
          ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败')
        } finally {
          submitLoading.value = false
        }
      }
    })
  }

  const viewExamQuestions = (row: ExamPaper | null) => {
    if (!row?.id) return

    // 关闭当前弹窗(如果打开的话)
    viewDialogVisible.value = false

    // 跳转到题目管理页面（使用replace而不是push）
    router.replace({
      path: `/exam-system/question`,
      query: {
        examId: row.id.toString(),
        examName: row.name
      }
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
        } catch (error: any) {
          console.error('试卷生成失败:', error)
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

  // 添加获取试卷详情的方法
  const fetchExamPaperDetail = async (examId: number, examName?: string) => {
    try {
      const res = await ExamPaperService.getExamPaperById(examId)
      if (res.code === 200 && res.data) {
        // 直接打开详情弹窗
        currentExamPaper.value = res.data
        viewDialogVisible.value = true
      } else {
        ElMessage.error(res.message || '获取试卷详情失败')
        fetchExamPaperList() // 加载试卷列表
      }
    } catch (error: any) {
      console.error('获取试卷详情失败:', error)
      ElMessage.error('获取试卷详情失败')
      fetchExamPaperList() // 加载试卷列表
    }
  }

  // 添加返回处理方法
  const handleReturn = () => {
    if (returnPath.value) {
      router.push(returnPath.value)
    }
  }

  // 添加用户角色转换函数
  const getUserRoleText = (role: string) => {
    const roleMap: Record<string, string> = {
      JOB_SEEKER: '求职者',
      INTERVIEWER: '面试官',
      ADMIN: '管理员'
    }
    return roleMap[role] || role
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
