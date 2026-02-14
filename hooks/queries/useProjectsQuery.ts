import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import api from '@/services/api'
import { Project } from '@/types'

interface ProjectsResponse {
  data: Project[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export function useProjectsQuery(params: { page: number; search: string; perPage?: number }) {
  return useQuery({
    queryKey: queryKeys.projects.list(params),
    queryFn: async (): Promise<ProjectsResponse> => {
      const apiParams: Record<string, unknown> = {
        page: params.page,
        per_page: params.perPage ?? 6,
      }
      if (params.search) apiParams.search = params.search

      const response = await api.get('/projects', { params: apiParams })
      const responseData = response.data
      const data = responseData.data || (Array.isArray(responseData) ? responseData : [])
      const meta = responseData.meta || {}

      return {
        data: data ?? [],
        meta: {
          current_page: meta.current_page ?? meta.currentPage ?? params.page,
          last_page: meta.last_page ?? meta.lastPage ?? 1,
          per_page: meta.per_page ?? meta.perPage ?? 6,
          total: meta.total ?? 0,
        },
      }
    },
  })
}
