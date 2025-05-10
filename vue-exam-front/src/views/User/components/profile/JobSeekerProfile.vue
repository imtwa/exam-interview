<template>
  <div class="jobseeker-profile">
    <div class="section-container basic-info">
      <!-- 基本信息 -->
      <div class="section-header">
        <h2 class="section-title">基本信息</h2>
      </div>
      <div v-if="!jobseekerData" class="empty-data">
        <el-empty description="暂无求职者资料" />
      </div>
      <div v-else class="section-content">
        <div class="info-items">
          <div class="info-item" v-if="jobseekerData.gender">
            <span class="label">性别:</span>
            <span class="value">{{ getGenderLabel(jobseekerData.gender) }}</span>
          </div>
          <div class="info-item" v-if="jobseekerData.birthday">
            <span class="label">年龄:</span>
            <span class="value">{{ getAge(jobseekerData.birthday) }}岁</span>
          </div>
          <div class="info-item" v-if="jobseekerData.address">
            <span class="label">所在地:</span>
            <span class="value">{{ jobseekerData.address }}</span>
          </div>
          <div class="info-item" v-if="jobseekerData.expectedWorkCity">
            <span class="label">期望工作城市:</span>
            <span class="value">{{ jobseekerData.expectedWorkCity }}</span>
          </div>
          <div class="info-item" v-if="jobseekerData.expectedPosition">
            <span class="label">期望职位:</span>
            <span class="value">{{ jobseekerData.expectedPosition }}</span>
          </div>
          <div class="info-item" v-if="jobseekerData.expectedSalary">
            <span class="label">期望薪资:</span>
            <span class="value">{{ formatSalary(jobseekerData.expectedSalary) }}</span>
          </div>
          <div class="info-item" v-if="jobseekerData.currentSalary">
            <span class="label">当前薪资:</span>
            <span class="value">{{ formatSalary(jobseekerData.currentSalary) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 教育经历 -->
    <div class="section-container education">
      <div class="section-header">
        <h2 class="section-title">教育经历</h2>
      </div>
      <div
        v-if="!jobseekerData || !jobseekerData.education || jobseekerData.education.length === 0"
        class="empty-data"
      >
        <el-empty description="暂无教育经历" />
      </div>
      <div v-else class="section-content">
        <el-timeline>
          <el-timeline-item
            v-for="edu in sortedEducation"
            :key="edu.id"
            :timestamp="formatEducationPeriod(edu)"
            placement="top"
            :type="getTimelineItemType(edu.degree)"
          >
            <div class="education-item">
              <h3 class="school-name">{{ edu.school }}</h3>
              <div class="education-details">
                <span class="degree">{{ getDegreeLabel(edu.degree) }}</span>
                <span class="major">{{ edu.major }}</span>
              </div>
              <div class="education-description" v-if="edu.description">
                {{ edu.description }}
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>

    <!-- 工作经验 -->
    <div class="section-container work-experience">
      <div class="section-header">
        <h2 class="section-title">工作经验</h2>
      </div>
      <div
        v-if="
          !jobseekerData ||
          !jobseekerData.workExperience ||
          jobseekerData.workExperience.length === 0
        "
        class="empty-data"
      >
        <el-empty description="暂无工作经验" />
      </div>
      <div v-else class="section-content">
        <el-timeline>
          <el-timeline-item
            v-for="work in sortedWorkExperience"
            :key="work.id"
            :timestamp="formatWorkPeriod(work)"
            placement="top"
          >
            <div class="work-item">
              <h3 class="company-name">{{ work.company }}</h3>
              <div class="work-details">
                <span class="position">{{ work.position }}</span>
                <span class="department" v-if="work.department">{{ work.department }}</span>
              </div>
              <div class="work-description" v-if="work.description">
                {{ work.description }}
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  jobseekerData: {
    type: Object,
    required: true
  }
})

// 按照结束时间排序的教育经历 (最近的在前面)
const sortedEducation = computed(() => {
  if (!props.jobseekerData?.education?.length) return []

  return [...props.jobseekerData.education].sort((a, b) => {
    // 如果endDate为空或为null，则视为当前正在进行
    const dateA = a.endDate ? new Date(a.endDate) : new Date()
    const dateB = b.endDate ? new Date(b.endDate) : new Date()
    return dateB - dateA
  })
})

// 按照结束时间排序的工作经历 (最近的在前面)
const sortedWorkExperience = computed(() => {
  if (!props.jobseekerData?.workExperience?.length) return []

  return [...props.jobseekerData.workExperience].sort((a, b) => {
    // 如果endDate为空或为null，则视为当前正在工作
    const dateA = a.endDate ? new Date(a.endDate) : new Date()
    const dateB = b.endDate ? new Date(b.endDate) : new Date()
    return dateB - dateA
  })
})

// 将学历枚举转换为中文显示
const getDegreeLabel = degree => {
  const degreeMap = {
    HIGH_SCHOOL: '高中',
    JUNIOR_COLLEGE: '大专',
    BACHELOR: '本科',
    MASTER: '硕士',
    DOCTOR: '博士',
    OTHER: '其他'
  }
  return degreeMap[degree] || '未知'
}

// 根据学历返回时间线项目的类型
const getTimelineItemType = degree => {
  const typeMap = {
    HIGH_SCHOOL: '',
    JUNIOR_COLLEGE: '',
    BACHELOR: 'primary',
    MASTER: 'success',
    DOCTOR: 'warning',
    OTHER: 'info'
  }
  return typeMap[degree] || ''
}

// 格式化教育经历的起止时间
const formatEducationPeriod = education => {
  const startDate = education.startDate ? formatDate(education.startDate) : '未知'
  const endDate = education.endDate ? formatDate(education.endDate) : '至今'
  return `${startDate} - ${endDate}`
}

// 格式化工作经历的起止时间
const formatWorkPeriod = work => {
  const startDate = work.startDate ? formatDate(work.startDate) : '未知'
  const endDate = work.endDate ? formatDate(work.endDate) : '至今'
  return `${startDate} - ${endDate}`
}

// 格式化日期
const formatDate = dateString => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  } catch (error) {
    console.error('日期格式化错误:', error)
    return dateString
  }
}

// 根据生日计算年龄
const getAge = birthday => {
  if (!birthday) return ''

  try {
    const birthDate = new Date(birthday)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  } catch (error) {
    console.error('年龄计算错误:', error)
    return ''
  }
}

// 格式化薪资
const formatSalary = salary => {
  if (!salary) return '面议'

  // 如果薪资是数字类型
  if (typeof salary === 'number') {
    if (salary >= 10000) {
      return `${(salary / 10000).toFixed(1)}万/年`
    }
    return `${salary}元/月`
  }

  // 如果薪资是字符串，直接返回
  return salary
}

// 将性别枚举转换为中文显示
const getGenderLabel = gender => {
  const genderMap = {
    MALE: '男',
    FEMALE: '女',
    OTHER: '其他'
  }
  return genderMap[gender] || '未设置'
}
</script>

<style lang="less" scoped>
.jobseeker-profile {
  margin-bottom: 24px;
}

.section-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 20px;
}

.section-header {
  margin-bottom: 16px;

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0;
    padding-left: 12px;
    border-left: 4px solid #0352c9;
  }
}

.empty-data {
  padding: 20px 0;
  text-align: center;
}

.section-content {
  padding: 0 12px;
}

.info-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;

  .info-item {
    display: flex;
    margin-bottom: 8px;

    .label {
      font-weight: 500;
      color: #666;
      width: 100px;
      flex-shrink: 0;
    }

    .value {
      color: #333;
    }
  }
}

.education-item,
.work-item {
  margin-bottom: 16px;

  .school-name,
  .company-name {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
  }

  .education-details,
  .work-details {
    margin-bottom: 8px;
    display: flex;
    gap: 12px;
    align-items: center;

    .degree,
    .position {
      font-weight: 500;
      color: #555;
    }

    .major,
    .department {
      color: #666;
    }
  }

  .education-description,
  .work-description {
    color: #666;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-line;
  }
}

// 时间线样式优化
:deep(.el-timeline) {
  padding-left: 16px;
}

:deep(.el-timeline-item__timestamp) {
  color: #888;
  font-size: 13px;
}

@media (max-width: 768px) {
  .info-items {
    grid-template-columns: 1fr;
  }
}
</style>
