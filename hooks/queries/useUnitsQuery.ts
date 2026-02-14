import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import api from '@/services/api'
import { Unit } from '@/types'

interface UnitsResponse {
  data: Unit[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export function useUnitsQuery(
  projectId: string,
  params: { page: number; search: string; perPage?: number },
) {
  return useQuery({
    queryKey: queryKeys.units.list(projectId, params),
    queryFn: async (): Promise<UnitsResponse> => {
      const response = await api.get(`/projects/${projectId}/units`, {
        params: {
          page: params.page,
          search: params.search || undefined,
          per_page: params.perPage,
          include:
            'statusUpdates,status_updates,statusUpdates.revisions,status_updates.revisions,statusUpdates.approvals,status_updates.approvals,stages.template,stages.tasks.template',
        },
      })
      const data = response.data.data || response.data
      const meta = response.data.meta || {}

      return {
        data: data ?? [],
        meta: {
          current_page: meta.current_page ?? meta.currentPage ?? params.page,
          last_page: meta.last_page ?? meta.lastPage ?? 1,
          per_page: meta.per_page ?? meta.perPage ?? 5,
          total: meta.total ?? 0,
        },
      }
    },
    enabled: !!projectId,
  })
}
