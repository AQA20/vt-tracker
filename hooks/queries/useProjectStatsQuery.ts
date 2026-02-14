import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import api from '@/services/api'
import { ProjectStats } from '@/types'

export function useProjectStatsQuery(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.stats(projectId),
    queryFn: async (): Promise<ProjectStats> => {
      const response = await api.get(`/projects/${projectId}/stats`)
      return response.data.data || response.data
    },
    enabled: !!projectId,
  })
}
