<template>
  <div class="recent-activities art-custom-card">
    <div class="card-header">
      <div class="title">
        <h4 class="box-title">近期活动</h4>
        <p class="subtitle">系统中的最新活动</p>
      </div>
      <el-button type="primary" text>查看全部</el-button>
    </div>
    <div class="activities-timeline">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in activities"
          :key="index"
          :color="getActivityColor(activity.type)"
          :timestamp="activity.time"
          size="large"
        >
          <div class="activity-content">
            <span class="activity-title">{{ activity.title }}</span>
            <p class="activity-desc">{{ activity.content }}</p>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive } from 'vue'

  // 模拟数据
  const activities = reactive([
    {
      title: '新增职位',
      content: '张经理发布了新职位"高级前端开发工程师"',
      time: '10分钟前',
      type: 'primary'
    },
    {
      title: '安排面试',
      content: '李HR安排了王芳的UI设计师面试',
      time: '2小时前',
      type: 'success'
    },
    {
      title: '考试完成',
      content: '赵强完成了"前端开发技能测评"考试',
      time: '4小时前',
      type: 'info'
    },
    {
      title: '简历投递',
      content: '收到刘伟的"测试工程师"职位申请',
      time: '昨天',
      type: 'warning'
    },
    {
      title: '面试结果',
      content: '张明的"前端开发工程师"面试通过',
      time: '2天前',
      type: 'success'
    }
  ])

  // 根据活动类型返回对应的颜色
  const getActivityColor = (type: string) => {
    const colorMap: Record<string, string> = {
      primary: 'var(--el-color-primary)',
      success: 'var(--el-color-success)',
      warning: 'var(--el-color-warning)',
      danger: 'var(--el-color-danger)',
      info: 'var(--el-color-info)'
    }
    return colorMap[type] || 'var(--el-color-info)'
  }
</script>

<style lang="scss" scoped>
  .recent-activities {
    width: 32%;
    padding: 0 20px 20px;

    .activities-timeline {
      margin-top: 10px;
      padding: 0 10px;
      max-height: 340px;
      overflow-y: auto;

      :deep(.el-timeline) {
        padding-bottom: 0;
      }

      :deep(.el-timeline-item) {
        padding-bottom: 15px;

        &:last-child {
          padding-bottom: 0;
        }

        .el-timeline-item__timestamp {
          font-size: 12px;
          color: var(--art-gray-500);
        }
      }

      .activity-content {
        .activity-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--art-gray-900);
        }

        .activity-desc {
          margin-top: 5px;
          font-size: 13px;
          color: var(--art-gray-600);
          line-height: 1.5;
        }
      }
    }
  }

  @media screen and (max-width: $device-ipad-pro) {
    .recent-activities {
      width: 100%;
      margin-bottom: 15px;
    }
  }
</style>
