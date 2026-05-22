<script lang="tsx" setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMagicKeys, useActiveElement } from '@vueuse/core'
import { defaultMockModelName, modelMappingList, triggerModelTermination } from '@/components/MarkdownPreview/models'
import type { InputInst } from 'naive-ui'
import type { SelectBaseOption } from 'naive-ui/es/select/src/interface'
import { isGithubDeployed } from '@/config'
import { UAParser } from 'ua-parser-js'

const route = useRoute()
const router = useRouter()
const businessStore = useBusinessStore()

const modelListSelections = computed(() => {
  return modelMappingList.map<SelectBaseOption>((modelItem) => {
    let disabled = false
    if (isGithubDeployed && modelItem.modelName !== defaultMockModelName) {
      disabled = true
    }

    return {
      label: modelItem.label,
      value: modelItem.modelName,
      disabled
    }
  })
})

const loading = ref(true)

setTimeout(() => {
  loading.value = false
}, 700)

const stylizingLoading = ref(false)

const inputTextString = ref('')
const refInputTextString = ref<InputInst | null>()

const outputTextReader = ref<ReadableStreamDefaultReader | null>()

const refReaderMarkdownPreview = ref<any>()

const onFailedReader = () => {
  outputTextReader.value = null
  stylizingLoading.value = false
  if (refReaderMarkdownPreview.value) {
    refReaderMarkdownPreview.value.initializeEnd()
  }
  window.$ModalMessage.error('转换失败，请重试')
  setTimeout(() => {
    if (refInputTextString.value) {
      refInputTextString.value.focus()
    }
  })
  triggerModelTermination()
}
const onCompletedReader = () => {
  stylizingLoading.value = false
  setTimeout(() => {
    if (refInputTextString.value) {
      refInputTextString.value.focus()
    }
  })
  triggerModelTermination()
}

const handleCreateStylized = async () => {
  if (stylizingLoading.value) {
    refReaderMarkdownPreview.value.abortReader()
    onCompletedReader()
    return
  }

  if (refInputTextString.value && !inputTextString.value.trim()) {
    inputTextString.value = ''
    refInputTextString.value.focus()
    return
  }

  refReaderMarkdownPreview.value.resetStatus()
  refReaderMarkdownPreview.value.initializeStart()

  stylizingLoading.value = true
  const textContent = inputTextString.value
  inputTextString.value = ''
  const { error, reader } = await businessStore.createAssistantWriterStylized({
    text: textContent
  })

  if (error) {
    onFailedReader()
    return
  }

  if (reader) {
    outputTextReader.value = reader
  }
}

const keys = useMagicKeys()
const enterCommand = keys['Meta+Enter']
const enterCtrl = keys['Ctrl+Enter']

const activeElement = useActiveElement()
const notUsingInput = computed(() => activeElement.value?.tagName !== 'TEXTAREA')

const parser = new UAParser()
const isMacos = computed(() => {
  const os = parser.getOS()
  if (!os) return

  const osName = os.name ?? ''
  return osName
    .toLocaleLowerCase()
    .includes?.('macos')
})

const placeholder = computed(() => {
  if (stylizingLoading.value) {
    return `输入任意问题...`
  }
  return `输入任意问题, 按 ${ isMacos.value ? 'Command' : 'Ctrl' } + Enter 键快捷开始...`
})

watch(
  () => enterCommand.value,
  () => {
    if (!isMacos.value || notUsingInput.value) return
    if (stylizingLoading.value) return
    if (!enterCommand.value) {
      handleCreateStylized()
    }
  },
  {
    deep: true
  }
)

watch(
  () => enterCtrl.value,
  () => {
    if (isMacos.value || notUsingInput.value) return
    if (stylizingLoading.value) return
    if (!enterCtrl.value) {
      handleCreateStylized()
    }
  },
  {
    deep: true
  }
)

const handleResetState = () => {
  inputTextString.value = ''
  stylizingLoading.value = false
  nextTick(() => {
    refInputTextString.value?.focus()
  })
  refReaderMarkdownPreview.value?.abortReader()
  refReaderMarkdownPreview.value?.resetStatus()
}
handleResetState()

const PromptTag = defineComponent({
  props: {
    text: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const handleClick = () => {
      inputTextString.value = props.text
      nextTick(() => {
        refInputTextString.value?.focus()
      })
    }
    return {
      handleClick
    }
  },
  render() {
    return (
      <div
        class="prompt-tag"
        onClick={this.handleClick}
      >
        <n-ellipsis
          tooltip={{
            contentClass: 'wrapper-tooltip-scroller',
            keepAliveOnHover: true
          }}
        >
          {{
            tooltip: () => this.text,
            default: () => this.text
          }}
        </n-ellipsis>
      </div>
    )
  }
})

const promptTextList = ref([
  '打个招呼吧，并告诉我你的名字',
  '使用中文，回答以下两个问题，分段表示\n1、你是什么模型？\n2、请分别使用 Vue3 和 React 编写一个 Button 组件，要求在 Vue3 中使用 Setup Composition API 语法糖，在 React 中使用 TSX 语法'
])
</script>

<template>
  <LayoutCenterPanel :loading="loading">
    <div class="chat-container">
      <div class="chat-header">
        <div class="header-info">
          <div class="avatar-wrapper">
            <span class="i-hugeicons:ai-chat-02"></span>
          </div>
          <div class="header-text">
            <h2 class="header-title">随便聊聊</h2>
            <p class="header-subtitle">我是你的智能助手，可以回答你的任何问题</p>
          </div>
        </div>
        <div class="header-actions">
          <div class="model-select-wrapper">
            <n-select
              v-model:value="businessStore.systemModelName"
              class="model-select"
              placeholder="请选择模型"
              :disabled="stylizingLoading"
              :options="modelListSelections"
            />
          </div>
        </div>
      </div>

      <div class="chat-content">
        <MarkdownPreview
          ref="refReaderMarkdownPreview"
          v-model:reader="outputTextReader"
          :model="businessStore.currentModelItem?.modelName"
          :transform-stream-fn="businessStore.currentModelItem?.transformStreamValue"
          @failed="onFailedReader"
          @completed="onCompletedReader"
        />
      </div>

      <div class="chat-footer">
        <!-- <div class="quick-prompts">
          <n-space class="prompts-container">
            <PromptTag
              v-for="(textItem, idx) in promptTextList"
              :key="idx"
              :text="textItem"
            />
          </n-space>
        </div> -->
        <div class="input-wrapper">
          <n-input
            ref="refInputTextString"
            v-model:value="inputTextString"
            type="textarea"
            autofocus
            class="chat-input"
            :placeholder="placeholder"
            :disabled="stylizingLoading"
          />
          <div class="input-actions">

            <button
              class="send-btn"
              :class="{ 'sending': stylizingLoading }"
              @click.stop="handleCreateStylized()"
              :disabled="!inputTextString.trim() || stylizingLoading"
            >
              <span v-if="stylizingLoading" class="i-svg-spinners:pulse-2"></span>
              <span v-else class="i-hugeicons:send">发送</span>
            </button>

          </div>
        </div>
        <!-- <div class="footer-info">
          <span class="info-text">按 Enter 发送，Shift + Enter 换行</span>
        </div> -->
      </div>
    </div>
  </LayoutCenterPanel>
</template>

<style lang="scss" scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(180deg, rgba(139, 92, 246, 0.02) 0%, transparent 100%);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #e9d5ff 0%, #fbcfe8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #8b5cf6;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.header-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.model-select-wrapper {
  position: relative;
}

.model-select {
  min-width: 200px;
  padding: 6px 12px;
  border-radius: 10px;
  background: #f3f4f6;
  border: none;
  
  .n-select-trigger {
    border-radius: 10px;
    background: transparent;
    border: none;
  }
}

.help-btn,
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
    background: rgba(139, 92, 246, 0.1);
    color: #8b5cf6;
  }
}

.chat-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #faf5ff;
}

.quick-prompts {
  padding-bottom: 12px;
}

.prompts-container {
  flex-wrap: wrap;
}

.prompt-tag {
  padding: 6px 12px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  
  &:hover {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
    border-color: rgba(139, 92, 246, 0.3);
    color: #8b5cf6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
  }
}

.input-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 10px;
  // background: #ffffff;
  // border-radius: 20px;
  // border: 1px solid #e5e7eb;
  // padding: 10px;
  transition: all 0.2s ease;
  
  // &:focus-within {
  //   border-color: #8b5cf6;
  //   box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  // }
}

.chat-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 15px;
  color: #1f2937;
  resize: none;
  
  .n-input-wrapper {
    background: transparent;
    border: none;
    
    textarea {
      resize: none;
      padding: 0;
    }
  }
}

.input-actions {
  display: flex;
  justify-content: flex-end;
}

.action-btn-small {
  width: 64px;
  height: 32px;
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

.send-btn {
  width: 64px;
  height: 32px;
  border-radius: 3px;
  border: none;
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.sending {
    background: linear-gradient(135deg, #a78bfa 0%, #f472b6 100%);
    animation: pulse 1s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.footer-info {
  padding-top: 8px;
  text-align: center;
}

.info-text {
  font-size: 12px;
  color: #9ca3af;
}

.link-primary {
  color: #8b5cf6;
  font-weight: 600;
  text-decoration: underline;
  
  &:hover {
    color: #7c3aed;
  }
}

.wrapper-tooltip-scroller {
  max-width: 285px;
  max-height: 100px;
  overflow-y: auto;
  white-space: pre-wrap;
  
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.5);
  }
  
  &::-webkit-scrollbar-track {
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.15);
  }
}
</style>
