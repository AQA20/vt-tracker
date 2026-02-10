'use client'

import { Unit, Stage, StatusUpdate } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  SquarePen,
  Trash2,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useProjectStore } from '@/store/useProjectStore'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface UnitsTableProps {
  units: Unit[]
  projectId: string
  view?: 'standard' | 'technical'
  showActions?: boolean
}

export function UnitsTable({
  units,
  projectId,
  view = 'standard',
  showActions = false,
}: UnitsTableProps) {
  if (units.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg bg-zinc-50 dark:bg-zinc-900 border-dashed">
        <p className="text-muted-foreground">No units added yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {units.map((unit) => (
          <UnitCard
            key={unit.id}
            unit={unit}
            projectId={projectId}
            view={view}
            showActions={showActions}
          />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {view === 'standard' && (
                <TableHead className="w-[50px]"></TableHead>
              )}
              <TableHead>Equipment Number</TableHead>
              {view === 'standard' ? (
                <>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-[180px]">Installation</TableHead>
                  <TableHead className="w-[180px]">Commissioning</TableHead>
                  <TableHead className="w-[180px]">Average Progress</TableHead>
                  <TableHead className="text-right">Stage</TableHead>
                </>
              ) : (
                <>
                  <TableHead className="text-center">Tech Sub</TableHead>
                  <TableHead className="text-center">Sample</TableHead>
                  <TableHead className="text-center">Layout</TableHead>
                  <TableHead className="text-center">Car M DWG</TableHead>
                  <TableHead className="text-center">COP DWG</TableHead>
                  <TableHead className="text-center">Landing DWG</TableHead>
                </>
              )}
              {showActions && (
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => (
              <UnitRow
                key={unit.id}
                unit={unit}
                projectId={projectId}
                view={view}
                showActions={showActions}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function UnitCard({
  unit,
  projectId,
  view = 'standard',
  showActions = false,
}: {
  unit: Unit
  projectId: string
  view?: 'standard' | 'technical'
  showActions?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const { fetchUnitStages } = useProjectStore()

  const toggleOpen = async () => {
    if (view === 'technical') return
    if (!isOpen && (!unit.stages || unit.stages.length === 0)) {
      await fetchUnitStages(unit.id)
    }
    setIsOpen(!isOpen)
  }

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
            {view === 'standard' &&
              (isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              ))}
          </div>
          {showActions && (
            <div className="flex items-center gap-1">
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
              <DeleteUnitButton unitId={unit.id} onDeleted={() => {}} />
            </div>
          )}
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
        {view === 'technical' && (
          <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-4">
            {[
              'tech',
              'sample',
              'layout',
              'car_m_dwg',
              'cop_dwg',
              'landing_dwg',
            ].map((key) => {
              const update = getTechnicalUpdate(unit, key)
              const status = update?.status
              return (
                <div key={key} className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground">
                    {getCategoryLabel(key)}
                  </span>
                  <Badge
                    variant={getStatusBadgeVariant(status)}
                    className="w-fit text-[10px] px-1.5 h-5"
                  >
                    {getStatusLabel(status)}
                  </Badge>
                  {renderTechnicalDetails(update)}
                </div>
              )
            })}
          </div>
        )}
      </div>
      {view === 'standard' && isOpen && (
        <div className="border-t bg-zinc-50/50 dark:bg-zinc-900/50 p-4">
          <StageWorkflow unit={unit} />
        </div>
      )}
    </div>
  )
}

function UnitRow({
  unit,
  projectId,
  view = 'standard',
  showActions = false,
}: {
  unit: Unit
  projectId: string
  view?: 'standard' | 'technical'
  showActions?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const { fetchUnitStages } = useProjectStore()

  const toggleOpen = async () => {
    if (view === 'technical') return
    if (!isOpen && (!unit.stages || unit.stages.length === 0)) {
      await fetchUnitStages(unit.id)
    }
    setIsOpen(!isOpen)
  }

  const completedStages = Array.isArray(unit.stages)
    ? unit.stages.filter((s) => s.status === 'completed').length
    : 0

  return (
    <>
      <TableRow
        className={cn(
          view === 'standard' &&
            'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900',
          isOpen && 'bg-zinc-50 dark:bg-zinc-900',
        )}
        onClick={toggleOpen}
      >
        {view === 'standard' && (
          <TableCell>
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </TableCell>
        )}
        <TableCell className="font-medium">{unit.equipment_number}</TableCell>
        {view === 'standard' ? (
          <>
            <TableCell className="max-w-[150px] truncate">
              {unit.unit_type}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{unit.category}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Progress
                  value={Number(unit.installation_progress || 0)}
                  className="h-2"
                />
                <span className="text-xs text-muted-foreground w-10">
                  {Number(unit.installation_progress || 0).toFixed(0)}%
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Progress
                  value={Number(unit.commissioning_progress || 0)}
                  className="h-2"
                />
                <span className="text-xs text-muted-foreground w-10">
                  {Number(unit.commissioning_progress || 0).toFixed(0)}%
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Progress
                  value={Number(unit.progress_percent || 0)}
                  className="h-2"
                />
                <span className="text-xs text-muted-foreground w-10">
                  {Number(unit.progress_percent || 0).toFixed(0)}%
                </span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Badge variant={completedStages === 8 ? 'default' : 'secondary'}>
                {completedStages === 8
                  ? 'Complete'
                  : `Stage ${completedStages + 1}/8`}
              </Badge>
            </TableCell>
          </>
        ) : (
          <>
            {[
              'tech',
              'sample',
              'layout',
              'car_m_dwg',
              'cop_dwg',
              'landing_dwg',
            ].map((key) => {
              const update = getTechnicalUpdate(unit, key)
              const status = update?.status
              return (
                <TableCell key={key} className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Badge
                      variant={getStatusBadgeVariant(status)}
                      className="text-[10px] px-2"
                    >
                      {getStatusLabel(status)}
                    </Badge>
                    {renderTechnicalDetails(update)}
                  </div>
                </TableCell>
              )
            })}
          </>
        )}
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
              <DeleteUnitButton unitId={unit.id} onDeleted={() => {}} />
            </div>
          </TableCell>
        )}
      </TableRow>
      {view === 'standard' && isOpen && (
        <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50/50">
          <TableCell colSpan={8} className="p-0">
            <div className="p-4">
              <StageWorkflow unit={unit} />
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

function StageWorkflow({ unit }: { unit: Unit }) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  )

  // By default, first group is expanded
  useEffect(() => {
    if (
      Array.isArray(unit.stages) &&
      unit.stages.length > 0 &&
      Object.keys(expandedGroups).length === 0
    ) {
      const firstGroup = unit.stages[0].template.progress_group || 'General'
      // SetTimeout to move the state update out of the synchronous render/effect cycle
      // This satisfies the "Avoid calling setState() directly within an effect" rule
      const timer = setTimeout(() => {
        setExpandedGroups((prev) => {
          if (Object.keys(prev).length === 0) {
            return { [firstGroup]: true }
          }
          return prev
        })
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [unit.stages, expandedGroups])

  if (!unit.stages || !Array.isArray(unit.stages) || unit.stages.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4 text-center w-full">
        Loading stages...
      </div>
    )
  }

  const groupedStages = unit.stages.reduce(
    (acc, stage) => {
      const group = stage.template.progress_group || 'General'
      if (!acc[group]) acc[group] = []
      acc[group].push(stage)
      return acc
    },
    {} as Record<string, Stage[]>,
  )

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }))
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedStages).map(([groupName, stages]) => {
        const isExpanded = expandedGroups[groupName] ?? false

        return (
          <div key={groupName} className="space-y-3">
            <button
              onClick={() => toggleGroup(groupName)}
              className="flex items-center gap-3 font-bold text-[10px] uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400 px-3 py-1 border border-zinc-200 dark:border-zinc-800 rounded-full bg-background shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group cursor-pointer"
            >
              <span>{groupName}</span>
              <ChevronDown
                className={cn(
                  'h-3 w-3 transition-transform duration-200',
                  isExpanded ? 'rotate-0' : '-rotate-90',
                )}
              />
            </button>

            {isExpanded && (
              <div className="grid gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                {stages.map((stage) => {
                  const globalIndex = Array.isArray(unit.stages)
                    ? unit.stages.findIndex((s) => s.id === stage.id)
                    : 0
                  return (
                    <StageCard
                      key={stage.id}
                      stage={stage}
                      index={globalIndex}
                      unitId={unit.id}
                    />
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function StageCard({
  stage,
  index,
  unitId,
}: {
  stage: Stage
  index: number
  unitId: string
}) {
  const { updateTaskStatus, fetchStageTasks, completeStage } = useProjectStore()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!stage.tasks && !isLoading) {
      const loadTasks = async () => {
        setIsLoading(true)
        await fetchStageTasks(stage.id)
        setIsLoading(false)
      }
      loadTasks()
    }
  }, [stage.id, stage.tasks, fetchStageTasks, isLoading])

  return (
    <div
      className={cn(
        'border rounded-lg p-3 md:p-4 bg-background',
        stage.status === 'completed'
          ? 'border-green-200 dark:border-green-900'
          : 'border-zinc-200 dark:border-zinc-800',
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-2 md:gap-3">
          <div
            className={cn(
              'h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
              stage.status === 'completed'
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
            )}
          >
            {index + 1}
          </div>
          <div>
            <h5 className="font-medium text-sm">
              {stage.template.title || stage.template.name}
            </h5>
            {stage.template.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {stage.template.description}
              </p>
            )}

            <div
              className="flex items-center space-x-2.5 mt-3 py-1.5 px-2 bg-zinc-50 dark:bg-zinc-900 rounded border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all cursor-pointer group/toggle"
              onClick={(e) => {
                e.stopPropagation()
                completeStage(unitId, stage.id, stage.status !== 'completed')
              }}
            >
              <Checkbox
                id={`complete-stage-${stage.id}`}
                checked={stage.status === 'completed'}
                onCheckedChange={(checked) =>
                  completeStage(unitId, stage.id, checked === true)
                }
                className="h-3.5 w-3.5 pointer-events-none"
              />
              <label
                htmlFor={`complete-stage-${stage.id}`}
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover/toggle:text-foreground cursor-pointer transition-colors"
              >
                {stage.status === 'completed'
                  ? 'Mark entire stage as incomplete'
                  : 'Mark entire stage as complete'}
              </label>
            </div>
          </div>
        </div>
        {stage.status === 'completed' && (
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        )}
      </div>

      <div className="space-y-2 pl-8 md:pl-9">
        {isLoading ? (
          <div className="text-xs text-muted-foreground">Loading tasks...</div>
        ) : (
          stage.tasks?.map((task) => (
            <div
              key={task.id}
              className="flex items-start space-x-3 py-2 px-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-md cursor-pointer transition-colors group"
              onClick={() =>
                updateTaskStatus(unitId, task.id, {
                  status: task.status === 'pass' ? 'pending' : 'pass',
                })
              }
            >
              <Checkbox
                id={`task-${task.id}`}
                checked={task.status === 'pass'}
                onCheckedChange={(checked) =>
                  updateTaskStatus(unitId, task.id, {
                    status: checked ? 'pass' : 'pending',
                  })
                }
                className="mt-1 pointer-events-none"
              />
              <div className="grid gap-1">
                <label
                  htmlFor={`task-${task.id}`}
                  className="text-sm font-medium leading-none cursor-pointer group-hover:text-primary transition-colors"
                >
                  {task.template.name}
                </label>
                <div className="text-xs text-muted-foreground">
                  <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded mr-2 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                    {task.template.task_code}
                  </span>
                  {task.template.description}
                </div>
              </div>
            </div>
          ))
        )}
        {!isLoading && (!stage.tasks || stage.tasks.length === 0) && (
          <div className="text-xs text-muted-foreground">No tasks found.</div>
        )}
      </div>
    </div>
  )
}

// Technical status helper functions
function getTechnicalUpdate(unit: Unit, key: string) {
  if (!unit) return undefined

  let updates = unit.status_updates || unit.statusUpdates || []

  // Handle Laravel-style .data wrapping if present
  if (updates && !Array.isArray(updates) && 'data' in updates) {
    updates = updates.data
  }

  const updatesArray = (
    Array.isArray(updates) ? updates : Object.values(updates || {})
  ) as StatusUpdate[]

  return updatesArray.find((u: StatusUpdate) => u && u.category === key)
}

function renderTechnicalDetails(update?: StatusUpdate) {
  if (!update || !update.status) return null

  const status = update.status
  const formatDate = (dateValue: string | number | null | undefined) => {
    if (!dateValue) return ''
    try {
      let date: Date
      if (typeof dateValue === 'number') {
        const timestamp = dateValue < 5000000000 ? dateValue * 1000 : dateValue
        date = new Date(timestamp)
      } else {
        const normalized = dateValue.includes(' ')
          ? dateValue.replace(' ', 'T')
          : dateValue
        date = new Date(normalized)
        if (isNaN(date.getTime())) {
          const num = Number(dateValue)
          if (!isNaN(num)) {
            const timestamp = num < 5000000000 ? num * 1000 : num
            date = new Date(timestamp)
          }
        }
      }
      if (isNaN(date.getTime())) return ''
      return date.toISOString().split('T')[0]
    } catch {
      return ''
    }
  }

  if (status === 'submitted' || status === 'rejected') {
    const statusKey = status as 'submitted' | 'rejected'
    const revisions = update.revisions?.[statusKey] || []
    if (revisions.length === 0) return null
    const lastRev = [...revisions].sort(
      (a, b) => (a.revision_number || 0) - (b.revision_number || 0),
    )[revisions.length - 1]

    return (
      <div className="text-[9px] text-muted-foreground font-medium leading-tight whitespace-nowrap">
        REV{String(lastRev.revision_number).padStart(2, '0')}{' '}
        {formatDate(lastRev.revision_date)}
      </div>
    )
  }

  if (status === 'approved') {
    const approvals = update.approvals || []
    if (approvals.length === 0) return null
    const lastApproval = approvals[approvals.length - 1]
    const label =
      lastApproval.approval_code === 'A'
        ? 'Code A approved'
        : 'Code B approved with comment'
    return (
      <div className="text-[9px] text-muted-foreground font-medium leading-tight">
        {label}
        <br />
        {formatDate(lastApproval.approved_at)}
      </div>
    )
  }

  return null
}

function getStatusBadgeVariant(
  status?: string | null,
):
  | 'default'
  | 'secondary'
  | 'outline'
  | 'destructive'
  | 'success'
  | 'warning'
  | 'info' {
  switch (status) {
    case 'approved':
      return 'success'
    case 'submitted':
      return 'info'
    case 'rejected':
      return 'destructive'
    case 'in_progress':
      return 'warning'
    default:
      return 'outline'
  }
}

function getStatusLabel(status?: string | null) {
  if (!status) return 'N/A'
  return status.replace('_', ' ').toUpperCase()
}

function getCategoryLabel(key: string) {
  const labels: Record<string, string> = {
    tech: 'Tech Sub',
    sample: 'Sample',
    layout: 'Layout',
    car_m_dwg: 'Car M DWG',
    cop_dwg: 'COP DWG',
    landing_dwg: 'Landing DWG',
  }
  return labels[key] || key
}

function DeleteUnitButton({
  unitId,
  onDeleted,
}: {
  unitId: string
  onDeleted: () => void
}) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleting(true)
    try {
      await useProjectStore.getState().deleteUnit(unitId)
      toast.success('Unit deleted successfully')
      onDeleted()
      setOpen(false)
    } catch (error) {
      console.error('Failed to delete unit', error)
      // Error is handled by global error handler but we stop loading
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              unit and all of its stages, tasks, and submission history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Unit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
