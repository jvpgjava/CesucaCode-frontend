import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { clearTokens, hasTokens, setTokens, setUnauthorizedHandler } from '@/api/client'
import { getMe, login as loginRequest, updateMe } from '@/api/endpoints/auth'
import type { User } from '@/api/types/auth'
import { AuthContext, type AuthStatus } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>(() =>
    hasTokens() ? 'loading' : 'unauthenticated',
  )

  const logout = useCallback(() => {
    clearTokens()
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const refreshUser = useCallback(async () => {
    const me = await getMe()
    setUser(me)
    setStatus('authenticated')
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
  }, [logout])

  useEffect(() => {
    if (!hasTokens()) {
      return
    }
    // Verifica a sessão existente ao carregar a página — o setState só acontece
    // dentro do .then/.catch assíncrono, não no corpo síncrono do efeito.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshUser().catch(() => {
      logout()
    })
  }, [refreshUser, logout])

  const login = useCallback(async (identifier: string, password: string) => {
    const response = await loginRequest(identifier, password)
    setTokens({ access: response.access, refresh: response.refresh })
    const me = await getMe()
    setUser(me)
    setStatus('authenticated')
    return me
  }, [])

  const updateProfile = useCallback(async (data: { nickname?: string; avatar?: File }) => {
    const me = await updateMe(data)
    setUser(me)
    return me
  }, [])

  const value = useMemo(
    () => ({ user, status, login, logout, refreshUser, updateProfile }),
    [user, status, login, logout, refreshUser, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
