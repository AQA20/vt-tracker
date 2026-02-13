import { useState, useCallback, useEffect } from 'react'
import { getProjects } from '@/services/engineeringSubmissionService'
import { Project } from '@/types'

export function useDeliveryDashboard(searchTerm?: string) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [perPage, setPerPage] = useState(6)

  const fetchProjects = useCallback(
    async (currentPage: number, search?: string) => {
      setIsLoading(true)
      try {
        const params: Record<string, unknown> = {
          page: currentPage,
          per_page: perPage,
          include: 'units,units.deliveryGroups,units.deliveryGroups.milestones',
        }
        if (search) {
          params.search = search
        }
        const response = await getProjects(params)

        const responseData = response.data
        const projectsData =
          responseData.data || (Array.isArray(responseData) ? responseData : [])
        const meta = responseData.meta || {}

        setProjects(projectsData)
        setTotalPages(meta.last_page || (meta.lastPage ?? 1))
        if (meta.per_page || meta.perPage) {
          setPerPage(meta.per_page || meta.perPage)
        }
      } catch (error) {
        console.error('Failed to fetch projects', error)
      } finally {
        setIsLoading(false)
      }
    },
    [perPage],
  )

  useEffect(() => {
    fetchProjects(page, searchTerm)
  }, [page, fetchProjects, searchTerm])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  return {
    projects,
    isLoading,
    page,
    totalPages,
    perPage,
    handlePageChange,
    refresh: () => fetchProjects(page),
  }
}
