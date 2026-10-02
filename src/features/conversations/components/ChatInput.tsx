import { ArrowUp, Square } from 'lucide-react'
import { type FormEvent, useLayoutEffect, useRef, useState } from 'react'

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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-crescimento: recalcula a altura a cada mudança de valor (digitar,
  // colar, limpar após enviar). O teto de 40vh vem do CSS (`max-h-[40vh]`);
  // passando dele, o próprio textarea rola por dentro.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `value` é o gatilho do recálculo
  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    const borders = textarea.offsetHeight - textarea.clientHeight
    textarea.style.height = `${textarea.scrollHeight + borders}px`
  }, [value])

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

  const buttonClasses =
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-navy text-white transition-colors hover:bg-brand-navy-dark disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 disabled:hover:bg-neutral-200'

  return (
    <div className="mx-auto w-full max-w-3xl border-neutral-200 border-t">
      <form onSubmit={handleSubmit} className="flex items-end gap-2 p-4 pb-2">
        <textarea
          ref={textareaRef}
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
          className="max-h-[40vh] flex-1 resize-none overflow-y-auto rounded-2xl border border-neutral-300 px-3.5 py-[7px] text-sm leading-5 outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy disabled:opacity-50"
        />
        {streaming && onStop ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Parar resposta"
            title="Parar resposta"
            className={buttonClasses}
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={disabled || !value.trim()}
            aria-label="Enviar mensagem"
            title="Enviar mensagem"
            className={buttonClasses}
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
      </form>
      <p className="px-4 pb-3 text-center text-neutral-400 text-xs">
        A S.O.F.I.A pode errar. Confira as informações importantes com seus professores e a
        coordenação do curso.
      </p>
    </div>
  )
}
