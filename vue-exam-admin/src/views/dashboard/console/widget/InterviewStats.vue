<template>
  <div class="region interview-stats art-custom-card">
    <div class="chart" ref="chartRef"></div>
    <div class="text">
      <h3 class="box-title">面试统计</h3>
      <p class="subtitle">本月面试通过率 <span class="text-success">+8%</span></p>
      <p class="subtitle">通过云面官系统，您可以高效安排和管理面试流程，提升招聘效率</p>
    </div>
    <div class="list">
      <div v-for="(item, index) in list" :key="index">
        <p>{{ item.num }}</p>
        <p class="subtitle">{{ item.name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import * as echarts from 'echarts'
  import { useECharts } from '@/utils/echarts/useECharts'
  import { useSettingStore } from '@/store/modules/setting'
  import { getCssVariable } from '@/utils/colors'
  import { storeToRefs } from 'pinia'

  const chartRef = ref<HTMLDivElement | null>(null)
  const { setOptions, removeResize, resize } = useECharts(chartRef as Ref<HTMLDivElement>)
  const settingStore = useSettingStore()
  const { menuOpen, isDark } = storeToRefs(settingStore)

  // 收缩菜单时，重新计算图表大小
  watch(menuOpen, () => {
    const delays = [100, 200, 300]
    delays.forEach((delay) => {
      setTimeout(resize, delay)
    })
  })

  const list = [
    { name: '面试总数', num: '89' },
    { name: '已完成', num: '65' },
    { name: '待进行', num: '24' },
    { name: '通过率', num: '42%' }
  ]

  const createChart = () => {
    setOptions({
      tooltip: {
        trigger: 'item'
      },
      legend: {
        bottom: '0%',
        left: 'center',
        textStyle: {
          color: isDark.value ? '#aaa' : '#666'
        }
      },
      series: [
        {
          name: '面试状态',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: isDark.value ? '#1a1a1a' : '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '16',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 32, name: '已通过' },
            { value: 24, name: '待面试' },
            { value: 18, name: '未通过' },
            { value: 15, name: '已取消' }
          ],
          color: [
            getCssVariable('--el-color-success'),
            getCssVariable('--el-color-primary'),
            getCssVariable('--el-color-danger'),
            getCssVariable('--el-color-info')
          ]
        }
      ]
    })
  }

  onMounted(() => {
    createChart()
  })

  onUnmounted(() => {
    removeResize()
  })
</script>

<style lang="scss" scoped>
  .dark {
    .region {
      .chart {
        background: none;
      }
    }
  }

  .interview-stats {
    box-sizing: border-box;
    width: 56%;
    height: 420px;
    padding: 16px;

    .chart {
      box-sizing: border-box;
      width: 100%;
      height: 220px;
      padding: 20px 0 20px 20px;
      border-radius: calc(var(--custom-radius) / 2 + 4px) !important;
    }

    .text {
      margin-left: 3px;

      h3 {
        margin-top: 20px;
        font-size: 18px;
        font-weight: 500;
      }

      p {
        margin-top: 5px;
        font-size: 14px;

        &:last-of-type {
          height: 42px;
          margin-top: 5px;
        }
      }
    }

    .list {
      display: flex;
      justify-content: space-between;
      margin-left: 3px;

      > div {
        flex: 1;

        p {
          font-weight: 400;

          &:first-of-type {
            font-size: 24px;
            color: var(--art-gray-900);
          }

          &:last-of-type {
            font-size: 13px;
          }
        }
      }
    }
  }

  @media screen and (max-width: $device-phone) {
    .dark {
      .interview-stats {
        .chart {
          padding: 15px 0 0 !important;
        }
      }
    }
  }
</style>
