import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { getProjectUnits } from '@/services/engineeringSubmissionService'
import { Unit } from '@/types'

interface DeliveryUnitsResponse {
  data: Unit[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export function useDeliveryProjectUnitsQuery(
  projectId: string,
  params: { page: number; search: string; perPage?: number },
) {
  return useQuery({
    queryKey: queryKeys.delivery.units(projectId, params),
    queryFn: async (): Promise<DeliveryUnitsResponse> => {
      const response = await getProjectUnits(projectId, {
        page: params.page,
        per_page: params.perPage || 10,
        search: params.search || undefined,
      })

      const data = response.data.data || response.data
      const meta = response.data.meta || {}

      return {
        data: Array.isArray(data) ? data : [],
        meta: {
          current_page: meta.current_page ?? meta.currentPage ?? params.page,
          last_page: meta.last_page ?? meta.lastPage ?? 1,
          per_page: meta.per_page ?? meta.perPage ?? params.perPage ?? 10,
          total: meta.total ?? 0,
        },
      }
    },
    enabled: !!projectId,
  })
}
