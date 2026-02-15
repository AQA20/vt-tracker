import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useProjectQuery } from '@/hooks/queries/useProjectQuery'
import { useUnitDetailQuery } from '@/hooks/queries/useUnitDetailQuery'
import { useDeliveryGroupsQuery } from '@/hooks/queries/useDeliveryGroupsQuery'
import { queryKeys } from '@/lib/queryKeys'
import { DeliveryMilestone } from '@/types'

export function useUnitDelivery(projectId: string, unitId: string) {
  const queryClient = useQueryClient()

  const [selectedMilestone, setSelectedMilestone] =
    useState<DeliveryMilestone | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const { data: project, isLoading: isProjectLoading } =
    useProjectQuery(projectId)

  const { data: unitDetail, isLoading: isUnitLoading } =
    useUnitDetailQuery(unitId)

  const { data: groups = [], isLoading: isGroupsLoading } =
    useDeliveryGroupsQuery(unitId)

  const isLoading = isProjectLoading || isUnitLoading || isGroupsLoading

  const handleMilestoneClick = (milestone: DeliveryMilestone) => {
    setSelectedMilestone(milestone)
    setEditDialogOpen(true)
  }

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.units.detail(unitId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.units.deliveryGroups(unitId) })
  }

  return {
    project: project ?? null,
    unit: unitDetail?.unit ?? null,
    latestRevision: unitDetail?.latestRevision ?? null,
    groups,
    isLoading,
    selectedMilestone,
    editDialogOpen,
    setEditDialogOpen,
    createDialogOpen,
    setCreateDialogOpen,
    handleMilestoneClick,
    refreshAll,
  }
}
