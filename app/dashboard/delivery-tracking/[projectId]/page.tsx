'use client'

import { Input } from '@/components/ui/input'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'
import { DeliveryOverviewTable } from '@/components/delivery-tracking/DeliveryOverviewTable'
import { useDeliveryProjectDetail } from '@/hooks/useDeliveryProjectDetail'
import { Pagination } from '@/components/ui/pagination'

export default function ProjectDeliveryPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const {
    units,
    isLoading,
    searchTerm,
    setSearchTerm,
    page,
    totalPages,
    totalUnits,
    handlePageChange,
  } = useDeliveryProjectDetail(projectId)

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
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

      {/* Table and loading state */}
      {isLoading ? (
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
          <Pagination 
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  )
}
