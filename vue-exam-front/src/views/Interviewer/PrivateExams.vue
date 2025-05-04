<template>
  <div class="private-exams-container">
    <div class="header">
      <h2>专属试卷管理</h2>
      <el-button type="primary" @click="showCreateDialog = true">创建专属试卷</el-button>
    </div>

    <div class="filters">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索试卷名称或描述"
        prefix-icon="el-icon-search"
        clearable
        @clear="handleSearch"
        @keyup.enter.native="handleSearch"
        style="width: 300px"
      ></el-input>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <el-table v-loading="loading" :data="examList" style="width: 100%" border>
      <el-table-column prop="name" label="试卷名称" min-width="180">
        <template #default="scope">
          <router-link :to="`/exam/detail/${scope.row.id}`" class="exam-name-link">
            {{ scope.row.name }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column prop="category.name" label="分类" width="120"></el-table-column>
      <el-table-column prop="subCategory.name" label="二级分类" width="120"></el-table-column>
      <el-table-column
        prop="questionsCount"
        label="题目数量"
        width="100"
        align="center"
      ></el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <router-link :to="`/exam/detail/${scope.row.id}`">
            <el-button type="text" size="small">查看</el-button>
          </router-link>
          <el-button type="text" size="small" @click="copyExamLink(scope.row.id)"
            >复制链接</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
      ></el-pagination>
    </div>

    <!-- 创建专属试卷对话框 -->
    <el-dialog
      title="创建专属试卷"
      :visible.sync="showCreateDialog"
      width="700px"
      @close="resetForm"
    >
      <el-form :model="examForm" :rules="rules" ref="examForm" label-width="120px">
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
          >
            <el-option
              v-for="item in subCategories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="收藏试卷" prop="favoriteExamIds">
          <el-select
            v-model="examForm.favoriteExamIds"
            multiple
            filterable
            placeholder="请选择收藏的试卷"
            style="width: 100%"
          >
            <el-option
              v-for="item in favorites"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
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
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showCreateDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">创 建</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPrivateExams, createPrivateExam } from '@/api/exam'
import { getUserFavorites } from '@/api/exam'
import { getAllCategories } from '@/api/category'
import { formatDate } from '@/utils/formatDate'

export default {
  name: 'PrivateExams',
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const submitting = ref(false)
    const showCreateDialog = ref(false)
    const examFormRef = ref(null)

    const searchKeyword = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const examList = ref([])

    // 分类数据
    const categories = ref([])
    const subCategories = ref([])
    const favorites = ref([])

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
          page: currentPage.value,
          pageSize: pageSize.value,
          keyword: searchKeyword.value,
          sortField: 'createdAt',
          sortOrder: 'desc'
        }
        const res = await getPrivateExams(params)
        examList.value = res.data.items
        total.value = res.data.total
      } catch (error) {
        console.error('获取专属试卷列表失败:', error)
        ElMessage.error('获取专属试卷列表失败')
      } finally {
        loading.value = false
      }
    }

    // 获取分类列表
    const fetchCategories = async () => {
      try {
        const res = await getAllCategories()
        categories.value = res.data
      } catch (error) {
        console.error('获取分类列表失败:', error)
        ElMessage.error('获取分类列表失败')
      }
    }

    // 获取收藏试卷列表
    const fetchFavorites = async () => {
      try {
        const params = {
          page: 1,
          pageSize: 100 // 获取较多收藏，以便用户选择
        }
        const res = await getUserFavorites(params)
        favorites.value = res.data.items
      } catch (error) {
        console.error('获取收藏列表失败:', error)
        ElMessage.error('获取收藏列表失败')
      }
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

    // 重置表单
    const resetForm = () => {
      if (examFormRef.value) {
        examFormRef.value.resetFields()
      }
      examForm.categoryId = ''
      examForm.subCategoryId = ''
      examForm.favoriteExamIds = []
      examForm.questionsPerExam = 10
    }

    // 提交表单
    const submitForm = async () => {
      if (examFormRef.value) {
        examFormRef.value.validate(async valid => {
          if (valid) {
            submitting.value = true
            try {
              await createPrivateExam(examForm)
              ElMessage.success('创建专属试卷成功')
              showCreateDialog.value = false
              fetchExamList()
            } catch (error) {
              console.error('创建专属试卷失败:', error)
              ElMessage.error(error.response?.data?.message || '创建专属试卷失败')
            } finally {
              submitting.value = false
            }
          }
        })
      }
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

    onMounted(() => {
      fetchExamList()
      fetchCategories()
      fetchFavorites()
    })

    return {
      loading,
      submitting,
      showCreateDialog,
      examFormRef,
      searchKeyword,
      currentPage,
      pageSize,
      total,
      examList,
      categories,
      subCategories,
      favorites,
      examForm,
      rules,
      formatDate,
      handleCategoryChange,
      handleSearch,
      handlePageChange,
      resetForm,
      submitForm,
      copyExamLink
    }
  }
}
</script>

<style scoped>
.private-exams-container {
  padding: 20px;
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
</style>
