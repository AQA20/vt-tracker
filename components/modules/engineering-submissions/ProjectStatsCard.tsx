import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, MapPin, Briefcase, LayoutGrid, Hash } from 'lucide-react'
import { Project } from '@/types'
import { STATUS_CATEGORIES, ProjectStats } from './constants'
import { ProgressCategoryRow } from './ProgressCategoryRow'

interface ProjectStatsCardProps {
  project: Project
  stats?: ProjectStats
}

export function ProjectStatsCard({ project, stats }: ProjectStatsCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/dashboard/engineering-submissions/${project.id}/units`)
  }

  return (
    <div className="relative h-full cursor-pointer group" onClick={handleClick}>
      <Card className="h-full overflow-hidden border-zinc-200 dark:border-zinc-800 group-hover:border-primary/50 dark:group-hover:border-primary/50 transition-all duration-300 group-hover:shadow-xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3 border-b bg-muted/30">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-lg font-bold line-clamp-1">
              {project.name}
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5 space-y-6">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4 shrink-0" />
              <span className="truncate font-medium text-foreground">
                {project.client_name}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate font-medium text-foreground">
                {project.location || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Hash className="h-4 w-4 shrink-0" />
              <span className="truncate font-medium text-foreground">
                {project.kone_project_id || 'N/A'}
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Submission Statistics</span>
              </div>
              <div className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {project.units_count ?? 0} Units
              </div>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
              {Object.entries(STATUS_CATEGORIES).map(([key, label]) => (
                <ProgressCategoryRow
                  key={key}
                  label={label}
                  stats={
                    stats?.[key] || {
                      submitted: 0,
                      in_progress: 0,
                      rejected: 0,
                      approved: 0,
                    }
                  }
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
