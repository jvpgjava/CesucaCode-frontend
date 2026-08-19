import { ApiError, request, streamEvents } from '@/api/client'
import type { Paginated } from '@/api/types/common'
import type { Conversation, Message } from '@/api/types/conversations'

export function listConversations() {
  return request<Paginated<Conversation>>('/api/conversations/')
}

export function createConversation() {
  return request<Conversation>('/api/conversations/', { method: 'POST', body: {} })
}

export function deleteConversation(id: number) {
  return request<void>(`/api/conversations/${id}/`, { method: 'DELETE' })
}

export function getMessages(id: number) {
  return request<Message[]>(`/api/conversations/${id}/messages/`)
}

export async function* sendMessage(conversationId: number, content: string) {
  for await (const { event, data } of streamEvents(
    `/api/conversations/${conversationId}/messages/send/`,
    { content },
  )) {
    if (event === 'error') {
      const parsed = JSON.parse(data) as { error: string }
      throw new ApiError(500, parsed, parsed.error)
    }
    if (event === 'done') {
      return
    }
    const parsed = JSON.parse(data) as { content: string }
    if (parsed.content) {
      yield parsed.content
    }
  }
}
