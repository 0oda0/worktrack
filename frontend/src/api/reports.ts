import { useQuery } from '@tanstack/react-query'

import { api } from './client'
import type { Audience, RatingRow, SummaryRow } from './types'

function periodParams(start: string, end: string, audience?: Audience) {
  return { start, end, ...(audience ? { audience } : {}) }
}

export function useSummary(start: string, end: string, audience?: Audience, enabled = true) {
  return useQuery({
    queryKey: ['reports', 'summary', start, end, audience ?? 'all'],
    enabled: enabled && Boolean(start && end),
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

/** Скачивает Excel-сводку (Bearer добавляет интерсептор), инициирует загрузку в браузере. */
export async function downloadReportXlsx(start: string, end: string, audience?: Audience) {
  const res = await api.get('/reports/export.xlsx', {
    params: periodParams(start, end, audience),
    responseType: 'blob',
  })
  const url = URL.createObjectURL(res.data as Blob)
  const a = document.createElement('a')
  a.href = url
  const ymd = (d: string) => d.replaceAll('-', '')
  a.download = `Отчет_${audience ?? 'все'}_${ymd(start)}-${ymd(end)}.xlsx`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
