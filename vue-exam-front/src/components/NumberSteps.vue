<template>
  <div class="number-steps">
    <div
      v-for="(item, index) in steps"
      :key="index"
      class="number-steps-item"
      :class="{
        finished: index + 1 < active,
        active: index + 1 === active
      }"
    >
      <template v-if="index > 0">
        <slot name="split">
          <i class="iconfont icon-wdjiantou2 number-steps-item-split"></i>
        </slot>
      </template>
      <div class="number-steps-item-content">
        <span
          class="number-steps-item-index"
          :class="{
            icon: index + 1 < active
          }"
          v-text="index + 1 < active ? undefined : index + 1"
        ></span
        ><span class="number-steps-item-text">{{ item }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NumberSteps',
  props: {
    steps: {
      type: Array,
      default: () => []
    },
    active: {
      type: Number,
      default: 1
    }
  }
}
</script>
<style lang="less" scoped>
.number-steps {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--boxBorderColor-1);
  &-item {
    display: flex;
    align-items: center;
    font-style: normal;
    font-weight: 400;
    line-height: 14px;
    &-content {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;
    }
    &-index {
      box-sizing: border-box;
      flex: none;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 24px;
      height: 24px;
      line-height: 24px;
      color: #8d8e99;
      font-size: 14px;
      border-radius: 50%;
      background: #eeeeee;
      text-align: center;
      border: 1px solid #eeeeee;
      &.icon {
        position: relative;
        color: var(--primaryColor);
        border-color: var(--primaryColor);
        background: var(--primaryColor);
        &:before,
        &:after {
          content: '';
          width: 2px;
          display: block;
          background: #ffffff;
          position: absolute;
        }
        &:before {
          height: 6px;
          transform: rotate(-45deg);
          top: 10px;
          left: 7px;
        }
        &:after {
          height: 12px;
          top: 5px;
          left: 12px;
          transform: rotate(45deg);
        }
      }
    }
    &-text {
      margin-left: 8px;
      color: #999;
      font-size: 12px;
    }
    &-split {
      margin: 0 16px;
      font-size: 16px;
      color: #8d8e99;
    }
    &.active {
      .number-steps-item-index {
        color: var(--primaryColor);
        background: rgba(19, 76, 255, 0.2);
        border-color: var(--primaryColor);
      }
      .number-steps-item-text {
        color: var(--primaryColor);
      }
      .number-steps-item-split {
        color: var(--primaryColor);
      }
    }
    &.finished {
      .number-steps-item-text {
        color: var(--primaryColor);
      }
    }
  }
}
</style>
