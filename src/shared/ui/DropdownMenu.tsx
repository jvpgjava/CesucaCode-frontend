import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu'
import { cn } from '@/shared/lib/cn'

export function DropdownMenu(props: RadixDropdownMenu.DropdownMenuProps) {
  return <RadixDropdownMenu.Root {...props} />
}

export function DropdownMenuTrigger(props: RadixDropdownMenu.DropdownMenuTriggerProps) {
  return <RadixDropdownMenu.Trigger {...props} />
}

export function DropdownMenuContent({
  children,
  className,
  ...props
}: RadixDropdownMenu.DropdownMenuContentProps) {
  return (
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.Content
        sideOffset={8}
        className={cn(
          'z-50 min-w-[180px] rounded-xl border border-neutral-200 bg-white p-1 shadow-lg',
          className,
        )}
        {...props}
      >
        {children}
      </RadixDropdownMenu.Content>
    </RadixDropdownMenu.Portal>
  )
}

export function DropdownMenuItem({ className, ...props }: RadixDropdownMenu.DropdownMenuItemProps) {
  return (
    <RadixDropdownMenu.Item
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 outline-none data-[highlighted]:bg-neutral-100',
        className,
      )}
      {...props}
    />
  )
}
