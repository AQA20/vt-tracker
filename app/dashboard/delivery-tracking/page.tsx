'use client'

import { useState } from 'react'
import { useDeliveryDashboard } from '@/hooks/useDeliveryDashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  Building2,
  Briefcase,
  MapPin,
  LayoutGrid,
  Search,
} from 'lucide-react'
import Link from 'next/link'

export default function DeliveryTrackingPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { projects, isLoading, page, totalPages, handlePageChange } =
    useDeliveryDashboard(searchTerm)

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Delivery Tracking
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor equipment delivery status and milestones across all
            projects.
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-dashed p-10 text-center bg-muted/20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Truck className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-xl font-bold">No projects found</h3>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/delivery-tracking/${project.id}`}
                className="group"
              >
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
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-muted-foreground shrink-0 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">
                            Client
                          </span>
                          <span className="font-semibold line-clamp-1">
                            {project.client_name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-muted-foreground shrink-0 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">
                            Location
                          </span>
                          <span className="font-semibold line-clamp-1">
                            {project.location || 'No Location specified'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <LayoutGrid className="h-3.5 w-3.5" />
                          <span>{project.units_count ?? 0} Units</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {totalPages >= 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1, searchTerm)}
                  disabled={page === 1}
                  className="cursor-pointer h-9 px-3"
                >
                  <ChevronLeft className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => {
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
