import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'

export function RequirePasswordCurrent() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return null
  }

  const onChangePasswordPage = location.pathname === '/change-password'

  if (user.must_change_password && !onChangePasswordPage) {
    return <Navigate to="/change-password" replace />
  }

  if (!user.must_change_password && onChangePasswordPage) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
