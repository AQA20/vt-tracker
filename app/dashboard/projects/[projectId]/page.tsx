'use client';

import { use } from 'react';
import { useProjectDetail } from '@/hooks/useProjectDetail';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Plus } from 'lucide-react';
import { ProjectUnitsTable } from '@/components/modules/units-table';
import { AddUnitModal } from '@/components/modules/add-unit-modal';
import { BulkImportModal } from '@/components/modules/bulk-import-modal';
import { DetailPageHeader } from '@/components/ui/detail-page-header';
import { SearchInput } from '@/components/ui/search-input';
import { ProjectStatsGrid } from '@/components/modules/project-stats-grid';

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId: id } = use(params);
  
  const {
    currentProject,
    units,
    isLoading,
    page,
    totalPages,
    totalUnits,
    searchTerm,
    setSearchTerm,
    isAddUnitOpen,
    setIsAddUnitOpen,
    isBulkImportOpen,
    setIsBulkImportOpen,
    handlePageChange,
  } = useProjectDetail(id);

  if (isLoading && !currentProject) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-[400px] w-full" />
        </div>
    )
  }

  if (!currentProject) return <div>Project not found</div>;

  return (
    <div className="flex flex-col gap-6">
      <DetailPageHeader
        backHref="/dashboard"
        title={currentProject.name}
        subtitle={`${currentProject.location} • ${currentProject.client_name}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto justify-end">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search units..."
            className="w-full sm:w-80 mb-2 sm:mb-0 sm:mr-4"
          />
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto justify-end">
            <Button className='cursor-pointer w-full sm:w-auto' variant="outline" onClick={() => setIsBulkImportOpen(true)}>
              <Download className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
            <Button onClick={() => setIsAddUnitOpen(true)} className="cursor-pointer w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Unit
            </Button>
          </div>
        </div>
      </DetailPageHeader>

      <ProjectStatsGrid
        totalUnits={totalUnits}
        installationProgress={currentProject.installation_progress || 0}
        commissioningProgress={currentProject.commissioning_progress || 0}
        completionPercentage={currentProject.completion_percentage || 0}
      />

      <ProjectUnitsTable units={units} projectId={id} />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <AddUnitModal 
        isOpen={isAddUnitOpen} 
        onClose={() => setIsAddUnitOpen(false)} 
        projectId={id} 
      />
      
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        projectId={id}
      />
    </div>
  );
}
