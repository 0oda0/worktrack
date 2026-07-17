import { Badge } from '@mantine/core'

import type { RequestStatus } from '../api/types'

const REQUEST: Record<RequestStatus, { label: string; color: string }> = {
  pending: { label: 'На рассмотрении', color: 'yellow' },
  approved: { label: 'Одобрено', color: 'green' },
  rejected: { label: 'Отклонено', color: 'red' },
}

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const s = REQUEST[status]
  return (
    <Badge variant="light" color={s.color}>
      {s.label}
    </Badge>
  )
}
