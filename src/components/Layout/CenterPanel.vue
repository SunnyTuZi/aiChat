<script lang="tsx" setup>
import SideBar from '../SideBar/index.vue'
import TopicSideBar from '../TopicSideBar/index.vue'

interface Props {
  loading?: boolean
  showLeftSidebar?: boolean
  showRightSidebar?: boolean
}

withDefaults(
  defineProps<Props>(),
  {
    loading: false,
    showLeftSidebar: true,
    showRightSidebar: false
  }
)
</script>

<template>
  <LayoutSlotCenterPanel v-bind="$attrs">
    <template
      v-if="showLeftSidebar"
      #left
    >
      <SideBar />
    </template>
    <div
      h-full
      class="main-content-area"
    >
      <slot name="default"></slot>
    </div>
    <template
      v-if="showRightSidebar"
      #right
    >
      <TopicSideBar />
    </template>
  </LayoutSlotCenterPanel>
</template>

<style lang="scss" scoped>
.main-content-area {
  display: flex;
  flex-direction: column;
  background: #fff;
}
</style>
