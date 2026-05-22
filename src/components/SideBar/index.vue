<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useBusinessStore, type ChatSession } from '@/store/business'
import { storeToRefs } from 'pinia'
import { NInput, useDialog, useMessage } from 'naive-ui'

const businessStore = useBusinessStore()
const { sessionList, currentSessionId } = storeToRefs(businessStore)

const dialog = useDialog()
const message = useMessage()

const editingId = ref<string | null>(null)
const editingTitle = ref('')
const openDropdownId = ref<string | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.dropdown-wrapper')) {
    openDropdownId.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const toggleDropdown = (sessionId: string, event: Event) => {
  event.stopPropagation()
  openDropdownId.value = openDropdownId.value === sessionId ? null : sessionId
}

const handleNewChat = () => {
  businessStore.createNewSession()
}

const handleSelectSession = (session: ChatSession) => {
  if (editingId.value === session.id || openDropdownId.value === session.id)
    return
  businessStore.selectSession(session.id)
}

const handleDeleteSession = (sessionId: string) => {
  businessStore.deleteSession(sessionId)
}

const handleRenameSession = (sessionId: string, newTitle: string) => {
  if (newTitle.trim()) {
    businessStore.renameSession(sessionId, newTitle.trim())
  }
  editingId.value = null
  editingTitle.value = ''
}

const handlePinSession = (sessionId: string) => {
  businessStore.pinSession(sessionId)
  openDropdownId.value = null
}

const startEdit = (session: ChatSession) => {
  editingId.value = session.id
  editingTitle.value = session.title
  openDropdownId.value = null
}

const cancelEdit = () => {
  editingId.value = null
  editingTitle.value = ''
}

const confirmDelete = (session: ChatSession) => {
  dialog.create({
    title: '确认删除',
    content: '确定要删除这个对话吗？',
    positiveText: '删除',
    negativeText: '取消',
    positiveButtonProps: {
      type: 'primary'
    },
    negativeButtonProps: {
      type: 'default',
      ghost: false
    },
    onPositiveClick: () => {
      handleDeleteSession(session.id)
      message.success('已删除')
    }
  })
  openDropdownId.value = null
}
</script>

<template>
  <div class="sidebar-container">
    <div class="sidebar-header">
      <div class="logo-section" @click="handleNewChat">
        <div class="logo-icon">
          <span class="i-hugeicons:ai-brain-03"></span>
        </div>
        <span class="logo-text">民宗助手</span>
      </div>
    </div>

    <div class="new-chat-wrapper">
      <button class="new-chat-btn" @click="handleNewChat">
        <span class="i-hugeicons:add-01"></span>
        <span>新建对话</span>
      </button>
    </div>

    <div class="chat-list">
      <div
        v-for="session in sessionList"
        :key="session.id"
        class="chat-item"
        :class="{
          'active': session.id === currentSessionId,
          'pinned': session.pinned
        }"
        @click="handleSelectSession(session)"
      >
        <div v-if="session.pinned" class="pin-icon">
          <span class="i-hugeicons:pin-01"></span>
        </div>
        <div class="chat-icon">
          <span class="i-hugeicons:ai-voice"></span>
        </div>
        <div class="chat-info">
          <div v-if="editingId === session.id" class="edit-input-wrapper">
            <NInput
              v-model:value="editingTitle"
              class="edit-input"
              @keydown.enter="handleRenameSession(session.id, editingTitle)"
              @keydown.escape="cancelEdit"
              autofocus
            />
          </div>
          <div v-else class="chat-title" :title="session.title">{{ session.title }}</div>
          <div class="chat-time">
            {{ new Date(session.updatedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) }}
          </div>
        </div>

        <div class="dropdown-wrapper">
          <button
            class="more-btn"
            @click.stop="toggleDropdown(session.id, $event)"
          >
            <span class="i-hugeicons:more-vertical"></span>
          </button>

          <div
            v-if="openDropdownId === session.id"
            class="custom-dropdown"
            @click.stop
          >
            <button class="dropdown-item" @click="startEdit(session)">
              <span class="i-hugeicons:edit-01"></span>
              <span>重命名</span>
            </button>
            <button class="dropdown-item" @click="handlePinSession(session.id)">
              <span class="i-hugeicons:pin-01"></span>
              <span>{{ session.pinned ? '取消置顶' : '置顶' }}</span>
            </button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item danger" @click="confirmDelete(session)">
              <span class="i-hugeicons:trash-01"></span>
              <span>删除</span>
            </button>
          </div>
        </div>
      </div>
    </div>
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
  padding: 8px 0 12px;
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

.new-chat-wrapper {
  padding-bottom: 12px;
}

.new-chat-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 4px 10px;

  background: #fff;
  color: #8b5cf6;
  font-size: 14px;
  font-weight: 600;
  border: 1px dashed #d8b4fe;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #8b5cf6;
    background: rgb(139 92 246 / 5%);
  }
}

.chat-list {
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

.chat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  margin-bottom: 4px;

  &:hover {
    background: rgb(139 92 246 / 5%);

    .more-btn {
      opacity: 1;
    }
  }

  &.active {
    background: linear-gradient(135deg, rgb(139 92 246 / 10%) 0%, rgb(236 72 153 / 10%) 100%);
  }
}

.chat-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #6b7280;
  flex-shrink: 0;
}

.chat-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.chat-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-time {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}

.dropdown-wrapper {
  position: relative;
  flex-shrink: 0;
}

.more-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #9ca3af;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: #f3f4f6;
    color: #6b7280;
  }
}

.chat-item:hover .more-btn {
  opacity: 1;
}

.pin-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #8b5cf6;
  flex-shrink: 0;
}

.edit-input-wrapper {
  width: 100%;
}

.edit-input {
  width: 100%;

  .n-input-wrapper {
    border-radius: 4px;
    border: 1px solid #8b5cf6;
  }
}

.custom-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  z-index: 100;
  min-width: 140px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
  }

  &.danger {
    color: #ef4444;

    &:hover {
      background: #fee2e2;
    }
  }
}

.dropdown-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 4px 0;
}
</style>
