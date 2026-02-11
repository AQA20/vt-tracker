'use client'

import { useEffect, useState } from 'react'
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
import { updateDeliveryMilestone } from '@/services/deliveryTrackingService'

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
  const [loading, setLoading] = useState(false)
  const [actualDate, setActualDate] = useState('')
  const [plannedDate, setPlannedDate] = useState('')

  useEffect(() => {
    if (milestone) {
      setActualDate(milestone.actual_completion_date || '')
      setPlannedDate(milestone.planned_completion_date || '')
    }
  }, [milestone])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!milestone) return

    setLoading(true)
    try {
      await updateDeliveryMilestone(milestone.id, {
        actual_completion_date: actualDate || null,
        planned_completion_date: plannedDate || null,
      })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to update milestone', error)
    } finally {
      setLoading(false)
    }
  }

  if (!milestone) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
