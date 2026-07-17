import { api } from './client'
import type { LoginResponse, User } from './types'

export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }).then((r) => r.data),
  register: (full_name: string, email: string, password: string) =>
    api.post<User>('/auth/register', { full_name, email, password }).then((r) => r.data),
  me: () => api.get<User>('/auth/me').then((r) => r.data),
}
