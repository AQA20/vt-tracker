'use client'

import { useState } from 'react'
import { useEngineeringDashboard } from '@/hooks/useEngineeringDashboard'
import { ProjectStatsCard } from '@/components/modules/engineering-submissions/ProjectStatsCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, FileText, Search } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function EngineeringSubmissionsListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const {
    projects,
    stats,
    isLoading,
    page,
    totalPages,
    perPage,
    handlePageChange,
  } = useEngineeringDashboard(searchTerm)

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Engineering Submissions
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor technical submission statuses.
          </p>
        </div>
        <div className="relative flex-1 sm:flex-initial sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: perPage }).map((_, i) => (
            <Skeleton key={i} className="h-[400px] w-full rounded-xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-dashed p-10 text-center bg-muted/20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-xl font-bold">No projects found</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            There are no projects currently available for engineering
            submissions monitoring.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 auto-rows-fr">
            {projects.map((project) => (
              <ProjectStatsCard
                key={project.id}
                project={project}
                stats={stats[project.id]}
              />
            ))}
          </div>

          {totalPages >= 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="cursor-pointer h-9 px-3"
                >
                  <ChevronLeft className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => {
                      // Show current page, first, last, and one around current
                      if (
                        p === 1 ||
                        p === totalPages ||
                        (p >= page - 1 && p <= page + 1)
                      ) {
                        return (
                          <Button
                            key={p}
                            variant={p === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(p)}
                            className="h-9 w-9 p-0"
                          >
                            {p}
                          </Button>
                        )
                      }
                      // Show ellipses
                      if (p === page - 2 || p === page + 2) {
                        return (
                          <span key={p} className="px-1 text-muted-foreground">
                            ...
                          </span>
                        )
                      }
                      return null
                    },
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="cursor-pointer h-9 px-3"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4 sm:ml-1" />
                </Button>
              </div>

              <div className="text-sm text-muted-foreground font-medium">
                Page {page} of {totalPages}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
