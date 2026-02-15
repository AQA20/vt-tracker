import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createDeliveryGroup } from '@/services/deliveryTrackingService'
import { CreateDeliveryGroupPayload } from '@/types'
import { queryKeys } from '@/lib/queryKeys'

export function useCreateDeliveryGroup(unitId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateDeliveryGroupPayload) =>
      createDeliveryGroup(unitId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.units.deliveryGroups(unitId),
      })
      queryClient.invalidateQueries({ queryKey: ['delivery'] })
    },
  })
}
