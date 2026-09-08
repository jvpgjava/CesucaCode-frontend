import { createContext } from 'react'
import type { User } from '@/api/types/auth'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthContextValue {
  user: User | null
  status: AuthStatus
  login: (identifier: string, password: string) => Promise<User>
  logout: () => void
  refreshUser: () => Promise<void>
  updateNickname: (nickname: string) => Promise<User>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
