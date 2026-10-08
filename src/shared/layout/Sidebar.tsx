import {
  Check,
  FolderOpen,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import type { Conversation } from '@/api/types/conversations'
import { useAuth } from '@/features/auth/useAuth'
import {
  useConversationsQuery,
  useCreateConversationMutation,
  useDeleteConversationMutation,
  useRemoveConversationFromCache,
  useRenameConversationMutation,
} from '@/features/conversations/hooks/useConversations'
import { isAdmin } from '@/shared/auth/roles'
import { cn } from '@/shared/lib/cn'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { Spinner } from '@/shared/ui/Spinner'
import { UserMenu } from './UserMenu'

/** Duração da animação de saída do item (mantida em sincronia com `duration-200` abaixo). */
const REMOVE_ANIMATION_MS = 200
const TITLE_PREVIEW_MAX = 40

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text
}

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
  const removeFromCache = useRemoveConversationFromCache()
  // Conversas já excluídas no servidor que ainda estão animando a saída da lista.
  const [removingIds, setRemovingIds] = useState<number[]>([])

  const handleNewConversation = async () => {
    const conversation = await createMutation.mutateAsync()
    navigate(`/chat/${conversation.id}`)
  }

  /** Retorna `true` se a exclusão deu certo (em erro, o toast já é exibido pelo hook). */
  const handleDeleteConversation = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id)
    } catch {
      return false
    }
    if (id === activeConversationId) {
      navigate('/chat', { replace: true })
    }
    // Só remove do cache depois da animação, para o item não sumir de repente.
    setRemovingIds((current) => [...current, id])
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.setTimeout(
      () => {
        removeFromCache(id)
        setRemovingIds((current) => current.filter((removingId) => removingId !== id))
      },
      reduceMotion ? 0 : REMOVE_ANIMATION_MS,
    )
    return true
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
          <span className="flex items-center gap-2 truncate font-semibold text-base text-brand-navy">
            <img src="/sofia-icon.png" alt="" className="h-6 w-6 shrink-0" />
            S.O.F.I.A
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
                    {conversations.results.map((conversation) => (
                      <ConversationListItem
                        key={conversation.id}
                        conversation={conversation}
                        isActive={conversation.id === activeConversationId}
                        isRemoving={removingIds.includes(conversation.id)}
                        onOpen={() => navigate(`/chat/${conversation.id}`)}
                        onDelete={() => handleDeleteConversation(conversation.id)}
                      />
                    ))}
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

function ConversationListItem({
  conversation,
  isActive,
  isRemoving,
  onOpen,
  onDelete,
}: {
  conversation: Conversation
  isActive: boolean
  isRemoving: boolean
  onOpen: () => void
  onDelete: () => Promise<boolean>
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(conversation.title)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const renameMutation = useRenameConversationMutation()

  const startEditing = () => {
    setTitle(conversation.title)
    setIsEditing(true)
  }

  const save = () => {
    const trimmed = title.trim()
    if (trimmed !== conversation.title) {
      renameMutation.mutate({ id: conversation.id, title: trimmed })
    }
    setIsEditing(false)
  }

  const handleConfirmDelete = async () => {
    if (isDeleting) return
    setIsDeleting(true)
    await onDelete()
    // Sucesso ou erro: o modal fecha (em erro o toast já foi exibido).
    setConfirmOpen(false)
    setIsDeleting(false)
  }

  if (isEditing) {
    // Mesma geometria da linha normal (padding, ícone, tamanho dos botões): só o
    // texto vira editável e um anel indica a edição, sem nada mudar de lugar.
    return (
      <li>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            save()
          }}
          className="flex items-center rounded-lg bg-neutral-100 pr-1 ring-1 ring-brand-navy/40 ring-inset"
        >
          <div
            className={cn(
              'flex flex-1 items-center gap-2 overflow-hidden px-3 py-1.5 text-sm',
              isActive ? 'font-medium text-brand-navy' : 'text-neutral-600',
            )}
          >
            <MessageCircle size={13} className="shrink-0 text-neutral-400" />
            <input
              // biome-ignore lint/a11y/noAutofocus: campo só existe porque o usuário acabou de clicar em "renomear" — foco automático é o esperado aqui, não uma surpresa de carregamento de página
              autoFocus
              onFocus={(event) => event.currentTarget.select()}
              aria-label="Nome da conversa"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setIsEditing(false)
              }}
              className="m-0 block w-full min-w-0 border-0 bg-transparent p-0 text-inherit leading-[inherit] outline-none"
            />
          </div>
          <button
            type="submit"
            title="Salvar"
            className="shrink-0 rounded p-1 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700"
          >
            <Check size={12} />
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            title="Cancelar"
            className="shrink-0 rounded p-1 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700"
          >
            <X size={12} />
          </button>
        </form>
      </li>
    )
  }

  return (
    <li
      className={cn(
        'grid transition-[grid-template-rows,opacity,translate] duration-200 ease-out motion-reduce:transition-none',
        isRemoving ? '-translate-x-3 grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr]',
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="group flex items-center rounded-lg pr-1 hover:bg-neutral-100">
          <button
            type="button"
            onClick={onOpen}
            className={cn(
              'flex flex-1 items-center gap-2 overflow-hidden px-3 py-1.5 text-left text-sm',
              isActive ? 'font-medium text-brand-navy' : 'text-neutral-600',
            )}
          >
            <MessageCircle size={13} className="shrink-0 text-neutral-400" />
            <span className="block truncate">{conversation.title || 'Nova conversa'}</span>
          </button>
          <button
            type="button"
            onClick={startEditing}
            title="Renomear conversa"
            className="shrink-0 rounded p-1 text-neutral-400 opacity-0 hover:bg-neutral-200 hover:text-neutral-700 group-hover:opacity-100"
          >
            <Pencil size={12} />
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            title="Excluir conversa"
            className="shrink-0 rounded p-1 text-neutral-400 opacity-0 hover:bg-neutral-200 hover:text-neutral-700 group-hover:opacity-100"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Excluir conversa?"
        description={`A conversa “${truncate(conversation.title || 'Nova conversa', TITLE_PREVIEW_MAX)}” será excluída permanentemente. Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        isPending={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </li>
  )
}
