import type { LucideIcon } from 'lucide-react'

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-neutral-300 border-dashed py-16 text-center">
      <Icon size={28} className="text-neutral-300" />
      <p className="font-medium text-neutral-700 text-sm">{title}</p>
      {description && <p className="text-neutral-500 text-sm">{description}</p>}
    </div>
  )
}
