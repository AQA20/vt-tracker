'use client';

import { useEffect, useState, use } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Download, Plus } from 'lucide-react';
import Link from 'next/link';
import { UnitsTable } from '@/components/modules/units-table';
import { AddUnitModal } from '@/components/modules/add-unit-modal';
import { BulkImportModal } from '@/components/modules/bulk-import-modal';

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  // Unwrap params using React.use()
  const { projectId: id } = use(params);
  
  const { currentProject, fetchProjectById, fetchUnits, units, isLoading, page, totalPages, totalUnits } = useProjectStore();
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (id) {
      fetchProjectById(id);
      fetchUnits(id, 1, searchTerm);
    }
  }, [id, fetchProjectById, fetchUnits, searchTerm]);

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
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">{currentProject.name}</h1>
            <p className="text-xs md:text-sm text-muted-foreground">{currentProject.location} • {currentProject.client_name}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto justify-end">
          <div className="relative w-full sm:w-80 mb-2 sm:mb-0 sm:mr-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search units..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
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
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card text-card-foreground shadow p-4 md:p-6">
              <div className="text-sm font-medium text-muted-foreground">Total Units</div>
              <div className="text-2xl font-bold">{totalUnits}</div>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow p-4 md:p-6">
              <div className="text-sm font-medium text-muted-foreground">Installation</div>
              <div className="text-2xl font-bold">{currentProject.installation_progress || 0}%</div>
              <Progress value={currentProject.installation_progress || 0} className="mt-2 h-2" />
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow p-4 md:p-6">
              <div className="text-sm font-medium text-muted-foreground">Commissioning</div>
              <div className="text-2xl font-bold">{currentProject.commissioning_progress || 0}%</div>
              <Progress value={currentProject.commissioning_progress || 0} className="mt-2 h-2" />
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow p-4 md:p-6 border-primary/20 bg-primary/5">
              <div className="text-sm font-medium text-primary/70">Average Completion</div>
              <div className="text-2xl font-bold text-primary">{currentProject.completion_percentage || 0}%</div>
              <Progress value={currentProject.completion_percentage || 0} className="mt-2 h-2" />
          </div>
      </div>

      <UnitsTable units={units} projectId={id} />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => fetchUnits(id, p, searchTerm)}
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
