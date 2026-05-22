<script lang="tsx" setup>
interface Props {
  loading?: boolean
}
withDefaults(
  defineProps<Props>(),
  {
    loading: false
  }
)
</script>

<template>
  <LayoutSlotFrame
    :class="[
      'bg-no-repeat bg-cover bg-center',
    ]"
  >
    <template #center>
      <div
        w-full
        h-full
        overflow-hidden
        class="panel-container"
      >
        <n-spin
          w-full
          h-full
          content-class="w-full h-full flex"
          :show="loading"
          :rotate="false"
          class="bg-#ffffff"
          :style="{
            '--n-opacity-spinning': '0'
          }"
        >
          <template #icon>
            <div class="i-svg-spinners:pulse-3"></div>
          </template>
          <div class="three-column-layout">
            <section
              v-if="$slots.left"
              class="left-sidebar"
            >
              <slot name="left"></slot>
            </section>
            <section class="main-content">
              <slot name="default"></slot>
            </section>
            <section
              v-if="$slots.right"
              class="right-sidebar"
            >
              <slot name="right"></slot>
            </section>
          </div>
        </n-spin>
      </div>
    </template>
    <!-- <template #bottom>
      <NavigationNavFooter />
    </template> -->
  </LayoutSlotFrame>
</template>

<style lang="scss" scoped>
.panel-container {
  display: flex;
  flex-direction: column;
}

.three-column-layout {
  display: flex;
  width: 100%;
  height: 100%;
}

.left-sidebar {
  width: 280px;
  flex-shrink: 0;
  height: 100%;
  border-right: 1px solid #e5e7eb;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.right-sidebar {
  width: 280px;
  flex-shrink: 0;
  height: 100%;
  border-left: 1px solid #e5e7eb;
}

@media (width <= 1280px) {

  .right-sidebar {
    display: none;
  }
}

@media (width <= 768px) {

  .left-sidebar {
    display: none;
  }
}
</style>
