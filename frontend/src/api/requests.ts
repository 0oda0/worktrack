import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from './client'
import type { CreateRequestInput, WorkRequest } from './types'

const myKey = ['requests', 'my'] as const

export function useMyRequests() {
  return useQuery({
    queryKey: myKey,
    queryFn: async () => (await api.get<WorkRequest[]>('/requests/my')).data,
  })
}

export function useCreateRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateRequestInput) =>
      (await api.post<WorkRequest>('/requests', input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: myKey }),
  })
}
