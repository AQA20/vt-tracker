import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { getProjects } from '@/services/engineeringSubmissionService'
import { Project } from '@/types'

interface DeliveryProjectsResponse {
  data: Project[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export function useDeliveryProjectsQuery(params: {
  page: number
  search: string
  perPage?: number
}) {
  return useQuery({
    queryKey: queryKeys.delivery.projects(params),
    queryFn: async (): Promise<DeliveryProjectsResponse> => {
      const apiParams: Record<string, unknown> = {
        page: params.page,
        per_page: params.perPage ?? 6,
        include: 'units,units.deliveryGroups,units.deliveryGroups.milestones',
      }
      if (params.search) apiParams.search = params.search

      const response = await getProjects(apiParams)
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
