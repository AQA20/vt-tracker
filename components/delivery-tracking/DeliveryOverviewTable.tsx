'use client'

import { Unit, DeliveryGroup, DeliveryMilestone } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface DeliveryOverviewTableProps {
  units: Unit[]
}

export function DeliveryOverviewTable({ units }: DeliveryOverviewTableProps) {
  // Key milestone code to show in the overview (Material in Agreed Location)
  const OVERVIEW_MILESTONE = '3s'

  // Determine all group numbers present across all units
  const allGroupNumbers = Array.from(
    new Set(
      units.flatMap((u) => u.delivery_groups?.map((g) => g.group_number) || []),
    ),
  ).sort((a, b) => a - b)

  const getMilestone = (
    group: DeliveryGroup | undefined,
    code: string,
  ): DeliveryMilestone | undefined => {
    return group?.milestones?.find((m) => m.milestone_code === code)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: '2-digit',
      }).format(date)
    } catch {
      return dateString
    }
  }

  return (
    <div className="rounded-md border overflow-x-auto bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[150px] sticky left-0 z-10 bg-muted/50 border-r min-w-[150px]">
              Unit / DG
            </TableHead>
            {allGroupNumbers.map((num) => (
              <TableHead
                key={`dg-${num}-header`}
                className="text-center border-r min-w-[200px]"
                colSpan={2}
              >
                Delivery Group {num}
              </TableHead>
            ))}
          </TableRow>
          <TableRow className="bg-muted/30">
            <TableHead className="sticky left-0 z-10 bg-muted/30 border-r">
              Equipment No
            </TableHead>
            {allGroupNumbers.map((num) => (
              <>
                <TableHead
                  key={`dg-${num}-planned`}
                  className="text-xs text-center border-r font-medium"
                >
                  Planned
                </TableHead>
                <TableHead
                  key={`dg-${num}-actual`}
                  className="text-xs text-center border-r font-medium"
                >
                  Actual
                </TableHead>
              </>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {units.map((unit) => (
            <TableRow key={unit.id} className="hover:bg-muted/20">
              <TableCell className="font-medium sticky left-0 z-10 bg-white border-r whitespace-nowrap">
                {unit.equipment_number}
              </TableCell>
              {allGroupNumbers.map((num) => {
                const group = unit.delivery_groups?.find(
                  (g) => g.group_number === num,
                )
                const milestone = getMilestone(group, OVERVIEW_MILESTONE)

                return (
                  <>
                    <TableCell
                      key={`unit-${unit.id}-dg-${num}-planned`}
                      className="text-center border-r py-3"
                    >
                      <span className="text-xs">
                        {formatDate(milestone?.planned_completion_date || null)}
                      </span>
                    </TableCell>
                    <TableCell
                      key={`unit-${unit.id}-dg-${num}-actual`}
                      className="text-center border-r py-3"
                    >
                      {milestone?.actual_completion_date ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 bg-green-50 text-green-700 border-green-200"
                        >
                          {formatDate(milestone.actual_completion_date)}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
