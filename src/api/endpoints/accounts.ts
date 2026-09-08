import { request } from '@/api/client'
import type {
  BulkImportResult,
  CreateCoordinatorPayload,
  CreateCoordinatorResponse,
  CreateStudentPayload,
  CreateStudentResponse,
  ResetPasswordResponse,
} from '@/api/types/accounts'
import type { User } from '@/api/types/auth'
import type { Paginated } from '@/api/types/common'

export function listAccounts(params: { search?: string; role?: string; page?: number } = {}) {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.role) query.set('role', params.role)
  if (params.page && params.page > 1) query.set('page', String(params.page))
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return request<Paginated<User>>(`/api/auth/accounts/${suffix}`)
}

export function createStudent(payload: CreateStudentPayload) {
  return request<CreateStudentResponse>('/api/auth/accounts/students/', {
    method: 'POST',
    body: payload,
  })
}

export function importStudents(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request<BulkImportResult>('/api/auth/accounts/students/import/', {
    method: 'POST',
    body: formData,
    isFormData: true,
  })
}

export function createCoordinator(payload: CreateCoordinatorPayload) {
  return request<CreateCoordinatorResponse>('/api/auth/accounts/coordinators/', {
    method: 'POST',
    body: payload,
  })
}

export function resetPassword(id: number) {
  return request<ResetPasswordResponse>(`/api/auth/accounts/${id}/reset-password/`, {
    method: 'POST',
  })
}

export function updateAccount(id: number, data: { nickname?: string; is_active?: boolean }) {
  return request<User>(`/api/auth/accounts/${id}/`, { method: 'PATCH', body: data })
}
