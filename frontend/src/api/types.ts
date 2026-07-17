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

export type RequestStatus = 'pending' | 'approved' | 'rejected'

export interface Attendance {
  id: number
  user_id: number
  work_date: string
  check_in: string
  check_out: string | null
  out_of_zone_in: boolean
  out_of_zone_out: boolean
  is_manual: boolean
  comment: string
}

export interface Stats {
  total_hours: number
  work_hours: number
  paid_hours: number
  overtime: number
  weekend_hours: number
}

export interface TimesheetDay {
  date: string
  check_in: string
  check_out: string | null
  hours: number
  is_weekend: boolean
  is_manual: boolean
  out_of_zone_in: boolean
}

export interface Timesheet {
  stats: Stats
  days: TimesheetDay[]
}

export interface WorkRequest {
  id: number
  user_id: number
  work_date: string
  check_in: string
  check_out: string | null
  comment: string
  status: RequestStatus
  reviewed_by: number | null
  review_comment: string
}

export interface CreateRequestInput {
  work_date: string
  check_in: string
  check_out?: string | null
  comment?: string
}
