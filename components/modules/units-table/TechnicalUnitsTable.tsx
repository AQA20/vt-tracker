'use client'

import { Unit } from '@/types'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SquarePen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  getTechnicalUpdate,
  renderTechnicalDetails,
  getStatusBadgeVariant,
  getStatusLabel,
  getCategoryLabel,
} from './helpers'
import { DeleteUnitButton } from './DeleteUnitButton'
import { EmptyUnitsState } from './EmptyUnitsState'
import { TechnicalUnitsTableSkeleton } from '@/components/skeletons/TechnicalUnitsTableSkeleton'

const TECHNICAL_KEYS = ['tech', 'sample', 'layout', 'car_m_dwg', 'cop_dwg', 'landing_dwg'] as const

interface TechnicalUnitsTableProps {
  units: Unit[]
  projectId: string
  showActions?: boolean
  isLoading?: boolean
}

export function TechnicalUnitsTable({
  units,
  projectId,
  showActions = true,
  isLoading = false,
}: TechnicalUnitsTableProps) {
  if (isLoading) {
    return <TechnicalUnitsTableSkeleton showActions={showActions} />
  }

  if (units.length === 0) return <EmptyUnitsState />

  return (
    <div className="space-y-4">
      {/* Card View – mobile & tablet */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:hidden">
        {units.map((unit) => (
          <TechnicalUnitCard
            key={unit.id}
            unit={unit}
            projectId={projectId}
            showActions={showActions}
          />
        ))}
      </div>

      {/* Table View – desktop */}
      <div className="hidden lg:block rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipment Number</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Tech Sub</TableHead>
              <TableHead className="text-center">Sample</TableHead>
              <TableHead className="text-center">Layout</TableHead>
              <TableHead className="text-center">Car M DWG</TableHead>
              <TableHead className="text-center">COP DWG</TableHead>
              <TableHead className="text-center">Landing DWG</TableHead>
              {showActions && (
                <TableHead className="text-right w-25">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => (
              <TechnicalUnitRow
                key={unit.id}
                unit={unit}
                projectId={projectId}
                showActions={showActions}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  TechnicalUnitCard – mobile card                                   */
/* ------------------------------------------------------------------ */

function TechnicalUnitCard({
  unit,
  projectId,
  showActions = true,
}: {
  unit: Unit
  projectId: string
  showActions?: boolean
}) {
  return (
    <div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden')}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="block font-bold text-sm">{unit.equipment_number}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 h-4">{unit.category}</Badge>
          {showActions && (
            <div className="flex items-center gap-1 ml-2">
              <Link href={`/dashboard/engineering-submissions/${projectId}/units/${unit.id}/edit`}>
                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                  <SquarePen className="h-4 w-4" />
                </Button>
              </Link>
              <DeleteUnitButton unitId={unit.id} projectId={projectId} onDeleted={() => {}} />
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 border-t pt-4">
          {TECHNICAL_KEYS.map((key) => {
            const update = getTechnicalUpdate(unit, key)
            const status = update?.status
            return (
              <div key={key} className="flex flex-col gap-1">
                <span className="text-[9px] uppercase font-bold text-muted-foreground">{getCategoryLabel(key)}</span>
                <Badge variant={getStatusBadgeVariant(status)} className="w-fit text-[10px] px-1.5 h-5">{getStatusLabel(status)}</Badge>
                {renderTechnicalDetails(update)}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  TechnicalUnitRow – desktop table row                              */
/* ------------------------------------------------------------------ */

function TechnicalUnitRow({
  unit,
  projectId,
  showActions = true,
}: {
  unit: Unit
  projectId: string
  showActions?: boolean
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{unit.equipment_number}</TableCell>
      <TableCell><Badge variant="outline">{unit.category}</Badge></TableCell>
      {TECHNICAL_KEYS.map((key) => {
        const update = getTechnicalUpdate(unit, key)
        const status = update?.status
        return (
          <TableCell key={key} className="text-center">
            <div className="flex flex-col items-center gap-1">
              <Badge variant={getStatusBadgeVariant(status)} className="text-[10px] px-2">{getStatusLabel(status)}</Badge>
              {renderTechnicalDetails(update)}
            </div>
          </TableCell>
        )
      })}
      {showActions && (
        <TableCell className="text-right">
          <div className="flex justify-end items-center gap-1">
            <Link
              href={`/dashboard/engineering-submissions/${projectId}/units/${unit.id}/edit`}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer"
              >
                <SquarePen className="h-4 w-4" />
              </Button>
            </Link>
            <DeleteUnitButton unitId={unit.id} projectId={projectId} onDeleted={() => {}} />
          </div>
        </TableCell>
      )}
    </TableRow>
  )
}

