import { type ReactNode, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message, MessageRole } from '@/api/types/conversations'
import { useAuth } from '@/features/auth/useAuth'
import { cn } from '@/shared/lib/cn'
import { AvatarCircle } from '@/shared/ui/AvatarCircle'
import { MessageFeedback } from './MessageFeedback'

export function ChatMessageList({
  conversationId,
  messages,
  streamingText,
  isStreaming,
}: {
  conversationId: number
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
        <ChatBubble
          key={message.id}
          sender={message.role}
          content={message.content}
          footer={
            message.role === 'assistant' ? (
              <MessageFeedback conversationId={conversationId} message={message} />
            ) : undefined
          }
        />
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
  footer,
}: {
  sender: MessageRole
  content: string
  pending?: boolean
  footer?: ReactNode
}) {
  const { user } = useAuth()
  const isUser = sender === 'user'
  const userInitial = (user?.nickname || user?.full_name || '?').charAt(0)
  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      {isUser ? (
        <AvatarCircle avatar={user?.avatar} initial={userInitial} className="h-8 w-8 text-xs" />
      ) : (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-neutral-200">
          <img src="/sofia-icon.png" alt="S.O.F.I.A" className="h-full w-full object-contain p-1" />
        </span>
      )}
      <div className="flex max-w-[80%] flex-col">
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm',
            isUser
              ? 'whitespace-pre-wrap bg-neutral-100 text-neutral-900'
              : 'bg-white text-neutral-900 shadow-sm',
          )}
        >
          {!content && pending && <span className="text-neutral-400">Pensando...</span>}
          {content && (isUser ? content : <MarkdownContent content={content} />)}
        </div>
        {footer}
      </div>
    </div>
  )
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="flex flex-col gap-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-brand-navy underline underline-offset-2 hover:text-brand-navy-dark"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-xs">{children}</code>
          ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-lg bg-neutral-900 p-3 text-neutral-100 text-xs">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-neutral-200 bg-neutral-50 px-2 py-1 font-medium">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="border border-neutral-200 px-2 py-1">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
