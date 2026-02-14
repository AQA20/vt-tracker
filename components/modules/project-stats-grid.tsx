import { Progress } from '@/components/ui/progress'

interface ProjectStatsGridProps {
  totalUnits: number
  installationProgress: number
  commissioningProgress: number
  completionPercentage: number
}

export function ProjectStatsGrid({
  totalUnits,
  installationProgress,
  commissioningProgress,
  completionPercentage,
}: ProjectStatsGridProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border bg-card text-card-foreground shadow p-4 md:p-6">
        <div className="text-sm font-medium text-muted-foreground">Total Units</div>
        <div className="text-2xl font-bold">{totalUnits}</div>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow p-4 md:p-6">
        <div className="text-sm font-medium text-muted-foreground">Installation</div>
        <div className="text-2xl font-bold">{installationProgress}%</div>
        <Progress value={installationProgress} className="mt-2 h-2" />
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow p-4 md:p-6">
        <div className="text-sm font-medium text-muted-foreground">Commissioning</div>
        <div className="text-2xl font-bold">{commissioningProgress}%</div>
        <Progress value={commissioningProgress} className="mt-2 h-2" />
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow p-4 md:p-6 border-primary/20 bg-primary/5">
        <div className="text-sm font-medium text-primary/70">Average Completion</div>
        <div className="text-2xl font-bold text-primary">{completionPercentage}%</div>
        <Progress value={completionPercentage} className="mt-2 h-2" />
      </div>
    </div>
  )
}
