<template>
  <el-tag :type="statusType" :effect="effect" size="small">{{ statusText }}</el-tag>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  effect: {
    type: String,
    default: 'light'
  }
})

// 状态文本映射
const statusText = computed(() => {
  const statusMap = {
    RESUME_SCREENING: '简历筛选',
    WRITTEN_TEST: '笔试',
    FIRST_INTERVIEW: '一面',
    SECOND_INTERVIEW: '二面',
    HR_INTERVIEW: 'HR面试',
    SCHEDULED: '已安排',
    OFFER: '已录用',
    REJECTED: '已拒绝'
  }
  return statusMap[props.status] || props.status
})

// 状态类型映射（对应el-tag的type）
const statusType = computed(() => {
  const typeMap = {
    RESUME_SCREENING: 'info',
    WRITTEN_TEST: 'info',
    FIRST_INTERVIEW: 'warning',
    SECOND_INTERVIEW: 'warning',
    HR_INTERVIEW: 'warning',
    SCHEDULED: 'primary',
    OFFER: 'success',
    REJECTED: 'danger'
  }
  return typeMap[props.status] || 'info'
})
</script>

<style scoped>
/* 可以添加自定义样式 */
</style>
