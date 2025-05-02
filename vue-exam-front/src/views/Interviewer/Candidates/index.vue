<template>
  <div class="candidates-page">
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>候选人管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Page Header -->
    <div class="page-header">
      <h1>候选人管理</h1>
      <p class="description">管理所有应聘者信息及招聘流程</p>
    </div>

    <!-- Filter Section -->
    <el-card class="filter-section">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="应聘职位">
          <el-select v-model="filterForm.jobId" placeholder="全部职位" clearable>
            <el-option
              v-for="job in jobs"
              :key="job.id"
              :label="job.title"
              :value="job.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="候选人状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
            <el-option label="已申请" value="applied" />
            <el-option label="简历筛选" value="screening" />
            <el-option label="面试中" value="interviewing" />
            <el-option label="发放offer" value="offered" />
            <el-option label="已入职" value="hired" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="filterForm.keyword"
            placeholder="姓名/手机/邮箱"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchCandidates(1)">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Candidates List -->
    <el-card class="candidates-card">
      <div slot="header" class="card-header">
        <span>候选人列表</span>
        <div class="header-actions">
          <el-button type="primary" @click="exportCandidates">导出</el-button>
          <el-button type="success" @click="importCandidates">导入</el-button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>

      <!-- Candidates Table -->
      <div v-else>
        <el-table
          :data="candidates"
          style="width: 100%"
          border
          stripe
          :default-sort="{ prop: 'applyDate', order: 'descending' }"
        >
          <el-table-column label="候选人" min-width="180">
            <template slot-scope="{ row }">
              <div class="candidate-info">
                <el-avatar :size="40" :src="row.avatar">
                  {{ row.name.charAt(0) }}
                </el-avatar>
                <div class="candidate-details">
                  <div class="candidate-name">{{ row.name }}</div>
                  <div class="candidate-contact">
                    <span>{{ row.phone }}</span>
                    <span>{{ row.email }}</span>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="jobTitle" label="应聘职位" min-width="140" />
          <el-table-column label="教育背景" min-width="160">
            <template slot-scope="{ row }">
              <div>{{ row.education }}</div>
              <div class="text-secondary">{{ row.school }}</div>
            </template>
          </el-table-column>
          <el-table-column label="工作经验" min-width="100">
            <template slot-scope="{ row }">
              {{ row.experience }}年
            </template>
          </el-table-column>
          <el-table-column label="应聘日期" min-width="120" sortable>
            <template slot-scope="{ row }">
              {{ formatDate(row.applyDate) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" min-width="120">
            <template slot-scope="{ row }">
              <el-tag
                :type="getStatusType(row.status)"
                effect="light"
              >
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="240" fixed="right">
            <template slot-scope="{ row }">
              <el-button size="mini" @click="viewResume(row)">查看简历</el-button>
              <el-dropdown size="mini" split-button type="primary" @command="handleCommand($event, row)">
                管理
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="schedule">安排面试</el-dropdown-item>
                  <el-dropdown-item command="offer">发送Offer</el-dropdown-item>
                  <el-dropdown-item command="hire">录用</el-dropdown-item>
                  <el-dropdown-item command="reject" divided>拒绝</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>

        <!-- Pagination -->
        <div class="pagination">
          <el-pagination
            background
            layout="prev, pager, next, sizes, total"
            :current-page.sync="currentPage"
            :page-size.sync="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { getCandidates, getJobs } from '@/api/candidate';
import { formatDate } from '@/utils/date';

export default {
  name: 'CandidatesManager',
  setup() {
    const loading = ref(true);
    const candidates = ref([]);
    const jobs = ref([]);
    const total = ref(0);
    const currentPage = ref(1);
    const pageSize = ref(10);

    const filterForm = reactive({
      jobId: '',
      status: '',
      keyword: ''
    });

    // 获取候选人列表
    const fetchCandidates = async (page = currentPage.value) => {
      loading.value = true;
      currentPage.value = page;
      
      try {
        const response = await getCandidates({
          page: currentPage.value,
          size: pageSize.value,
          ...filterForm
        });
        
        candidates.value = response.list;
        total.value = response.total;
      } catch (error) {
        console.error('获取候选人列表失败:', error);
        ElMessage.error('获取候选人列表失败');
      } finally {
        loading.value = false;
      }
    };

    // 获取职位列表
    const fetchJobs = async () => {
      try {
        const response = await getJobs({ size: 100 });
        jobs.value = response.list;
      } catch (error) {
        console.error('获取职位列表失败:', error);
      }
    };

    // 重置筛选条件
    const resetFilters = () => {
      Object.keys(filterForm).forEach(key => {
        filterForm[key] = '';
      });
      fetchCandidates(1);
    };

    // 分页操作
    const handlePageChange = (page) => {
      fetchCandidates(page);
    };

    const handleSizeChange = (size) => {
      pageSize.value = size;
      fetchCandidates(1);
    };

    // 状态处理
    const getStatusText = (status) => {
      const statusMap = {
        applied: '已申请',
        screening: '简历筛选',
        interviewing: '面试中',
        offered: 'Offer发放',
        hired: '已入职',
        rejected: '已拒绝'
      };
      return statusMap[status] || status;
    };

    const getStatusType = (status) => {
      const typeMap = {
        applied: 'info',
        screening: 'warning',
        interviewing: 'primary',
        offered: 'success',
        hired: 'success',
        rejected: 'danger'
      };
      return typeMap[status] || 'info';
    };

    // 操作函数
    const viewResume = (candidate) => {
      ElMessage.success(`查看${candidate.name}的简历`);
      // 实现查看简历的逻辑
    };

    const handleCommand = (command, candidate) => {
      switch (command) {
        case 'schedule':
          ElMessage.success(`为${candidate.name}安排面试`);
          break;
        case 'offer':
          ElMessage.success(`向${candidate.name}发送Offer`);
          break;
        case 'hire':
          ElMessage.success(`录用${candidate.name}`);
          break;
        case 'reject':
          ElMessage.success(`拒绝${candidate.name}`);
          break;
      }
    };

    const exportCandidates = () => {
      ElMessage.success('导出候选人数据');
    };

    const importCandidates = () => {
      ElMessage.success('导入候选人数据');
    };

    // 初始化
    onMounted(() => {
      fetchJobs();
      fetchCandidates();
    });

    // 监听筛选条件变化
    watch([() => filterForm.jobId, () => filterForm.status], () => {
      fetchCandidates(1);
    });

    return {
      loading,
      candidates,
      jobs,
      total,
      currentPage,
      pageSize,
      filterForm,
      fetchCandidates,
      resetFilters,
      handlePageChange,
      handleSizeChange,
      formatDate,
      getStatusText,
      getStatusType,
      viewResume,
      handleCommand,
      exportCandidates,
      importCandidates
    };
  }
};
</script>

<style scoped>
.candidates-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  margin-bottom: 8px;
}

.description {
  color: #666;
  font-size: 14px;
}

.filter-section {
  margin-bottom: 20px;
}

.candidates-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.loading-container {
  padding: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.candidate-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.candidate-details {
  display: flex;
  flex-direction: column;
}

.candidate-name {
  font-weight: bold;
}

.candidate-contact {
  font-size: 12px;
  color: #666;
  display: flex;
  gap: 10px;
}

.text-secondary {
  color: #666;
  font-size: 13px;
}
</style> 