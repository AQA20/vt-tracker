import { useState } from 'react'
import { useDeliveryProjectUnitsQuery } from '@/hooks/queries/useDeliveryProjectUnitsQuery'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

export function useDeliveryProjectDetail(projectId: string) {
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 10

  const debouncedSearch = useDebouncedValue(searchTerm)

  const { data: unitsData, isLoading } = useDeliveryProjectUnitsQuery(projectId, {
    page,
    search: debouncedSearch,
    perPage,
  })

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }

  const handlePageChange = (p: number) => {
    setPage(p)
  }

  return {
    units: unitsData?.data ?? [],
    isLoading,
    page,
    totalPages: unitsData?.meta.last_page ?? 1,
    totalUnits: unitsData?.meta.total ?? 0,
    searchTerm,
    setSearchTerm: handleSearchChange,
    handlePageChange,
  }
}
