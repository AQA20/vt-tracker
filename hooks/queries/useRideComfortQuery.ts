import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import api from '@/services/api'

export function useRideComfortQuery(unitId: string) {
  return useQuery({
    queryKey: queryKeys.units.rideComfort(unitId),
    queryFn: async (): Promise<Record<string, unknown>> => {
      const response = await api.get(`/units/${unitId}/ride-comfort`)
      return response.data
    },
    enabled: !!unitId,
  })
}
