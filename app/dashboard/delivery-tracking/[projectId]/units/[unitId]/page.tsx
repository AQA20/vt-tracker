'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DeliveryTimeline } from '@/components/delivery-tracking/DeliveryTimeline'
import { MilestoneDialog } from '@/components/delivery-tracking/MilestoneDialog'
import { CreateGroupDialog } from '@/components/delivery-tracking/CreateGroupDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Plus } from 'lucide-react'
import { useUnitDelivery } from '@/hooks/useUnitDelivery'

export default function UnitDeliveryPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const unitId = params.unitId as string

  const {
    project,
    unit,
    latestRevision,
    groups,
    isLoading,
    selectedMilestone,
    editDialogOpen,
    setEditDialogOpen,
    createDialogOpen,
    setCreateDialogOpen,
    handleMilestoneClick,
    refreshAll,
  } = useUnitDelivery(projectId, unitId)

  return (
    <div className="space-y-6 w-full">
      <div className="bg-muted/30 border rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Project Name:</span>
            <p className="font-medium text-foreground">
              {project?.name || 'Loading...'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Company Project ID:</span>
            <p className="font-medium font-mono text-foreground">
              {project?.kone_project_id || 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Revision:</span>
            <p className="font-medium text-foreground">
              {latestRevision ? `Rev ${latestRevision.number}` : 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Last Revision Date:</span>
            <p className="font-medium text-foreground">
              {latestRevision
                ? new Date(latestRevision.date).toISOString().split('T')[0]
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-muted/30 border rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">FL name/number:</span>
            <p className="font-medium text-foreground">
              {unit?.fl_unit_name || 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Equipment no.:</span>
            <p className="font-medium text-foreground">
              {unit?.equipment_number || 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">SL Reference no.:</span>
            <p className="font-medium text-foreground">
              {unit?.sl_reference_no || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/delivery-tracking/${projectId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Unit Delivery Timeline
            </h1>
            <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
              <span>Track delivery milestones.</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-8">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground border rounded-lg p-8">
          No delivery groups found for this unit.
        </div>
      ) : (
        <DeliveryTimeline
          groups={groups}
          onMilestoneClick={handleMilestoneClick}
        />
      )}

      <MilestoneDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        milestone={selectedMilestone}
        onSuccess={refreshAll}
      />

      <CreateGroupDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        unitId={unitId}
        existingGroups={groups}
        onSuccess={refreshAll}
      />
    </div>
  )
}
