import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCoordinator,
  createStudent,
  importStudents,
  listAccounts,
  resetPassword,
  updateAccount,
} from '@/api/endpoints/accounts'
import { useToast } from '@/shared/ui/Toast'

const accountsListBaseKey = ['accounts', 'list'] as const
const accountsListKey = (params: { search?: string; role?: string; page?: number }) =>
  [...accountsListBaseKey, params] as const

export function useAccountsQuery(params: { search?: string; role?: string; page?: number } = {}) {
  return useQuery({
    queryKey: accountsListKey(params),
    queryFn: () => listAccounts(params),
  })
}

export function useCreateStudentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsListBaseKey })
    },
  })
}

export function useImportStudentsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: importStudents,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsListBaseKey })
    },
  })
}

export function useCreateCoordinatorMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCoordinator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsListBaseKey })
    },
  })
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: resetPassword,
  })
}

export function useUpdateAccountMutation() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { nickname?: string; is_active?: boolean } }) =>
      updateAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsListBaseKey })
    },
    onError: () => {
      toast.error('Não foi possível atualizar a conta. Tente novamente.')
    },
  })
}
