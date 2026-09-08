import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createConversation,
  deleteConversation,
  getMessages,
  listConversations,
  renameConversation,
} from '@/api/endpoints/conversations'
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

export function useDeleteConversationMutation() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationsListKey })
    },
    onError: () => {
      toast.error('Não foi possível excluir a conversa. Tente novamente.')
    },
  })
}
