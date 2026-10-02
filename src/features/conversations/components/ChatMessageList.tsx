import { Check, ChevronDown, ChevronRight } from 'lucide-react'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ChatStep, Message, MessageRole } from '@/api/types/conversations'
import { useAuth } from '@/features/auth/useAuth'
import { cn } from '@/shared/lib/cn'
import { AvatarCircle } from '@/shared/ui/AvatarCircle'
import { Spinner } from '@/shared/ui/Spinner'
import { MessageFeedback } from './MessageFeedback'
import { FollowUpChips } from './SuggestionChips'

export function ChatMessageList({
  conversationId,
  messages,
  streamingText,
  isStreaming,
  steps,
  suggestions,
  onRegenerate,
  onPickSuggestion,
}: {
  conversationId: number
  messages: Message[]
  streamingText: string
  isStreaming: boolean
  steps: ChatStep[]
  suggestions: string[]
  onRegenerate: () => void
  onPickSuggestion: (text: string) => void
}) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: rola até o fim a cada mensagem/pedaço/etapa nova
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText, steps, suggestions])

  // "Gerar novamente" e os follow-ups só fazem sentido na última resposta
  // (a última mensagem da conversa) e fora do stream.
  const lastIndex = messages.length - 1
  const endsWithAssistant = lastIndex >= 0 && messages[lastIndex].role === 'assistant'

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      {messages.map((message, index) => {
        const isLastAssistant = endsWithAssistant && index === lastIndex && !isStreaming
        return (
          <ChatBubble
            key={message.id}
            sender={message.role}
            content={message.content}
            footer={
              message.role === 'assistant' ? (
                <MessageFeedback
                  conversationId={conversationId}
                  message={message}
                  onRegenerate={isLastAssistant ? onRegenerate : undefined}
                />
              ) : undefined
            }
          />
        )
      })}
      {isStreaming && (
        <ChatBubble
          sender="assistant"
          content={streamingText}
          pending
          header={
            steps.length > 0 ? <StepsTimeline steps={steps} hasText={!!streamingText} /> : undefined
          }
        />
      )}
      {endsWithAssistant && !isStreaming && suggestions.length > 0 && (
        <div className="pl-11">
          <FollowUpChips items={suggestions} onPick={onPickSuggestion} />
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}

// Linha do tempo compacta das etapas da resposta. Enquanto o texto ainda não
// chegou fica aberta; depois que começa a ser escrito, recolhe num resumo que
// o usuário pode expandir. Só existe para a resposta em andamento.
function StepsTimeline({ steps, hasText }: { steps: ChatStep[]; hasText: boolean }) {
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null)
  const expanded = userExpanded ?? !hasText
  const doneCount = steps.filter((step) => step.status === 'done').length

  const summary =
    doneCount === 0
      ? 'Trabalhando na resposta'
      : `${doneCount} ${doneCount === 1 ? 'etapa concluída' : 'etapas concluídas'}`

  return (
    <div aria-live="polite" className={cn('text-neutral-500 text-xs', hasText && 'mb-2')}>
      {hasText && (
        <button
          type="button"
          onClick={() => setUserExpanded(!expanded)}
          aria-expanded={expanded}
          className="flex items-center gap-1 rounded text-neutral-500 hover:text-neutral-800"
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          {summary}
        </button>
      )}
      {expanded && (
        <ul className={cn('flex flex-col gap-1', hasText && 'mt-1.5 pl-1')}>
          {steps.map((step, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: a lista só cresce; etapas podem repetir o mesmo `step`
            <li key={`${index}-${step.step}`} className="flex items-center gap-2">
              {step.status === 'active' ? (
                <Spinner size={12} className="text-brand-navy" />
              ) : (
                <Check size={12} className="text-green-600" />
              )}
              <span className={cn(step.status === 'active' && 'text-neutral-800')}>
                {step.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ChatBubble({
  sender,
  content,
  pending,
  header,
  footer,
}: {
  sender: MessageRole
  content: string
  pending?: boolean
  header?: ReactNode
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
          {header}
          {!content && pending && !header && <span className="text-neutral-400">Pensando...</span>}
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
