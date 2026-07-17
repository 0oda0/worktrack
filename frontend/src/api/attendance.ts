import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Coords } from '../lib/geo'
import { api } from './client'
import type { Attendance, Timesheet } from './types'

const keys = {
  root: ['attendance'] as const,
  status: ['attendance', 'status'] as const,
  timesheet: (start: string, end: string) => ['attendance', 'timesheet', start, end] as const,
}

export function useStatus() {
  return useQuery({
    queryKey: keys.status,
    queryFn: async () => (await api.get<Attendance | null>('/attendance/status')).data,
  })
}

export function useTimesheet(start: string, end: string) {
  return useQuery({
    queryKey: keys.timesheet(start, end),
    queryFn: async () =>
      (await api.get<Timesheet>('/attendance/timesheet', { params: { start, end } })).data,
  })
}

function useMark(path: 'check-in' | 'check-out') {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (coords: Coords) =>
      (await api.post<Attendance>(`/attendance/${path}`, coords)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.root }),
  })
}

export const useCheckIn = () => useMark('check-in')
export const useCheckOut = () => useMark('check-out')
