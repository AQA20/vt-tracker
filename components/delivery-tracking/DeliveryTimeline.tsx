'use client'

import { useState } from 'react'
import { DeliveryGroup, DeliveryMilestone } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Edit } from 'lucide-react'
import { SupplyChainDialog } from './SupplyChainDialog'

interface DeliveryTimelineProps {
  groups: DeliveryGroup[]
  onMilestoneClick?: (milestone: DeliveryMilestone) => void
}

export function DeliveryTimeline({
  groups,
  onMilestoneClick,
}: DeliveryTimelineProps) {
  const [selectedGroup, setSelectedGroup] = useState<DeliveryGroup | null>(null)
  const [supplyChainDialogOpen, setSupplyChainDialogOpen] = useState(false)

  const getStatusColor = (status: DeliveryMilestone['status']) => {
    switch (status) {
      case 'completed-on-time':
        return 'bg-green-500'
      case 'completed-late':
        return 'bg-orange-500'
      case 'overdue':
        return 'bg-red-500'
      case 'on-track':
      default:
        return 'bg-blue-500'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    // Return YYYY-MM-DD format
    return new Date(dateString).toISOString().split('T')[0]
  }

  const handleEditSupplyChain = (group: DeliveryGroup, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedGroup(group)
    setSupplyChainDialogOpen(true)
  }

  const handleSupplyChainSuccess = () => {
    // Refresh the page or refetch data
    window.location.reload()
  }

  return (
    <>
      <div className="space-y-8">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>{group.group_name}</CardTitle>
                <div className="flex gap-2 text-xs">
                  {group.supply_chain_reference?.dir_reference && (
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                      DIR: {group.supply_chain_reference.dir_reference}
                    </span>
                  )}
                  {group.supply_chain_reference?.csp_reference && (
                    <span className="bg-secondary/50 text-secondary-foreground px-2 py-1 rounded">
                      CSP: {group.supply_chain_reference.csp_reference}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => handleEditSupplyChain(group, e)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-gray-200 ml-4 py-4 space-y-6">
                {group.milestones?.map((milestone) => (
                  <div key={milestone.id} className="ml-6 relative">
                    <span
                      className={cn(
                        'absolute -left-10 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white',
                        getStatusColor(milestone.status),
                      )}
                    >
                      <span className="text-white text-xs font-bold">
                        {milestone.milestone_code}
                      </span>
                    </span>

                    <div
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-start group cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                      onClick={() => onMilestoneClick?.(milestone)}
                    >
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-foreground">
                          {milestone.milestone_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {milestone.milestone_description}
                        </p>
                      </div>

                      <div className="mt-2 sm:mt-0 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            variant={
                              milestone.status === 'overdue'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {milestone.status}
                          </Badge>
                          {milestone.planned_completion_date && (
                            <>
                              {(() => {
                                const currentIndex =
                                  group.milestones?.findIndex(
                                    (m) => m.id === milestone.id,
                                  )
                                const previousMilestone =
                                  currentIndex !== undefined &&
                                  currentIndex > 0 &&
                                  group.milestones
                                    ? group.milestones[currentIndex - 1]
                                    : null

                                if (
                                  !previousMilestone?.planned_completion_date
                                ) {
                                  return (
                                    <span className="text-[10px] text-muted-foreground">
                                      Planned leadtime: 0 days
                                    </span>
                                  )
                                }

                                if (milestone.planned_completion_date) {
                                  const previous = new Date(
                                    previousMilestone.planned_completion_date,
                                  )
                                  const current = new Date(
                                    milestone.planned_completion_date,
                                  )
                                  const diffDays = Math.abs(
                                    Math.round(
                                      (current.getTime() - previous.getTime()) /
                                        (1000 * 60 * 60 * 24),
                                    ),
                                  )

                                  return (
                                    <span className="text-[10px] text-muted-foreground">
                                      Planned leadtime: {diffDays} days
                                    </span>
                                  )
                                }
                                return null
                              })()}
                            </>
                          )}
                          <span className="text-xs text-muted-foreground">
                            Planned:{' '}
                            {formatDate(milestone.planned_completion_date)}
                          </span>
                          {milestone.actual_completion_date && (
                            <span className="text-xs font-medium">
                              Actual:{' '}
                              {formatDate(milestone.actual_completion_date)}
                            </span>
                          )}
                          {milestone.difference_days !== null &&
                            milestone.difference_days !== 0 && (
                              <span
                                className={cn(
                                  'text-xs',
                                  milestone.difference_days > 0
                                    ? 'text-red-600'
                                    : 'text-green-600',
                                )}
                              >
                                {Math.abs(milestone.difference_days)} days{' '}
                                {milestone.difference_days > 0
                                  ? 'late'
                                  : 'early'}
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedGroup && (
        <SupplyChainDialog
          open={supplyChainDialogOpen}
          onOpenChange={setSupplyChainDialogOpen}
          deliveryGroupId={selectedGroup.id}
          initialData={selectedGroup.supply_chain_reference || undefined}
          onSuccess={handleSupplyChainSuccess}
        />
      )}
    </>
  )
}
