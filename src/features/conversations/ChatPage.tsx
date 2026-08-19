import { MessageSquarePlus } from 'lucide-react'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Spinner } from '@/shared/ui/Spinner'
import { ChatInput } from './components/ChatInput'
import { ChatMessageList } from './components/ChatMessageList'
import { useChat } from './hooks/useChat'
import { useMessagesQuery } from './hooks/useConversations'

export function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const conversationId = id ? Number(id) : null

  return (
    <div className="flex h-full flex-col">
      {!conversationId ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <MessageSquarePlus size={32} className="text-neutral-300" />
          <p className="text-neutral-500">
            Escolha uma conversa ou comece uma nova pela barra lateral.
          </p>
        </div>
      ) : (
        <ChatConversation key={conversationId} conversationId={conversationId} />
      )}
    </div>
  )
}

function ChatConversation({ conversationId }: { conversationId: number }) {
  const { data: initialMessages, isLoading: loadingMessages } = useMessagesQuery(conversationId)
  const { messages, streamingText, isStreaming, error, send, setMessages } = useChat(conversationId)

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages)
    }
  }, [initialMessages, setMessages])

  if (loadingMessages) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner size={28} />
      </div>
    )
  }

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ChatMessageList
          messages={messages}
          streamingText={streamingText}
          isStreaming={isStreaming}
        />
      </div>
      {error && <p className="mx-auto w-full max-w-3xl px-6 pb-2 text-red-600 text-sm">{error}</p>}
      <ChatInput onSend={send} disabled={isStreaming} />
    </>
  )
}
