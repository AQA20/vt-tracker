import Link from 'next/link'
import { Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ProjectInfoRow } from '@/components/ui/project-info-row'
import { Building2, Briefcase, MapPin, Hash, LayoutGrid } from 'lucide-react'

interface ProjectCardProps {
  project: Project
  href: string
  /** When true the three progress bars (installation / commissioning / average) are shown */
  showProgress?: boolean
}

export function ProjectCard({ project, href, showProgress = false }: ProjectCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3 border-b bg-muted/30">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
              {project.name}
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="grid gap-3">
            <ProjectInfoRow icon={Briefcase} label="Client" value={project.client_name} />
            <ProjectInfoRow icon={MapPin} label="Location" value={project.location || 'No Location specified'} />
            <ProjectInfoRow icon={Hash} label="Company Project ID" value={project.kone_project_id || 'N/A'} />
          </div>

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
            <div className={`flex items-center justify-between${showProgress ? ' mb-3' : ''}`}>
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>{project.units_count ?? 0} Units</span>
              </div>
            </div>

            {showProgress && (
              <div className="grid grid-cols-3 gap-3">
                <ProgressStat
                  label="Installation"
                  value={project.installation_progress}
                />
                <ProgressStat
                  label="Commissioning"
                  value={project.commissioning_progress}
                />
                <ProgressStat
                  label="Average"
                  value={project.completion_percentage}
                  isPrimary
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

/* ------------------------------------------------------------------ */

function ProgressStat({
  label,
  value,
  isPrimary = false,
}: {
  label: string
  value: number
  isPrimary?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <span
        className={`text-[11px] uppercase tracking-wider font-bold block truncate ${
          isPrimary
            ? 'text-primary/70'
            : 'text-zinc-600 dark:text-zinc-400'
        }`}
      >
        {label}
      </span>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold ${isPrimary ? 'text-primary' : ''}`}>
          {value}%
        </span>
      </div>
      <Progress
        value={value}
        className={`h-1 ${isPrimary ? 'bg-primary/20' : 'bg-zinc-100 dark:bg-zinc-800'}`}
      />
    </div>
  )
}
