import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ReactNode } from 'react'

interface DetailPageHeaderProps {
  backHref: string
  title: string
  subtitle?: string
  children?: ReactNode
}

export function DetailPageHeader({
  backHref,
  title,
  subtitle,
  children,
}: DetailPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
      <div className="flex items-center gap-4">
        <Link href={backHref}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs md:text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}
