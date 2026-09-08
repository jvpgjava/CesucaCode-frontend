import { request } from '@/api/client'
import type { Paginated } from '@/api/types/common'
import type { Document, DocumentChunk, DocumentUploadResponse } from '@/api/types/documents'

export function listDocuments(params: { page?: number } = {}) {
  const query = new URLSearchParams()
  if (params.page && params.page > 1) query.set('page', String(params.page))
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return request<Paginated<Document>>(`/api/documents/${suffix}`)
}

export function getDocument(id: number) {
  return request<Document>(`/api/documents/${id}/`)
}

export function uploadDocument(data: { title: string; course: string; file: File }) {
  const formData = new FormData()
  formData.append('title', data.title)
  formData.append('course', data.course)
  formData.append('file', data.file)
  return request<DocumentUploadResponse>('/api/documents/upload/', {
    method: 'POST',
    body: formData,
    isFormData: true,
  })
}

export function deleteDocument(id: number) {
  return request<void>(`/api/documents/${id}/`, { method: 'DELETE' })
}

export function updateDocument(id: number, data: { title?: string; course?: string }) {
  return request<Document>(`/api/documents/${id}/`, { method: 'PATCH', body: data })
}

export function getDocumentChunks(id: number) {
  return request<Paginated<DocumentChunk>>(`/api/documents/${id}/chunks/`)
}

export function reprocessDocument(id: number) {
  return request<Document>(`/api/documents/${id}/reprocess/`, { method: 'POST' })
}
