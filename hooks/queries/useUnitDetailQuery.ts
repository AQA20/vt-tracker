import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import api from '@/services/api'
import { StatusRevision, StatusUpdate, Unit } from '@/types'

interface UnitDetailData {
  unit: Unit
  latestRevision: { number: number; date: string } | null
}

export function useUnitDetailQuery(unitId: string) {
  return useQuery({
    queryKey: queryKeys.units.detail(unitId),
    queryFn: async (): Promise<UnitDetailData> => {
      const res = await api.get(
        `/units/${unitId}?include=statusUpdates.revisions,status_updates.revisions`,
      )
      const unitData: Unit = res.data.data

      const statusUpdates =
        unitData.status_updates || unitData.statusUpdates || []

      let latestRev: { number: number; date: string } | null = null

      ;(statusUpdates as StatusUpdate[]).forEach((update) => {
        const revisions = (
          Array.isArray(update.revisions)
            ? update.revisions
            : update.revisions?.submitted || []
        ) as StatusRevision[]
        revisions.forEach((rev) => {
          if (!latestRev || rev.revision_number > latestRev.number) {
            latestRev = {
              number: rev.revision_number,
              date: rev.revision_date.toString(),
            }
          }
        })
      })

      return { unit: unitData, latestRevision: latestRev }
    },
    enabled: !!unitId,
  })
}
