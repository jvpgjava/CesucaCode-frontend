import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { ApiError } from '@/api/client'
import { sendMessage } from '@/api/endpoints/conversations'
import type { Message } from '@/api/types/conversations'

let tempIdCounter = -1

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const detail = (err.body as { detail?: string } | null)?.detail
    if (detail) return detail
    return err.message
  }
  return 'Não foi possível gerar a resposta.'
}

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
        {
          id: tempIdCounter--,
          role: 'user',
          content,
          feedback: null,
          created_at: new Date().toISOString(),
        },
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
            feedback: null,
            created_at: new Date().toISOString(),
          },
        ])
        queryClient.invalidateQueries({ queryKey: ['conversations', 'list'] })
        // Recarrega o histórico pra trocar os ids temporários pelos reais (o 👍/👎
        // precisa do id da mensagem no servidor).
        queryClient.invalidateQueries({
          queryKey: ['conversations', 'detail', conversationId, 'messages'],
        })
      } catch (err) {
        setError(errorMessage(err))
      } finally {
        setStreamingText('')
        setIsStreaming(false)
      }
    },
    [conversationId, queryClient],
  )

  return { messages, streamingText, isStreaming, error, send, setMessages }
}
