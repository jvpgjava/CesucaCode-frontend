import { Navigate, Outlet } from 'react-router-dom'
import type { Role } from '@/api/types/auth'
import { useAuth } from '@/features/auth/useAuth'
import { hasRole } from './roles'

export function RequireRole({ roles }: { roles: Role[] }) {
  const { user } = useAuth()

  if (!hasRole(user, roles)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
