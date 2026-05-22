<script lang="tsx" setup>
import { computed, ref } from 'vue'

interface Assistant {
  id: string
  name: string
  avatar: string
  description: string
  isActive?: boolean
}

const props = withDefaults(
  defineProps<{
    assistants?: Assistant[]
    activeId?: string
  }>(),
  {
    assistants: () => [
      {
        id: '1',
        name: '随便聊聊',
        avatar: 'i-hugeicons:ai-chat-02',
        description: '我是你的智能助手，可以回答你的任何问题',
        isActive: true
      }
      // {
      //   id: '2',
      //   name: '代码助手',
      //   avatar: 'i-hugeicons:code-circle',
      //   description: '专业的代码编写和调试助手'
      // },
      // {
      //   id: '3',
      //   name: '写作助手',
      //   avatar: 'i-hugeicons:edit-3',
      //   description: '帮助你撰写各种类型的文档'
      // },
      // {
      //   id: '4',
      //   name: '学习助手',
      //   avatar: 'i-hugeicons:book-open',
      //   description: '学习路上的好帮手'
      // }
    ]
  }
)

const emit = defineEmits(['select'])

const hoveredId = ref<string | null>(null)

const activeAssistant = computed(() => {
  return props.assistants.find(a => a.id === props.activeId) || props.assistants[0]
})

const handleSelect = (assistant: Assistant) => {
  emit('select', assistant)
}

const AddAssistantButton = defineComponent({
  setup() {
    const isHovered = ref(false)
    return {
      isHovered
    }
  },
  render() {
    return (
      <button
        class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-200 cursor-pointer group"
        style={{
          backgroundColor: this.isHovered ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
          border: '2px dashed #e5e7eb'
        }}
        onMouseenter={() => { this.isHovered = true }}
        onMouseleave={() => { this.isHovered = false }}
      >
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
          style={{
            backgroundColor: this.isHovered ? '#8b5cf6' : '#f3f4f6'
          }}
        >
          <span
            class="text-lg font-bold transition-colors duration-200"
            style={{
              color: this.isHovered ? '#ffffff' : '#6b7280'
            }}
          >+</span>
        </div>
        <span
          class="text-sm font-medium transition-colors duration-200"
          style={{
            color: this.isHovered ? '#8b5cf6' : '#9ca3af'
          }}
        >新建助手</span>
      </button>
    )
  }
})
</script>

<template>
  <div class="sidebar-container">
    <div class="sidebar-header">
      <div class="logo-section">
        <div class="logo-icon">
          <span class="i-hugeicons:ai-brain-03"></span>
        </div>
        <span class="logo-text">民宗助手</span>
      </div>
    </div>

    <div class="search-wrapper">
      <div class="search-input-wrapper">
        <span class="search-icon i-hugeicons:search"></span>
        <input
          type="text"
          placeholder="搜索助手..."
          class="search-input"
        >
      </div>
    </div>

    <div class="assistants-list">
      <div
        v-for="assistant in assistants"
        :key="assistant.id"
        class="assistant-item"
        :class="{
          'active': assistant.id === activeId,
          'hovered': hoveredId === assistant.id
        }"
        @click="handleSelect(assistant)"
        @mouseenter="hoveredId = assistant.id"
        @mouseleave="hoveredId = null"
      >
        <div class="assistant-avatar">
          <span :class="assistant.avatar"></span>
        </div>
        <div class="assistant-info">
          <div class="assistant-name">{{ assistant.name }}</div>
          <div class="assistant-description">{{ assistant.description }}</div>
        </div>
        <div
          v-if="assistant.id === activeId"
          class="active-indicator"
        ></div>
      </div>
    </div>

    <!-- <div class="sidebar-footer">
      <AddAssistantButton />

      <div class="divider"></div>

      <div class="sidebar-actions">
        <button class="action-btn">
          <span class="i-hugeicons:settings-2"></span>
        </button>
        <button class="action-btn">
          <span class="i-hugeicons:help-circle"></span>
        </button>
      </div>
    </div> -->
  </div>
</template>

<style lang="scss" scoped>
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 280px;
  background: linear-gradient(180deg, #faf5ff 0%, #fff 100%);
  border-right: 1px solid #e5e7eb;
  padding: 16px;
}

.sidebar-header {
  padding: 8px 0 20px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }
}

.logo-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(255 255 255 / 20%);
  border-radius: 8px;
  font-size: 18px;
  color: #fff;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.search-wrapper {
  padding-bottom: 12px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;

  // background: #f3f4f6;
  // border-radius: 12px;
  // padding: 8px 12px;

  transition: all 0.2s ease;

  &:focus-within {
    background: #fff;
    box-shadow: 0 0 0 2px rgb(139 92 246 / 20%);
    border-color: #8b5cf6;
  }
}

.search-icon {
  font-size: 14px;
  color: #9ca3af;
  margin-right: 8px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #1f2937;

  &::placeholder {
    color: #9ca3af;
  }
}

.assistants-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;

    &:hover {
      background: #9ca3af;
    }
  }
}

.assistant-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  margin-bottom: 4px;

  &:hover {
    background: rgb(139 92 246 / 5%);
  }

  &.active {
    background: linear-gradient(135deg, rgb(139 92 246 / 10%) 0%, rgb(236 72 153 / 10%) 100%);
  }
}

.assistant-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: linear-gradient(135deg, #e9d5ff 0%, #fbcfe8 100%);
  color: #8b5cf6;
  flex-shrink: 0;
}

.assistant-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.assistant-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.assistant-description {
  font-size: 12px;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.active-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: linear-gradient(180deg, #8b5cf6 0%, #ec4899 100%);
  border-radius: 0 3px 3px 0;
}

.sidebar-footer {
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.divider {
  height: 1px;
  background: #e5e7eb;
  margin: 12px 0;
}

.sidebar-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgb(139 92 246 / 10%);
    color: #8b5cf6;
  }
}
</style>
