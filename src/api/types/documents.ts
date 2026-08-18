import type { Course } from './auth'

export type DocumentStatus = 'processing' | 'ready' | 'failed'

export interface Document {
  id: number
  title: string
  course: Course
  file: string
  uploaded_by_name: string
  status: DocumentStatus
  processing_error: string
  chunk_count: number
  created_at: string
}

export interface DocumentUploadResponse {
  id: number
  title: string
  course: string
  file: string
  status: DocumentStatus
  processing_error: string
}

export interface DocumentChunk {
  id: number
  index: number
  content: string
}
