import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createConversation,
  deleteConversation,
  getMessages,
  getSuggestions,
  listConversations,
  renameConversation,
} from '@/api/endpoints/conversations'
import type { Paginated } from '@/api/types/common'
import type { Conversation } from '@/api/types/conversations'
import { useToast } from '@/shared/ui/Toast'

const conversationsListKey = ['conversations', 'list'] as const
const messagesKey = (id: number) => ['conversations', 'detail', id, 'messages'] as const

export function useConversationsQuery() {
  return useQuery({ queryKey: conversationsListKey, queryFn: listConversations })
}

export function useMessagesQuery(id: number | null) {
  return useQuery({
    queryKey: messagesKey(id ?? -1),
    queryFn: () => getMessages(id as number),
    enabled: id !== null,
  })
}

export function useSuggestionsQuery() {
  return useQuery({
    queryKey: ['conversations', 'suggestions'],
    queryFn: getSuggestions,
    staleTime: 60_000,
  })
}

export function useCreateConversationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationsListKey })
    },
  })
}

export function useRenameConversationMutation() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) => renameConversation(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationsListKey })
    },
    onError: () => {
      toast.error('Não foi possível renomear a conversa. Tente novamente.')
    },
  })
}

/**
 * Exclui a conversa no servidor. Não mexe no cache da lista: quem chama decide quando
 * remover o item (ver `useRemoveConversationFromCache`), para poder animar a saída antes.
 */
export function useDeleteConversationMutation() {
  const toast = useToast()
  return useMutation({
    mutationFn: deleteConversation,
    onError: () => {
      toast.error('Não foi possível excluir a conversa. Tente novamente.')
    },
  })
}

/** Remove a conversa do cache da lista (sem piscar) e revalida em seguida. */
export function useRemoveConversationFromCache() {
  const queryClient = useQueryClient()
  return (id: number) => {
    queryClient.setQueryData<Paginated<Conversation>>(conversationsListKey, (old) =>
      old
        ? {
            ...old,
            count: Math.max(0, old.count - 1),
            results: old.results.filter((conversation) => conversation.id !== id),
          }
        : old,
    )
    queryClient.invalidateQueries({ queryKey: conversationsListKey })
  }
}
