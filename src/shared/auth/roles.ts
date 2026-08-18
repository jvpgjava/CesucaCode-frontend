import type { Role, User } from '@/api/types/auth'

export function isAdmin(user: User | null): boolean {
  return user?.role === 'cs_admin'
}

export function isCoordinator(user: User | null): boolean {
  return user?.role === 'cs_coordinator'
}

export function isStudent(user: User | null): boolean {
  return user?.role === 'cs_student'
}

export function hasRole(user: User | null, roles: Role[]): boolean {
  return user !== null && roles.includes(user.role)
}
