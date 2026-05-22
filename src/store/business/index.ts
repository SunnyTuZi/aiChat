import { defineStore } from 'pinia'

import * as TransformUtils from '@/components/MarkdownPreview/transform'

import { defaultModelName, modelMappingList } from '@/components/MarkdownPreview/models'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  aborted?: boolean
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
  pinned: boolean
}

export interface BusinessState {
  systemModelName: string
  sessions: ChatSession[]
  currentSessionId: string | null
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export const useBusinessStore = defineStore('business-store', {
  state: (): BusinessState => {
    return {
      systemModelName: defaultModelName,
      sessions: [],
      currentSessionId: null
    }
  },
  getters: {
    currentModelItem (state) {
      return modelMappingList.find(v => v.modelName === state.systemModelName)
    },
    currentSession (state): ChatSession | null {
      return state.sessions.find(s => s.id === state.currentSessionId) || null
    },
    currentMessages (state): ChatMessage[] {
      const session = state.sessions.find(s => s.id === state.currentSessionId)
      return session ? session.messages : []
    },
    sessionList (state): ChatSession[] {
      return [...state.sessions].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return b.updatedAt - a.updatedAt
      })
    }
  },
  actions: {
    createNewSession() {
      const newSession: ChatSession = {
        id: generateId(),
        title: '新对话',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pinned: false
      }
      this.sessions.push(newSession)
      this.currentSessionId = newSession.id
      this.saveToLocalStorage()
      return newSession
    },
    selectSession(sessionId: string) {
      this.currentSessionId = sessionId
    },
    deleteSession(sessionId: string) {
      const index = this.sessions.findIndex(s => s.id === sessionId)
      if (index > -1) {
        this.sessions.splice(index, 1)
        if (this.currentSessionId === sessionId) {
          this.currentSessionId = this.sessions.length > 0 ? this.sessions[0].id : null
        }
      }
      this.saveToLocalStorage()
    },
    renameSession(sessionId: string, newTitle: string) {
      const session = this.sessions.find(s => s.id === sessionId)
      if (session) {
        session.title = newTitle
        this.saveToLocalStorage()
      }
    },
    pinSession(sessionId: string) {
      const session = this.sessions.find(s => s.id === sessionId)
      if (session) {
        session.pinned = !session.pinned
        this.saveToLocalStorage()
      }
    },
    addUserMessage(content: string) {
      if (!this.currentSessionId) {
        this.createNewSession()
      }
      const session = this.sessions.find(s => s.id === this.currentSessionId)
      if (session) {
        const message: ChatMessage = {
          id: generateId(),
          role: 'user',
          content,
          timestamp: Date.now()
        }
        session.messages.push(message)
        session.updatedAt = Date.now()
        if (session.title === '新对话') {
          session.title = content.length > 20 ? content.substring(0, 20) + '...' : content
        }
        this.saveToLocalStorage()
      }
    },
    addAssistantMessage(content: string, aborted = false) {
      const session = this.sessions.find(s => s.id === this.currentSessionId)
      if (session) {
        const existingMessage = session.messages.find(m => m.role === 'assistant' && m.content === '')
        if (existingMessage) {
          existingMessage.content = content
          existingMessage.aborted = aborted
        } else {
          const message: ChatMessage = {
            id: generateId(),
            role: 'assistant',
            content,
            timestamp: Date.now(),
            aborted
          }
          session.messages.push(message)
        }
        session.updatedAt = Date.now()
        this.saveToLocalStorage()
      }
    },
    updateLastAssistantMessage(content: string) {
      const session = this.sessions.find(s => s.id === this.currentSessionId)
      if (session && session.messages.length > 0) {
        const lastMessage = session.messages[session.messages.length - 1]
        if (lastMessage.role === 'assistant') {
          lastMessage.content = content
        } else {
          const message: ChatMessage = {
            id: generateId(),
            role: 'assistant',
            content,
            timestamp: Date.now()
          }
          session.messages.push(message)
        }
        session.updatedAt = Date.now()
      }
    },
    ensureCurrentSession() {
      if (!this.currentSessionId || this.sessions.length === 0) {
        this.createNewSession()
      }
    },
    saveToLocalStorage() {
      try {
        localStorage.setItem('chat-sessions', JSON.stringify(this.sessions))
        localStorage.setItem('chat-current-session-id', this.currentSessionId || '')
      } catch (e) {
        console.error('Failed to save to localStorage:', e)
      }
    },
    loadFromLocalStorage() {
      try {
        const sessions = localStorage.getItem('chat-sessions')
        const currentSessionId = localStorage.getItem('chat-current-session-id')
        if (sessions) {
          const parsedSessions = JSON.parse(sessions)
          this.sessions = parsedSessions.map((session: ChatSession) => ({
            pinned: false,
            ...session
          }))
        }
        if (currentSessionId) {
          this.currentSessionId = currentSessionId
        }
        if (this.sessions.length === 0) {
          this.createNewSession()
        }
      } catch (e) {
        console.error('Failed to load from localStorage:', e)
      }
    },
    async createAssistantWriterStylized(data): Promise<{error: number
      reader: ReadableStreamDefaultReader<string> | null}> {

      return new Promise((resolve) => {
        if (!this.currentModelItem?.chatFetch) {
          return {
            error: 1,
            reader: null
          }
        }
        const messages = this.currentMessages.map(m => ({
          role: m.role,
          content: m.content
        }))
        this.currentModelItem.chatFetch(data.text, messages)
          .then((res) => {
            if (res.body) {
              const reader = res.body
                .pipeThrough(new TextDecoderStream())
                .pipeThrough(TransformUtils.splitStream('\n'))
                .getReader()

              resolve({
                error: 0,
                reader
              })
            } else {
              resolve({
                error: 1,
                reader: null
              })
            }
          })
          .catch((err) => {
            resolve({
              error: 1,
              reader: null
            })
          })
      })
    }
  }
})
