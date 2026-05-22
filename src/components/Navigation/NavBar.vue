<script lang="tsx" setup>
import { ref } from 'vue'

interface Props {
  transparent?: boolean
  hasBorder?: boolean
}
withDefaults(
  defineProps<Props>(),
  {
    transparent: true,
    hasBorder: true
  }
)


const handleToRepo = () => {
  const link = ref('https://github.com/pdsuwwz/chatgpt-vue3-light-mvp')
  window.open(link.value, '_blank')
}


</script>

<template>
  <header
    class="navigation-nav-header-container"
    :class="[
      transparent
        ? 'bg-bgcolor'
        : 'bg-transparent',
      hasBorder
        ? 'b-b-#e5e7eb b-b-solid'
        : 'b-b-transparent'
    ]"
  >
    <div class="header-left">
      <div
        class="logo-wrapper"
        @click="handleToRepo()"
      >
        <div class="logo-icon">
          <span class="i-hugeicons:cloud-1"></span>
        </div>
        <span class="logo-text">小宗助手</span>
      </div>
    </div>
    <div class="header-center">
      <slot name="center"></slot>
    </div>
    <div class="header-right">
      <slot name="right"></slot>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.navigation-nav-header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(180deg, rgb(139 92 246 / 2%) 0%, transparent 100%);
}

.header-left {
  display: flex;
  align-items: center;
  height: 40px;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgb(139 92 246 / 8%);
    transform: translateY(-1px);
  }
}

.logo-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  border-radius: 8px;
  font-size: 16px;
  color: #fff;
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  height: 40px;
  gap: 8px;
}
</style>
