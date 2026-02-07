'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Unit, StatusUpdate } from '@/types'
import { getProjectUnits } from '@/services/engineeringSubmissionService'
import { cn } from '@/lib/utils'

interface CopyStatusModalProps {
  isOpen: boolean
  onClose: () => void
  onCopy: (sourceUnitId: string, sourceStatusKey: string) => Promise<void>
  projectId: string
  currentUnitId: string
  targetCategory: string
  targetCategoryLabel: string
}

export function CopyStatusModal({
  isOpen,
  onClose,
  onCopy,
  projectId,
  currentUnitId,
  targetCategory,
  targetCategoryLabel,
}: CopyStatusModalProps) {
  const [units, setUnits] = useState<Unit[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)
  const [selectedStatusKey, setSelectedStatusKey] =
    useState<string>(targetCategory)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchUnits = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getProjectUnits(projectId)
      const unitsData = res.data.data || res.data
      setUnits(unitsData.filter((u: Unit) => u.id !== currentUnitId))
    } catch (error) {
      console.error('Failed to fetch units for copy modal', error)
    } finally {
      setIsLoading(false)
    }
  }, [projectId, currentUnitId])

  useEffect(() => {
    if (isOpen && projectId) {
      fetchUnits()
    }
  }, [isOpen, projectId, fetchUnits])

  const handleCopy = async () => {
    if (!selectedUnitId || !selectedStatusKey) return
    setIsSubmitting(true)
    try {
      await onCopy(selectedUnitId, selectedStatusKey)
      onClose()
    } catch (error) {
      console.error('Copy failed', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const technicalCategories = [
    { key: 'tech', label: 'Tech Sub' },
    { key: 'sample', label: 'Sample' },
    { key: 'layout', label: 'Layout' },
    { key: 'car_m_dwg', label: 'Car M DWG' },
    { key: 'cop_dwg', label: 'COP DWG' },
    { key: 'landing_dwg', label: 'Landing DWG' },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] flex flex-col p-4 sm:p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg sm:text-xl">
            Copy Status to {targetCategoryLabel}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Select a unit and the specific status you want to copy from. This
            will overwrite all data for {targetCategoryLabel} on the current
            unit.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 border-y py-2">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="p-2 sm:p-4 space-y-6">
              <RadioGroup
                value={selectedUnitId || ''}
                onValueChange={setSelectedUnitId}
                className="space-y-4"
              >
                {units.map((unit) => (
                  <div
                    key={unit.id}
                    className={cn(
                      'flex flex-col gap-3 p-3 sm:p-4 rounded-lg border transition-all cursor-pointer hover:border-primary/50',
                      selectedUnitId === unit.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-zinc-200 dark:border-zinc-800',
                    )}
                    onClick={() => setSelectedUnitId(unit.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem
                          value={unit.id}
                          id={unit.id}
                          className="mt-1"
                        />
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <Label
                            htmlFor={unit.id}
                            className="font-bold text-sm cursor-pointer"
                          >
                            {unit.equipment_number}
                          </Label>
                          <Badge
                            variant="outline"
                            className="text-[9px] sm:text-[10px] h-4 w-fit"
                          >
                            {unit.category}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3 ml-7">
                      {technicalCategories.map((cat) => {
                        const update = getTechnicalUpdate(unit, cat.key)
                        const status = update?.status
                        const isSelectedStatus =
                          selectedUnitId === unit.id &&
                          selectedStatusKey === cat.key

                        return (
                          <div
                            key={cat.key}
                            className={cn(
                              'flex flex-col gap-1.5 p-2 rounded border text-left cursor-pointer transition-colors',
                              isSelectedStatus
                                ? 'border-primary bg-primary/10 shadow-sm'
                                : 'border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800',
                            )}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedUnitId(unit.id)
                              setSelectedStatusKey(cat.key)
                            }}
                          >
                            <span className="text-[10px] font-bold uppercase text-muted-foreground whitespace-nowrap">
                              {cat.label}
                            </span>
                            <div className="flex flex-col gap-1">
                              <Badge
                                variant={getStatusBadgeVariant(status)}
                                className="w-fit text-[9px] px-1.5 h-4"
                              >
                                {getStatusLabel(status)}
                              </Badge>
                              {renderTechnicalDetails(update)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </RadioGroup>

              {/* Warning inside ScrollArea with enough bottom padding */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="text-[10px] sm:text-xs leading-relaxed">
                  <p className="font-bold mb-1 uppercase tracking-wider">
                    Warning
                  </p>
                  This will permanently overwrite the current **
                  {targetCategoryLabel}** status, all approvals, revisions, and
                  the PDF attachment on this unit. This action cannot be undone.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 sm:pt-6 space-y-4">
          {/* The warning message was moved inside the scrollable area */}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleCopy}
              disabled={!selectedUnitId || isSubmitting}
              className="w-full sm:w-auto font-bold capitalize"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Copying...
                </>
              ) : (
                `Overwrite & Copy Status`
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Helpers (replicated from units-table.tsx)
function getTechnicalUpdate(unit: Unit, key: string) {
  if (!unit) return undefined
  let updates = unit.status_updates || unit.statusUpdates || []
  if (updates && !Array.isArray(updates) && 'data' in updates) {
    updates = (updates as { data: StatusUpdate[] }).data
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
      <div className="text-[8px] text-muted-foreground font-medium leading-tight whitespace-nowrap">
        REV{String(lastRev.revision_number).padStart(2, '0')}{' '}
        {formatDate(lastRev.revision_date)}
      </div>
    )
  }

  if (status === 'approved') {
    const approvals = update.approvals || []
    if (approvals.length === 0) return null
    const lastApproval = approvals[approvals.length - 1]
    const label = lastApproval.approval_code === 'A' ? 'Code A' : 'Code B'
    return (
      <div className="text-[8px] text-muted-foreground font-medium leading-tight">
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
  | 'success'
  | 'info'
  | 'destructive'
  | 'warning'
  | 'secondary'
  | 'outline'
  | 'default' {
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
