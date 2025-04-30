<template>
  <div class="question-list-page">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>题目管理</span>
        </div>
      </template>

      <div class="filter-row">
        <el-select
          v-model="questionType"
          placeholder="题目类型"
          clearable
          @change="handleFilterChange"
          style="width: 140px"
        >
          <el-option label="单选题" :value="1" />
          <el-option label="多选题" :value="2" />
          <el-option label="判断题" :value="3" />
          <el-option label="填空题" :value="4" />
        </el-select>

        <el-select
          v-model="difficulty"
          placeholder="难度等级"
          clearable
          @change="handleFilterChange"
          style="width: 140px; margin-left: 10px"
        >
          <el-option label="简单" :value="1" />
          <el-option label="中等" :value="2" />
          <el-option label="困难" :value="3" />
        </el-select>
      </div>

      <CommonCrudTable
        :data="questionList"
        :total="total"
        :loading="loading"
        search-placeholder="输入题目关键字搜索"
        add-button-text="新增题目"
        @search="handleSearch"
        @add="handleAdd"
        @edit="handleEdit"
        @delete="handleDelete"
        @view="handleView"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      >
        <template #extraButtons>
          <el-upload
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleUploadChange"
          >
            <el-button type="primary" plain>批量导入</el-button>
          </el-upload>
        </template>

        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="qtype" label="题目类型" width="100">
          <template #default="scope">
            <el-tag :type="getQuestionTypeTag(scope.row.qtype)">
              {{ getQuestionTypeText(scope.row.qtype) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="question" label="题目内容" show-overflow-tooltip />
        <el-table-column prop="difficulty" label="难度" width="100">
          <template #default="scope">
            <el-tag :type="getDifficultyTag(scope.row.difficulty)">
              {{ getDifficultyText(scope.row.difficulty) }}
            </el-tag>
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
      :title="dialogType === 'add' ? '新增题目' : '编辑题目'"
      width="70%"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" label-width="100px">
        <el-form-item label="题目类型" prop="qtype">
          <el-radio-group v-model="form.qtype">
            <el-radio :label="1">单选题</el-radio>
            <el-radio :label="2">多选题</el-radio>
            <el-radio :label="3">判断题</el-radio>
            <el-radio :label="4">填空题</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="题目内容" prop="question">
          <el-input
            v-model="form.question"
            type="textarea"
            :rows="4"
            placeholder="请输入题目内容"
          />
        </el-form-item>

        <!-- 选择题选项 -->
        <template v-if="form.qtype === 1 || form.qtype === 2">
          <el-divider content-position="left">选项</el-divider>

          <div v-for="(option, index) in options" :key="index" class="option-item">
            <el-form-item
              :label="`选项 ${String.fromCharCode(65 + index)}`"
              :prop="`options.${index}.content`"
            >
              <div class="option-row">
                <el-input v-model="option.content" placeholder="请输入选项内容" />
                <el-checkbox v-model="option.isCorrect" :label="option.isCorrect" />
                <el-button type="danger" circle plain @click="removeOption(index)" :icon="Delete" />
              </div>
            </el-form-item>
          </div>

          <el-button type="primary" plain @click="addOption">添加选项</el-button>
        </template>

        <!-- 判断题答案 -->
        <template v-if="form.qtype === 3">
          <el-form-item label="答案" prop="answer">
            <el-radio-group v-model="form.answer">
              <el-radio label="true">正确</el-radio>
              <el-radio label="false">错误</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>

        <!-- 填空题答案 -->
        <template v-if="form.qtype === 4">
          <el-form-item label="答案" prop="answer">
            <el-input v-model="form.answer" placeholder="请输入答案，多个答案请用半角逗号分隔" />
          </el-form-item>
        </template>

        <el-form-item label="AI题目解析" prop="ai_analysis">
          <div class="ai-analysis-container">
            <el-input
              v-model="form.ai_analysis"
              type="textarea"
              :rows="4"
              placeholder="请输入题目解析"
            />
            <el-button
              type="primary"
              plain
              @click="generateAnalysis"
              :loading="generatingAnalysis"
              :disabled="!form.question"
            >
              AI生成解析
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="难度等级" prop="difficulty">
          <el-rate v-model="form.difficulty" :max="3" :texts="['简单', '中等', '困难']" show-text />
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
    <el-dialog v-model="viewDialogVisible" title="题目详情" width="70%">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ currentQuestion?.id }}</el-descriptions-item>
        <el-descriptions-item label="题目类型">
          {{ getQuestionTypeText(currentQuestion?.qtype) }}
        </el-descriptions-item>
        <el-descriptions-item label="题目内容">{{
          currentQuestion?.question
        }}</el-descriptions-item>

        <template v-if="currentQuestion?.qtype === 1 || currentQuestion?.qtype === 2">
          <el-descriptions-item label="选项">
            <div v-for="(option, index) in parsedOptions" :key="index">
              <div class="option-view">
                <span>{{ String.fromCharCode(65 + index) }}. {{ option.content }}</span>
                <el-tag v-if="option.isCorrect" type="success">正确答案</el-tag>
              </div>
            </div>
          </el-descriptions-item>
        </template>

        <template v-if="currentQuestion?.qtype === 3">
          <el-descriptions-item label="答案">
            <el-tag :type="currentQuestion?.answer === 'true' ? 'success' : 'danger'">
              {{ currentQuestion?.answer === 'true' ? '正确' : '错误' }}
            </el-tag>
          </el-descriptions-item>
        </template>

        <template v-if="currentQuestion?.qtype === 4">
          <el-descriptions-item label="答案">{{ currentQuestion?.answer }}</el-descriptions-item>
        </template>

        <el-descriptions-item label="AI解析">{{
          currentQuestion?.ai_analysis
        }}</el-descriptions-item>
        <el-descriptions-item label="难度等级">
          <el-rate
            v-model="currentQuestionDifficulty"
            :max="3"
            disabled
            :texts="['简单', '中等', '困难']"
            show-text
          />
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{
          formatDate(currentQuestion?.createdAt)
        }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{
          formatDate(currentQuestion?.updatedAt)
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
  import { ref, onMounted, computed, watch } from 'vue'
  import CommonCrudTable from '@/components/CommonCrudTable.vue'
  import { QuestionService } from '@/api/questionService'
  import { QuestionModel } from '@/api/model/examModels'
  import { ElMessage, FormInstance, FormRules } from 'element-plus'
  import { Delete } from '@element-plus/icons-vue'

  // Data
  const questionList = ref<QuestionModel[]>([])
  const total = ref(0)
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchKeyword = ref('')

  // Filters
  const questionType = ref<number | null>(null)
  const difficulty = ref<number | null>(null)

  // Form
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const form = ref<QuestionModel>({
    qtype: 1,
    question: '',
    answer: '',
    ai_analysis: '',
    difficulty: 1
  })
  const options = ref<Array<{ content: string; isCorrect: boolean }>>([
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false }
  ])
  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const generatingAnalysis = ref(false)

  // View Dialog
  const viewDialogVisible = ref(false)
  const currentQuestion = ref<QuestionModel | null>(null)
  const currentQuestionDifficulty = ref(1)
  const parsedOptions = ref<Array<{ content: string; isCorrect: boolean }>>([])

  // Form Rules
  const rules = ref<FormRules>({
    qtype: [{ required: true, message: '请选择题目类型', trigger: 'change' }],
    question: [
      { required: true, message: '请输入题目内容', trigger: 'blur' },
      { min: 2, message: '题目内容不能少于2个字符', trigger: 'blur' }
    ],
    answer: [{ required: true, message: '请输入答案', trigger: 'blur' }],
    ai_analysis: [{ required: true, message: '请输入题目解析', trigger: 'blur' }]
  })

  // Fetch Data
  onMounted(() => {
    fetchQuestionList()
  })

  const fetchQuestionList = async () => {
    loading.value = true
    try {
      const res = await QuestionService.getQuestionList({
        page: currentPage.value,
        size: pageSize.value,
        searchVal: searchKeyword.value,
        qtype: questionType.value,
        difficulty: difficulty.value
      })

      if (res.code === 200) {
        questionList.value = res.data || []
        total.value = res.total || 0
      } else {
        ElMessage.error(res.message || '获取题目列表失败')
      }
    } catch (error) {
      ElMessage.error('获取题目列表失败')
    } finally {
      loading.value = false
    }
  }

  // Watch form type changes to reset options
  watch(
    () => form.value.qtype,
    (newType) => {
      if (newType === 1 || newType === 2) {
        options.value = [
          { content: '', isCorrect: false },
          { content: '', isCorrect: false },
          { content: '', isCorrect: false },
          { content: '', isCorrect: false }
        ]
      } else if (newType === 3) {
        form.value.answer = 'true'
      } else {
        form.value.answer = ''
      }
    }
  )

  // Handlers
  const handleFilterChange = () => {
    currentPage.value = 1
    fetchQuestionList()
  }

  const handleSearch = (params: { keyword: string; page: number; pageSize: number }) => {
    searchKeyword.value = params.keyword
    currentPage.value = params.page
    pageSize.value = params.pageSize
    fetchQuestionList()
  }

  const handlePageChange = (params: { page: number; pageSize: number }) => {
    currentPage.value = params.page
    pageSize.value = params.pageSize
    fetchQuestionList()
  }

  const handleSizeChange = (params: { page: number; pageSize: number }) => {
    currentPage.value = params.page
    pageSize.value = params.pageSize
    fetchQuestionList()
  }

  const handleAdd = () => {
    dialogType.value = 'add'
    form.value = {
      qtype: 1,
      question: '',
      answer: '',
      ai_analysis: '',
      difficulty: 1
    }
    options.value = [
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false }
    ]
    dialogVisible.value = true
  }

  const handleEdit = (row: QuestionModel) => {
    dialogType.value = 'edit'
    form.value = {
      id: row.id,
      qtype: row.qtype,
      question: row.question,
      answer: row.answer,
      ai_analysis: row.ai_analysis,
      difficulty: row.difficulty || 1
    }

    // Parse options if qtype is 1 or 2
    if (row.qtype === 1 || row.qtype === 2) {
      try {
        const parsedOpts = JSON.parse(row.options || '[]')
        options.value = parsedOpts
      } catch (error) {
        options.value = [
          { content: '', isCorrect: false },
          { content: '', isCorrect: false },
          { content: '', isCorrect: false },
          { content: '', isCorrect: false }
        ]
      }
    }

    dialogVisible.value = true
  }

  const handleView = (row: QuestionModel) => {
    currentQuestion.value = row
    currentQuestionDifficulty.value = row.difficulty || 1

    // Parse options for viewing
    if (row.qtype === 1 || row.qtype === 2) {
      try {
        parsedOptions.value = JSON.parse(row.options || '[]')
      } catch (error) {
        parsedOptions.value = []
      }
    }

    viewDialogVisible.value = true
  }

  const handleDelete = async (row: QuestionModel) => {
    try {
      const res = await QuestionService.deleteQuestion(row.id!)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchQuestionList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }

  const addOption = () => {
    options.value.push({ content: '', isCorrect: false })
  }

  const removeOption = (index: number) => {
    if (options.value.length > 2) {
      options.value.splice(index, 1)
    } else {
      ElMessage.warning('至少需要两个选项')
    }
  }

  const generateAnalysis = async () => {
    if (!form.value.question) {
      ElMessage.warning('请先输入题目内容')
      return
    }

    generatingAnalysis.value = true
    try {
      const res = await QuestionService.generateAnalysis(form.value.question)
      if (res.code === 200 && res.data) {
        form.value.ai_analysis = res.data.analysis
        ElMessage.success('AI解析生成成功')
      } else {
        ElMessage.error(res.message || 'AI解析生成失败')
      }
    } catch (error) {
      ElMessage.error('AI解析生成失败')
    } finally {
      generatingAnalysis.value = false
    }
  }

  const handleUploadChange = (file: any) => {
    const formData = new FormData()
    formData.append('file', file.raw)

    ElMessage.info('开始导入题目...')

    QuestionService.importQuestions(file.raw)
      .then((res) => {
        if (res.code === 200) {
          ElMessage.success('题目导入成功')
          fetchQuestionList()
        } else {
          ElMessage.error(res.message || '题目导入失败')
        }
      })
      .catch(() => {
        ElMessage.error('题目导入失败')
      })
  }

  const submitForm = async () => {
    if (!formRef.value) return

    // Prepare data before submit
    if (form.value.qtype === 1 || form.value.qtype === 2) {
      // For single/multiple choice, ensure at least one correct answer
      const hasCorrectAnswer = options.value.some((opt) => opt.isCorrect)
      if (!hasCorrectAnswer) {
        ElMessage.warning('请至少选择一个正确答案')
        return
      }

      // For single choice, ensure only one correct answer
      if (form.value.qtype === 1 && options.value.filter((opt) => opt.isCorrect).length > 1) {
        ElMessage.warning('单选题只能有一个正确答案')
        return
      }

      // Convert options to JSON string
      form.value.options = JSON.stringify(options.value)

      // Generate answer string from correct options
      form.value.answer = options.value
        .map((opt, index) => (opt.isCorrect ? String.fromCharCode(65 + index) : null))
        .filter(Boolean)
        .join(',')
    }

    await formRef.value.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true
        try {
          const service =
            dialogType.value === 'add'
              ? QuestionService.addQuestion
              : QuestionService.updateQuestion

          const res =
            dialogType.value === 'add'
              ? await service(form.value)
              : await service(form.value.id!, form.value)

          if (res.code === 200) {
            ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
            dialogVisible.value = false
            fetchQuestionList()
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

  const getQuestionTypeText = (type: number | undefined) => {
    if (!type) return '-'
    const typeMap: Record<number, string> = {
      1: '单选题',
      2: '多选题',
      3: '判断题',
      4: '填空题'
    }
    return typeMap[type] || '-'
  }

  const getQuestionTypeTag = (type: number | undefined) => {
    if (!type) return ''
    const typeMap: Record<number, string> = {
      1: 'success',
      2: 'warning',
      3: 'info',
      4: 'danger'
    }
    return typeMap[type] || ''
  }

  const getDifficultyText = (difficulty: number | undefined) => {
    if (!difficulty) return '-'
    const difficultyMap: Record<number, string> = {
      1: '简单',
      2: '中等',
      3: '困难'
    }
    return difficultyMap[difficulty] || '-'
  }

  const getDifficultyTag = (difficulty: number | undefined) => {
    if (!difficulty) return ''
    const difficultyMap: Record<number, string> = {
      1: 'success',
      2: 'warning',
      3: 'danger'
    }
    return difficultyMap[difficulty] || ''
  }
</script>

<style scoped>
  .question-list-page {
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

  .option-item {
    margin-bottom: 15px;
  }

  .option-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ai-analysis-container {
    display: flex;
    gap: 10px;
  }

  .option-view {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    border-bottom: 1px dashed #eee;
  }
</style>
