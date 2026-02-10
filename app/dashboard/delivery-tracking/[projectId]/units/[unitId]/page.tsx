'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getUnitDeliveryGroups } from '@/services/deliveryTrackingService'
import { DeliveryTimeline } from '@/components/delivery-tracking/DeliveryTimeline'
import { MilestoneDialog } from '@/components/delivery-tracking/MilestoneDialog'
import { CreateGroupDialog } from '@/components/delivery-tracking/CreateGroupDialog'
import { SupplyChainDialog } from '@/components/delivery-tracking/SupplyChainDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Plus, Settings } from 'lucide-react'
import { DeliveryGroup, DeliveryMilestone, SupplyChainReference } from '@/types'
import api from '@/services/api' // IDK if we have getUnit helper that includes supply chain ref?

// We need to fetch unit details to get supply chain ref
// For now I'll fetch it separately or assume it comes with groups? No, separate.

export default function UnitDeliveryPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const unitId = params.unitId as string

  const [groups, setGroups] = useState<DeliveryGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMilestone, setSelectedMilestone] =
    useState<DeliveryMilestone | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [supplyChainDialogOpen, setSupplyChainDialogOpen] = useState(false)

  const [supplyChainData, setSupplyChainData] = useState<
    SupplyChainReference | undefined
  >(undefined)

  const fetchUnitDetails = useCallback(async () => {
    // Small helper to fetch unit with relationship
    try {
      const res = await api.get(`/units/${unitId}?include=supplyChainReference`)
      setSupplyChainData(res.data.data.supply_chain_reference)
    } catch (e) {
      console.error('Failed to fetch unit details', e)
    }
  }, [unitId])

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getUnitDeliveryGroups(unitId)
      const data = response.data.data || response.data
      setGroups(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch delivery groups', error)
    } finally {
      setLoading(false)
    }
  }, [unitId])

  useEffect(() => {
    fetchGroups()
    fetchUnitDetails()
  }, [fetchUnitDetails, fetchGroups])

  const handleMilestoneClick = (milestone: DeliveryMilestone) => {
    setSelectedMilestone(milestone)
    setEditDialogOpen(true)
  }

  const refreshAll = () => {
    fetchGroups()
    fetchUnitDetails()
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/delivery-tracking/${projectId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Unit Delivery Timeline
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span>Track delivery milestones.</span>
              {supplyChainData && (
                <span className="bg-muted px-2 py-0.5 rounded text-xs font-mono">
                  DIR: {supplyChainData.dir_reference || 'N/A'} | CSP:{' '}
                  {supplyChainData.csp_reference || 'N/A'}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setSupplyChainDialogOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Edit References
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>
      </div>

      {loading ? (
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

      <SupplyChainDialog
        open={supplyChainDialogOpen}
        onOpenChange={setSupplyChainDialogOpen}
        unitId={unitId}
        initialData={supplyChainData}
        onSuccess={refreshAll}
      />
    </div>
  )
}
