<template>
  <div class="private-exams-container">
    <div class="header">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>专属试卷</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <el-button type="primary" @click="openCreateDialog">创建专属试卷</el-button>
    </div>

    <div class="filters">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索试卷名称或描述"
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
        style="width: 300px"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <!-- 试卷列表 -->
    <el-card shadow="never" class="exam-list-card">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="6" animated />
      </div>
      <div v-else-if="examList.length === 0" class="empty-container">
        <el-empty description="暂无专属试卷">
          <template #description>
            <p>您还没有创建任何专属试卷</p>
          </template>
          <el-button type="primary" @click="openCreateDialog">立即创建</el-button>
        </el-empty>
      </div>
      <el-table v-else :data="examList" style="width: 100%" border>
        <el-table-column prop="name" label="试卷名称" min-width="180">
          <template #default="scope">
            <router-link :to="`/exam/detail/${scope.row.id}`" class="exam-name-link">
              {{ scope.row.name }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="category.name" label="分类" width="120"></el-table-column>
        <el-table-column prop="subCategory.name" label="二级分类" width="120">
          <template #default="scope">
            {{ scope.row.subCategory?.name || '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="examQuestions.length" label="题目数量" width="100" align="center">
          <template #default="scope">
            {{ scope.row.examQuestions?.length || scope.row.questionsCount || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <router-link :to="`/exam/${scope.row.id}`">
              <el-button link type="primary" size="small">查看</el-button>
            </router-link>
            <el-button link type="primary" size="small" @click="copyExamLink(scope.row.id)"
              >复制链接</el-button
            >
            <el-button link type="danger" size="small" @click="confirmDelete(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          background
          layout="total, prev, pager, next, sizes"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50]"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        ></el-pagination>
      </div>
    </el-card>

    <!-- 创建专属试卷对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建专属试卷"
      width="700px"
      @close="resetForm"
      destroy-on-close
    >
      <el-form :model="examForm" :rules="rules" ref="examFormRef" label-width="120px">
        <el-form-item label="试卷名称" prop="name">
          <el-input v-model="examForm.name" placeholder="请输入专属试卷名称"></el-input>
        </el-form-item>
        <el-form-item label="试卷简介" prop="description">
          <el-input
            v-model="examForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入专属试卷简介"
          ></el-input>
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select
            v-model="examForm.categoryId"
            placeholder="请选择分类"
            @change="handleCategoryChange"
            style="width: 100%"
          >
            <el-option
              v-for="item in categories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="二级分类" prop="subCategoryId">
          <el-select
            v-model="examForm.subCategoryId"
            placeholder="请选择二级分类"
            style="width: 100%"
            :disabled="!examForm.categoryId || !subCategories.length"
            clearable
          >
            <el-option
              v-for="item in subCategories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <!-- 收藏试卷选择区域 -->
        <el-form-item label="收藏试卷" prop="favoriteExamIds">
          <div v-if="loadingFavorites" class="loading-favorites">
            <el-skeleton :rows="3" />
          </div>
          <div v-else-if="favorites.length === 0" class="no-favorites">
            <el-alert
              title="您还未收藏任何试卷"
              type="warning"
              description="请先收藏一些试卷，才能创建专属试卷"
              show-icon
            />
          </div>
          <div v-else>
            <el-select
              v-model="examForm.favoriteExamIds"
              multiple
              filterable
              placeholder="请选择收藏的试卷"
              style="width: 100%"
              @change="updateSelectedFavorites"
            >
              <el-option
                v-for="item in favorites"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <div class="favorite-option">
                  <div class="favorite-name">{{ item.name }}</div>
                  <div class="favorite-info">
                    <span>分类: {{ item.category?.name || '未分类' }}</span>
                    <span>{{ item.questionsCount || 0 }}题</span>
                  </div>
                </div>
              </el-option>
            </el-select>

            <!-- 显示已选择的试卷信息 -->
            <div class="selected-favorites" v-if="examForm.favoriteExamIds.length > 0">
              <div class="section-title">已选择{{ examForm.favoriteExamIds.length }}份试卷：</div>
              <el-table :data="selectedFavorites" size="small" style="width: 100%">
                <el-table-column prop="name" label="试卷名称" min-width="150" />
                <el-table-column
                  prop="questionsCount"
                  label="题目数量"
                  width="100"
                  align="center"
                />
                <el-table-column label="可抽题数" width="100" align="center">
                  <template #default="scope">
                    最多{{ Math.min(examForm.questionsPerExam, scope.row.questionsCount || 0) }}题
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="每卷抽题数量" prop="questionsPerExam">
          <el-input-number
            v-model="examForm.questionsPerExam"
            :min="1"
            :max="50"
            controls-position="right"
          ></el-input-number>
          <span class="hint">每个试卷抽取的题目数量，建议5-20题</span>
        </el-form-item>

        <div class="dialog-summary" v-if="examForm.favoriteExamIds.length > 0">
          <el-alert type="info" :closable="false">
            <template #title>
              将从{{ examForm.favoriteExamIds.length }}份试卷中随机抽取约{{
                getTotalQuestions()
              }}道题组成新试卷
            </template>
          </el-alert>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取 消</el-button>
          <el-button
            type="primary"
            @click="submitForm"
            :loading="submitting"
            :disabled="favorites.length === 0"
          >
            创 建
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { createPrivateExam, getInterviewerPrivateExams, getPrivateExamDetail } from '@/api/exam'
import { getUserFavorites } from '@/api/exam'
import { getAllCategories } from '@/api/category'
import { formatDate } from '@/utils/formatDate'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const submitting = ref(false)
const showCreateDialog = ref(false)
const examFormRef = ref(null)
const loadingFavorites = ref(false)

const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const examList = ref([])

// 分类数据
const categories = ref([])
const subCategories = ref([])
const favorites = ref([])
const selectedFavorites = ref([])

// 表单数据
const examForm = reactive({
  name: '',
  description: '',
  categoryId: '',
  subCategoryId: '',
  favoriteExamIds: [],
  questionsPerExam: 10
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入试卷名称', trigger: 'blur' },
    { max: 100, message: '名称长度不能超过100个字符', trigger: 'blur' }
  ],
  description: [{ max: 500, message: '描述长度不能超过500个字符', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  favoriteExamIds: [
    { required: true, message: '请选择收藏的试卷', trigger: 'change' },
    { type: 'array', min: 1, message: '至少选择一个收藏的试卷', trigger: 'change' }
  ]
}

// 获取试卷列表
const fetchExamList = async () => {
  loading.value = true
  try {
    const params = {
      interviewerId: userStore.interviewerId,
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      sortField: 'createdAt',
      sortOrder: 'desc'
    }
    const res = await getInterviewerPrivateExams(params)
    if (res.items) {
      examList.value = res.items || []
      total.value = res.total || 0
    } else {
      examList.value = []
      total.value = 0
      ElMessage.warning(res.message || '获取试卷列表失败')
    }
  } catch (error) {
    console.error('获取专属试卷列表失败:', error)
    ElMessage.error('获取专属试卷列表失败')
    examList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await getAllCategories()
    if (res) {
      categories.value = res
    } else {
      categories.value = []
      ElMessage.warning(res.message || '获取分类列表失败')
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
    categories.value = []
  }
}

// 获取收藏试卷列表
const fetchFavorites = async () => {
  loadingFavorites.value = true
  try {
    const params = {
      page: 1,
      pageSize: 100 // 获取较多收藏，以便用户选择
    }
    const res = await getUserFavorites(params)
    if (res.items) {
      favorites.value = res.items || []
    } else {
      favorites.value = []
      ElMessage.warning(res.message || '获取收藏列表失败')
    }
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    ElMessage.error('获取收藏列表失败')
    favorites.value = []
  } finally {
    loadingFavorites.value = false
  }
}

// 更新已选择的收藏试卷列表
const updateSelectedFavorites = () => {
  if (!examForm.favoriteExamIds.length) {
    selectedFavorites.value = []
    return
  }

  selectedFavorites.value = favorites.value.filter(favorite =>
    examForm.favoriteExamIds.includes(favorite.id)
  )
}

// 计算预计的总题目数
const getTotalQuestions = () => {
  if (!selectedFavorites.value.length) return 0

  let total = 0
  selectedFavorites.value.forEach(favorite => {
    total += Math.min(examForm.questionsPerExam, favorite.questionsCount || 0)
  })

  return total
}

// 分类变更时更新二级分类
const handleCategoryChange = categoryId => {
  examForm.subCategoryId = ''
  if (!categoryId) {
    subCategories.value = []
    return
  }

  const category = categories.value.find(item => item.id === categoryId)
  subCategories.value = category?.children || []
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchExamList()
}

// 分页变化
const handlePageChange = page => {
  currentPage.value = page
  fetchExamList()
}

// 每页条数变化
const handleSizeChange = size => {
  pageSize.value = size
  currentPage.value = 1
  fetchExamList()
}

// 打开创建对话框
const openCreateDialog = () => {
  resetForm()
  fetchFavorites() // 打开对话框时刷新收藏列表
  showCreateDialog.value = true
}

// 重置表单
const resetForm = () => {
  if (examFormRef.value) {
    examFormRef.value.resetFields()
  }
  examForm.categoryId = ''
  examForm.subCategoryId = ''
  examForm.favoriteExamIds = []
  examForm.questionsPerExam = 10
  selectedFavorites.value = []
}

// 提交表单
const submitForm = async () => {
  if (!examFormRef.value) return

  await examFormRef.value.validate(async valid => {
    if (valid) {
      submitting.value = true
      try {
        const res = await createPrivateExam(examForm)
        if (res.id) {
          ElMessage.success('创建专属试卷成功')
          showCreateDialog.value = false
          fetchExamList()
        } else {
          ElMessage.error(res.message || '创建专属试卷失败')
        }
      } catch (error) {
        console.error('创建专属试卷失败:', error)
        ElMessage.error(error.response?.data?.message || '创建专属试卷失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 复制试卷链接
const copyExamLink = examId => {
  const url = `${window.location.origin}/exam/detail/${examId}`
  navigator.clipboard
    .writeText(url)
    .then(() => {
      ElMessage.success('链接已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制')
      console.log('复制的链接:', url)
    })
}

// 确认删除
const confirmDelete = exam => {
  ElMessageBox.confirm(`确定要删除试卷"${exam.name}"吗？删除后不可恢复。`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      ElMessage({
        type: 'success',
        message: '删除功能暂未实现'
      })
    })
    .catch(() => {
      // 用户取消删除
    })
}

onMounted(() => {
  fetchExamList()
  fetchCategories()
})
</script>

<style scoped>
.private-exams-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filters {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.exam-list-card {
  margin-bottom: 20px;
}

.loading-container,
.empty-container {
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.exam-name-link {
  color: #409eff;
  text-decoration: none;
}

.exam-name-link:hover {
  text-decoration: underline;
}

.hint {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.loading-favorites {
  padding: 20px 0;
}

.no-favorites {
  margin-bottom: 10px;
}

.favorite-option {
  display: flex;
  flex-direction: column;
}

.favorite-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.selected-favorites {
  margin-top: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
  background-color: #f9f9f9;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #606266;
}

.dialog-summary {
  margin-top: 20px;
}
</style>
