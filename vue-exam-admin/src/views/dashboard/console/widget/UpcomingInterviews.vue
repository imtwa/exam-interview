<template>
  <div class="upcoming-interviews art-custom-card">
    <div class="card-header">
      <div class="title">
        <h4 class="box-title">即将到来的面试</h4>
        <p class="subtitle">未来7天的面试安排</p>
      </div>
      <el-button type="primary" text>查看全部</el-button>
    </div>
    <div class="interview-list">
      <div class="interview-item" v-for="(item, index) in interviewList" :key="index">
        <div class="date-badge">
          <div class="month">{{ getMonth(item.date) }}</div>
          <div class="day">{{ getDay(item.date) }}</div>
        </div>
        <div class="info">
          <div class="candidate-position">
            <span class="candidate">{{ item.candidate }}</span>
            <span class="position">{{ item.position }}</span>
          </div>
          <div class="details">
            <div class="time-location">
              <i class="el-icon-time"></i>
              <span>{{ item.time }}</span>
              <i class="el-icon-location" style="margin-left: 10px"></i>
              <span>{{ item.location }}</span>
            </div>
            <el-tag size="small" :type="item.type">{{ item.status }}</el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive } from 'vue'

  // 模拟数据
  interface InterviewItem {
    candidate: string
    position: string
    date: string
    time: string
    location: string
    status: string
    type: 'success' | 'warning' | 'info' | 'primary' | 'danger'
  }

  const interviewList = reactive<InterviewItem[]>([
    {
      candidate: '李华',
      position: '后端开发工程师',
      date: '2023-08-18',
      time: '10:00-11:00',
      location: '线上面试',
      status: '待确认',
      type: 'warning'
    },
    {
      candidate: '王芳',
      position: 'UI设计师',
      date: '2023-08-19',
      time: '14:30-15:30',
      location: '会议室A',
      status: '已确认',
      type: 'success'
    },
    {
      candidate: '赵强',
      position: '产品经理',
      date: '2023-08-20',
      time: '11:00-12:00',
      location: '会议室B',
      status: '已确认',
      type: 'success'
    },
    {
      candidate: '刘伟',
      position: '测试工程师',
      date: '2023-08-21',
      time: '16:00-17:00',
      location: '线上面试',
      status: '待确认',
      type: 'warning'
    }
  ])

  // 获取月份
  const getMonth = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', { month: 'short' }).replace('月', '')
  }

  // 获取日期
  const getDay = (dateString: string) => {
    const date = new Date(dateString)
    return date.getDate()
  }
</script>

<style lang="scss" scoped>
  .upcoming-interviews {
    width: 32%;
    padding: 0 20px 20px;

    .interview-list {
      margin-top: 10px;
    }

    .interview-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }

      .date-badge {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 50px;
        height: 50px;
        background-color: var(--el-color-primary-light-9);
        border-radius: 8px;

        .month {
          font-size: 12px;
          color: var(--el-color-primary);
        }

        .day {
          font-size: 18px;
          font-weight: bold;
          color: var(--el-color-primary);
        }
      }

      .info {
        flex: 1;
        margin-left: 15px;

        .candidate-position {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 5px;

          .candidate {
            font-size: 14px;
            font-weight: 500;
            color: var(--art-gray-900);
          }

          .position {
            font-size: 12px;
            color: var(--art-gray-600);
          }
        }

        .details {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .time-location {
            display: flex;
            align-items: center;
            font-size: 12px;
            color: var(--art-gray-500);

            i {
              margin-right: 3px;
              font-size: 12px;
            }
          }
        }
      }
    }
  }

  @media screen and (max-width: $device-ipad-pro) {
    .upcoming-interviews {
      width: 100%;
    }
  }
</style>
