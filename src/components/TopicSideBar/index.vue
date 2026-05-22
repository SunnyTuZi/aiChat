<script lang="tsx" setup>
import { ref } from 'vue'

interface Topic {
  id: string
  title: string
  icon: string
  count?: number
}

interface Message {
  id: string
  content: string
  timestamp: string
  isUser: boolean
}

const props = withDefaults(
  defineProps<{
    topics?: Topic[]
    messages?: Message[]
  }>(),
  {
    topics: () => [
      {
        id: '1',
        title: '常见问题',
        icon: 'i-hugeicons:help-circle',
        count: 5
      },
      {
        id: '2',
        title: '产品更新',
        icon: 'i-hugeicons:update',
        count: 3
      },
      {
        id: '3',
        title: '使用教程',
        icon: 'i-hugeicons:book-open',
        count: 8
      },
      {
        id: '4',
        title: 'API文档',
        icon: 'i-hugeicons:file-code',
        count: 12
      },
      {
        id: '5',
        title: '技术博客',
        icon: 'i-hugeicons:blog',
        count: 15
      }
    ],
    messages: () => [
      {
        id: '1',
        content: '您好，我是你的智能助手，可以问我任何问题',
        timestamp: '刚刚',
        isUser: false
      },
      {
        id: '2',
        content: '如何开始使用这个应用？',
        timestamp: '5分钟前',
        isUser: true
      },
      {
        id: '3',
        content: '您可以在左侧选择一个助手开始对话，或者直接输入问题',
        timestamp: '5分钟前',
        isUser: false
      }
    ]
  }
)

const activeTopicId = ref('1')
const hoveredTopicId = ref<string | null>(null)

const handleTopicSelect = (topicId: string) => {
  activeTopicId.value = topicId
}
</script>

<template>
  <div class="topic-sidebar-container">
    <div class="topic-sidebar-header">
      <h3 class="section-title">话题列表</h3>
      <button class="collapse-btn">
        <span class="i-hugeicons:chevron-left"></span>
      </button>
    </div>

    <div class="topics-section">
      <div
        v-for="topic in props.topics"
        :key="topic.id"
        class="topic-item"
        :class="{
          'active': topic.id === activeTopicId,
          'hovered': hoveredTopicId === topic.id
        }"
        @click="handleTopicSelect(topic.id)"
        @mouseenter="hoveredTopicId = topic.id"
        @mouseleave="hoveredTopicId = null"
      >
        <span
          :class="topic.icon"
          class="topic-icon"
        ></span>
        <span class="topic-title">{{ topic.title }}</span>
        <span
          v-if="topic.count"
          class="topic-count"
        >{{ topic.count }}</span>
      </div>
    </div>

    <div class="divider"></div>

    <div class="history-section">
      <h4 class="section-subtitle">最近消息</h4>
      <div class="history-list">
        <div
          v-for="message in props.messages"
          :key="message.id"
          class="message-item"
          :class="{ 'is-user': message.isUser }"
        >
          <div class="message-avatar">
            <span
              v-if="message.isUser"
              class="i-hugeicons:user"
            ></span>
            <span
              v-else
              class="i-hugeicons:ai-chat-02"
            ></span>
          </div>
          <div class="message-content">
            <p class="message-text">{{ message.content }}</p>
            <span class="message-time">{{ message.timestamp }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="sidebar-footer">
      <div class="stats">
        <div class="stat-item">
          <span class="stat-value">42</span>
          <span class="stat-label">对话次数</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">1.2h</span>
          <span class="stat-label">使用时长</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.topic-sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 280px;
  background: #fff;
  border-left: 1px solid #e5e7eb;
  padding: 16px;
}

.topic-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.collapse-btn {
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
    background: rgb(139 92 246 / 10%);
    color: #8b5cf6;
  }
}

.topics-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.topic-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgb(139 92 246 / 5%);
  }

  &.active {
    background: linear-gradient(135deg, rgb(139 92 246 / 10%) 0%, rgb(236 72 153 / 10%) 100%);
  }
}

.topic-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #6b7280;
  border-radius: 8px;
  background: #f3f4f6;

  .topic-item.active & {
    background: linear-gradient(135deg, #e9d5ff 0%, #fbcfe8 100%);
    color: #8b5cf6;
  }
}

.topic-title {
  flex: 1;
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.topic-count {
  font-size: 11px;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 10px;

  .topic-item.active & {
    background: rgb(139 92 246 / 10%);
    color: #8b5cf6;
  }
}

.divider {
  height: 1px;
  background: #e5e7eb;
  margin: 16px 0;
}

.history-section {
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

.section-subtitle {
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
  gap: 8px;

  &.is-user {
    flex-direction: row-reverse;

    .message-content {
      text-align: right;
      background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);

      .message-text {
        color: #fff;
      }

      .message-time {
        color: rgb(255 255 255 / 70%);
      }
    }

    .message-avatar {
      background: #f3f4f6;
      color: #6b7280;
    }
  }
}

.message-avatar {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  background: linear-gradient(135deg, #e9d5ff 0%, #fbcfe8 100%);
  color: #8b5cf6;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  max-width: 80%;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 8px 12px;
}

.message-text {
  font-size: 12px;
  color: #374151;
  margin: 0 0 4px;
  line-height: 1.4;
  word-break: break-word;
}

.message-time {
  font-size: 10px;
  color: #9ca3af;
}

.sidebar-footer {
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #8b5cf6;
}

.stat-label {
  font-size: 11px;
  color: #9ca3af;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: #e5e7eb;
}
</style>
