'use client'

import { DeliveryGroup, DeliveryMilestone } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DeliveryTimelineProps {
  groups: DeliveryGroup[]
  onMilestoneClick?: (milestone: DeliveryMilestone) => void
}

export function DeliveryTimeline({
  groups,
  onMilestoneClick,
}: DeliveryTimelineProps) {
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
    return new Date(dateString).toLocaleDateString(undefined, {
      dateStyle: 'medium',
    })
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <Card key={group.id}>
          <CardHeader>
            <CardTitle>{group.group_name}</CardTitle>
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
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-start group cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                    onClick={() => onMilestoneClick?.(milestone)}
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {milestone.milestone_name}
                      </h3>
                      <p className="text-sm text-gray-500">
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
                        <span className="text-xs text-gray-500">
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
                              {milestone.difference_days > 0 ? 'late' : 'early'}
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
  )
}
