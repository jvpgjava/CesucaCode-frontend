import { Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export function Spinner({ className, size = 20 }: { className?: string; size?: number }) {
  return <Loader2 className={cn('animate-spin text-neutral-400', className)} size={size} />
}
