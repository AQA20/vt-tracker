import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { getProjects, getProjectStats } from '@/services/engineeringSubmissionService'
import { Project, ProjectStats } from '@/types'

interface EngineeringProjectsResponse {
  projects: Project[]
  stats: Record<string, ProjectStats>
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export function useEngineeringProjectsQuery(params: {
  page: number
  search: string
  perPage?: number
}) {
  return useQuery({
    queryKey: queryKeys.engineering.projects(params),
    queryFn: async (): Promise<EngineeringProjectsResponse> => {
      const apiParams: Record<string, unknown> = {
        page: params.page,
        per_page: params.perPage ?? 6,
      }
      if (params.search) apiParams.search = params.search

      const response = await getProjects(apiParams)
      const responseData = response.data
      const projectsData =
        responseData.data || (Array.isArray(responseData) ? responseData : [])
      const meta = responseData.meta || {}

      // Fetch stats for each project concurrently
      const statsPromises = projectsData.map((p: Project) =>
        getProjectStats(p.id).then((res) => ({
          id: p.id,
          data: res.data.data || res.data,
        })),
      )

      const statsResults = await Promise.all(statsPromises)
      const newStats: Record<string, ProjectStats> = {}
      statsResults.forEach((res: { id: string; data: ProjectStats }) => {
        newStats[res.id] = res.data
      })

      return {
        projects: projectsData ?? [],
        stats: newStats,
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
