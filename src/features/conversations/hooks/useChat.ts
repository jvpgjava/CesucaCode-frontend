import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { ApiError } from '@/api/client'
import { sendMessage } from '@/api/endpoints/conversations'
import type { Message } from '@/api/types/conversations'

let tempIdCounter = -1

// O componente que chama esse hook é remontado (via `key`) a cada troca de
// conversa, então o estado abaixo já nasce limpo — não precisa de reset manual.
export function useChat(conversationId: number | null) {
  const queryClient = useQueryClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = useCallback(
    async (content: string) => {
      if (!conversationId) return
      setError(null)
      setMessages((prev) => [
        ...prev,
        { id: tempIdCounter--, role: 'user', content, created_at: new Date().toISOString() },
      ])
      setIsStreaming(true)
      setStreamingText('')

      let full = ''
      try {
        for await (const piece of sendMessage(conversationId, content)) {
          full += piece
          setStreamingText(full)
        }
        setMessages((prev) => [
          ...prev,
          {
            id: tempIdCounter--,
            role: 'assistant',
            content: full,
            created_at: new Date().toISOString(),
          },
        ])
        queryClient.invalidateQueries({ queryKey: ['conversations', 'list'] })
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Não foi possível gerar a resposta.')
      } finally {
        setStreamingText('')
        setIsStreaming(false)
      }
    },
    [conversationId, queryClient],
  )

  return { messages, streamingText, isStreaming, error, send, setMessages }
}
