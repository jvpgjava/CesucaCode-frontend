import { request, streamEvents } from '@/api/client'
import type { Paginated } from '@/api/types/common'
import type {
  ChatStreamEvent,
  Conversation,
  FeedbackReason,
  Message,
} from '@/api/types/conversations'

export function listConversations() {
  return request<Paginated<Conversation>>('/api/conversations/')
}

export function createConversation() {
  return request<Conversation>('/api/conversations/', { method: 'POST', body: {} })
}

export function deleteConversation(id: number) {
  return request<void>(`/api/conversations/${id}/`, { method: 'DELETE' })
}

export function renameConversation(id: number, title: string) {
  return request<Conversation>(`/api/conversations/${id}/`, {
    method: 'PATCH',
    body: { title },
  })
}

export function getMessages(id: number) {
  return request<Message[]>(`/api/conversations/${id}/messages/`)
}

export function getSuggestions() {
  return request<{ suggestions: string[] }>('/api/conversations/suggestions/')
}

export function setMessageFeedback(
  conversationId: number,
  messageId: number,
  feedback: 1 | -1 | null,
  details?: { reason?: FeedbackReason; comment?: string },
) {
  return request<Message>(`/api/conversations/${conversationId}/messages/${messageId}/feedback/`, {
    method: 'PATCH',
    body: { feedback, ...details },
  })
}

function parseJson(data: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(data)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null
  } catch {
    return null
  }
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' ? value : null
}

// Converte o SSE do backend em eventos tipados. Eventos desconhecidos são
// ignorados (compatibilidade com versões futuras do protocolo); "token" é o
// evento padrão, sem `event:` explícito.
export async function* sendMessage(
  conversationId: number,
  content: string,
  options: { signal?: AbortSignal; regenerate?: boolean } = {},
): AsyncGenerator<ChatStreamEvent> {
  const body: { content: string; regenerate?: boolean } = { content }
  if (options.regenerate) body.regenerate = true

  for await (const { event, data } of streamEvents(
    `/api/conversations/${conversationId}/messages/send/`,
    body,
    options.signal,
  )) {
    const payload = parseJson(data)
    if (!payload) continue

    switch (event) {
      case 'message': {
        const token = asString(payload.content)
        if (token) yield { type: 'token', content: token }
        break
      }
      case 'meta':
        yield {
          type: 'meta',
          userMessageId: asNumber(payload.user_message_id),
          route: asString(payload.route),
        }
        break
      case 'status': {
        const step = asString(payload.step)
        const label = asString(payload.label)
        if (step && label) yield { type: 'status', step, label }
        break
      }
      case 'suggestions': {
        const items = Array.isArray(payload.items)
          ? payload.items.filter((item): item is string => typeof item === 'string')
          : []
        yield { type: 'suggestions', items }
        break
      }
      case 'done':
        yield { type: 'done', messageId: asNumber(payload.message_id) }
        return
      case 'error':
        yield {
          type: 'error',
          message:
            asString(payload.message) ??
            asString(payload.error) ??
            'Não foi possível gerar a resposta.',
        }
        return
    }
  }
}
