import { request } from '@/api/client'
import type { Paginated } from '@/api/types/common'
import type { User } from '@/api/types/auth'
import type {
  BulkImportResult,
  CreateCoordinatorPayload,
  CreateCoordinatorResponse,
  CreateStudentPayload,
  CreateStudentResponse,
  ResetPasswordResponse,
} from '@/api/types/accounts'

export function listAccounts(params: { search?: string; role?: string } = {}) {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.role) query.set('role', params.role)
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
