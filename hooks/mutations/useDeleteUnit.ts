import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'

export function useDeleteUnit(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (unitId: string) => {
      await api.delete(`/units/${unitId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'units'] })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
    },
  })
}
