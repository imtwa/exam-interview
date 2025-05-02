<template>
  <div class="industry-list-page">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>行业分类管理</span>
        </div>
      </template>

      <div class="industry-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="输入行业名称搜索"
          style="width: 250px"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><i class="iconfont-sys">&#xe628;</i></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleAdd">新增一级行业</el-button>
      </div>

      <el-table
        :data="industryList"
        border
        style="width: 100%"
        row-key="id"
        :expand-row-keys="expandedRows"
        :tree-props="{ children: 'children', hasChildren: 'hasSubCategories' }"
        v-loading="loading"
      >
        <el-table-column type="expand">
          <template #default="props">
            <div
              class="subcategory-wrapper"
              v-if="props.row.children && props.row.children.length > 0"
            >
              <el-table :data="props.row.children" border style="width: 100%; margin-bottom: 10px">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="子行业名称" />
                <el-table-column prop="description" label="描述" show-overflow-tooltip />
                <el-table-column prop="createdAt" label="创建时间" width="180">
                  <template #default="scope">{{ formatDate(scope.row.createdAt) }}</template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="scope">
                    <el-button
                      type="primary"
                      size="small"
                      @click="handleEditSubIndustry(scope.row, props.row.id)"
                    >
                      编辑
                    </el-button>
                    <el-button
                      type="danger"
                      size="small"
                      @click="handleDeleteSubIndustry(scope.row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div class="empty-subcategory" v-else>
              <el-empty description="暂无子行业" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="行业名称" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="scope">{{ formatDate(scope.row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)"> 编辑 </el-button>
            <el-button type="success" size="small" @click="handleAddSubIndustry(scope.row)">
              添加子行业
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 一级行业 Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增行业' : '编辑行业'"
      width="50%"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" label-width="100px">
        <el-form-item label="行业名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入行业名称" />
        </el-form-item>
        <el-form-item label="行业描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入行业描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 二级行业 Add/Edit Dialog -->
    <el-dialog
      v-model="subDialogVisible"
      :title="subDialogType === 'add' ? '新增子行业' : '编辑子行业'"
      width="50%"
      :close-on-click-modal="false"
    >
      <el-form
        ref="subFormRef"
        :model="subForm"
        :rules="rules"
        label-position="top"
        label-width="100px"
      >
        <el-form-item label="所属行业" prop="categoryId">
          <el-select
            v-model="subForm.categoryId"
            placeholder="选择所属行业"
            style="width: 100%"
            :disabled="subDialogType === 'edit'"
          >
            <el-option
              v-for="item in industryList"
              :key="item.id!"
              :label="item.name"
              :value="item.id!"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="子行业名称" prop="name">
          <el-input v-model="subForm.name" placeholder="请输入子行业名称" />
        </el-form-item>
        <el-form-item label="子行业描述" prop="description">
          <el-input
            v-model="subForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入子行业描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="subDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitSubForm" :loading="submitLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { IndustryService } from '@/api/industryService'
  import { Industry } from '@/api/model/userModel'
  import { ElMessage, FormInstance, FormRules } from 'element-plus'

  // Data
  const industryList = ref<Industry[]>([])
  const expandedRows = ref<string[]>([])
  const total = ref(0)
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchKeyword = ref('')

  // 一级行业表单
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const form = ref<Industry>({
    name: '',
    description: ''
  })
  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  // 二级行业表单
  const subDialogVisible = ref(false)
  const subDialogType = ref<'add' | 'edit'>('add')
  const subForm = ref<any>({
    name: '',
    description: '',
    categoryId: 0
  })
  const subFormRef = ref<FormInstance>()

  // 表单验证规则
  const rules = ref<FormRules>({
    name: [
      { required: true, message: '请输入行业名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    categoryId: [{ required: true, message: '请选择所属行业', trigger: 'change' }]
  })

  // 初始化
  onMounted(() => {
    fetchIndustryList()
  })

  // 获取行业列表
  const fetchIndustryList = async () => {
    loading.value = true
    try {
      const res = await IndustryService.getAllIndustries({
        page: currentPage.value,
        pageSize: pageSize.value,
        keyword: searchKeyword.value
      })

      if (res.code === 200) {
        // 处理返回的数据结构，API返回的data包含list和total
        const industryData = res.data.list || []
        industryList.value = industryData.map((industry: Industry) => ({
          ...industry,
          children: industry.subCategories || [], // 将subCategories映射为children
          hasSubCategories: industry.subCategories && industry.subCategories.length > 0
        }))
        total.value = res.data.total || 0
      } else {
        ElMessage.error(res.message || '获取行业列表失败')
      }
    } catch (error) {
      console.error('获取行业列表失败:', error)
      ElMessage.error('获取行业列表失败')
    } finally {
      loading.value = false
    }
  }

  // 处理搜索
  const handleSearch = () => {
    currentPage.value = 1
    fetchIndustryList()
  }

  // 分页处理
  const handlePageChange = (page: number) => {
    currentPage.value = page
    fetchIndustryList()
  }

  const handleSizeChange = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
    fetchIndustryList()
  }

  // 添加一级行业
  const handleAdd = () => {
    dialogType.value = 'add'
    form.value = {
      name: '',
      description: ''
    }
    dialogVisible.value = true
  }

  // 编辑一级行业
  const handleEdit = (row: Industry) => {
    dialogType.value = 'edit'
    form.value = {
      id: row.id,
      name: row.name,
      description: row.description
    }
    dialogVisible.value = true
  }

  // 添加二级行业
  const handleAddSubIndustry = (row: Industry) => {
    if (!row.id) {
      ElMessage.error('行业ID不存在')
      return
    }

    subDialogType.value = 'add'
    subForm.value = {
      name: '',
      description: '',
      categoryId: row.id
    }
    subDialogVisible.value = true

    // 展开行
    if (!expandedRows.value.includes(row.id!.toString())) {
      expandedRows.value.push(row.id!.toString())
    }
  }

  // 编辑二级行业
  const handleEditSubIndustry = (row: any, parentId?: number) => {
    subDialogType.value = 'edit'
    subForm.value = {
      id: row.id,
      name: row.name,
      description: row.description,
      categoryId: row.parentId || parentId
    }
    subDialogVisible.value = true
  }

  // 删除一级行业
  const handleDelete = async (row: Industry) => {
    try {
      // 检查是否有子行业
      if (row.children && row.children.length > 0) {
        ElMessage.warning('请先删除该行业下的所有子行业')
        return
      }

      const res = await IndustryService.deleteIndustryCategory(row.id!)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchIndustryList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }

  // 删除二级行业
  const handleDeleteSubIndustry = async (row: any) => {
    try {
      const res = await IndustryService.deleteIndustrySubCategory(row.id!)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchIndustryList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }

  // 提交一级行业表单
  const submitForm = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true
        try {
          let res
          if (dialogType.value === 'add') {
            // 创建一级行业
            res = await IndustryService.createIndustryCategory({
              name: form.value.name,
              description: form.value.description
            })
          } else {
            // 更新一级行业
            res = await IndustryService.updateIndustryCategory(form.value.id!, {
              name: form.value.name,
              description: form.value.description
            })
          }

          if (res.code === 200) {
            ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
            dialogVisible.value = false
            fetchIndustryList()
          } else {
            ElMessage.error(res.message || (dialogType.value === 'add' ? '添加失败' : '更新失败'))
          }
        } catch (error) {
          console.error('提交表单失败:', error)
          ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败')
        } finally {
          submitLoading.value = false
        }
      }
    })
  }

  // 提交二级行业表单
  const submitSubForm = async () => {
    if (!subFormRef.value) return

    await subFormRef.value.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true
        try {
          let res
          if (subDialogType.value === 'add') {
            // 创建二级行业
            res = await IndustryService.createIndustrySubCategory({
              name: subForm.value.name,
              description: subForm.value.description,
              categoryId: subForm.value.categoryId
            })
          } else {
            // 更新二级行业
            res = await IndustryService.updateIndustrySubCategory(subForm.value.id!, {
              name: subForm.value.name,
              description: subForm.value.description,
              categoryId: subForm.value.categoryId
            })
          }

          if (res.code === 200) {
            ElMessage.success(subDialogType.value === 'add' ? '添加成功' : '更新成功')
            subDialogVisible.value = false
            fetchIndustryList()
          } else {
            ElMessage.error(
              res.message || (subDialogType.value === 'add' ? '添加失败' : '更新失败')
            )
          }
        } catch (error) {
          console.error('提交表单失败:', error)
          ElMessage.error(subDialogType.value === 'add' ? '添加失败' : '更新失败')
        } finally {
          submitLoading.value = false
        }
      }
    })
  }

  // 格式化日期
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return ''
    return new Date(date).toLocaleString()
  }
</script>

<style scoped>
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .industry-actions {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .subcategory-wrapper {
    padding: 20px;
    background-color: #f8f8f8;
  }

  .empty-subcategory {
    padding: 20px;
    background-color: #f8f8f8;
  }
</style>
