import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { UpdateTaskPayload } from '@/types'

export function useUpdateTask(unitId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      taskId,
      payload,
    }: {
      taskId: string
      payload: UpdateTaskPayload
    }) => {
      await api.put(`/tasks/${taskId}`, payload)
    },
    onSuccess: () => {
      // Refetch stages to get updated task statuses
      queryClient.invalidateQueries({ queryKey: ['units', unitId, 'stages'] })
      queryClient.invalidateQueries({ queryKey: ['stages'] })
    },
  })
}
