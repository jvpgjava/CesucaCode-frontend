import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Spinner } from '@/shared/ui/Spinner'
import { ChatInput } from './components/ChatInput'
import { ChatMessageList } from './components/ChatMessageList'
import { SuggestionChips } from './components/SuggestionChips'
import { useChat } from './hooks/useChat'
import { useCreateConversationMutation, useMessagesQuery } from './hooks/useConversations'

export function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const conversationId = id ? Number(id) : null

  return (
    <div className="flex h-full flex-col">
      {!conversationId ? (
        <ChatWelcome />
      ) : (
        <ChatConversation key={conversationId} conversationId={conversationId} />
      )}
    </div>
  )
}

function WelcomeHeader() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <img src="/sofia-icon.png" alt="S.O.F.I.A" className="h-16 w-16" />
      <h1 className="font-semibold text-neutral-900 text-xl">Olá! Eu sou a S.O.F.I.A</h1>
      <p className="max-w-md text-neutral-500 text-sm">
        Tire dúvidas sobre os materiais e as disciplinas do seu curso. Escolha uma sugestão ou
        escreva sua pergunta.
      </p>
    </div>
  )
}

function ChatWelcome() {
  const navigate = useNavigate()
  const createMutation = useCreateConversationMutation()

  const [error, setError] = useState<string | null>(null)

  const start = async (text: string) => {
    setError(null)
    try {
      const conversation = await createMutation.mutateAsync()
      navigate(`/chat/${conversation.id}`, { state: { initialMessage: text } })
    } catch {
      setError('Não foi possível iniciar a conversa. Tente novamente.')
    }
  }

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 overflow-y-auto p-6">
        <WelcomeHeader />
        <div className="max-w-2xl">
          <SuggestionChips onPick={start} disabled={createMutation.isPending} />
        </div>
      </div>
      {error && <p className="mx-auto w-full max-w-3xl px-6 pb-2 text-red-600 text-sm">{error}</p>}
      <ChatInput onSend={start} disabled={createMutation.isPending} />
    </>
  )
}

function ChatConversation({ conversationId }: { conversationId: number }) {
  const location = useLocation()
  const navigate = useNavigate()
  const initialMessage = (location.state as { initialMessage?: string } | null)?.initialMessage
  const sentInitial = useRef(false)

  const { data: initialMessages, isLoading: loadingMessages } = useMessagesQuery(conversationId)
  const { messages, streamingText, isStreaming, error, send, setMessages } = useChat(conversationId)

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages)
    }
  }, [initialMessages, setMessages])

  // Mensagem vinda de uma sugestão clicada na tela inicial: envia uma única vez
  // e limpa o state da rota pra não reenviar ao recarregar a página.
  useEffect(() => {
    if (!initialMessage || sentInitial.current || !initialMessages) return
    sentInitial.current = true
    navigate(location.pathname, { replace: true, state: null })
    send(initialMessage)
  }, [initialMessage, initialMessages, location.pathname, navigate, send])

  if (loadingMessages) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner size={28} />
      </div>
    )
  }

  const isEmpty = messages.length === 0 && !isStreaming && !initialMessage

  return (
    <>
      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 overflow-y-auto p-6">
          <WelcomeHeader />
          <div className="max-w-2xl">
            <SuggestionChips onPick={send} disabled={isStreaming} />
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ChatMessageList
            conversationId={conversationId}
            messages={messages}
            streamingText={streamingText}
            isStreaming={isStreaming}
          />
        </div>
      )}
      {error && <p className="mx-auto w-full max-w-3xl px-6 pb-2 text-red-600 text-sm">{error}</p>}
      <ChatInput onSend={send} disabled={isStreaming} />
    </>
  )
}
