import { useState } from 'react'
import { CreateProjectPayload } from '@/types'
import { useProjectsQuery } from '@/hooks/queries/useProjectsQuery'
import { useCreateProject } from '@/hooks/mutations/useCreateProject'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

const EMPTY_PROJECT: CreateProjectPayload = {
  name: '',
  client_name: '',
  location: '',
  kone_project_id: '',
}

export function useDashboard() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [newProject, setNewProject] = useState<CreateProjectPayload>({ ...EMPTY_PROJECT })

  const debouncedSearch = useDebouncedValue(searchTerm)

  const { data, isLoading } = useProjectsQuery({
    page,
    search: debouncedSearch,
  })

  const createProjectMutation = useCreateProject()

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }

  const handleCreate = async () => {
    if (!newProject.name) return
    try {
      await createProjectMutation.mutateAsync(newProject)
      setIsCreateOpen(false)
      setNewProject({ ...EMPTY_PROJECT })
    } catch (e) {
      console.error(e)
    }
  }

  const handlePageChange = (p: number) => {
    setPage(p)
  }

  return {
    projects: data?.data ?? [],
    isLoading,
    page,
    totalPages: data?.meta.last_page ?? 1,
    perPage: data?.meta.per_page ?? 6,
    searchTerm,
    setSearchTerm: handleSearchChange,
    isCreateOpen,
    setIsCreateOpen,
    newProject,
    setNewProject,
    handleCreate,
    handlePageChange,
  }
}
