import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '@/api/client'
import { sendMessage } from '@/api/endpoints/conversations'
import type { ChatStep, Message } from '@/api/types/conversations'

let tempIdCounter = -1

// Dá tempo do backend gravar o texto parcial (ele só salva no `finally` do
// stream, depois de notar a desconexão) antes de recarregar o histórico.
const STOP_REFETCH_DELAY_MS = 1000

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const detail = (err.body as { detail?: string } | null)?.detail
    if (detail) return detail
    return err.message
  }
  return 'Não foi possível gerar a resposta.'
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError'
}

function markAllDone(steps: ChatStep[]): ChatStep[] {
  return steps.some((step) => step.status === 'active')
    ? steps.map((step) => ({ ...step, status: 'done' }))
    : steps
}

interface LastRequest {
  content: string
  // true quando o servidor já gravou a mensagem do usuário (evento `meta`).
  // Se a falha foi antes disso, "tentar novamente" é um envio comum — um
  // `regenerate` apagaria o par anterior da conversa.
  persisted: boolean
}

// O componente que chama esse hook é remontado (via `key`) a cada troca de
// conversa, então o estado abaixo já nasce limpo — não precisa de reset manual.
export function useChat(conversationId: number | null) {
  const queryClient = useQueryClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [steps, setSteps] = useState<ChatStep[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])

  const abortRef = useRef<AbortController | null>(null)
  const streamingRef = useRef(false)
  const lastRequestRef = useRef<LastRequest | null>(null)
  const mountedRef = useRef(true)

  // Aborta o stream ao desmontar. O abort é adiado um tick para não matar o
  // envio no ciclo montar/desmontar/montar do StrictMode em desenvolvimento.
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      setTimeout(() => {
        if (!mountedRef.current) abortRef.current?.abort()
      }, 0)
    }
  }, [])

  const syncQueries = useCallback(() => {
    if (!conversationId) return
    queryClient.invalidateQueries({ queryKey: ['conversations', 'list'] })
    // Recarrega o histórico pra alinhar com o que o servidor gravou.
    queryClient.invalidateQueries({
      queryKey: ['conversations', 'detail', conversationId, 'messages'],
    })
  }, [conversationId, queryClient])

  const run = useCallback(
    async (content: string, regenerate: boolean) => {
      if (!conversationId || streamingRef.current) return

      const controller = new AbortController()
      abortRef.current = controller
      streamingRef.current = true
      lastRequestRef.current = { content, persisted: false }

      const tempUserId = tempIdCounter--
      setError(null)
      setSuggestions([])
      setSteps([])
      setMessages((prev) => [
        ...prev,
        {
          id: tempUserId,
          role: 'user',
          content,
          feedback: null,
          created_at: new Date().toISOString(),
        },
      ])
      setIsStreaming(true)
      setStreamingText('')

      let full = ''
      let assistantId: number | null = null
      let failure: string | null = null
      let completed = false

      try {
        for await (const event of sendMessage(conversationId, content, {
          signal: controller.signal,
          regenerate,
        })) {
          switch (event.type) {
            case 'meta': {
              if (lastRequestRef.current) lastRequestRef.current.persisted = true
              const realId = event.userMessageId
              if (realId !== null) {
                setMessages((prev) =>
                  prev.map((message) =>
                    message.id === tempUserId ? { ...message, id: realId } : message,
                  ),
                )
              }
              break
            }
            case 'status':
              // A etapa anterior termina quando a próxima começa.
              setSteps((prev) => [
                ...prev.map((step): ChatStep => ({ ...step, status: 'done' })),
                { step: event.step, label: event.label, status: 'active' },
              ])
              break
            case 'token':
              if (!full) setSteps(markAllDone)
              full += event.content
              setStreamingText(full)
              break
            case 'suggestions':
              setSuggestions(event.items)
              break
            case 'done':
              assistantId = event.messageId
              completed = true
              break
            case 'error':
              failure = event.message
              break
          }
        }
      } catch (err) {
        if (!isAbortError(err)) failure = errorMessage(err)
      }

      const aborted = controller.signal.aborted
      streamingRef.current = false
      if (abortRef.current === controller) abortRef.current = null
      // Desmontado: nada mais a atualizar (o servidor salva o parcial sozinho).
      if (!mountedRef.current && aborted) return

      // Preserva o que chegou — resposta completa, texto parcial após parar ou
      // após um erro no meio do stream.
      if (full) {
        const id = assistantId ?? tempIdCounter--
        setMessages((prev) => [
          ...prev,
          {
            id,
            role: 'assistant',
            content: full,
            feedback: null,
            created_at: new Date().toISOString(),
          },
        ])
      }
      setSteps(markAllDone)
      setStreamingText('')
      setIsStreaming(false)

      if (failure !== null && !aborted) {
        setError(failure)
        queryClient.invalidateQueries({ queryKey: ['conversations', 'list'] })
      } else if (aborted) {
        setSuggestions([])
        setTimeout(syncQueries, STOP_REFETCH_DELAY_MS)
      } else if (completed) {
        syncQueries()
      } else {
        // Stream encerrou sem `done` nem erro: conexão caiu no meio.
        setError('A conexão foi interrompida antes do fim da resposta.')
      }
    },
    [conversationId, queryClient, syncQueries],
  )

  const send = useCallback((content: string) => run(content, false), [run])

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  // Reenvia o último texto do usuário pedindo ao backend que descarte o último
  // par pergunta/resposta; na UI o par é removido da mesma forma.
  const regenerate = useCallback(async () => {
    if (streamingRef.current) return
    const lastUserIndex = messages.findLastIndex((message) => message.role === 'user')
    if (lastUserIndex === -1) return
    const content = messages[lastUserIndex].content
    setMessages(messages.slice(0, lastUserIndex))
    await run(content, true)
  }, [messages, run])

  // Botão "Tentar novamente" depois de um erro.
  const retry = useCallback(async () => {
    const last = lastRequestRef.current
    if (!last || streamingRef.current) return
    if (last.persisted) {
      await regenerate()
      return
    }
    // Falhou antes de o servidor gravar a pergunta: remove só a mensagem
    // otimista e envia de novo normalmente.
    const lastUserIndex = messages.findLastIndex((message) => message.role === 'user')
    setMessages(lastUserIndex === -1 ? messages : messages.slice(0, lastUserIndex))
    await run(last.content, false)
  }, [messages, regenerate, run])

  return {
    messages,
    streamingText,
    isStreaming,
    error,
    steps,
    suggestions,
    send,
    stop,
    regenerate,
    retry,
    setMessages,
  }
}
