export type Role = 'cs_admin' | 'cs_coordinator' | 'cs_student'

export interface Course {
  id: number
  code: string
  name: string
}

export interface User {
  id: number
  email: string
  full_name: string
  nickname: string
  rgm: string | null
  role: Role
  course: Course | null
  coordinated_courses: Course[]
  must_change_password: boolean
  created_at: string
}

export interface LoginResponse {
  access: string
  refresh: string
  must_change_password: boolean
}
