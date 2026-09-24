import { ChevronsUpDown, LogOut, UserPen } from 'lucide-react'
import { useState } from 'react'
import { EditProfileDialog } from '@/features/auth/EditProfileDialog'
import { useAuth } from '@/features/auth/useAuth'
import { roleLabels } from '@/shared/auth/roles'
import { cn } from '@/shared/lib/cn'
import { AvatarCircle } from '@/shared/ui/AvatarCircle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/DropdownMenu'

export function UserMenu({ collapsed }: { collapsed: boolean }) {
  const { user, logout } = useAuth()
  const [editOpen, setEditOpen] = useState(false)

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
            <AvatarCircle avatar={user.avatar} initial={initial} className="h-7 w-7 text-xs" />
          ) : (
            <>
              <div className="flex min-w-0 items-center gap-2.5">
                <AvatarCircle avatar={user.avatar} initial={initial} className="h-8 w-8 text-xs" />
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate font-medium text-neutral-900 text-sm">
                    {displayName}
                  </span>
                  <span className="truncate text-neutral-500 text-xs">{roleLabels[user.role]}</span>
                </div>
              </div>
              <ChevronsUpDown size={16} className="shrink-0 text-neutral-400" />
            </>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <UserPen size={16} />
            Editar perfil
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={logout} className="text-red-600">
            <LogOut size={16} />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} />
    </div>
  )
}
