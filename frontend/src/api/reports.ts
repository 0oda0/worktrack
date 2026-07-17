import { useQuery } from '@tanstack/react-query'

import { api } from './client'
import type { Audience, RatingRow, SummaryRow } from './types'

function periodParams(start: string, end: string, audience?: Audience) {
  return { start, end, ...(audience ? { audience } : {}) }
}

export function useSummary(start: string, end: string, audience?: Audience) {
  return useQuery({
    queryKey: ['reports', 'summary', start, end, audience ?? 'all'],
    queryFn: async () =>
      (await api.get<SummaryRow[]>('/reports/summary', { params: periodParams(start, end, audience) }))
        .data,
  })
}

export function useRating(start: string, end: string, audience?: Audience) {
  return useQuery({
    queryKey: ['reports', 'rating', start, end, audience ?? 'all'],
    queryFn: async () =>
      (await api.get<RatingRow[]>('/reports/rating', { params: periodParams(start, end, audience) }))
        .data,
  })
}
