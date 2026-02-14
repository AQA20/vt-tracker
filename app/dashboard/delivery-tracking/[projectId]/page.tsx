'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getProjectUnits } from '@/services/engineeringSubmissionService'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'
import { Unit } from '@/types'
import { DeliveryOverviewTable } from '@/components/delivery-tracking/DeliveryOverviewTable'

export default function ProjectDeliveryPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUnits, setTotalUnits] = useState(0)
  const perPage = 10

  useEffect(() => {
    const fetchUnits = async () => {
      setLoading(true)
      try {
        const response = await getProjectUnits(projectId, { page, per_page: perPage, search: searchTerm })
        const data = response.data.data || response.data
        setUnits(Array.isArray(data) ? data : [])
        const meta = response.data.meta || {}
        setTotalPages(meta.last_page || meta.lastPage || 1)
        setTotalUnits(meta.total || (Array.isArray(data) ? data.length : 0))
      } catch (error) {
        console.error('Failed to fetch units', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUnits()
  }, [projectId, page, searchTerm])

  return (
    <div className="space-y-6 w-full min-w-0 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/delivery-tracking">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Project Delivery Units
            </h1>
            <p className="text-sm text-muted-foreground">
              Track delivery milestones across all units.
            </p>
          </div>
        </div>
        <div className="relative w-full sm:w-80 ml-auto">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <Input
            placeholder="Search units..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            className="pl-10 w-full"
          />
        </div>
      </div>

      {/* Table and loading state */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : units.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No units found in this project.
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs text-muted-foreground font-medium">
              Total Units: {totalUnits}
            </div>
          </div>
          <DeliveryOverviewTable units={units} />
          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="cursor-pointer h-9 px-3"
              >
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
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
                        onClick={() => setPage(p)}
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
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="cursor-pointer h-9 px-3"
              >
                <span className="hidden sm:inline">Next</span>
              </Button>
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Page {page} of {totalPages}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
