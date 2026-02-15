import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { getDeliveryGroupItems } from '@/services/deliveryGroupItemService'
import { DeliveryGroupItem } from '@/types'

export function useDeliveryGroupItemsQuery(deliveryGroupId: string) {
  return useQuery({
    queryKey: queryKeys.delivery.groupItems(deliveryGroupId),
    queryFn: async (): Promise<DeliveryGroupItem[]> => {
      const res = await getDeliveryGroupItems(deliveryGroupId)
      return res.data.data
    },
    enabled: !!deliveryGroupId,
  })
}
