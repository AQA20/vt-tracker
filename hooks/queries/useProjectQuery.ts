import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import api from '@/services/api'
import { Project } from '@/types'

export function useProjectQuery(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: async (): Promise<Project> => {
      const response = await api.get(`/projects/${projectId}`)
      return response.data.data || response.data
    },
    enabled: !!projectId,
  })
}
