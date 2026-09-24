import { cn } from '@/shared/lib/cn'

export function AvatarCircle({
  avatar,
  initial,
  className,
}: {
  avatar: string | null | undefined
  initial: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-navy font-medium text-white',
        className,
      )}
    >
      {avatar ? (
        <img src={avatar} alt="" className="h-full w-full object-cover" />
      ) : (
        initial.toUpperCase()
      )}
    </span>
  )
}
