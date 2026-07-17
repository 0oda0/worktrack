import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from './client'
import type { Settings } from './types'

const key = ['admin', 'settings'] as const

export function useSettings() {
  return useQuery({
    queryKey: key,
    queryFn: async () => (await api.get<Settings>('/admin/settings')).data,
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Settings) => (await api.put<Settings>('/admin/settings', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}
