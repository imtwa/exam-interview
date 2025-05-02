<template>
  <div class="question-list-page">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>{{ examName ? `${examName} - 题目管理` : '题目管理' }}</span>
          <div v-if="examId" class="header-actions">
            <el-button size="small" @click="clearExamFilter">返回全部题目</el-button>
          </div>
        </div>
      </template>

      <!-- 添加提示信息 -->
      <el-alert
        v-if="!examId"
        title="请通过试卷管理页面查看题目"
        type="info"
        description="当前系统只支持通过试卷查看题目，请前往试卷管理页面选择一个试卷进行查看。"
        show-icon
        :closable="false"
        style="margin-bottom: 15px"
      />

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

        <el-table-column prop="order" label="序号" width="80" />
        <el-table-column prop="qtype" label="题目类型" width="100">
          <template #default="scope">
            <el-tag :type="getQuestionTypeTag(scope.row.qtype)">
              {{ getQuestionTypeText(scope.row.qtype) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="question" label="题目内容" show-overflow-tooltip />
        <el-table-column prop="score" label="分值" width="80">
          <template #default="scope">
            <span>{{ scope.row.score || 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="examPaperName" label="所属试卷" width="150">
          <template #default="scope">
            <el-link
              v-if="scope.row.examPaperId"
              type="primary"
              @click="viewExamPaper(scope.row.examPaperId, scope.row.examPaperName)"
            >
              {{ scope.row.examPaperName }}
            </el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
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
  import { useRoute, useRouter } from 'vue-router'
  import CommonCrudTable from '@/components/CommonCrudTable.vue'
  import { QuestionService } from '@/api/questionService'
  import {
    Question,
    QuestionListParams,
    QuestionType,
    DifficultyLevel
  } from '@/api/model/examModels'
  import { ElMessage, FormInstance, FormRules } from 'element-plus'
  import { Delete } from '@element-plus/icons-vue'

  const route = useRoute()
  const router = useRouter()

  // 获取URL参数
  const examId = computed(() => {
    const id = route.query.examId
    return id ? Number(id) : undefined
  })

  const examName = computed(() => (route.query.examName as string) || '')

  // 清除试卷筛选
  const clearExamFilter = () => {
    ElMessage.info('当前系统只支持通过试卷查看题目，请前往试卷管理页面')
  }

  // Data
  const questionList = ref<Question[]>([])
  const allQuestions = ref<Question[]>([]) // 存储所有题目，用于前端分页
  const total = ref(0)
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchKeyword = ref('')

  // Filters
  const questionType = ref<QuestionType | undefined>(undefined)
  const difficulty = ref<DifficultyLevel | undefined>(undefined)

  // Form
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const form = ref<Question>({
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
  const currentQuestion = ref<Question | null>(null)
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

  // 添加一个存储原始数据的变量
  const rawQuestions = ref<Question[]>([]) // 存储原始数据，用于前端过滤

  // Fetch Data
  onMounted(() => {
    console.log('组件已挂载，获取初始数据')
    fetchQuestionList()
  })

  // 监听路由参数变化
  watch(
    () => route.query,
    (newQuery) => {
      // 当路由参数变化时重新获取数据
      fetchQuestionList()
    },
    { deep: true }
  )

  const fetchQuestionList = async () => {
    // 避免重复加载
    if (loading.value) {
      return
    }

    loading.value = true

    try {
      // 前端分页不需要向后端发送分页参数
      const params: QuestionListParams = {
        // 不再传递筛选参数，因为要在前端进行筛选
      }

      // 如果有examId参数，添加到查询条件
      if (examId.value) {
        params.examId = examId.value
      } else {
        // 如果没有examId，显示提示信息并返回空数据
        ElMessage.info('请通过试卷管理页面查看题目')
        rawQuestions.value = []
        allQuestions.value = []
        questionList.value = []
        total.value = 0
        loading.value = false
        return
      }

      const res = await QuestionService.getQuestionList(params)

      if (res.code === 200) {
        if (examId.value) {
          // 如果是获取试卷题目，处理特殊的数据结构
          if (res.data && res.data.examQuestions) {
            // 从examQuestions提取题目数据并格式化
            rawQuestions.value = res.data.examQuestions.map((item: any) => {
              return {
                id: item.question.id,
                qtype: item.question.qtype,
                question: item.question.question,
                options: item.question.options,
                answer: item.question.answer,
                ai_analysis: item.question.ai_analysis,
                difficulty: item.question.difficulty,
                score: item.score,
                order: item.order, // 已有order字段
                createdAt: item.question.createdAt,
                updatedAt: item.question.updatedAt,
                // 添加试卷信息
                examPaperId: res.data.id,
                examPaperName: res.data.name
              }
            })

            // 应用筛选并排序
            applyFilters()
          } else {
            rawQuestions.value = []
            allQuestions.value = []
            questionList.value = []
            total.value = 0
          }
        } else {
          // 普通题目列表 - 不应该走到这里
          rawQuestions.value = []
          allQuestions.value = []
          questionList.value = []
          total.value = 0
        }
      } else {
        ElMessage.error(res.message || '获取题目列表失败')
      }
    } catch (error: any) {
      console.error('获取题目列表失败:', error)
      ElMessage.error('获取题目列表失败')
    } finally {
      loading.value = false
    }
  }

  // 添加筛选方法
  const applyFilters = () => {
    // 应用筛选条件
    allQuestions.value = rawQuestions.value.filter((question) => {
      // 题目类型筛选
      if (questionType.value && question.qtype !== questionType.value) {
        return false
      }

      // 难度筛选
      if (difficulty.value && question.difficulty !== difficulty.value) {
        return false
      }

      // 关键字搜索
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase()
        return question.question.toLowerCase().includes(keyword)
      }

      return true
    })

    // 按照order字段升序排列
    allQuestions.value.sort((a, b) => {
      // 考虑可能没有order字段的情况
      const orderA = a.order || 0
      const orderB = b.order || 0
      return orderA - orderB
    })

    // 更新总数
    total.value = allQuestions.value.length

    // 重置分页到第一页
    currentPage.value = 1

    // 应用分页
    applyPagination()
  }

  // 修改筛选和搜索的处理方法
  const handleFilterChange = () => {
    applyFilters()
  }

  // 修改分页处理方法，不再发送请求，只是应用前端分页
  const handlePageChange = (params: { page: number; pageSize: number }) => {
    currentPage.value = params.page
    pageSize.value = params.pageSize
    applyPagination()
  }

  const handleSizeChange = (params: { page: number; pageSize: number }) => {
    currentPage.value = params.page
    pageSize.value = params.pageSize
    applyPagination()
  }

  // 修改搜索处理方法
  const handleSearch = (params: { keyword: string; page: number; pageSize: number }) => {
    searchKeyword.value = params.keyword
    currentPage.value = params.page
    pageSize.value = params.pageSize

    // 应用筛选条件
    applyFilters()
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

  const handleEdit = (row: Question) => {
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
        const rawOptions = JSON.parse(row.options || '[]')
        // 处理两种可能的选项格式
        if (rawOptions.length > 0 && 'Key' in rawOptions[0]) {
          // 处理 {Key: "A", Value: "选项内容"} 格式
          options.value = rawOptions.map((opt: any) => ({
            content: opt.Value,
            isCorrect: row.answer.includes(opt.Key)
          }))
        } else {
          // 处理普通格式
          options.value = rawOptions
        }
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

  const handleView = (row: Question) => {
    currentQuestion.value = row
    currentQuestionDifficulty.value = row.difficulty || 1

    // Parse options for viewing
    if (row.qtype === 1 || row.qtype === 2) {
      try {
        const rawOptions = JSON.parse(row.options || '[]')
        // 处理两种可能的选项格式 - 检查是否是{Key, Value}格式
        if (rawOptions.length > 0 && 'Key' in rawOptions[0]) {
          // 处理 {Key: "A", Value: "选项内容"} 格式
          parsedOptions.value = rawOptions.map((opt: any) => ({
            content: opt.Value,
            isCorrect: row.answer.includes(opt.Key)
          }))
        } else {
          // 处理普通格式
          parsedOptions.value = rawOptions
        }
      } catch (error) {
        parsedOptions.value = []
      }
    }

    viewDialogVisible.value = true
  }

  const handleDelete = async (row: Question) => {
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

      // 格式化选项以适配后端API格式
      const formattedOptions = options.value.map((opt, index) => ({
        Key: String.fromCharCode(65 + index),
        Value: opt.content
      }))

      // Convert options to JSON string
      form.value.options = JSON.stringify(formattedOptions)

      // Generate answer string from correct options
      form.value.answer = options.value
        .map((opt, index) => (opt.isCorrect ? String.fromCharCode(65 + index) : null))
        .filter(Boolean)
        .join('')
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

  // 添加查看试卷详情方法
  const viewExamPaper = (examPaperId: number, examPaperName: string) => {
    // 使用replace而不是push
    router.replace({
      path: `/exam-system/exam-paper`,
      query: {
        view: examPaperId.toString(),
        name: examPaperName,
        returnPath: '/exam-system/question'
      }
    })
  }

  // 添加前端分页方法
  const applyPagination = () => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    questionList.value = allQuestions.value.slice(start, end)
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
