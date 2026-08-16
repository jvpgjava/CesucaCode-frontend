import { ChevronsUpDown, LogOut } from 'lucide-react'
import type { Role } from '@/api/types/auth'
import { useAuth } from '@/features/auth/useAuth'
import { cn } from '@/shared/lib/cn'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/DropdownMenu'

const roleLabels: Record<Role, string> = {
  cs_admin: 'CSAdmin',
  cs_coordinator: 'CSCoordinator',
  cs_student: 'CSStudent',
}

export function UserMenu({ collapsed }: { collapsed: boolean }) {
  const { user, logout } = useAuth()

  if (!user) {
    return null
  }

  const displayName = user.nickname || user.full_name
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="border-neutral-200 border-t p-3">
      <DropdownMenu>
        <DropdownMenuTrigger
          title={collapsed ? displayName : undefined}
          className={cn(
            'flex w-full items-center rounded-lg px-2 py-2 text-left hover:bg-neutral-100',
            collapsed ? 'justify-center' : 'justify-between',
          )}
        >
          {collapsed ? (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-navy font-medium text-white text-xs">
              {initial}
            </span>
          ) : (
            <>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate font-medium text-neutral-900 text-sm">{displayName}</span>
                <span className="truncate text-neutral-500 text-xs">{roleLabels[user.role]}</span>
              </div>
              <ChevronsUpDown size={16} className="shrink-0 text-neutral-400" />
            </>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onSelect={logout} className="text-red-600">
            <LogOut size={16} />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
