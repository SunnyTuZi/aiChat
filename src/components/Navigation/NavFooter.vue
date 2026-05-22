<script lang="tsx" setup>
withDefaults(
  defineProps<{
    showBorder?: boolean
  }>(),
  {
    showBorder: false
  }
)

const link = ref('https://github.com/pdsuwwz')

</script>

<template>
  <footer
    class="footer"
    :class="{
      'has-border': showBorder
    }"
  >
    <div class="footer-content">
      <div class="footer-left">
        <div class="status-indicator">
          <span class="status-dot"></span>
          <span class="status-text">在线</span>
        </div>
        <span class="divider">|</span>
        <span class="footer-text">
          <NavigationNavOctocat />
          MIT Licensed | Copyright © 2020-PRESENT 
          <a
            target="_blank"
            :href="link"
            class="github-link"
          >
            Wisdom
          </a>
        </span>
      </div>
      <div class="footer-right">
        <div class="footer-actions">
          <button class="footer-action-btn">
            <span class="i-hugeicons:github"></span>
          </button>
          <button class="footer-action-btn">
            <span class="i-hugeicons:twitter"></span>
          </button>
          <button class="footer-action-btn">
            <span class="i-hugeicons:mail"></span>
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  width: 100%;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  padding: 8px 16px;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  animation: status-pulse 2s ease-in-out infinite;
}

@keyframes status-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

.status-text {
  font-size: 12px;
  color: #6b7280;
}

.divider {
  color: #d1d5db;
}

.footer-text {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #9ca3af;
}

.github-link {
  color: #8b5cf6;
  font-weight: 600;
  text-decoration: none;
  padding-bottom: 2px;
  border-bottom: 1px solid transparent;
  transition: all 0.2s ease;
  
  &:hover {
    color: #7c3aed;
    border-bottom-color: #8b5cf6;
  }
}

.footer-right {
  display: flex;
  align-items: center;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-action-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(139, 92, 246, 0.1);
    color: #8b5cf6;
  }
}
</style>
