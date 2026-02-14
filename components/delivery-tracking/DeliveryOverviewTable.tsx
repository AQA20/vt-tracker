'use client'

import { Unit, DeliveryMilestone } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'

interface DeliveryOverviewTableProps {
  units: Unit[]
}


import { SquarePen } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

export function DeliveryOverviewTable({ units }: DeliveryOverviewTableProps) {
  const isMobile = useIsMobile();
  // Define constant milestones descriptions
  const MILESTONES = [
    { code: '1c', description: 'Receive approved drawings' },
    { code: '2', description: 'FL sends final specification to SL' },
    { code: '3', description: 'Point of no return, NRP' },
    {
      code: '3s',
      description:
        'Material in the place of delivery according to delivery terms',
    },
  ]

  // We want to show DG1 to DG12 as requested
  const dgNumbers = Array.from({ length: 12 }, (_, i) => i + 1)

  const getMilestone = (
    unit: Unit,
    dgNum: number,
    code: string,
  ): DeliveryMilestone | undefined => {
    const group = unit.delivery_groups?.find((g) => g.group_number === dgNum)
    return group?.milestones?.find((m) => m.milestone_code === code)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      // Special handle for the 1899-12-30 date often seen in Excel exports as null/placeholder
      if (date.getFullYear() < 1920) return '-'
      return new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date)
    } catch {
      return dateString
    }
  }

  // Determine style for actual date cell
  const getActualStyle = (
    actualDate: string | null,
    plannedDate: string | null,
  ) => {
    // If no actual date, default style
    if (!actualDate) return 'bg-background'

    try {
      const actual = new Date(actualDate)
      // Check for invalid/placeholder dates
      if (actual.getFullYear() < 1920) return 'bg-background'

      // If no planned date but actual exists, treat as success (green)
      if (!plannedDate)
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 font-medium'

      const planned = new Date(plannedDate)
      // Check for invalid/placeholder planned dates
      if (planned.getFullYear() < 1920)
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 font-medium'

      // Compare dates (reset time part for pure date comparison if needed,
      // but usually these come as YYYY-MM-DD strings so simple comparison works if parsed correctly.
      // Safe bet is to compare time values)
      if (actual.getTime() > planned.getTime()) {
        return 'bg-red-600 text-white font-bold'
      } else {
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 font-medium'
      }
    } catch {
      return 'bg-background'
    }
  }

  return (
    <div className="w-full rounded-md border overflow-x-auto bg-background shadow-sm">
      <Table className="border-collapse table-auto w-full">
        <TableHeader className="sticky top-0 z-40">
          {/* Row 1: FL Elevator name/number */}
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead
              className={
                `sticky left-0 z-50 bg-muted border-r border-b font-bold text-foreground border-border ` +
                (isMobile ? 'min-w-[80px] w-[80px]' : 'min-w-[300px] w-[300px]')
              }
              colSpan={2}
            >
              FL Elevator name/number
            </TableHead>
            {units.map((unit) => (
              <TableHead
                key={`unit-${unit.id}-fl-name`}
                className={
                  `text-center border-r border-b border-border font-medium text-muted-foreground bg-background ` +
                  (isMobile ? 'min-w-[60px] w-[60px]' : 'min-w-[200px]')
                }
                colSpan={2}
              >
                {unit.fl_unit_name || '-'}
              </TableHead>
            ))}
          </TableRow>

          {/* Row 2: KONE equipment no. (mobile: Eq. No.) */}
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead
              className="sticky left-0 z-50 bg-muted border-r border-b font-bold text-foreground border-border"
              colSpan={2}
            >
              {isMobile ? 'Eq. No.' : 'KONE equipment no.'}
            </TableHead>
            {units.map((unit) => (
              <TableHead
                key={`unit-${unit.id}-equip-no`}
                className={
                  `text-center border-r border-b border-border bg-background ` +
                  (isMobile ? 'min-w-[60px] w-[60px]' : 'min-w-[200px]')
                }
                colSpan={2}
              >
                <div className="flex items-center justify-center gap-2 py-2">
                  <span className="text-muted-foreground">
                    {unit.equipment_number || '-'}
                  </span>
                  <Link
                    href={`/dashboard/delivery-tracking/${unit.project_id}/units/${unit.id}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <SquarePen className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </TableHead>
            ))}
          </TableRow>

          {/* Row 3: SL Reference no. (mobile: Ref. No.) */}
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead
              className="sticky left-0 z-50 bg-muted border-r border-b font-bold text-foreground border-border"
              colSpan={2}
            >
              {isMobile ? 'Ref. No.' : 'SL Reference no.'}
            </TableHead>
            {units.map((unit) => (
              <TableHead
                key={`unit-${unit.id}-sl-ref`}
                className={
                  `text-center border-r border-b border-border font-medium text-muted-foreground bg-background ` +
                  (isMobile ? 'min-w-[60px] w-[60px]' : 'min-w-[200px]')
                }
                colSpan={2}
              >
                {unit.sl_reference_no || '-'}
              </TableHead>
            ))}
          </TableRow>

          {/* Row 4: Planned/Actual Labels */}
          <TableRow className="bg-muted hover:bg-muted">
            <TableHead
              className="sticky left-0 z-50 bg-muted border-r border-b border-border"
              colSpan={2}
            ></TableHead>
            {units.map((unit) => (
              <>
                <TableHead
                  key={`unit-${unit.id}-planned-header`}
                  className="text-[10px] uppercase tracking-wider text-center border-r border-b border-border font-bold text-foreground min-w-[100px]"
                >
                  Planned
                </TableHead>
                <TableHead
                  key={`unit-${unit.id}-actual-header`}
                  className="text-[10px] uppercase tracking-wider text-center border-r border-b border-border font-bold text-foreground min-w-[100px]"
                >
                  Actual
                </TableHead>
              </>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {dgNumbers.map((dgNum) => (
            <>
              {MILESTONES.map((milestone, mIdx) => (
                <TableRow
                  key={`dg-${dgNum}-milestone-${milestone.code}`}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {/* Vertical DG label (merges 4 rows) */}
                  {mIdx === 0 && (
                    <TableCell
                      rowSpan={4}
                      className="sticky left-0 z-30 bg-muted border-r border-b border-border font-black text-center text-xl text-foreground w-[50px] p-0"
                    >
                      <div className="flex flex-col items-center justify-center leading-none tracking-widest uppercase">
                        <span>D</span>
                        <span>G</span>
                        <span className="mt-2">{dgNum}</span>
                      </div>
                    </TableCell>
                  )}

                  {/* Milestone description (mobile: code only) */}
                  <TableCell className={
                    `font-semibold border-r border-b border-border text-xs whitespace-normal sticky left-[50px] z-30 bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-200 ` +
                    (isMobile ? 'min-w-[40px] w-[40px]' : 'min-w-[250px]')
                  }>
                    {isMobile ? milestone.code : `${milestone.code} (${milestone.description})`}
                  </TableCell>

                  {/* Data cells for each unit */}
                  {units.map((unit) => {
                    const mData = getMilestone(unit, dgNum, milestone.code)
                    const actualStyle = getActualStyle(
                      mData?.actual_completion_date || null,
                      mData?.planned_completion_date || null,
                    )

                    return (
                      <>
                        <TableCell className={
                          `text-center border-r border-b border-border text-[11px] bg-background py-2 ` +
                          (isMobile ? 'min-w-[40px] w-[40px]' : 'min-w-[100px]')
                        }>
                          {formatDate(mData?.planned_completion_date || null)}
                        </TableCell>
                        <TableCell
                          className={
                            `text-center border-r border-b border-border text-[11px] py-2 ${actualStyle} ` +
                            (isMobile ? 'min-w-[40px] w-[40px]' : 'min-w-[100px]')
                          }
                        >
                          {formatDate(mData?.actual_completion_date || null)}
                        </TableCell>
                      </>
                    )
                  })}
                </TableRow>
              ))}
              {/* Spacer row between DGs */}
              <TableRow className="h-4 bg-muted">
                <TableCell
                  colSpan={2 + units.length * 2}
                  className="p-0 border-b border-border"
                ></TableCell>
              </TableRow>
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
