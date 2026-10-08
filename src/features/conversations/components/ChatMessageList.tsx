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
          header={streamingText ? undefined : <StepProgress steps={steps} />}
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

// Progresso da resposta em andamento: uma única linha com a etapa ATUAL (e
// shimmer no texto). O chevron expande a lista completa de etapas sob demanda;
// nunca abre sozinho. Só é exibido antes do primeiro token: assim que o texto
// chega, o cabeçalho some por completo.
function StepProgress({ steps }: { steps: ChatStep[] }) {
  const [expanded, setExpanded] = useState(false)
  const current = steps.length > 0 ? steps[steps.length - 1].label : 'Pensando…'

  return (
    <div className="text-neutral-500 text-sm">
      <div className="flex items-center gap-2">
        <Spinner size={14} className="shrink-0 text-brand-navy" />
        <span aria-live="polite" className="min-w-0 flex-1">
          <span key={current} className="inline-block animate-step-fade-in text-shimmer">
            {current}
          </span>
        </span>
        {steps.length > 1 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label={expanded ? 'Ocultar etapas' : 'Ver etapas'}
            title={expanded ? 'Ocultar etapas' : 'Ver etapas'}
            className="rounded p-0.5 text-neutral-400 hover:text-neutral-700"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
      </div>
      {expanded && (
        <ul className="mt-2 flex flex-col gap-1 pl-0.5 text-xs">
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
  header,
  footer,
}: {
  sender: MessageRole
  content: string
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
          // O react-markdown renderiza bloco de código como <pre><code>; sem o reset,
          // o estilo do código inline (fundo claro) cobre o texto claro do bloco.
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-lg bg-neutral-900 p-3 text-neutral-100 text-xs [&_code]:rounded-none [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit">
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
