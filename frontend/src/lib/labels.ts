import type { Audience, Role } from '../api/types'

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Администратор',
  leader: 'Старший состав',
  worker: 'Работник',
}

export const ROLE_OPTIONS = [
  { value: 'worker', label: ROLE_LABEL.worker },
  { value: 'leader', label: ROLE_LABEL.leader },
  { value: 'admin', label: ROLE_LABEL.admin },
]

export const AUDIENCES: Audience[] = ['203', '903', '906']
export const AUDIENCE_OPTIONS = AUDIENCES.map((a) => ({ value: a, label: a }))
