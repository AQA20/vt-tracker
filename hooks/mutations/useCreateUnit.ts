import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { CreateUnitPayload } from '@/types'

export function useCreateUnit(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateUnitPayload) => {
      const response = await api.post(`/projects/${projectId}/units`, data)
      return response.data
    },
    onSuccess: () => {
      // Invalidate both units list and project detail (for updated counts/stats)
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'units'] })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
    },
  })
}
