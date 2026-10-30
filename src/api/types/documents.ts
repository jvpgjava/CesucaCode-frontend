import type { Course } from './auth'

export type DocumentStatus = 'processing' | 'ready' | 'failed'

export interface Document {
  id: number
  title: string
  courses: Course[]
  /** Omitido pela API para estudantes (não expõe arquivos internos do acervo). */
  file?: string
  /** Omitido pela API para estudantes. */
  uploaded_by_name?: string
  status: DocumentStatus
  /** Omitido pela API para estudantes. */
  processing_error?: string
  /** Etapa atual do processamento, em texto (só enquanto `processing`). Omitido para estudantes. */
  processing_detail?: string
  /** Progresso do processamento, 0 a 100. Omitido para estudantes. */
  processing_progress?: number
  /** Durante uma espera pelo limite de uso do serviço externo: quando o processamento
   * é retomado (ISO 8601). Omitido para estudantes. */
  processing_resume_at?: string | null
  chunk_count: number
  /** Coordenador só exclui se coordenar todos os cursos do material. */
  can_delete: boolean
  created_at: string
}

export interface DocumentUploadResponse {
  id: number
  title: string
  courses: string[]
  file: string
  status: DocumentStatus
  processing_error: string
}

export interface DocumentChunk {
  id: number
  index: number
  content: string
}
