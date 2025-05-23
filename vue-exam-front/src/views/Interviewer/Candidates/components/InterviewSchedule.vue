<template>
  <el-dialog
    title="安排面试"
    :modelValue="visible"
    @update:modelValue="$emit('update:visible', $event)"
    width="550px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" label-position="right">
      <el-form-item label="候选人" prop="candidateName">
        <el-input v-model="form.candidateName" disabled />
      </el-form-item>

      <el-form-item label="面试轮次" prop="round">
        <el-select v-model="form.round" placeholder="请选择面试轮次" style="width: 100%">
          <el-option label="一面" value="FIRST_INTERVIEW" />
          <el-option label="二面" value="SECOND_INTERVIEW" />
          <el-option label="HR面试" value="HR_INTERVIEW" />
        </el-select>
      </el-form-item>

      <el-form-item label="面试类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择面试类型" style="width: 100%">
          <el-option label="电话面试" value="phone" />
          <el-option label="视频面试" value="video" />
          <el-option label="现场面试" value="onsite" />
        </el-select>
      </el-form-item>

      <el-form-item label="面试时间" prop="interviewTime">
        <el-date-picker
          v-model="form.interviewTime"
          type="datetime"
          placeholder="选择面试时间"
          style="width: 100%"
          :disabled-date="disabledDate"
        />
      </el-form-item>

      <el-form-item label="面试时长" prop="duration">
        <el-input-number
          v-model="form.duration"
          :min="30"
          :max="180"
          :step="15"
          style="width: 100%"
        />
        <span class="unit">分钟</span>
      </el-form-item>

      <el-form-item label="发送邮件通知" prop="sendEmail">
        <el-switch v-model="form.sendEmail" active-text="是" inactive-text="否" />
      </el-form-item>

      <el-form-item label="备注" prop="notes">
        <el-input v-model="form.notes" type="textarea" :rows="3" placeholder="面试备注信息" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" :loading="loading" @click="submitForm">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { scheduleInterview } from '@/api/interviewer'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  candidate: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'success'])

const formRef = ref(null)
const loading = ref(false)
const userStore = useUserStore()

// 表单数据
const form = reactive({
  candidateId: '',
  candidateName: '',
  round: 'FIRST_INTERVIEW', // 面试轮次: 一面、二面、HR面试
  type: 'video',
  interviewTime: '',
  duration: 60,
  sendEmail: true, // 是否发送邮件通知
  notes: ''
})

// 表单验证规则
const rules = reactive({
  round: [{ required: true, message: '请选择面试轮次', trigger: 'change' }],
  type: [{ required: true, message: '请选择面试类型', trigger: 'change' }],
  interviewTime: [{ required: true, message: '请选择面试时间', trigger: 'change' }],
  duration: [{ required: true, message: '请设置面试时长', trigger: 'change' }]
})

// 禁用过去的日期
const disabledDate = time => {
  return time.getTime() < Date.now() - 8.64e7 // 禁用今天之前的日期
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    loading.value = true
    await scheduleInterview(form.candidateId, {
      round: form.round, // 面试轮次
      scheduleTime: form.interviewTime,
      duration: form.duration,
      notes: form.notes,
      type: form.type,
      interviewerIds: [userStore.interviewerId], // 使用当前登录面试官的ID
      sendEmail: form.sendEmail // 是否发送邮件通知
    })

    ElMessage.success('面试安排成功')
    emit('success')
    emit('update:visible', false)
  } catch (error) {
    console.error('面试安排失败:', error)
    if (error?.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('面试安排失败')
    }
  } finally {
    loading.value = false
  }
}

// 关闭对话框
const closeDialog = () => {
  emit('update:visible', false)
}

// 关闭对话框并重置表单
const handleClose = () => {
  formRef.value?.resetFields()
  emit('update:visible', false)
}

// 监听候选人变化
watch(
  () => props.candidate,
  newVal => {
    if (newVal && newVal.id) {
      form.candidateId = newVal.id
      form.candidateName = newVal.candidateName || '未知候选人'
    }
  },
  { immediate: true }
)

// 根据面试类型更新表单验证
watch(
  () => form.type,
  newType => {
    // 类型改变时的处理逻辑
  }
)

// 监听对话框显示状态
watch(
  () => props.visible,
  newVal => {
    // 对话框显示时的处理逻辑
  },
  { immediate: true }
)
</script>

<style scoped>
.unit {
  margin-left: 8px;
  color: #606266;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
}
</style>
