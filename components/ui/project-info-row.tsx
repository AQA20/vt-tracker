import { type LucideIcon } from 'lucide-react'

interface ProjectInfoRowProps {
  icon: LucideIcon
  label: string
  value: string
}

export function ProjectInfoRow({ icon: Icon, label, value }: ProjectInfoRowProps) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-muted-foreground shrink-0 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">
          {label}
        </span>
        <span className="font-semibold line-clamp-1">{value}</span>
      </div>
    </div>
  )
}
