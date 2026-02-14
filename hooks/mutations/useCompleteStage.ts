import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'

export function useCompleteStage(unitId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      stageId,
      completed,
      taskIds,
    }: {
      stageId: string
      completed: boolean
      taskIds: string[]
    }) => {
      const newStageStatus = completed ? 'completed' : 'pending'
      const newTaskStatus = completed ? 'pass' : 'pending'

      // Update stage status
      await api.put(`/stages/${stageId}`, { status: newStageStatus })

      // Update all tasks in the stage
      if (taskIds.length > 0) {
        await Promise.all(
          taskIds.map((id) => api.put(`/tasks/${id}`, { status: newTaskStatus })),
        )
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units', unitId, 'stages'] })
      queryClient.invalidateQueries({ queryKey: ['stages'] })
    },
  })
}
