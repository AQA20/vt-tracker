import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateDeliveryMilestone } from '@/services/deliveryTrackingService'
import { UpdateDeliveryMilestonePayload } from '@/types'

export function useUpdateMilestone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      milestoneId,
      payload,
    }: {
      milestoneId: string
      payload: UpdateDeliveryMilestonePayload
    }) => updateDeliveryMilestone(milestoneId, payload),
    onSuccess: () => {
      // Invalidate all delivery-group queries so the parent refreshes
      queryClient.invalidateQueries({ queryKey: ['units'] })
      queryClient.invalidateQueries({ queryKey: ['delivery'] })
    },
  })
}
