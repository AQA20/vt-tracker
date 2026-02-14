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
import { Progress } from '@/components/ui/progress'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useUnitStagesQuery } from '@/hooks/queries/useUnitStagesQuery'
import { ExpandableDescriptionCell, ExpandableDescriptionCard } from './ExpandableDescription'
import { StageWorkflow } from './StageWorkflow'
import { EmptyUnitsState } from './EmptyUnitsState'

interface ProjectUnitsTableProps {
  units: Unit[]
  projectId: string
}

export function ProjectUnitsTable({ units, projectId }: ProjectUnitsTableProps) {
  if (units.length === 0) return <EmptyUnitsState />

  return (
    <div className="space-y-4">
      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {units.map((unit) => (
          <ProjectUnitCard key={unit.id} unit={unit} />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12.5"></TableHead>
              <TableHead>Equipment Number</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="w-45">Installation</TableHead>
              <TableHead className="w-45">Commissioning</TableHead>
              <TableHead className="w-45">Average Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => (
              <ProjectUnitRow key={unit.id} unit={unit} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  ProjectUnitCard – mobile card                                     */
/* ------------------------------------------------------------------ */

function ProjectUnitCard({ unit }: { unit: Unit }) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: stages } = useUnitStagesQuery(unit.id, isOpen)

  const enrichedUnit = useMemo(
    () => (stages ? { ...unit, stages } : unit),
    [unit, stages],
  )

  const toggleOpen = () => {
    setIsOpen(!isOpen)
  }

  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return (
      <div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden')}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="block font-bold text-sm">{unit.equipment_number}</span>
            <Badge variant="outline" className="text-[10px] px-1.5 h-4">{unit.category}</Badge>
          </div>
          <div className="mb-2 text-xs text-muted-foreground">
            <div><span className="font-semibold">SL Ref:</span> {unit.sl_reference_no || '-'}</div>
            <div><span className="font-semibold">FL Unit Name:</span> {unit.fl_unit_name || '-'}</div>
            <ExpandableDescriptionCard description={unit.unit_description} />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-2">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Installation</span>
              <div className="flex items-center gap-2">
                <Progress value={Number(unit.installation_progress || 0)} className="h-1.5" />
                <span className="text-[10px] font-medium w-7 text-right">{Number(unit.installation_progress || 0).toFixed(0)}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Commissioning</span>
              <div className="flex items-center gap-2">
                <Progress value={Number(unit.commissioning_progress || 0)} className="h-1.5" />
                <span className="text-[10px] font-medium w-7 text-right">{Number(unit.commissioning_progress || 0).toFixed(0)}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-primary uppercase font-bold tracking-tight">Average</span>
              <div className="flex items-center gap-2">
                <Progress value={Number(unit.progress_percent || 0)} className="h-1.5" />
                <span className="text-[10px] font-bold text-primary w-7 text-right">{Number(unit.progress_percent || 0).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // SSR / fallback
  return (
    <div
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden',
        isOpen && 'ring-1 ring-primary/20',
      )}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={toggleOpen}
          >
            <span className="font-bold text-sm">{unit.equipment_number}</span>
            <Badge variant="outline" className="text-[10px] px-1.5 h-4">
              {unit.category}
            </Badge>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
              Installation
            </span>
            <div className="flex items-center gap-2">
              <Progress
                value={Number(unit.installation_progress || 0)}
                className="h-1.5"
              />
              <span className="text-[10px] font-medium w-7 text-right">
                {Number(unit.installation_progress || 0).toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
              Commissioning
            </span>
            <div className="flex items-center gap-2">
              <Progress
                value={Number(unit.commissioning_progress || 0)}
                className="h-1.5"
              />
              <span className="text-[10px] font-medium w-7 text-right">
                {Number(unit.commissioning_progress || 0).toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-primary uppercase font-bold tracking-tight">
              Average
            </span>
            <div className="flex items-center gap-2">
              <Progress
                value={Number(unit.progress_percent || 0)}
                className="h-1.5"
              />
              <span className="text-[10px] font-bold text-primary w-7 text-right">
                {Number(unit.progress_percent || 0).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
        {isOpen && (
          <div className="border-t bg-zinc-50/50 dark:bg-zinc-900/50 p-4">
            <StageWorkflow unit={enrichedUnit} />
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  ProjectUnitRow – desktop table row                                */
/* ------------------------------------------------------------------ */

function ProjectUnitRow({ unit }: { unit: Unit }) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: stages } = useUnitStagesQuery(unit.id, isOpen)

  const enrichedUnit = useMemo(
    () => (stages ? { ...unit, stages } : unit),
    [unit, stages],
  )

  const toggleOpen = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <TableRow
        className={cn(
          'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900',
          isOpen && 'bg-zinc-50 dark:bg-zinc-900',
        )}
        onClick={toggleOpen}
      >
        <TableCell>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </TableCell>
        <TableCell className="font-medium">{unit.equipment_number}</TableCell>
        <TableCell className="max-w-37.5 truncate">{unit.unit_type}</TableCell>
        <TableCell><Badge variant="outline">{unit.category}</Badge></TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Progress value={Number(unit.installation_progress || 0)} className="h-2" />
            <span className="text-xs text-muted-foreground w-10">{Number(unit.installation_progress || 0).toFixed(0)}%</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Progress value={Number(unit.commissioning_progress || 0)} className="h-2" />
            <span className="text-xs text-muted-foreground w-10">{Number(unit.commissioning_progress || 0).toFixed(0)}%</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Progress value={Number(unit.progress_percent || 0)} className="h-2" />
            <span className="text-xs text-muted-foreground w-10">{Number(unit.progress_percent || 0).toFixed(0)}%</span>
          </div>
        </TableCell>
      </TableRow>
      {isOpen && (
        <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50/50">
          <TableCell colSpan={8} className="p-0">
            <div className="p-4">
              <div className="mb-2 grid grid-cols-1 gap-1 text-xs">
                <div><span className="font-semibold text-muted-foreground">SL Ref:</span> {unit.sl_reference_no || '-'}</div>
                <div><span className="font-semibold text-muted-foreground">FL Unit Name:</span> {unit.fl_unit_name || '-'}</div>
                <div><span className="font-semibold text-muted-foreground">Type:</span> {unit.unit_type || '-'}</div>
                <ExpandableDescriptionCard description={unit.unit_description} />
              </div>
              <StageWorkflow unit={enrichedUnit} />
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
