import { useState } from 'react'
import { useProjectQuery } from '@/hooks/queries/useProjectQuery'
import { useUnitsQuery } from '@/hooks/queries/useUnitsQuery'
import { useProjectStatsQuery } from '@/hooks/queries/useProjectStatsQuery'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

const TECHNICAL_CATEGORIES = [
  { key: 'tech', label: 'Tech Sub' },
  { key: 'sample', label: 'Sample' },
  { key: 'layout', label: 'Layout' },
  { key: 'car_m_dwg', label: 'Car M DWG' },
  { key: 'cop_dwg', label: 'COP DWG' },
  { key: 'landing_dwg', label: 'Landing DWG' },
] as const

export function useEngineeringUnits(projectId: string) {
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebouncedValue(searchTerm)

  const { data: currentProject } = useProjectQuery(projectId)

  const { data: unitsData, isLoading } = useUnitsQuery(projectId, {
    page,
    search: debouncedSearch,
  })

  const { data: stats } = useProjectStatsQuery(projectId)

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
    stats: stats ?? null,
    isLoading,
    page,
    totalPages: unitsData?.meta.last_page ?? 1,
    totalUnits: unitsData?.meta.total ?? 0,
    searchTerm,
    setSearchTerm: handleSearchChange,
    handlePageChange,
    technicalCategories: TECHNICAL_CATEGORIES,
  }
}
