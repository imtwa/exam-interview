<template>
  <div class="exam-paper-questions-page">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>{{ examPaperName }} - 题目管理</span>
          <div>
            <el-button @click="goBack">返回</el-button>
          </div>
        </div>
      </template>

      <div class="actions-row">
        <el-button type="primary" @click="openAddQuestionsDialog">添加题目</el-button>
      </div>

      <el-table
        :data="examQuestions"
        border
        v-loading="loading"
        style="width: 100%"
        class="data-table"
        :header-cell-style="{ 'background-color': '#f5f7fa' }"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="order" label="试卷顺序" width="100" align="center" />
        <el-table-column prop="question.qtype" label="题目类型" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getQuestionTypeTag(scope.row.question.qtype)">
              {{ getQuestionTypeText(scope.row.question.qtype) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="question.question" label="题目内容" show-overflow-tooltip />
        <el-table-column prop="score" label="分值" width="100" align="center">
          <template #default="scope">
            <span>{{ scope.row.score }} 分</span>
          </template>
        </el-table-column>
        <el-table-column prop="question.difficulty" label="难度" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getDifficultyTag(scope.row.question.difficulty)">
              {{ getDifficultyText(scope.row.question.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewQuestion(scope.row.question)" link>
              查看
            </el-button>
            <el-button type="primary" size="small" @click="editExamQuestion(scope.row)" link>
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="confirmRemoveQuestion(scope.row)" link>
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Add Questions Dialog -->
    <el-dialog
      v-model="addQuestionsDialogVisible"
      title="添加题目"
      width="80%"
      :close-on-click-modal="false"
    >
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

        <el-input
          v-model="searchKeyword"
          placeholder="输入题目关键字搜索"
          clearable
          style="width: 220px; margin-left: 10px"
          @keyup.enter="handleFilterChange"
        />

        <el-button type="primary" @click="handleFilterChange" style="margin-left: 10px">
          搜索
        </el-button>
      </div>

      <el-table
        :data="availableQuestions"
        border
        v-loading="availableQuestionsLoading"
        style="width: 100%"
        max-height="500"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="qtype" label="题目类型" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getQuestionTypeTag(scope.row.qtype)">
              {{ getQuestionTypeText(scope.row.qtype) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="question" label="题目内容" show-overflow-tooltip />
        <el-table-column prop="difficulty" label="难度" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getDifficultyTag(scope.row.difficulty)">
              {{ getDifficultyText(scope.row.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          :hide-on-single-page="false"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addQuestionsDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="confirmAddQuestions"
            :disabled="selectedQuestions.length === 0"
            :loading="addingQuestions"
          >
            添加 {{ selectedQuestions.length }} 个题目
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Edit Exam Question Dialog -->
    <el-dialog
      v-model="editQuestionDialogVisible"
      title="编辑试卷题目"
      width="50%"
      :close-on-click-modal="false"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-position="top"
        label-width="100px"
      >
        <el-form-item label="试卷顺序" prop="order">
          <el-input-number v-model="editForm.order" :min="1" style="width: 180px" />
        </el-form-item>

        <el-form-item label="题目分值" prop="score">
          <el-input-number v-model="editForm.score" :min="0.5" :step="0.5" style="width: 180px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editQuestionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditForm" :loading="editLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- View Question Dialog -->
    <el-dialog v-model="viewQuestionDialogVisible" title="题目详情" width="70%">
      <el-descriptions :column="1" border>
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
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewQuestionDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Delete Confirmation Dialog -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认移除"
      width="30%"
      :close-on-click-modal="false"
    >
      <span>确定要从试卷中移除这道题目吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="removeQuestion" :loading="deleteLoading">
            确认移除
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage, FormInstance, FormRules } from 'element-plus'
  import { ExamPaperService } from '@/api/examPaperApi'
  import { QuestionService } from '@/api/questionApi'
  import { QuestionModel, ExamQuestionModel } from '@/api/model/examModels'

  const route = useRoute()
  const router = useRouter()

  // Get exam paper id from route params
  const examPaperId = computed(() => Number(route.params.id))
  const examPaperName = computed(() => String(route.query.name || '试卷'))

  // Data
  const examQuestions = ref<ExamQuestionModel[]>([])
  const loading = ref(false)

  // Available questions for adding
  const availableQuestions = ref<QuestionModel[]>([])
  const availableQuestionsLoading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const searchKeyword = ref('')
  const questionType = ref<number | null>(null)
  const difficulty = ref<number | null>(null)
  const selectedQuestions = ref<QuestionModel[]>([])
  const addQuestionsDialogVisible = ref(false)
  const addingQuestions = ref(false)

  // Edit question
  const editQuestionDialogVisible = ref(false)
  const editForm = ref<{ examId: number; questionId: number; order: number; score: number }>({
    examId: 0,
    questionId: 0,
    order: 1,
    score: 1
  })
  const editFormRef = ref<FormInstance>()
  const editLoading = ref(false)
  const editRules = ref<FormRules>({
    order: [{ required: true, message: '请输入题目顺序', trigger: 'blur' }],
    score: [{ required: true, message: '请输入题目分值', trigger: 'blur' }]
  })

  // View question
  const viewQuestionDialogVisible = ref(false)
  const currentQuestion = ref<QuestionModel | null>(null)
  const currentQuestionDifficulty = ref(1)
  const parsedOptions = ref<Array<{ content: string; isCorrect: boolean }>>([])

  // Delete confirmation
  const deleteDialogVisible = ref(false)
  const questionToDelete = ref<ExamQuestionModel | null>(null)
  const deleteLoading = ref(false)

  // Fetch data
  onMounted(() => {
    fetchExamQuestions()
  })

  const fetchExamQuestions = async () => {
    if (!examPaperId.value) return

    loading.value = true
    try {
      const res = await ExamPaperService.getExamQuestions(examPaperId.value)
      if (res.code === 200) {
        examQuestions.value = res.data || []
      } else {
        ElMessage.error(res.message || '获取试卷题目失败')
      }
    } catch (error) {
      ElMessage.error('获取试卷题目失败')
    } finally {
      loading.value = false
    }
  }

  const fetchAvailableQuestions = async () => {
    availableQuestionsLoading.value = true
    try {
      const res = await QuestionService.getQuestionList({
        page: currentPage.value,
        size: pageSize.value,
        searchVal: searchKeyword.value,
        qtype: questionType.value,
        difficulty: difficulty.value
      })

      if (res.code === 200) {
        availableQuestions.value = res.data || []
        total.value = res.total || 0
      } else {
        ElMessage.error(res.message || '获取题目列表失败')
      }
    } catch (error) {
      ElMessage.error('获取题目列表失败')
    } finally {
      availableQuestionsLoading.value = false
    }
  }

  // Handlers
  const goBack = () => {
    router.push('/exam-system/exam-paper')
  }

  const openAddQuestionsDialog = () => {
    addQuestionsDialogVisible.value = true
    currentPage.value = 1
    pageSize.value = 10
    questionType.value = null
    difficulty.value = null
    searchKeyword.value = ''
    selectedQuestions.value = []

    // Fetch available questions
    fetchAvailableQuestions()
  }

  const handleFilterChange = () => {
    currentPage.value = 1
    fetchAvailableQuestions()
  }

  const handleCurrentChange = (val: number) => {
    currentPage.value = val
    fetchAvailableQuestions()
  }

  const handleSizeChange = (val: number) => {
    pageSize.value = val
    currentPage.value = 1
    fetchAvailableQuestions()
  }

  const handleSelectionChange = (selection: QuestionModel[]) => {
    selectedQuestions.value = selection
  }

  const confirmAddQuestions = async () => {
    if (selectedQuestions.value.length === 0) {
      ElMessage.warning('请选择要添加的题目')
      return
    }

    addingQuestions.value = true
    try {
      // Calculate the max order
      const maxOrder =
        examQuestions.value.length > 0 ? Math.max(...examQuestions.value.map((q) => q.order)) : 0

      // Create exam question objects
      const examQuestionsToAdd = selectedQuestions.value.map((question, index) => ({
        examId: examPaperId.value,
        questionId: question.id!,
        order: maxOrder + index + 1,
        score: 1 // Default score
      }))

      // Add questions to exam paper
      const res = await ExamPaperService.addExamQuestions(examPaperId.value, examQuestionsToAdd)

      if (res.code === 200) {
        ElMessage.success('题目添加成功')
        addQuestionsDialogVisible.value = false
        fetchExamQuestions()
      } else {
        ElMessage.error(res.message || '题目添加失败')
      }
    } catch (error) {
      ElMessage.error('题目添加失败')
    } finally {
      addingQuestions.value = false
    }
  }

  const viewQuestion = (question: QuestionModel) => {
    currentQuestion.value = question
    currentQuestionDifficulty.value = question.difficulty || 1

    // Parse options for viewing
    if (question.qtype === 1 || question.qtype === 2) {
      try {
        parsedOptions.value = JSON.parse(question.options || '[]')
      } catch (error) {
        parsedOptions.value = []
      }
    }

    viewQuestionDialogVisible.value = true
  }

  const editExamQuestion = (examQuestion: ExamQuestionModel) => {
    editForm.value = {
      examId: examPaperId.value,
      questionId: examQuestion.questionId,
      order: examQuestion.order,
      score: examQuestion.score
    }

    editQuestionDialogVisible.value = true
  }

  const submitEditForm = async () => {
    if (!editFormRef.value) return

    await editFormRef.value.validate(async (valid) => {
      if (valid) {
        editLoading.value = true
        try {
          const res = await ExamPaperService.updateExamQuestion(
            editForm.value.examId,
            editForm.value.questionId,
            {
              order: editForm.value.order,
              score: editForm.value.score
            }
          )

          if (res.code === 200) {
            ElMessage.success('更新成功')
            editQuestionDialogVisible.value = false
            fetchExamQuestions()
          } else {
            ElMessage.error(res.message || '更新失败')
          }
        } catch (error) {
          ElMessage.error('更新失败')
        } finally {
          editLoading.value = false
        }
      }
    })
  }

  const confirmRemoveQuestion = (examQuestion: ExamQuestionModel) => {
    questionToDelete.value = examQuestion
    deleteDialogVisible.value = true
  }

  const removeQuestion = async () => {
    if (!questionToDelete.value) return

    deleteLoading.value = true
    try {
      const res = await ExamPaperService.removeExamQuestion(
        examPaperId.value,
        questionToDelete.value.questionId
      )

      if (res.code === 200) {
        ElMessage.success('题目移除成功')
        deleteDialogVisible.value = false
        fetchExamQuestions()
      } else {
        ElMessage.error(res.message || '题目移除失败')
      }
    } catch (error) {
      ElMessage.error('题目移除失败')
    } finally {
      deleteLoading.value = false
    }
  }

  // Utils
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
  .exam-paper-questions-page {
    padding: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .actions-row {
    margin-bottom: 20px;
  }

  .filter-row {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }

  .option-view {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    border-bottom: 1px dashed #eee;
  }
</style>
