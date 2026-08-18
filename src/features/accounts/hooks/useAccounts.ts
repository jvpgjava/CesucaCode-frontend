import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCoordinator,
  createStudent,
  importStudents,
  listAccounts,
  resetPassword,
} from '@/api/endpoints/accounts'

const accountsListBaseKey = ['accounts', 'list'] as const
const accountsListKey = (params: { search?: string; role?: string }) =>
  [...accountsListBaseKey, params] as const

export function useAccountsQuery(params: { search?: string; role?: string } = {}) {
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
