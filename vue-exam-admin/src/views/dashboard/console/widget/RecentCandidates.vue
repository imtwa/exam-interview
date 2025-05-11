<template>
  <div class="recent-candidates art-custom-card">
    <div class="card-header">
      <div class="title">
        <h4 class="box-title">最近候选人</h4>
        <p class="subtitle">最近7天添加的候选人</p>
      </div>
      <el-button type="primary" text>查看全部</el-button>
    </div>
    <div class="candidate-list">
      <div class="candidate-item" v-for="(item, index) in candidateList" :key="index">
        <el-avatar :size="40" :src="item.avatar">{{ item.name.charAt(0) }}</el-avatar>
        <div class="info">
          <div class="name-position">
            <span class="name">{{ item.name }}</span>
            <span class="position">{{ item.position }}</span>
          </div>
          <div class="details">
            <span class="date">{{ item.date }}</span>
            <el-tag :type="getStatusType(item.status)" size="small">{{ item.status }}</el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive } from 'vue'

  // 模拟数据
  const candidateList = reactive([
    {
      name: '张明',
      position: '前端开发工程师',
      avatar: '',
      date: '2023-08-15',
      status: '已投递'
    },
    {
      name: '李华',
      position: '后端开发工程师',
      avatar: '',
      date: '2023-08-14',
      status: '简历筛选'
    },
    {
      name: '王芳',
      position: 'UI设计师',
      avatar: '',
      date: '2023-08-13',
      status: '待面试'
    },
    {
      name: '赵强',
      position: '产品经理',
      avatar: '',
      date: '2023-08-12',
      status: '已面试'
    },
    {
      name: '刘伟',
      position: '测试工程师',
      avatar: '',
      date: '2023-08-11',
      status: '已录用'
    }
  ])

  // 根据状态返回对应的标签类型
  const getStatusType = (status: string) => {
    const statusMap: Record<string, 'success' | 'warning' | 'info' | 'primary' | 'danger'> = {
      已投递: 'info',
      简历筛选: 'warning',
      待面试: 'primary',
      已面试: 'success',
      已录用: 'success',
      未通过: 'danger'
    }
    return statusMap[status] || 'info'
  }
</script>

<style lang="scss" scoped>
  .recent-candidates {
    width: 32%;
    padding: 0 20px 20px;

    .candidate-list {
      margin-top: 10px;
    }

    .candidate-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }

      .info {
        flex: 1;
        margin-left: 15px;

        .name-position {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 5px;

          .name {
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

          .date {
            font-size: 12px;
            color: var(--art-gray-500);
          }
        }
      }
    }
  }

  @media screen and (max-width: $device-ipad-pro) {
    .recent-candidates {
      width: 100%;
      margin-bottom: 15px;
    }
  }
</style>
