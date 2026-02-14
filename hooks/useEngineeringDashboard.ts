import { useState } from 'react'
import { useEngineeringProjectsQuery } from '@/hooks/queries/useEngineeringProjectsQuery'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

export function useEngineeringDashboard(searchTerm?: string) {
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(searchTerm ?? '')

  const { data, isLoading } = useEngineeringProjectsQuery({
    page,
    search: debouncedSearch,
  })

  const handlePageChange = (newPage: number) => {
    const totalPages = data?.meta.last_page ?? 1
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  return {
    projects: data?.projects ?? [],
    stats: data?.stats ?? {},
    isLoading,
    page,
    totalPages: data?.meta.last_page ?? 1,
    perPage: data?.meta.per_page ?? 6,
    handlePageChange,
  }
}
