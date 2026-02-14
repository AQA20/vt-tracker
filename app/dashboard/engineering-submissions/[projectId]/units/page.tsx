'use client'

import { use } from 'react'
import { useEngineeringUnits } from '@/hooks/useEngineeringUnits'
import { TechnicalUnitsTable } from '@/components/modules/units-table'
import { Pagination } from '@/components/ui/pagination'
import { Loader2 } from 'lucide-react'
import { DetailPageHeader } from '@/components/ui/detail-page-header'
import { SearchInput } from '@/components/ui/search-input'
import { TechnicalStatsGrid } from '@/components/modules/technical-stats-grid'

export default function ProjectUnitsPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = use(params)
  const {
    currentProject,
    units,
    stats,
    isLoading,
    page,
    totalPages,
    totalUnits,
    searchTerm,
    setSearchTerm,
    handlePageChange,
    technicalCategories,
  } = useEngineeringUnits(projectId)

  if (!currentProject) return null

  return (
    <div className="flex flex-col gap-4 pb-10">
      <DetailPageHeader
        backHref="/dashboard/engineering-submissions"
        title={currentProject.name}
        subtitle={`${currentProject.location} • ${currentProject.client_name}`}
      >
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search units..."
          className="w-full sm:w-80 ml-auto"
        />
      </DetailPageHeader>

      <TechnicalStatsGrid
        totalUnits={totalUnits}
        categories={technicalCategories}
        stats={stats}
      />

      <div className="flex items-center justify-between">
        {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
      </div>

      <div className="w-full">
        {isLoading ? (
          <div className="flex flex-col gap-4 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 w-full bg-muted animate-pulse rounded"
              />
            ))}
          </div>
        ) : (
          <>
            <TechnicalUnitsTable
              units={units}
              projectId={projectId}
              showActions={true}
            />
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  )
}
