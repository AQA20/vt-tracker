import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import api from '@/services/api'
import { Stage } from '@/types'

export function useUnitStagesQuery(unitId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.units.stages(unitId),
    queryFn: async (): Promise<Stage[]> => {
      const response = await api.get(`/units/${unitId}/stages`)
      let stages = response.data.data || response.data

      if (!Array.isArray(stages)) {
        stages =
          typeof stages === 'object' && stages !== null
            ? Object.values(stages)
            : []
      }

      return stages
    },
    enabled: !!unitId && enabled,
  })
}
