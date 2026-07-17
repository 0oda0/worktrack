import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from './client'
import type { Audience, CreateRequestInput, WorkRequest } from './types'

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

// ---------- ревью (leader/admin) ----------

export function usePendingRequests(audience?: Audience) {
  return useQuery({
    queryKey: ['requests', 'pending', audience ?? 'all'],
    queryFn: async () =>
      (await api.get<WorkRequest[]>('/requests/pending', { params: audience ? { audience } : {} }))
        .data,
  })
}

function useReview(action: 'approve' | 'reject') {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, comment }: { id: number; comment?: string }) =>
      (await api.post<WorkRequest>(`/requests/${id}/${action}`, { comment: comment ?? '' })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] })
      qc.invalidateQueries({ queryKey: ['admin'] }) // approve создаёт отметку
    },
  })
}

export const useApproveRequest = () => useReview('approve')
export const useRejectRequest = () => useReview('reject')
