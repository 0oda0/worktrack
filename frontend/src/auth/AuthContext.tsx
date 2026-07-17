import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { authApi } from '../api/auth'
import { clearToken, getToken, setToken } from '../api/client'
import type { Role, User } from '../api/types'

type Status = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthValue {
  user: User | null
  status: Status
  login: (email: string, password: string) => Promise<User>
  register: (full_name: string, email: string, password: string) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

/** Стартовый маршрут по роли: работник — своя отметка, старший/админ — админка. */
export const homeFor = (role: Role) => (role === 'worker' ? '/' : '/admin')

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const navigate = useNavigate()
  const qc = useQueryClient()

  // гидрация: есть токен → тянем /me
  useEffect(() => {
    if (!getToken()) {
      setStatus('unauthenticated')
      return
    }
    authApi
      .me()
      .then((u) => {
        setUser(u)
        setStatus('authenticated')
      })
      .catch(() => {
        clearToken()
        setStatus('unauthenticated')
      })
  }, [])

  const login = async (email: string, password: string) => {
    const { token, user: u } = await authApi.login(email, password)
    setToken(token)
    setUser(u)
    setStatus('authenticated')
    return u
  }

  const register = async (full_name: string, email: string, password: string) => {
    await authApi.register(full_name, email, password)
    // сразу входим — роутер отправит на /pending до одобрения админом
    return login(email, password)
  }

  const logout = () => {
    clearToken()
    setUser(null)
    setStatus('unauthenticated')
    qc.clear()
    navigate('/login', { replace: true })
  }

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth должен использоваться внутри AuthProvider')
  return ctx
}
