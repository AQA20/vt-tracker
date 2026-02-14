import { useState } from 'react'
import { useProjectQuery } from '@/hooks/queries/useProjectQuery'
import { useUnitsQuery } from '@/hooks/queries/useUnitsQuery'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

export function useProjectDetail(projectId: string) {
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false)
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebouncedValue(searchTerm)

  const { data: currentProject, isLoading: isProjectLoading } = useProjectQuery(projectId)

  const { data: unitsData, isLoading: isUnitsLoading } = useUnitsQuery(projectId, {
    page,
    search: debouncedSearch,
  })

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }

  const handlePageChange = (p: number) => {
    setPage(p)
  }

  return {
    currentProject: currentProject ?? null,
    units: unitsData?.data ?? [],
    isLoading: isProjectLoading || isUnitsLoading,
    page,
    totalPages: unitsData?.meta.last_page ?? 1,
    totalUnits: unitsData?.meta.total ?? 0,
    searchTerm,
    setSearchTerm: handleSearchChange,
    isAddUnitOpen,
    setIsAddUnitOpen,
    isBulkImportOpen,
    setIsBulkImportOpen,
    handlePageChange,
  }
}
