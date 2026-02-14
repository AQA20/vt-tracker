import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface CategoryStats {
  submitted: number
  in_progress: number
  rejected: number
  approved: number
}

interface TechnicalCategory {
  readonly key: string
  readonly label: string
}

interface TechnicalStatsGridProps {
  totalUnits: number
  categories: readonly TechnicalCategory[]
  stats: Record<string, CategoryStats> | null | undefined
}

export function TechnicalStatsGrid({
  totalUnits,
  categories,
  stats,
}: TechnicalStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      <Card className="bg-card/50 backdrop-blur-sm shadow-sm border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-4 flex flex-col justify-between h-full min-h-[100px]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Units
          </span>
          <div className="mt-2 text-2xl font-bold">{totalUnits}</div>
        </CardContent>
      </Card>

      {categories.map((cat) => {
        const catStats = stats?.[cat.key] || {
          submitted: 0,
          in_progress: 0,
          rejected: 0,
          approved: 0,
        }

        return (
          <TechnicalCategoryCard
            key={cat.key}
            label={cat.label}
            stats={catStats}
          />
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */

function TechnicalCategoryCard({
  label,
  stats,
}: {
  label: string
  stats: CategoryStats
}) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm shadow-sm border-zinc-200 dark:border-zinc-800">
      <CardContent className="p-4 flex flex-col gap-3 h-full">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
          {label}
        </span>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          <MiniProgressBar
            label="Prog"
            value={stats.in_progress}
            className="bg-yellow-100 dark:bg-yellow-900/30 [&>div]:bg-yellow-500"
          />
          <MiniProgressBar
            label="Sub"
            value={stats.submitted}
            className="bg-blue-100 dark:bg-blue-900/30 [&>div]:bg-blue-500"
          />
          <MiniProgressBar
            label="Rej"
            value={stats.rejected}
            className="bg-red-100 dark:bg-red-900/30 [&>div]:bg-red-500"
          />
          <MiniProgressBar
            label="App"
            value={stats.approved}
            className="bg-green-100 dark:bg-green-900/30 [&>div]:bg-green-500"
          />
        </div>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */

function MiniProgressBar({
  label,
  value,
  className,
}: {
  label: string
  value: number
  className: string
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[9px] font-bold uppercase text-muted-foreground/70">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <Progress value={value} className={`h-1 ${className}`} />
    </div>
  )
}
