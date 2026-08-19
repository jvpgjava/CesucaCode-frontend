import { Send } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Button } from '@/shared/ui/Button'

export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (content: string) => void
  disabled: boolean
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
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-3xl items-end gap-2 border-neutral-200 border-t p-4"
    >
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            submit()
          }
        }}
        placeholder="Pergunte alguma coisa sobre os materiais do seu curso..."
        rows={1}
        disabled={disabled}
        className="max-h-40 flex-1 resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy disabled:opacity-50"
      />
      <Button type="submit" disabled={disabled || !value.trim()}>
        <Send size={16} />
      </Button>
    </form>
  )
}
