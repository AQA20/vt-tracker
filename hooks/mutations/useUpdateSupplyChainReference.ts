import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateSupplyChainReference } from '@/services/deliveryTrackingService'
import { UpdateSupplyChainReferencePayload } from '@/types'

export function useUpdateSupplyChainReference() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      deliveryGroupId,
      payload,
    }: {
      deliveryGroupId: string
      payload: UpdateSupplyChainReferencePayload
    }) => updateSupplyChainReference(deliveryGroupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] })
      queryClient.invalidateQueries({ queryKey: ['delivery'] })
    },
  })
}
