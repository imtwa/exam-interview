<template>
  <div class="exam-management-page">
    <div class="exam-management-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>考试管理</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 页面标题 -->
      <div class="page-header">
        <div class="title-section">
          <h1 class="page-title">考试管理</h1>
          <p class="page-description">管理针对候选人的考试和测评</p>
        </div>
        <div class="actions-section">
          <el-button type="primary" @click="createExam">
            <el-icon><Plus /></el-icon>
            创建考试
          </el-button>
        </div>
      </div>

      <!-- 筛选区域 -->
      <div class="filter-container">
        <el-form :inline="true" class="filter-form">
          <el-form-item label="职位">
            <el-select v-model="queryParams.jobId" placeholder="选择职位" clearable @change="fetchExams">
              <el-option
                v-for="job in jobs"
                :key="job.id"
                :label="job.title"
                :value="job.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="选择状态" clearable @change="fetchExams">
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="关键词">
            <el-input v-model="queryParams.keyword" placeholder="考试名称" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchExams">搜索</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton animated :rows="6" :loading="loading" />
      </div>

      <!-- 考试列表 -->
      <div v-else class="exams-list">
        <div v-if="exams.length === 0" class="empty-container">
          <el-empty description="暂无考试">
            <template #description>
              <p>您还没有创建任何考试</p>
            </template>
            <el-button type="primary" @click="createExam">立即创建考试</el-button>
          </el-empty>
        </div>
        <div v-else>
          <el-table :data="exams" style="width: 100%" stripe>
            <el-table-column prop="title" label="考试名称" min-width="160">
              <template #default="{ row }">
                <span class="exam-title" @click="viewExamDetail(row.id)">{{ row.title }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="jobTitle" label="关联职位" min-width="140">
              <template #default="{ row }">
                {{ row.jobTitle || '未关联' }}
              </template>
            </el-table-column>
            <el-table-column prop="duration" label="时长" width="80">
              <template #default="{ row }">
                {{ row.duration }}分钟
              </template>
            </el-table-column>
            <el-table-column prop="questionsCount" label="题目数" width="90" align="center">
              <template #default="{ row }">
                {{ row.questionsCount || 0 }}
              </template>
            </el-table-column>
            <el-table-column prop="candidatesCount" label="应试人数" width="100" align="center">
              <template #default="{ row }">
                <el-button type="primary" link @click="viewCandidates(row.id)">
                  {{ row.candidatesCount || 0 }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column prop="averageScore" label="平均分" width="100" align="center">
              <template #default="{ row }">
                {{ row.candidatesCount ? row.averageScore : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建日期" width="120">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="200">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="editExam(row.id)">
                  编辑
                </el-button>
                <el-dropdown trigger="click">
                  <el-button link type="primary" size="small">
                    更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="viewExamDetail(row.id)">查看详情</el-dropdown-item>
                      <el-dropdown-item @click="duplicateExam(row.id)">复制考试</el-dropdown-item>
                      <el-dropdown-item @click="assignCandidates(row.id)">分配考生</el-dropdown-item>
                      <el-dropdown-item @click="toggleExamStatus(row.id, row.status)">
                        {{ row.status === 'ACTIVE' ? '暂停考试' : '重新启用' }}
                      </el-dropdown-item>
                      <el-dropdown-item divided class="text-danger" @click="deleteExam(row.id)">
                        删除考试
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="queryParams.page"
              v-model:page-size="queryParams.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowDown } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/formatDate'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const exams = ref([])
const total = ref(0)
const jobs = ref([])

// 获取URL中的jobId
const jobId = computed(() => route.query.jobId ? parseInt(route.query.jobId) : null)

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  jobId: null,
  status: '',
  keyword: ''
})

// 状态选项
const statusOptions = [
  { label: '启用中', value: 'ACTIVE' },
  { label: '已暂停', value: 'PAUSED' },
  { label: '已结束', value: 'ENDED' },
  { label: '草稿', value: 'DRAFT' }
]

// 获取状态显示类型
const getStatusType = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'success'
    case 'PAUSED':
      return 'warning'
    case 'ENDED':
      return 'info'
    case 'DRAFT':
      return ''
    default:
      return ''
  }
}

// 获取状态显示文本
const getStatusLabel = (status) => {
  const found = statusOptions.find(option => option.value === status)
  return found ? found.label : '未知'
}

// 获取考试列表
const fetchExams = async (page = currentPage.value) => {
  loading.value = true;
  currentPage.value = page;
  
  try {
    const response = await getExams({
      page: currentPage.value,
      size: pageSize.value,
      jobId: filterForm.jobId,
      status: filterForm.status,
      keyword: filterForm.keyword
    });
    
    exams.value = response.list;
    total.value = response.total;
  } catch (error) {
    console.error('获取考试列表失败:', error);
    ElMessage.error('获取考试列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取职位列表
const fetchJobs = async () => {
  try {
    const response = await getJobs();
    jobs.value = response.list;
  } catch (error) {
    console.error('获取职位列表失败:', error);
  }
};

// 重置筛选条件
const resetFilters = () => {
  queryParams.status = ''
  queryParams.keyword = ''
  queryParams.page = 1
  
  // 如果是从职位详情页进入，保留jobId筛选
  if (!jobId.value) {
    queryParams.jobId = null
  }
  
  fetchExams()
}

// 处理分页变化
const handleSizeChange = (size) => {
  queryParams.pageSize = size
  fetchExams()
}

const handleCurrentChange = (page) => {
  queryParams.page = page
  fetchExams()
}

// 创建考试
const createExam = () => {
  router.push('/exam-management/create')
}

// 查看考试详情
const viewExamDetail = (id) => {
  router.push(`/exam-management/detail/${id}`)
}

// 编辑考试
const editExam = (id) => {
  router.push(`/exam-management/edit/${id}`)
}

// 复制考试
const duplicateExam = async (id) => {
  try {
    await ElMessageBox.confirm('确定要复制该考试吗？将创建一个包含相同题目的新考试。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    
    const response = await copyExam(id);
    
    ElMessage.success('复制考试成功');
    router.push(`/exam-management/edit/${response.id}`);
  } catch (error) {
    if (error !== 'cancel') {
      console.error('复制考试失败:', error);
      ElMessage.error('复制考试失败');
    }
  }
}

// 分配考试给候选人
const assignCandidates = async (examId) => {
  try {
    const candidatesForm = {
      examId: examId,
      candidateIds: [1, 2, 3] // 示例数据，实际应从弹窗中获取
    };
    
    const response = await assignExamToCandidates(candidatesForm);
    
    ElMessage.success('已成功分配考试给候选人');
    await fetchExams();
  } catch (error) {
    console.error('分配考试失败:', error);
    ElMessage.error('分配考试失败');
  }
};

// 查看考生
const viewCandidates = (id) => {
  router.push(`/exam-management/candidates/${id}`)
}

// 更改考试状态
const toggleExamStatus = async (exam) => {
  try {
    const newStatus = exam.status === 'active' ? 'inactive' : 'active';
    const response = await updateExamStatus(exam.id, newStatus);
    
    ElMessage.success(`考试已${newStatus === 'active' ? '启用' : '停用'}`);
    await fetchExams();
  } catch (error) {
    console.error('更新考试状态失败:', error);
    ElMessage.error('更新考试状态失败');
  }
};

// 删除考试
const deleteExam = async (exam) => {
  try {
    await ElMessageBox.confirm(`确定要删除考试 "${exam.title}" 吗？此操作不可逆`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    const response = await removeExam(exam.id);
    
    ElMessage.success('考试已删除');
    await fetchExams();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除考试失败:', error);
      ElMessage.error('删除考试失败');
    }
  }
};

onMounted(() => {
  // 如果有URL参数，更新查询条件
  if (jobId.value) {
    queryParams.jobId = jobId.value
  }
  
  fetchJobs()
  fetchExams()
})
</script>

<style scoped>
.exam-management-page {
  width: 100%;
  background-color: #f5f9ff;
  min-height: calc(100vh - 60px);
}

.exam-management-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.breadcrumb-container {
  margin-bottom: 20px;
  font-size: 14px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .title-section {
    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin: 0 0 8px 0;
    }

    .page-description {
      color: #666;
      font-size: 14px;
      margin: 0;
    }
  }
}

.filter-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 20px;
}

.loading-container {
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.exams-list {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.empty-container {
  padding: 40px;
  text-align: center;

  p {
    color: #666;
    margin-bottom: 16px;
  }
}

.exam-title {
  color: #0352c9;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

.text-danger {
  color: #f56c6c;
}
</style> 