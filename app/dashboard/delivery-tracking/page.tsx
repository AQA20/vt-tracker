'use client'

import { useState } from 'react'
import { useDeliveryDashboard } from '@/hooks/useDeliveryDashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { Truck } from 'lucide-react'
import { Pagination } from '@/components/ui/pagination'
import { PageHeader } from '@/components/ui/page-header'
import { SearchInput } from '@/components/ui/search-input'
import { EmptyState } from '@/components/ui/empty-state'
import { ProjectCard } from '@/components/modules/project-card'

export default function DeliveryTrackingPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { projects, isLoading, page, totalPages, handlePageChange } =
    useDeliveryDashboard(searchTerm)

  return (
    <div className="flex flex-col gap-8 pb-10">
      <PageHeader
        title="Delivery Tracking"
        subtitle="Monitor equipment delivery status and milestones across all projects."
      >
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search projects..."
        />
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState icon={Truck} title="No projects found" />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                href={`/dashboard/delivery-tracking/${project.id}`}
              />
            ))}
          </div>

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
