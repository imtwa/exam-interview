<template>
  <ul class="card-list" :style="{ marginTop: showWorkTab ? '0' : '10px' }">
    <li class="art-custom-card" v-for="(item, index) in dataList" :key="index">
      <span class="des subtitle">{{ item.des }}</span>
      <CountTo class="number box-title" :endVal="item.num" :duration="1000" separator=""></CountTo>
      <div class="change-box">
        <span class="change-text">较上周</span>
        <span
          class="change"
          :class="[item.change.indexOf('+') === -1 ? 'text-danger' : 'text-success']"
        >
          {{ item.change }}
        </span>
      </div>
      <i class="iconfont-sys" v-html="item.icon"></i>
    </li>
  </ul>
</template>

<script setup lang="ts">
  import { useSettingStore } from '@/store/modules/setting'
  import { CountTo } from 'vue3-count-to'
  import { storeToRefs } from 'pinia'
  import { reactive } from 'vue'

  const { showWorkTab } = storeToRefs(useSettingStore())

  const dataList = reactive([
    {
      des: '职位发布数',
      icon: '&#xe721;',
      startVal: 0,
      duration: 1000,
      num: 128,
      change: '+15%'
    },
    {
      des: '简历投递数',
      icon: '&#xe724;',
      startVal: 0,
      duration: 1000,
      num: 356,
      change: '+22%'
    },
    {
      des: '面试安排数',
      icon: '&#xe7aa;',
      startVal: 0,
      duration: 1000,
      num: 89,
      change: '+18%'
    },
    {
      des: '考试完成数',
      icon: '&#xe82a;',
      startVal: 0,
      duration: 1000,
      num: 65,
      change: '+10%'
    }
  ])
</script>

<style lang="scss" scoped>
  .card-list {
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    width: calc(100% + var(--console-margin));
    margin-top: 0 !important;
    margin-left: calc(0px - var(--console-margin));
    background-color: transparent !important;

    li {
      position: relative;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: calc(25% - var(--console-margin));
      height: 140px;
      padding: 0 18px;
      margin: 0 0 0 var(--console-margin);
      background: var(--art-main-bg-color);

      $icon-size: 52px;

      .iconfont-sys {
        position: absolute;
        top: 0;
        right: 20px;
        bottom: 0;
        width: $icon-size;
        height: $icon-size;
        margin: auto;
        overflow: hidden;
        font-size: 22px;
        line-height: $icon-size;
        color: var(--el-color-primary) !important;
        text-align: center;
        background-color: var(--el-color-primary-light-9);
        border-radius: 12px;
      }

      .des {
        display: block;
        height: 14px;
        font-size: 14px;
        line-height: 14px;
      }

      .number {
        display: block;
        margin-top: 10px;
        font-size: 28px;
        font-weight: 400;
      }

      .change-box {
        display: flex;
        align-items: center;
        margin-top: 10px;

        .change-text {
          display: block;
          font-size: 13px;
          color: var(--art-text-gray-600);
        }

        .change {
          display: block;
          margin-left: 5px;
          font-size: 13px;
          font-weight: bold;
        }
      }
    }
  }

  .dark {
    .card-list {
      li {
        .iconfont-sys {
          background-color: #232323 !important;
        }
      }
    }
  }
</style>
