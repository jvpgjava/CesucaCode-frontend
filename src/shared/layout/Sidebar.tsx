import {
  FolderOpen,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Sparkle,
  Trash2,
  Users,
} from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import {
  useConversationsQuery,
  useCreateConversationMutation,
  useDeleteConversationMutation,
} from '@/features/conversations/hooks/useConversations'
import { isAdmin } from '@/shared/auth/roles'
import { cn } from '@/shared/lib/cn'
import { Spinner } from '@/shared/ui/Spinner'
import { UserMenu } from './UserMenu'

const navItems = [
  { to: '/chat', label: 'Chat', icon: MessageCircle, adminOnly: false },
  { to: '/materiais', label: 'Materiais', icon: FolderOpen, adminOnly: false },
  { to: '/contas', label: 'Contas', icon: Users, adminOnly: true },
]

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isChatSection = location.pathname.startsWith('/chat')
  const activeConversationId = Number(location.pathname.match(/^\/chat\/(\d+)/)?.[1]) || null

  const { data: conversations, isLoading: loadingConversations } = useConversationsQuery()
  const createMutation = useCreateConversationMutation()
  const deleteMutation = useDeleteConversationMutation()

  const handleNewConversation = async () => {
    const conversation = await createMutation.mutateAsync()
    navigate(`/chat/${conversation.id}`)
  }

  const handleDeleteConversation = async (id: number) => {
    await deleteMutation.mutateAsync(id)
    if (id === activeConversationId) {
      navigate('/chat', { replace: true })
    }
  }

  return (
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col border-neutral-200 border-r bg-white transition-[width] duration-150',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex items-center justify-between px-3 py-5">
        {!collapsed && (
          <span className="flex items-center gap-1.5 truncate font-semibold text-base text-brand-navy">
            <Sparkle size={18} className="shrink-0 fill-brand-orange text-brand-orange" />
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

      <div className="flex min-h-0 flex-1 flex-col">
        <nav className="flex shrink-0 flex-col gap-1 px-3 pb-2">
          {navItems
            .filter((item) => !item.adminOnly || isAdmin(user))
            .map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                title={collapsed ? label : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-sm',
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

        {isChatSection && !collapsed && (
          <div className="flex min-h-0 flex-1 flex-col border-neutral-100 border-t pt-2">
            <button
              type="button"
              onClick={handleNewConversation}
              className="mx-3 flex items-center gap-2.5 rounded-lg px-3 py-2 text-left font-medium text-neutral-700 text-sm hover:bg-neutral-100"
            >
              <Plus size={16} className="shrink-0" />
              Nova conversa
            </button>

            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
              {loadingConversations ? (
                <div className="flex justify-center py-6">
                  <Spinner />
                </div>
              ) : !conversations || conversations.results.length === 0 ? (
                <p className="px-3 py-4 text-center text-neutral-400 text-xs">
                  Nenhuma conversa ainda.
                </p>
              ) : (
                <>
                  <p className="px-3 pt-2 pb-1 font-medium text-neutral-400 text-xs uppercase tracking-wide">
                    Conversas
                  </p>
                  <ul className="flex flex-col">
                    {conversations.results.map((conversation) => {
                      const isActive = conversation.id === activeConversationId
                      return (
                        <li key={conversation.id}>
                          <div className="group flex items-center rounded-lg pr-1 hover:bg-neutral-100">
                            <button
                              type="button"
                              onClick={() => navigate(`/chat/${conversation.id}`)}
                              className={cn(
                                'flex flex-1 items-center gap-2 overflow-hidden px-3 py-1.5 text-left text-sm',
                                isActive ? 'font-medium text-brand-navy' : 'text-neutral-600',
                              )}
                            >
                              <MessageCircle size={13} className="shrink-0 text-neutral-400" />
                              <span className="block truncate">
                                {conversation.title || 'Nova conversa'}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteConversation(conversation.id)}
                              title="Excluir conversa"
                              className="shrink-0 rounded p-1 text-neutral-400 opacity-0 hover:bg-neutral-200 hover:text-neutral-700 group-hover:opacity-100"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <UserMenu collapsed={collapsed} />
    </aside>
  )
}
