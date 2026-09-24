export interface Conversation {
  id: number
  title: string
  created_at: string
  updated_at: string
}

export type MessageRole = 'user' | 'assistant'

export interface Message {
  id: number
  role: MessageRole
  content: string
  feedback: 1 | -1 | null
  created_at: string
}
