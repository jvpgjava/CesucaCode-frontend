import { useSuggestionsQuery } from '../hooks/useConversations'

export function SuggestionChips({
  onPick,
  disabled,
}: {
  onPick: (text: string) => void
  disabled?: boolean
}) {
  const { data } = useSuggestionsQuery()
  const suggestions = data?.suggestions ?? []
  if (suggestions.length === 0) return null

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {suggestions.map((text) => (
        <button
          key={text}
          type="button"
          disabled={disabled}
          onClick={() => onPick(text)}
          className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-left text-neutral-700 text-sm shadow-sm transition-colors hover:border-brand-navy hover:text-brand-navy disabled:opacity-50"
        >
          {text}
        </button>
      ))}
    </div>
  )
}
