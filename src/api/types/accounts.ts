export interface CreateStudentPayload {
  email: string
  full_name: string
  nickname?: string
  rgm: string
  course: string
}

export interface CreateStudentResponse {
  id: number
  email: string
  full_name: string
  nickname: string
  rgm: string
  course: string
  email_sent: boolean
}

export interface CreateCoordinatorPayload {
  email: string
  full_name: string
  nickname?: string
  coordinated_courses: string[]
}

export interface CreateCoordinatorResponse {
  id: number
  email: string
  full_name: string
  nickname: string
  coordinated_courses: string[]
  email_sent: boolean
}

export interface BulkImportError {
  row: number
  rgm: string | null
  errors: Record<string, string[]>
}

export interface BulkImportResult {
  created_count: number
  failed_count: number
  email_failures_count: number
  errors: BulkImportError[]
}

export interface ResetPasswordResponse {
  detail: string
  email_sent: boolean
}
