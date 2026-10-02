import { Send, Square } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Button } from '@/shared/ui/Button'

export function ChatInput({
  onSend,
  disabled,
  streaming = false,
  onStop,
}: {
  onSend: (content: string) => void
  disabled: boolean
  // Durante o stream o botão de enviar vira "Parar".
  streaming?: boolean
  onStop?: () => void
}) {
  const [value, setValue] = useState('')

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    submit()
  }

  return (
    <div className="mx-auto w-full max-w-3xl border-neutral-200 border-t">
      <form onSubmit={handleSubmit} className="flex items-end gap-2 p-4 pb-2">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              submit()
            }
          }}
          placeholder="Pergunte alguma coisa sobre o seu curso e disciplinas..."
          rows={1}
          disabled={disabled}
          className="max-h-40 flex-1 resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy disabled:opacity-50"
        />
        {streaming && onStop ? (
          <Button type="button" onClick={onStop} aria-label="Parar resposta" title="Parar resposta">
            <Square size={16} className="fill-current" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={disabled || !value.trim()}
            aria-label="Enviar mensagem"
            title="Enviar mensagem"
          >
            <Send size={16} />
          </Button>
        )}
      </form>
      <p className="px-4 pb-3 text-center text-neutral-400 text-xs">
        A S.O.F.I.A pode errar. Confira as informações importantes com seus professores e a
        coordenação do curso.
      </p>
    </div>
  )
}
