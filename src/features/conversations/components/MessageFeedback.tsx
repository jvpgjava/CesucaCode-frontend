import { RotateCcw, ThumbsDown, ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { setMessageFeedback } from '@/api/endpoints/conversations'
import {
  FEEDBACK_COMMENT_MAX_LENGTH,
  FEEDBACK_REASON_LABELS,
  type FeedbackReason,
  type Message,
} from '@/api/types/conversations'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { Dialog, DialogContent } from '@/shared/ui/Dialog'
import { useToast } from '@/shared/ui/Toast'

type Rating = 1 | -1 | null

const REASONS = Object.keys(FEEDBACK_REASON_LABELS) as FeedbackReason[]

export function MessageFeedback({
  conversationId,
  message,
  onRegenerate,
}: {
  conversationId: number
  message: Message
  // Só é passado para a última resposta da assistente.
  onRegenerate?: () => void
}) {
  const toast = useToast()
  const [rating, setRating] = useState<Rating>(message.feedback)
  const [reasonOpen, setReasonOpen] = useState(false)

  // Mensagem ainda com id temporário (resposta parcial após parar/erro): o
  // servidor ainda não devolveu o id real, então não dá pra avaliar.
  const disabled = message.id < 0

  const choose = async (next: 1 | -1) => {
    const value: Rating = rating === next ? null : next
    const previous = rating
    setRating(value)
    try {
      await setMessageFeedback(conversationId, message.id, value)
      // O 👎 abre o seletor de motivo; dá pra pular e ficar só com o -1.
      if (value === -1) setReasonOpen(true)
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
      {onRegenerate && (
        <button
          type="button"
          title="Gerar novamente"
          aria-label="Gerar novamente"
          onClick={onRegenerate}
          className="rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
        >
          <RotateCcw size={14} />
        </button>
      )}
      <Dialog open={reasonOpen} onOpenChange={setReasonOpen}>
        <DialogContent
          title="O que deu errado?"
          description="Seu retorno ajuda a melhorar a S.O.F.I.A. Você pode pular esta etapa."
        >
          <FeedbackReasonForm
            conversationId={conversationId}
            messageId={message.id}
            onClose={() => setReasonOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FeedbackReasonForm({
  conversationId,
  messageId,
  onClose,
}: {
  conversationId: number
  messageId: number
  onClose: () => void
}) {
  const toast = useToast()
  const [reason, setReason] = useState<FeedbackReason | null>(null)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)

  const canSubmit = reason !== null || comment.trim() !== ''

  const submit = async () => {
    setSaving(true)
    try {
      await setMessageFeedback(conversationId, messageId, -1, {
        reason: reason ?? undefined,
        comment: comment.trim() || undefined,
      })
      toast.success('Obrigada pelo retorno!')
      onClose()
    } catch {
      toast.error('Não foi possível enviar o motivo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-1.5">
        <legend className="sr-only">Motivo</legend>
        {REASONS.map((value) => (
          <label
            key={value}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-neutral-800 text-sm hover:bg-neutral-50"
          >
            <input
              type="radio"
              name="feedback-reason"
              value={value}
              checked={reason === value}
              onChange={() => setReason(value)}
              className="accent-brand-navy"
            />
            {FEEDBACK_REASON_LABELS[value]}
          </label>
        ))}
      </fieldset>
      <div className="flex flex-col gap-1">
        <label htmlFor="feedback-comment" className="text-neutral-600 text-sm">
          Comentário (opcional)
        </label>
        <textarea
          id="feedback-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={FEEDBACK_COMMENT_MAX_LENGTH}
          rows={3}
          className="resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
        />
        <span className="self-end text-neutral-400 text-xs">
          {comment.length}/{FEEDBACK_COMMENT_MAX_LENGTH}
        </span>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
          Pular
        </Button>
        <Button type="button" onClick={submit} disabled={!canSubmit || saving}>
          Enviar
        </Button>
      </div>
    </div>
  )
}
