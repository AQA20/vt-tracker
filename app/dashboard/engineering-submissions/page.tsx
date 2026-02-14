'use client'

import { useState } from 'react'
import { useEngineeringDashboard } from '@/hooks/useEngineeringDashboard'
import { ProjectStatsCard } from '@/components/modules/engineering-submissions/ProjectStatsCard'
import { FileText } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Pagination } from '@/components/ui/pagination'
import { PageHeader } from '@/components/ui/page-header'
import { SearchInput } from '@/components/ui/search-input'
import { EmptyState } from '@/components/ui/empty-state'

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
      <PageHeader
        title="Engineering Submissions"
        subtitle="Monitor technical submission statuses."
      >
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search projects..."
        />
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: perPage }).map((_, i) => (
            <Skeleton key={i} className="h-[400px] w-full rounded-xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No projects found"
          description="There are no projects currently available for engineering submissions monitoring."
        />
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
