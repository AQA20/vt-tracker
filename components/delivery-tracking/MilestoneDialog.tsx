'use client'

import { useState } from 'react'
import { DeliveryMilestone } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useUpdateMilestone } from '@/hooks/mutations/useUpdateMilestone'

interface MilestoneDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  milestone: DeliveryMilestone | null
  onSuccess: () => void
}

export function MilestoneDialog({
  open,
  onOpenChange,
  milestone,
  onSuccess,
}: MilestoneDialogProps) {
  if (!milestone) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* key forces React to remount the form when the milestone changes */}
      <MilestoneForm
        key={milestone.id}
        milestone={milestone}
        onSuccess={onSuccess}
        onOpenChange={onOpenChange}
      />
    </Dialog>
  )
}

function MilestoneForm({
  milestone,
  onSuccess,
  onOpenChange,
}: {
  milestone: DeliveryMilestone
  onSuccess: () => void
  onOpenChange: (open: boolean) => void
}) {
  const updateMilestone = useUpdateMilestone()
  const [actualDate, setActualDate] = useState(
    milestone.actual_completion_date || '',
  )
  const [plannedDate, setPlannedDate] = useState(
    milestone.planned_completion_date || '',
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateMilestone.mutateAsync({
        milestoneId: milestone.id,
        payload: {
          actual_completion_date: actualDate || null,
          planned_completion_date: plannedDate || null,
        },
      })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to update milestone', error)
    }
  }

  return (
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Milestone: {milestone.milestone_code}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Milestone Name</Label>
            <div className="font-medium">{milestone.milestone_name}</div>
            <div className="text-sm text-gray-500">
              {milestone.milestone_description}
            </div>
          </div>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="planned_date" className="text-right">
                Planned Date
              </Label>
              <Input
                id="planned_date"
                type="text"
                placeholder="YYYY-MM-DD"
                pattern="\d{4}-\d{2}-\d{2}"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="actual_date" className="text-right">
                Actual Date
              </Label>
              <Input
                id="actual_date"
                type="text"
                placeholder="YYYY-MM-DD"
                pattern="\d{4}-\d{2}-\d{2}"
                value={actualDate}
                onChange={(e) => setActualDate(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={updateMilestone.isPending}>
              {updateMilestone.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
  )
}
