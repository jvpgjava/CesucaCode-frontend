import { request } from '@/api/client'
import type { Course, LoginResponse, User } from '@/api/types/auth'
import type { Paginated } from '@/api/types/common'

export function login(identifier: string, password: string) {
  return request<LoginResponse>('/api/auth/login/', {
    method: 'POST',
    body: { identifier, password },
    skipAuth: true,
  })
}

export function getMe() {
  return request<User>('/api/auth/me/')
}

export function updateMe(data: { nickname?: string; avatar?: File }) {
  const formData = new FormData()
  if (data.nickname !== undefined) formData.append('nickname', data.nickname)
  if (data.avatar) formData.append('avatar', data.avatar)
  return request<User>('/api/auth/me/', { method: 'PATCH', body: formData, isFormData: true })
}

export function changePassword(oldPassword: string, newPassword: string) {
  return request<{ detail: string }>('/api/auth/change-password/', {
    method: 'POST',
    body: { old_password: oldPassword, new_password: newPassword },
  })
}

export function getCourses() {
  return request<Paginated<Course>>('/api/auth/courses/')
}
