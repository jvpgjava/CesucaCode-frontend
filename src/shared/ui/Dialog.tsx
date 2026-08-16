import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export function Dialog(props: RadixDialog.DialogProps) {
  return <RadixDialog.Root {...props} />
}

export function DialogTrigger(props: RadixDialog.DialogTriggerProps) {
  return <RadixDialog.Trigger {...props} />
}

export function DialogContent({
  children,
  className,
  title,
  description,
}: {
  children: ReactNode
  className?: string
  title: string
  description: string
}) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
      <RadixDialog.Content
        className={cn(
          'fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl',
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <RadixDialog.Title className="text-base font-semibold text-neutral-900">
              {title}
            </RadixDialog.Title>
            <RadixDialog.Description className="mt-1 text-sm text-neutral-500">
              {description}
            </RadixDialog.Description>
          </div>
          <RadixDialog.Close className="text-neutral-400 hover:text-neutral-700">
            <X size={18} />
          </RadixDialog.Close>
        </div>
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  )
}
