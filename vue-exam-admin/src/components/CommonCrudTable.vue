<template>
  <div class="common-crud-table">
    <!-- Search and Action Bar -->
    <el-row justify="space-between" :gutter="10" class="search-row">
      <el-col :lg="6" :md="6" :sm="14" :xs="16">
        <el-input
          v-model="searchKeyword"
          :prefix-icon="Search"
          clearable
          :placeholder="searchPlaceholder"
          @keyup.enter="handleSearch"
        />
      </el-col>
      <el-col :lg="6" :md="6" :sm="10" :xs="6" class="action-buttons">
        <slot name="extraButtons"></slot>
        <el-button type="primary" @click="handleAdd" v-if="permissions.add">{{
          addButtonText
        }}</el-button>
      </el-col>
    </el-row>

    <!-- Data Table -->
    <el-table
      :data="tableData"
      v-loading="loading"
      border
      style="width: 100%"
      class="data-table"
      :header-cell-style="{ 'background-color': '#f5f7fa' }"
    >
      <slot></slot>

      <!-- Operation Column -->
      <el-table-column
        v-if="permissions.edit || permissions.delete || permissions.view"
        label="操作"
        width="220"
        align="center"
      >
        <template #default="scope">
          <el-button
            v-if="permissions.view"
            type="primary"
            size="small"
            @click="handleView(scope.row)"
            :icon="View"
            link
          >
            查看
          </el-button>
          <el-button
            v-if="permissions.edit"
            type="primary"
            size="small"
            @click="handleEdit(scope.row)"
            :icon="Edit"
            link
          >
            编辑
          </el-button>
          <el-button
            v-if="permissions.delete"
            type="danger"
            size="small"
            @click="confirmDelete(scope.row)"
            :icon="Delete"
            link
          >
            删除
          </el-button>
          <slot name="extraActions" :row="scope.row"></slot>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
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

    <!-- Delete Confirmation Dialog -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="30%"
      :close-on-click-modal="false"
    >
      <span>确定要删除这条记录吗？此操作不可恢复。</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="handleDelete" :loading="deleteLoading">
            确认删除
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, defineEmits, defineProps, watchEffect } from 'vue'
  import { Search, View, Edit, Delete } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'

  const props = defineProps({
    // Data
    data: {
      type: Array,
      required: true
    },
    total: {
      type: Number,
      default: 0
    },
    loading: {
      type: Boolean,
      default: false
    },
    // Permissions
    permissions: {
      type: Object,
      default: () => ({
        add: true,
        edit: true,
        delete: true,
        view: true
      })
    },
    // Labels
    addButtonText: {
      type: String,
      default: '新增'
    },
    searchPlaceholder: {
      type: String,
      default: '请输入关键字搜索'
    }
  })

  const emit = defineEmits([
    'search',
    'add',
    'edit',
    'delete',
    'view',
    'page-change',
    'size-change'
  ])

  // Search
  const searchKeyword = ref('')
  const handleSearch = () => {
    currentPage.value = 1
    emit('search', {
      keyword: searchKeyword.value,
      page: currentPage.value,
      pageSize: pageSize.value
    })
  }

  // Pagination
  const currentPage = ref(1)
  const pageSize = ref(10)

  const handleSizeChange = (val: number) => {
    pageSize.value = val
    emit('size-change', {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value
    })
  }

  const handleCurrentChange = (val: number) => {
    currentPage.value = val
    emit('page-change', {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value
    })
  }

  // CRUD Operations
  const tableData = ref<any[]>([])
  watchEffect(() => {
    tableData.value = props.data
  })

  const handleAdd = () => {
    emit('add')
  }

  const handleEdit = (row: any) => {
    emit('edit', row)
  }

  const handleView = (row: any) => {
    emit('view', row)
  }

  // Delete with confirmation
  const deleteDialogVisible = ref(false)
  const deleteLoading = ref(false)
  const rowToDelete = ref<any>(null)

  const confirmDelete = (row: any) => {
    deleteDialogVisible.value = true
    rowToDelete.value = row
  }

  const handleDelete = async () => {
    deleteLoading.value = true
    try {
      emit('delete', rowToDelete.value)
      deleteDialogVisible.value = false
      ElMessage({
        type: 'success',
        message: '删除成功'
      })
    } catch (_) {
      ElMessage({
        type: 'error',
        message: '删除失败'
      })
    } finally {
      deleteLoading.value = false
    }
  }
</script>

<style scoped>
  .common-crud-table {
    padding: 20px;
  }

  .search-row {
    margin-bottom: 20px;
  }

  .action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .data-table {
    margin-bottom: 20px;
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
</style>
