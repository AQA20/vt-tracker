import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { getUnitDeliveryGroups } from '@/services/deliveryTrackingService'
import { DeliveryGroup } from '@/types'

export function useDeliveryGroupsQuery(unitId: string) {
  return useQuery({
    queryKey: queryKeys.units.deliveryGroups(unitId),
    queryFn: async (): Promise<DeliveryGroup[]> => {
      const response = await getUnitDeliveryGroups(unitId)
      const data = response.data.data || response.data
      return Array.isArray(data) ? data : []
    },
    enabled: !!unitId,
  })
}
