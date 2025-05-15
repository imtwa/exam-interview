<template>
  <div class="assign-exam-form">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="default">
      <el-form-item label="笔试试卷" prop="examId">
        <el-select
          v-model="form.examId"
          placeholder="请选择笔试试卷"
          style="width: 100%"
          filterable
          remote
          :remote-method="searchExams"
          :loading="loading"
        >
          <el-option v-for="item in examOptions" :key="item.id" :label="item.name" :value="item.id">
            <div class="custom-option">
              <span>{{ item.name }}</span>
              <small>题目数: {{ item.questionsCount || 0 }}</small>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="考试时长" prop="duration">
        <el-input-number
          v-model="form.duration"
          :min="15"
          :max="240"
          :step="15"
          style="width: 100%"
        >
          <template #suffix>分钟</template>
        </el-input-number>
      </el-form-item>

      <el-form-item label="考试时间" prop="timeRange" class="datetime-picker-container">
        <el-date-picker
          v-model="form.timeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          style="width: 100%"
          value-format="YYYY-MM-DD HH:mm:ss"
          :shortcuts="dateShortcuts"
          popper-class="moved-up-datepicker"
        />
      </el-form-item>

      <el-form-item label="考试说明" prop="note">
        <el-input
          v-model="form.note"
          type="textarea"
          :rows="4"
          placeholder="请输入笔试说明和要求"
        />
      </el-form-item>
    </el-form>

    <div class="form-actions">
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="submitting"> 确认分配 </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { getInterviewerPrivateExams } from '@/api/exam'
import { assignExam } from '@/api/interviewer'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  applicationId: {
    type: Number,
    required: true
  },
  jobSeekerId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['success', 'cancel'])

const formRef = ref(null)
const loading = ref(false)
const submitting = ref(false)
const examOptions = ref([])
const userStore = useUserStore()

// 日期快捷选项
const dateShortcuts = [
  {
    text: '未来3天',
    value: () => {
      const start = new Date()
      const end = new Date()
      end.setTime(start.getTime() + 3600 * 1000 * 24 * 3)
      return [start, end]
    }
  },
  {
    text: '未来一周',
    value: () => {
      const start = new Date()
      const end = new Date()
      end.setTime(start.getTime() + 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  }
]

const form = reactive({
  examId: undefined,
  timeRange: [
    new Date(Date.now() + 24 * 60 * 60 * 1000), // 默认开始时间：明天
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 默认结束时间：一周后
  ],
  duration: 60, // 默认考试时长：60分钟
  note: '请认真作答，考试期间不得查阅资料，感谢您的配合。'
})

const rules = {
  examId: [{ required: true, message: '请选择笔试试卷', trigger: 'change' }],
  timeRange: [
    { required: true, message: '请选择考试时间范围', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (Array.isArray(value) && value.length === 2) {
          const start = new Date(value[0]).getTime()
          const end = new Date(value[1]).getTime()
          if (end <= start) {
            callback(new Error('结束时间必须晚于开始时间'))
          } else if (end - start < form.duration * 60 * 1000) {
            callback(new Error('考试时间范围必须大于考试时长'))
          } else {
            callback()
          }
        } else {
          callback(new Error('请选择完整的时间范围'))
        }
      },
      trigger: 'change'
    }
  ],
  duration: [
    { required: true, message: '请设置考试时长', trigger: 'blur' },
    { type: 'number', min: 15, message: '考试时长不能少于15分钟', trigger: 'blur' },
    { type: 'number', max: 240, message: '考试时长不能超过240分钟', trigger: 'blur' }
  ],
  note: [{ max: 500, message: '考试说明不能超过500个字符', trigger: 'blur' }]
}

// 搜索试卷
const searchExams = async query => {
  if (query !== '' && query.length < 2) {
    return
  }

  loading.value = true
  try {
    const res = await getInterviewerPrivateExams({
      page: 1,
      pageSize: 50,
      interviewerId: userStore.interviewerId,
      keyword: query,
      isPublic: false // 只获取HR创建的私有试卷
    })

    if (res.items) {
      examOptions.value = res.items
    }
  } catch (error) {
    console.error('搜索试卷失败:', error)
  } finally {
    loading.value = false
  }
}

// 提交表单
const submitForm = async () => {
  if (submitting.value) return

  try {
    await formRef.value.validate()

    submitting.value = true

    // 准备提交数据
    const [examStartTime, examEndTime] = form.timeRange

    const assignData = {
      applicationId: props.applicationId,
      jobSeekerId: props.jobSeekerId,
      examId: form.examId,
      duration: form.duration,
      examStartTime,
      examEndTime,
      note: form.note
    }

    // 调用API
    const res = await assignExam(assignData)

    if (res) {
      ElMessage.success('笔试分配成功')
      emit('success', {
        invitationCode: res.invitationCode,
        ...assignData
      })
    }
  } catch (error) {
    console.error('分配笔试失败:', error)
  } finally {
    submitting.value = false
  }
}

// 初始化
searchExams('')
</script>

<style>
/* 全局样式，不使用scoped，确保能修改日期选择器弹窗 */
.moved-up-datepicker {
  margin-top: -50px !important; /* 上移弹窗 */
  transform: translateY(-50px);
}
</style>

<style scoped>
.assign-exam-form {
  padding: 20px 0;
}

.custom-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.custom-option small {
  color: #909399;
  font-size: 12px;
}

.form-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.datetime-picker-container {
  position: relative;
  z-index: 10;
}
</style>
