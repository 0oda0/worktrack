import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from './client'
import type {
  AdminRecord,
  ApproveUserInput,
  Audience,
  NowWorking,
  RecordFilters,
  UpdateRecordInput,
  UpdateUserInput,
  User,
} from './types'

// ---------- пользователи ----------

export function useUsers(audience?: Audience) {
  return useQuery({
    queryKey: ['admin', 'users', audience ?? 'all'],
    queryFn: async () =>
      (await api.get<User[]>('/admin/users', { params: audience ? { audience } : {} })).data,
  })
}

export function usePendingUsers() {
  return useQuery({
    queryKey: ['admin', 'users', 'pending'],
    queryFn: async () => (await api.get<User[]>('/admin/users/pending')).data,
  })
}

export function useApproveUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ApproveUserInput }) =>
      (await api.post<User>(`/admin/users/${id}/approve`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateUserInput }) =>
      (await api.patch<User>(`/admin/users/${id}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

// ---------- отметки ----------

export function useRecords(filters: RecordFilters) {
  return useQuery({
    queryKey: ['admin', 'records', filters],
    queryFn: async () => (await api.get<AdminRecord[]>('/admin/records', { params: filters })).data,
  })
}

export function useUpdateRecord() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateRecordInput }) =>
      (await api.patch<AdminRecord>(`/admin/records/${id}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'records'] }),
  })
}

export function useDeleteRecord() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/records/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'records'] }),
  })
}

// ---------- кто на работе ----------

export function useNowWorking(audience?: Audience) {
  return useQuery({
    queryKey: ['admin', 'now-working', audience ?? 'all'],
    queryFn: async () =>
      (await api.get<NowWorking[]>('/admin/now-working', { params: audience ? { audience } : {} }))
        .data,
    refetchInterval: 30000,
  })
}
