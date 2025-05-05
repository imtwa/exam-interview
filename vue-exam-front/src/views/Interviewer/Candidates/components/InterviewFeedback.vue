<template>
  <el-dialog
    title="面试评价"
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
        <el-input v-model="form.roundText" disabled />
      </el-form-item>

      <el-form-item label="面试状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择面试结果" style="width: 100%">
          <el-option label="通过，进入下一轮" value="PASS" />
          <el-option label="未通过" value="REJECTED" />
          <el-option label="待定，需要讨论" value="PENDING" />
        </el-select>
      </el-form-item>

      <el-form-item label="评分" prop="rating">
        <el-rate v-model="form.rating" :texts="ratingTexts" show-text :colors="ratingColors" />
      </el-form-item>

      <el-form-item label="技术能力" prop="technicalSkill">
        <el-select v-model="form.technicalSkill" placeholder="请评价技术能力" style="width: 100%">
          <el-option label="优秀 - 技术全面且深入" value="EXCELLENT" />
          <el-option label="良好 - 基础扎实" value="GOOD" />
          <el-option label="一般 - 基础薄弱" value="AVERAGE" />
          <el-option label="较差 - 技术欠缺" value="POOR" />
        </el-select>
      </el-form-item>

      <el-form-item label="沟通能力" prop="communicationSkill">
        <el-select
          v-model="form.communicationSkill"
          placeholder="请评价沟通能力"
          style="width: 100%"
        >
          <el-option label="优秀 - 表达清晰，思路清楚" value="EXCELLENT" />
          <el-option label="良好 - 能够正常交流" value="GOOD" />
          <el-option label="一般 - 表达不够清晰" value="AVERAGE" />
          <el-option label="较差 - 交流困难" value="POOR" />
        </el-select>
      </el-form-item>

      <el-form-item label="面试详细评价" prop="feedback">
        <el-input
          v-model="form.feedback"
          type="textarea"
          :rows="6"
          placeholder="请填写对该候选人的详细评价，包括技术能力、沟通表达、学习能力、团队协作等方面"
        />
      </el-form-item>

      <el-form-item label="是否进入下一轮" v-if="form.status === 'PASS' && needNextInterview">
        <el-switch v-model="form.scheduleNextRound" active-text="是" inactive-text="否" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" :loading="loading" @click="submitForm">提 交</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, defineProps, defineEmits, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { submitInterviewFeedback } from '@/api/interviewer'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  interview: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'success'])

const formRef = ref(null)
const loading = ref(false)

// 评分文本和颜色
const ratingTexts = ['不合格', '较差', '一般', '良好', '优秀']
const ratingColors = ['#F56C6C', '#E6A23C', '#909399', '#67C23A', '#409EFF']

// 表单数据
const form = reactive({
  interviewId: '',
  candidateName: '',
  round: '',
  roundText: '',
  rating: 3,
  status: 'PENDING',
  technicalSkill: 'AVERAGE',
  communicationSkill: 'AVERAGE',
  feedback: '',
  scheduleNextRound: false
})

// 是否需要进入下一轮面试
const needNextInterview = computed(() => {
  return form.round === 'FIRST_INTERVIEW' || form.round === 'SECOND_INTERVIEW'
})

// 下一轮面试是什么
const nextRound = computed(() => {
  if (form.round === 'FIRST_INTERVIEW') return 'SECOND_INTERVIEW'
  if (form.round === 'SECOND_INTERVIEW') return 'HR_INTERVIEW'
  return null
})

// 表单验证规则
const rules = reactive({
  status: [{ required: true, message: '请选择面试结果', trigger: 'change' }],
  rating: [{ required: true, message: '请评分', trigger: 'change' }],
  technicalSkill: [{ required: true, message: '请评价技术能力', trigger: 'change' }],
  communicationSkill: [{ required: true, message: '请评价沟通能力', trigger: 'change' }],
  feedback: [{ required: true, message: '请填写面试评价', trigger: 'blur' }]
})

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    loading.value = true
    await submitInterviewFeedback(form.interviewId, {
      status: form.status,
      feedbackRating: form.rating,
      feedback: form.feedback,
      technicalSkill: form.technicalSkill,
      communicationSkill: form.communicationSkill,
      scheduleNextRound: form.status === 'PASS' && form.scheduleNextRound ? nextRound.value : null
    })

    ElMessage.success('面试评价提交成功')
    emit('success')
    emit('update:visible', false)
  } catch (error) {
    console.error('面试评价提交失败:', error)
    if (error?.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('面试评价提交失败')
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

// 获取面试轮次文本
const getRoundText = round => {
  const roundMap = {
    FIRST_INTERVIEW: '一面',
    SECOND_INTERVIEW: '二面',
    HR_INTERVIEW: 'HR面试'
  }
  return roundMap[round] || '未知'
}

// 监听面试数据变化
watch(
  () => props.interview,
  async newVal => {
    if (newVal && newVal.id) {
      form.interviewId = newVal.id
      form.candidateName = newVal.candidateName || '未知候选人'
      form.round = newVal.round
      form.roundText = getRoundText(newVal.round)

      // 如果已有评价，则加载现有数据
      if (newVal.feedback) {
        form.feedback = newVal.feedback
      }
      if (newVal.feedbackRating) {
        form.rating = newVal.feedbackRating
      }
      
      // 如果状态已经设定，加载状态
      if (newVal.status && newVal.status !== 'SCHEDULED') {
        form.status = newVal.status
      }
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
}
</style>
