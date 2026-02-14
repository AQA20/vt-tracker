'use client'

import { useDashboard } from '@/hooks/useDashboard'
import { Briefcase } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Pagination } from '@/components/ui/pagination'
import { PageHeader } from '@/components/ui/page-header'
import { SearchInput } from '@/components/ui/search-input'
import { EmptyState } from '@/components/ui/empty-state'
import { ProjectCard } from '@/components/modules/project-card'
import { CreateProjectDialog } from '@/components/modules/create-project-dialog'

export default function DashboardPage() {
  const {
    projects,
    isLoading,
    page,
    totalPages,
    perPage,
    searchTerm,
    setSearchTerm,
    isCreateOpen,
    setIsCreateOpen,
    newProject,
    setNewProject,
    handleCreate,
    handlePageChange,
  } = useDashboard()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Projects">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search projects..."
            className="flex-1 sm:flex-initial sm:w-80"
          />
          <CreateProjectDialog
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            project={newProject}
            onProjectChange={setNewProject}
            onSubmit={handleCreate}
          />
        </div>
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: perPage || 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[420px] w-full rounded-xl" />
          ))}
        </div>
      ) : !projects || projects.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No projects found"
          description="Get started by creating a new installation project."
          actionLabel="Create Project"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="flex flex-col gap-6 px-1">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                href={`/dashboard/projects/${project.id}`}
                showProgress
              />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}
