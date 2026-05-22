<script lang="tsx" setup>
import { renderMarkdownText, renderMermaidProcess } from './plugins/markdown'

import type { CrossTransformFunction, TransformFunction } from './models'
import { defaultMockModelName } from './models'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
}

interface Props {
  reader?: ReadableStreamDefaultReader<Uint8Array> | null | undefined
  model: string | null| undefined
  transformStreamFn: TransformFunction | null | undefined
  messages: ChatMessage[]
  streamingContent?: string
}

const props = withDefaults(
  defineProps<Props>(),
  {
    reader: null,
    messages: () => [],
    streamingContent: ''
  }
)

const fullContent = ref('')
const readerLoading = ref(false)
const isAbort = ref(false)
const isCompleted = ref(false)

const emit = defineEmits([
  'failed',
  'completed',
  'update:reader',
  'streaming-update'
])

const refWrapperContent = ref<HTMLElement>()

const waitingForQueue = ref(false)

const WaitTextRender = defineComponent({
  render() {
    return (
      <n-empty
        size="large"
        class="font-bold [&_.n-empty\_\_icon]:flex [&_.n-empty\_\_icon]:justify-center"
      >
        {{
          default: () => (
            <div
              whitespace-break-spaces
              text-center
            >请求排队处理中，请耐心等待...</div>
          ),
          icon: () => (
            <n-icon class="text-30">
              <div class="i-svg-spinners:clock"></div>
            </n-icon>
          )
        }}
      </n-empty>
    )
  }
})

const abortReader = () => {
  if (props.reader) {
    props.reader.cancel()
  }

  isAbort.value = true
  readIsOver.value = false
  emit('update:reader', null)
  initializeEnd()
  isCompleted.value = true
}

const resetStatus = () => {
  isAbort.value = false
  isCompleted.value = false
  readIsOver.value = false

  emit('update:reader', null)

  initializeEnd()
  fullContent.value = ''
  readerLoading.value = false
}

const initialized = ref(false)

const initializeStart = () => {
  initialized.value = true
}

const initializeEnd = () => {
  initialized.value = false
}

const readIsOver = ref(false)
const readTextStream = async () => {
  if (!props.reader) return

  const textDecoder = new TextDecoder('utf-8')
  readerLoading.value = true
  fullContent.value = ''

  while (true) {
    if (isAbort.value) {
      break
    }
    try {
      if (!props.reader) {
        readIsOver.value = true
        break
      }
      const { value, done } = await props.reader.read()
      if (!props.reader) {
        readIsOver.value = true
        break
      }
      if (done) {
        readIsOver.value = true
        break
      }

      const transformer = props.transformStreamFn as CrossTransformFunction
      if (!transformer) {
        break
      }

      const stream = transformer(value, textDecoder)
      if (stream.done) {
        readIsOver.value = true
        break
      }

      if (stream.isWaitQueuing) {
        waitingForQueue.value = stream.isWaitQueuing
      }
      if (stream.content) {
        waitingForQueue.value = false
        fullContent.value += stream.content
        emit('streaming-update', fullContent.value)
      }

      nextTick(() => {
        scrollToBottomIfAtBottom()
      })
    } catch (error) {
      readIsOver.value = true
      emit('failed', error)
      resetStatus()
      break
    } finally {
      initializeEnd()
    }
  }

  window.$ModalNotification.success({
    title: '生成完毕',
    duration: 1500
  })
  emit('update:reader', null)
  emit('completed')
  readerLoading.value = false
  isCompleted.value = true
  nextTick(() => {
    readIsOver.value = false
  })
}

const scrollToBottom = async () => {
  await nextTick()
  if (!refWrapperContent.value) return

  refWrapperContent.value.scrollTop = refWrapperContent.value.scrollHeight
}
const scrollToBottomByThreshold = async () => {
  if (!refWrapperContent.value) return

  const threshold = 100
  const distanceToBottom = refWrapperContent.value.scrollHeight - refWrapperContent.value.scrollTop - refWrapperContent.value.clientHeight
  if (distanceToBottom <= threshold) {
    scrollToBottom()
  }
}

const scrollToBottomIfAtBottom = async () => {
  scrollToBottomByThreshold()
}

watch(
  () => props.reader,
  () => {
    if (props.reader) {
      fullContent.value = ''
      readTextStream()
    }
  },
  {
    immediate: true,
    deep: true
  }
)

watch(
  () => props.messages,
  () => {
    nextTick(() => {
      scrollToBottom()
    })
  },
  { deep: true }
)

watch(
  () => props.streamingContent,
  () => {
    nextTick(() => {
      scrollToBottomIfAtBottom()
    })
  }
)

onUnmounted(() => {
  resetStatus()
})

defineExpose({
  abortReader,
  resetStatus,
  initializeStart,
  initializeEnd
})

const showLoading = computed(() => {
  if (initialized.value) {
    return true
  }

  if (!props.reader) {
    return false
  }

  if (!readerLoading) {
    return false
  }
  if (fullContent.value) {
    return false
  }

  return false
})

const emptyPlaceholder = computed(() => {
  return defaultMockModelName === props.model
    ? '你想问点什么呢？' : '你想问点什么呢？'
})

const renderMessageContent = (content: string) => {
  return renderMarkdownText(content)
}
</script>

<template>
  <div
    ref="refWrapperContent"
    text-16
    class="w-full h-full overflow-y-auto message-list-container"
    p-24px
  >
    <n-empty
      v-if="messages.length === 0 && !reader"
      size="large"
      class="font-bold empty-state"
    >
      <div
        whitespace-break-spaces
        text-center
        v-html="emptyPlaceholder"
      ></div>
      <template #icon>
        <n-icon>
          <div class="i-hugeicons:ai-chat-02"></div>
        </n-icon>
      </template>
    </n-empty>

    <div
      v-for="message in messages"
      :key="message.id"
      class="message-wrapper"
      :class="message.role"
    >
      <div class="message-avatar">
        <span v-if="message.role === 'user'" class="i-hugeicons:user-03"></span>
        <span v-else class="i-hugeicons:ai-chat-02"></span>
      </div>
      <div class="message-content">
        <div class="message-role">
          {{ message.role === 'user' ? '你' : '助手' }}
        </div>
        <div
          class="markdown-wrapper"
          v-html="renderMessageContent(message.content)"
        ></div>
      </div>
    </div>

    <div
      v-if="reader && streamingContent"
      class="message-wrapper assistant streaming"
    >
      <div class="message-avatar">
        <span class="i-hugeicons:ai-chat-02"></span>
      </div>
      <div class="message-content">
        <div class="message-role">助手</div>
        <div
          class="markdown-wrapper"
          v-html="renderMessageContent(streamingContent)"
        ></div>
      </div>
    </div>

    <div
      v-if="showLoading"
      class="message-wrapper assistant loading"
    >
      <div class="message-avatar">
        <span class="i-hugeicons:ai-chat-02"></span>
      </div>
      <div class="message-content">
        <div class="message-role">助手</div>
        <div class="loading-indicator">
          <div class="i-svg-spinners:3-dots-rotate"></div>
          <span>正在思考...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use "@/styles/naive-variables.scss" as *;

.message-list-container {
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

.empty-state {
  padding-top: 60px;
}

.message-wrapper {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  max-width: 100%;

  &.user {
    flex-direction: row-reverse;

    .message-content {
      align-items: flex-end;
    }
  }

  &.assistant {
    .message-avatar {
      background: linear-gradient(135deg, #e9d5ff 0%, #fbcfe8 100%);
      color: #8b5cf6;
    }
  }
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #3b82f6;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-role {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  color: #6b7280;
  font-size: 14px;
}

.markdown-wrapper {

  h1 {
    font-size: 2em;
  }

  h2 {
    font-size: 1.5em;
  }

  h3 {
    font-size: 1.25em;
  }

  h4 {
    font-size: 1em;
  }

  h5 {
    font-size: 0.875em;
  }

  h6 {
    font-size: 0.85em;
  }

  h1,h2,h3,h4,h5,h6 {
    margin: 0 auto;
    line-height: 1.25;
  }

  & ul,ol {
    padding-left: 1.5em;
    line-height: 0.8;
  }

  & ul,li,ol {
    list-style-position: outside;
    white-space: normal;
  }

  li {
    line-height: 1.7;

    & > code {
      --at-apply: 'bg-#e5e5e5';
      --at-apply: whitespace-pre m-2px px-6px py-2px rounded-5px;
    }
  }

  ol ol {
    padding-left: 20px;
  }

  ul ul {
    padding-left: 20px;
  }

  hr {
    margin: 16px 0;
  }

  a {
    color: $color-default;
    font-weight: bolder;
    text-decoration: underline;
    padding: 0 3px;
  }

  p {
    line-height: 1.8;
    white-space: pre-wrap;

    & > code {
      --at-apply: 'bg-#e5e5e5';
      --at-apply: whitespace-pre mx-4px px-6px py-3px rounded-5px;
    }


    img {
      display: inline-block;
    }
  }

  li > p {
    line-height: 2
  }

  blockquote {
    padding: 10px;
    margin: 20px 0;
    border-left: 5px solid #ccc;
    background-color: #f9f9f9;
    color: #555;

    & > p {
      margin: 0;
    }
  }

  .katex {
    --at-apply: c-primary;
  }

  kbd {
    --at-apply: inline-block align-middle p-0.1em p-0.3em;
    --at-apply: bg-#fcfcfc text-#555;
    --at-apply: border border-solid border-#ccc border-b-#bbb;
    --at-apply: rounded-0.2em shadow-[inset_0_-1px_0_#bbb] text-0.9em;
  }

  table {
    --at-apply: w-fit border-collapse my-16;
  }

  th, td {
    --at-apply: p-7 text-left border border-solid border-#ccc;
  }

  th {
    --at-apply: bg-#f2f2f2 font-bold;
  }

  tr:nth-child(even) {
    --at-apply: bg-#f9f9f9;
  }

  tr:hover {
    --at-apply: bg-#f1f1f1;
  }

  .think-wrapper {
    --at-apply: pl-13 text-14 c-#8b8b8b;
    --at-apply: b-l-2 b-l-solid b-#e5e5e5;

    p {
      --at-apply: line-height-26;
    }
  }
}
</style>
