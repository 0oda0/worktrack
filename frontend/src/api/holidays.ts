import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from './client'
import type { Holiday } from './types'

const key = ['holidays'] as const

export function useHolidays() {
  return useQuery({
    queryKey: key,
    queryFn: async () => (await api.get<Holiday[]>('/holidays')).data,
  })
}

export function useAddHoliday() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { date: string; name: string }) =>
      (await api.post<Holiday>('/holidays', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useDeleteHoliday() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/holidays/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}
