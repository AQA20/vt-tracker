import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { Stage } from '@/types'

export function useStageTasks(stageId: string, enabled = true) {
  return useQuery({
    queryKey: ['stages', stageId, 'tasks'],
    queryFn: async (): Promise<Stage['tasks']> => {
      const response = await api.get(`/stages/${stageId}/tasks`)
      let tasks = response.data.data || response.data

      if (!Array.isArray(tasks)) {
        tasks =
          typeof tasks === 'object' && tasks !== null
            ? Object.values(tasks)
            : []
      }

      return tasks
    },
    enabled: !!stageId && enabled,
  })
}
