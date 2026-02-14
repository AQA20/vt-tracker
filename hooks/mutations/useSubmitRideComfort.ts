import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { queryKeys } from '@/lib/queryKeys'

export function useSubmitRideComfort(unitId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      await api.post(`/units/${unitId}/ride-comfort`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.units.rideComfort(unitId) })
    },
  })
}
