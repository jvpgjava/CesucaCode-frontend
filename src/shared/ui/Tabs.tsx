import * as RadixTabs from '@radix-ui/react-tabs'
import { cn } from '@/shared/lib/cn'

export function Tabs(props: RadixTabs.TabsProps) {
  return <RadixTabs.Root {...props} />
}

export function TabsList({ className, ...props }: RadixTabs.TabsListProps) {
  return (
    <RadixTabs.List
      className={cn('mb-4 flex gap-1 rounded-full bg-neutral-100 p-1', className)}
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }: RadixTabs.TabsTriggerProps) {
  return (
    <RadixTabs.Trigger
      className={cn(
        'flex-1 rounded-full px-3 py-1.5 font-medium text-neutral-600 text-sm transition-colors data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent(props: RadixTabs.TabsContentProps) {
  return <RadixTabs.Content {...props} />
}
