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

export interface AdminRecord {
  id: number
  user_id: number
  full_name: string
  audience: Audience | null
  work_date: string
  check_in: string
  check_out: string | null
  lat_in: number | null
  lng_in: number | null
  lat_out: number | null
  lng_out: number | null
  out_of_zone_in: boolean
  out_of_zone_out: boolean
  is_manual: boolean
  comment: string
}

export interface NowWorking {
  user_id: number
  full_name: string
  audience: Audience | null
  check_in: string
  out_of_zone_in: boolean
}

export interface SummaryRow extends Stats {
  user_id: number
  full_name: string
  audience: Audience | null
  hire_date: string | null
}

export interface RatingRow {
  user_id: number
  full_name: string
  audience: Audience | null
  total_hours: number
  overtime: number
  weekend_hours: number
  lateness: number
  score: number
}

export interface RecordFilters {
  user_id?: number
  audience?: Audience
  start?: string
  end?: string
}

export interface UpdateRecordInput {
  check_in?: string
  check_out?: string | null
  comment?: string
}

export interface ApproveUserInput {
  role: Role
  audience?: Audience | null
  hire_date: string
}

export interface UpdateUserInput {
  full_name?: string
  role?: Role
  audience?: Audience | null
  hire_date?: string
  is_approved?: boolean
  is_active?: boolean
}

export interface Holiday {
  id: number
  date: string
  name: string
}

export interface Settings {
  office_lat: number
  office_lng: number
  office_radius_m: number
}
