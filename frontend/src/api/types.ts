export type Role = 'admin' | 'leader' | 'worker'
export type Audience = '203' | '903' | '906'

export interface User {
  id: number
  full_name: string
  email: string
  role: Role
  audience: Audience | null
  hire_date: string | null
  is_approved: boolean
  is_active: boolean
}

export interface LoginResponse {
  token: string
  user: User
}
