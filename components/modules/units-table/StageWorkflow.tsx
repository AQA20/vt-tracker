'use client'

import { useState, useEffect } from 'react'
import { Unit, Stage } from '@/types'
import { useStageTasks } from '@/hooks/queries/useStageTasks'
import { useUpdateTask } from '@/hooks/mutations/useUpdateTask'
import { useCompleteStage } from '@/hooks/mutations/useCompleteStage'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckCircle2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StageWorkflow({ unit }: { unit: Unit }) {
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
      const group = stage?.template?.progress_group || 'General'
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
  const { data: tasks, isLoading } = useStageTasks(stage.id, !stage.tasks)
  const updateTask = useUpdateTask(unitId)
  const completeStageM = useCompleteStage(unitId)

  const resolvedTasks = stage.tasks ?? tasks ?? []

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
              {stage?.template?.title || stage?.template?.name || 'Unknown Stage'}
            </h5>
            {stage?.template?.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {stage.template.description}
              </p>
            )}

            <div
              className="flex items-center space-x-2.5 mt-3 py-1.5 px-2 bg-zinc-50 dark:bg-zinc-900 rounded border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all cursor-pointer group/toggle"
              onClick={(e) => {
                e.stopPropagation()
                completeStageM.mutate({
                  stageId: stage.id,
                  completed: stage.status !== 'completed',
                  taskIds: resolvedTasks.map((t) => t.id),
                })
              }}
            >
              <Checkbox
                id={`complete-stage-${stage.id}`}
                checked={stage.status === 'completed'}
                onCheckedChange={(checked) =>
                  completeStageM.mutate({
                    stageId: stage.id,
                    completed: checked === true,
                    taskIds: resolvedTasks.map((t) => t.id),
                  })
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
          resolvedTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start space-x-3 py-2 px-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-md cursor-pointer transition-colors group"
              onClick={() =>
                updateTask.mutate({
                  taskId: task.id,
                  payload: {
                    status: task.status === 'pass' ? 'pending' : 'pass',
                  },
                })
              }
            >
              <Checkbox
                id={`task-${task.id}`}
                checked={task.status === 'pass'}
                onCheckedChange={(checked) =>
                  updateTask.mutate({
                    taskId: task.id,
                    payload: {
                      status: checked ? 'pass' : 'pending',
                    },
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
        {!isLoading && resolvedTasks.length === 0 && (
          <div className="text-xs text-muted-foreground">No tasks found.</div>
        )}
      </div>
    </div>
  )
}
