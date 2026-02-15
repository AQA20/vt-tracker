import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { getDeliveryModules } from '@/services/deliveryGroupItemService'
import { DeliveryModule } from '@/types'

export function useDeliveryModulesQuery() {
  return useQuery({
    queryKey: queryKeys.delivery.modules,
    queryFn: async (): Promise<DeliveryModule[]> => {
      const res = await getDeliveryModules()
      return res.data.data
    },
  })
}
