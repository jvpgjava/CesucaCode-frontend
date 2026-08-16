import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import type { Role } from '@/api/types/auth'
import { hasRole } from './roles'

export function RequireRole({ roles }: { roles: Role[] }) {
  const { user } = useAuth()

  if (!hasRole(user, roles)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
