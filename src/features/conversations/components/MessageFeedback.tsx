import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { setMessageFeedback } from '@/api/endpoints/conversations'
import type { Message } from '@/api/types/conversations'
import { cn } from '@/shared/lib/cn'
import { useToast } from '@/shared/ui/Toast'

type Rating = 1 | -1 | null

export function MessageFeedback({
  conversationId,
  message,
}: {
  conversationId: number
  message: Message
}) {
  const toast = useToast()
  const [rating, setRating] = useState<Rating>(message.feedback)

  // Mensagem ainda com id temporário (acabou de chegar): o servidor ainda não
  // devolveu o id real, então não dá pra avaliar.
  const disabled = message.id < 0

  const choose = async (next: 1 | -1) => {
    const value: Rating = rating === next ? null : next
    const previous = rating
    setRating(value)
    try {
      await setMessageFeedback(conversationId, message.id, value)
    } catch {
      setRating(previous)
      toast.error('Não foi possível registrar sua avaliação.')
    }
  }

  const button = (value: 1 | -1, label: string, Icon: typeof ThumbsUp) => (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={rating === value}
      disabled={disabled}
      onClick={() => choose(value)}
      className={cn(
        'rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-40',
        rating === value && 'text-brand-navy',
      )}
    >
      <Icon size={14} className={cn(rating === value && 'fill-current')} />
    </button>
  )

  return (
    <div className="mt-1 flex gap-0.5">
      {button(1, 'Resposta útil', ThumbsUp)}
      {button(-1, 'Resposta não ajudou', ThumbsDown)}
    </div>
  )
}
