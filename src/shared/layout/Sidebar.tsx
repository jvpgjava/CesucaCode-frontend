import { NavLink } from 'react-router-dom'
import { FolderOpen, PanelLeftClose, PanelLeftOpen, Sparkle, Users } from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import { isAdmin } from '@/shared/auth/roles'
import { cn } from '@/shared/lib/cn'
import { UserMenu } from './UserMenu'

const navItems = [
  { to: '/materiais', label: 'Materiais', icon: FolderOpen, adminOnly: false },
  { to: '/contas', label: 'Contas', icon: Users, adminOnly: true },
]

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { user } = useAuth()

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-neutral-200 bg-white transition-[width] duration-150',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex items-center justify-between px-3 py-5">
        {!collapsed && (
          <span className="text-brand-navy flex items-center gap-1.5 truncate text-base font-semibold">
            <Sparkle size={18} className="fill-brand-orange text-brand-orange shrink-0" />
            CesucaCode
          </span>
        )}
        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          className="shrink-0 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin(user))
          .map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
                  collapsed && 'justify-center px-0',
                  isActive ? 'bg-brand-navy text-white' : 'text-neutral-600 hover:bg-neutral-100',
                )
              }
            >
              <Icon size={18} />
              {!collapsed && label}
            </NavLink>
          ))}
      </nav>

      <UserMenu collapsed={collapsed} />
    </aside>
  )
}
