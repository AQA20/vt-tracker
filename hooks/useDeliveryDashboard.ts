import { useState } from 'react'
import { useDeliveryProjectsQuery } from '@/hooks/queries/useDeliveryProjectsQuery'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'

export function useDeliveryDashboard(searchTerm?: string) {
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(searchTerm ?? '')
  const queryClient = useQueryClient()

  const { data, isLoading } = useDeliveryProjectsQuery({
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
    projects: data?.data ?? [],
    isLoading,
    page,
    totalPages: data?.meta.last_page ?? 1,
    perPage: data?.meta.per_page ?? 6,
    handlePageChange,
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.delivery.projects({ page, search: debouncedSearch }),
      }),
  }
}
