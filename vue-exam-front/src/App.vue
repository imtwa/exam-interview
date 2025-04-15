<template>
  <div>
    <router-view />
  </div>
</template>

<script setup></script>

<style>
/* 全局滚动条美化样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 4px;
  transition: all 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

/* Firefox滚动条样式 */
* {
  scrollbar-width: thin;
  scrollbar-color: #c0c4cc #f1f1f1;
}
</style>
