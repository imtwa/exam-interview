<template>
  <div class="console">
    <CardList></CardList>

    <div class="column column2">
      <ExamOverview></ExamOverview>
      <InterviewStats></InterviewStats>
    </div>

    <div class="column column3">
      <RecentCandidates></RecentCandidates>
      <RecentActivities></RecentActivities>
      <UpcomingInterviews></UpcomingInterviews>
    </div>

    <div class="bottom-wrap art-custom-card">
      <div>
        <h2 class="box-title">关于云面官系统</h2>
        <p>云面官是一款专业的在线招聘与面试管理系统，帮助企业高效管理招聘流程</p>
        <p>系统集成了简历筛选、在线考试、面试安排、候选人评估等多项功能</p>

        <div class="feature-list">
          <div class="feature">
            <i class="el-icon-document"></i>
            <div>
              <h3>简历管理</h3>
              <p>高效筛选和管理求职者简历</p>
            </div>
          </div>
          <div class="feature">
            <i class="el-icon-edit-outline"></i>
            <div>
              <h3>在线考试</h3>
              <p>自定义专业技能测评</p>
            </div>
          </div>
          <div class="feature">
            <i class="el-icon-video-camera"></i>
            <div>
              <h3>视频面试</h3>
              <p>便捷的远程面试体验</p>
            </div>
          </div>
          <div class="feature">
            <i class="el-icon-data-analysis"></i>
            <div>
              <h3>数据分析</h3>
              <p>全面的招聘数据报告</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, watch } from 'vue'
  import CardList from './widget/CardList.vue'
  import RecentCandidates from './widget/RecentCandidates.vue'
  import RecentActivities from './widget/RecentActivities.vue'
  import ExamOverview from './widget/ExamOverview.vue'
  import InterviewStats from './widget/InterviewStats.vue'
  import UpcomingInterviews from './widget/UpcomingInterviews.vue'
  import AppConfig from '@/config'
  import { useSettingStore } from '@/store/modules/setting'
  import { useCommon } from '@/composables/useCommon'

  const settingStore = useSettingStore()
  const currentGlopTheme = computed(() => settingStore.systemThemeType)

  // 系统主题风格变化时，刷新页面重写渲染 Echarts
  watch(currentGlopTheme, () => {
    settingStore.reload()
  })

  const systemName = AppConfig.systemInfo.name
  useCommon().scrollToTop()
</script>

<style lang="scss" scoped>
  .console {
    padding-bottom: 15px;

    :deep(.card-header) {
      display: flex;
      justify-content: space-between;
      padding: 20px 25px 5px 0;

      .title {
        h4 {
          font-size: 18px;
          font-weight: 500;
          color: var(--art-text-gray-800);
        }

        p {
          margin-top: 3px;
          font-size: 13px;

          span {
            margin-left: 10px;
            color: #52c41a;
          }
        }
      }
    }

    // 主标题
    :deep(.box-title) {
      color: var(--art-gray-900) !important;
    }

    // 副标题
    :deep(.subtitle) {
      color: var(--art-gray-600) !important;
    }

    :deep(.card-list li),
    .region,
    .dynamic,
    .bottom-wrap {
      background: var(--art-main-bg-color);
      border-radius: calc(var(--custom-radius) + 4px) !important;
    }

    .column {
      display: flex;
      justify-content: space-between;
      margin-top: var(--console-margin);
      background-color: transparent !important;
    }

    .bottom-wrap {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      padding: 20px;
      margin-top: var(--console-margin);
      background: var(--art-main-bg-color);

      h2 {
        margin-top: 10px;
        font-size: 20px;
        font-weight: 500;
      }

      p {
        margin-top: 5px;
        font-size: 14px;
        color: var(--art-gray-600);
      }

      .feature-list {
        display: flex;
        flex-wrap: wrap;
        margin-top: 25px;

        .feature {
          display: flex;
          align-items: center;
          width: 48%;
          padding: 15px;
          margin-bottom: 15px;
          background: var(--art-bg-color);
          border-radius: 8px;
          transition: all 0.3s;

          &:hover {
            transform: translateY(-4px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          }

          i {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            font-size: 24px;
            color: var(--el-color-primary);
            background-color: var(--el-color-primary-light-9);
            border-radius: 8px;
          }

          div {
            margin-left: 15px;

            h3 {
              font-size: 16px;
              font-weight: 500;
              color: var(--art-gray-900);
            }

            p {
              margin-top: 5px;
              font-size: 13px;
              color: var(--art-gray-600);
            }
          }
        }
      }
    }
  }

  @media screen and (max-width: $device-ipad-pro) {
    .console {
      .column2 {
        margin-top: 15px;
      }

      .column3 {
        display: flex;
        flex-wrap: wrap;
        margin-top: 15px;
      }

      .bottom-wrap {
        margin-top: 15px;

        .feature-list {
          .feature {
            width: 100%;
          }
        }
      }
    }
  }
</style>

<!-- 移动端处理 -->
<style lang="scss" scoped>
  .console {
    @media screen and (max-width: $device-ipad-vertical) {
      :deep(.card-list) {
        width: calc(100% + 15px);
        margin-left: -15px;

        li {
          width: calc(50% - 15px);
          margin: 0 0 15px 15px;
        }
      }

      .column2 {
        display: block;
        margin-top: 0;

        :deep(.exam-overview) {
          width: 100%;
          margin-top: 15px;
        }

        :deep(.interview-stats) {
          width: 100%;
          margin-top: 15px;
        }
      }

      .column3 {
        display: block;
        margin-top: 15px;

        :deep(.recent-candidates) {
          width: 100%;
          margin-top: 15px;
        }

        :deep(.recent-activities) {
          width: 100%;
          margin-top: 15px;
        }

        :deep(.upcoming-interviews) {
          width: 100%;
          margin-top: 15px;
        }
      }

      .bottom-wrap {
        height: auto;
        margin-top: 15px;

        .feature-list {
          .feature {
            width: 100%;
          }
        }
      }
    }

    @media screen and (max-width: $device-phone) {
      :deep(.card-list) {
        width: 100%;
        margin: 0;

        li {
          width: 100%;
          margin: 0 0 15px;
        }
      }

      .column2 {
        display: block;
        margin-top: 0;

        :deep(.exam-overview) {
          width: 100%;
          margin-top: 15px;
        }

        :deep(.interview-stats) {
          width: 100%;
          margin-top: 15px;
        }
      }

      .column3 {
        display: block;
        margin-top: 15px;

        :deep(.recent-candidates) {
          width: 100%;
          margin-top: 15px;
        }

        :deep(.recent-activities) {
          width: 100%;
          margin-top: 15px;
        }

        :deep(.upcoming-interviews) {
          width: 100%;
          margin-top: 15px;
        }
      }

      .bottom-wrap {
        padding: 0 15px;

        .feature-list {
          .feature {
            width: 100%;
          }
        }
      }
    }
  }
</style>
