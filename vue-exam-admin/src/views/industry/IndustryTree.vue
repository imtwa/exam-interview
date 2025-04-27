<template>
  <div class="industry-tree-page">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>行业分类树形管理</span>
          <el-button type="primary" @click="handleAddRoot">添加根行业</el-button>
        </div>
      </template>

      <div class="tree-container" v-loading="loading">
        <el-tree
          :data="industryTree"
          node-key="id"
          default-expand-all
          :props="{ label: 'name', children: 'children' }"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <span>{{ node.label }}</span>
              <span class="node-actions">
                <el-button type="primary" link @click="handleAdd(data)">添加子行业</el-button>
                <el-button type="primary" link @click="handleEdit(data)">编辑</el-button>
                <el-button type="danger" link @click="handleDelete(data)">删除</el-button>
              </span>
            </span>
          </template>
        </el-tree>
      </div>
    </el-card>

    <!-- Add/Edit Dialog -->
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
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { IndustryService } from '@/api/userApi'
  import { Industry } from '@/api/model/userModel'
  import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'

  // Data
  const industryTree = ref<Industry[]>([])
  const loading = ref(false)

  // Form
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const form = ref<Partial<Industry>>({
    name: '',
    description: '',
    parentId: null
  })
  const currentParentId = ref<number | null>(null)
  const formRef = ref<FormInstance | null>(null)
  const submitLoading = ref(false)

  // Rules
  const rules = ref<FormRules>({
    name: [
      { required: true, message: '请输入行业名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    description: [{ max: 500, message: '长度不能超过 500 个字符', trigger: 'blur' }]
  })

  // Methods
  const loadIndustryTree = async () => {
    loading.value = true
    try {
      const res = await IndustryService.getIndustryTree()
      if (res.code === 0) {
        industryTree.value = res.data || []
      } else {
        ElMessage.error(res.message || '获取行业树失败')
      }
    } catch (error) {
      console.error('获取行业树失败', error)
      ElMessage.error('获取行业树失败')
    } finally {
      loading.value = false
    }
  }

  const handleAddRoot = () => {
    dialogType.value = 'add'
    form.value = {
      name: '',
      description: '',
      parentId: null
    }
    currentParentId.value = null
    dialogVisible.value = true
  }

  const handleAdd = (parentIndustry: Industry) => {
    dialogType.value = 'add'
    form.value = {
      name: '',
      description: '',
      parentId: parentIndustry.id
    }
    currentParentId.value = parentIndustry.id
    dialogVisible.value = true
  }

  const handleEdit = (industry: Industry) => {
    dialogType.value = 'edit'
    form.value = { ...industry }
    dialogVisible.value = true
  }

  const handleDelete = async (industry: Industry) => {
    try {
      await ElMessageBox.confirm('此操作将永久删除该行业及其所有子行业，是否继续？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      const res = await IndustryService.deleteIndustry(industry.id!)
      if (res.code === 0) {
        ElMessage.success('删除成功')
        loadIndustryTree()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('删除行业失败', error)
        ElMessage.error('删除行业失败')
      }
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
            res = await IndustryService.createIndustry(
              form.value as Omit<Industry, 'id' | 'children'>
            )
          } else {
            res = await IndustryService.updateIndustry(form.value.id!, form.value)
          }

          if (res.code === 0) {
            ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
            dialogVisible.value = false
            loadIndustryTree()
          } else {
            ElMessage.error(res.message || (dialogType.value === 'add' ? '添加失败' : '更新失败'))
          }
        } catch (error) {
          console.error(dialogType.value === 'add' ? '添加行业失败' : '更新行业失败', error)
          ElMessage.error(dialogType.value === 'add' ? '添加行业失败' : '更新行业失败')
        } finally {
          submitLoading.value = false
        }
      }
    })
  }

  // Lifecycle
  onMounted(() => {
    loadIndustryTree()
  })
</script>

<style scoped>
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tree-container {
    margin-top: 20px;
  }

  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }

  .node-actions {
    margin-left: 20px;
  }
</style>
