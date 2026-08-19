import { Bot, User } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { Message, MessageRole } from '@/api/types/conversations'
import { cn } from '@/shared/lib/cn'

export function ChatMessageList({
  messages,
  streamingText,
  isStreaming,
}: {
  messages: Message[]
  streamingText: string
  isStreaming: boolean
}) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: rola até o fim a cada mensagem/pedaço novo
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      {messages.map((message) => (
        <ChatBubble key={message.id} sender={message.role} content={message.content} />
      ))}
      {isStreaming && <ChatBubble sender="assistant" content={streamingText} pending />}
      <div ref={bottomRef} />
    </div>
  )
}

function ChatBubble({
  sender,
  content,
  pending,
}: {
  sender: MessageRole
  content: string
  pending?: boolean
}) {
  const isUser = sender === 'user'
  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-neutral-200 text-neutral-700' : 'bg-brand-navy text-white',
        )}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div
        className={cn(
          'max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm',
          isUser ? 'bg-neutral-100 text-neutral-900' : 'bg-white text-neutral-900 shadow-sm',
        )}
      >
        {content || (pending && <span className="text-neutral-400">Pensando...</span>)}
      </div>
    </div>
  )
}
