import { useState, useCallback, useEffect } from 'react'
import { getProjects } from '@/services/engineeringSubmissionService'
import { Project } from '@/types'

export function useDeliveryDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [perPage, setPerPage] = useState(6)

  const fetchProjects = useCallback(
    async (currentPage: number) => {
      setIsLoading(true)
      try {
        const response = await getProjects({
          page: currentPage,
          per_page: perPage,
          include: 'units,units.deliveryGroups,units.deliveryGroups.milestones',
        })

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
    fetchProjects(page)
  }, [page, fetchProjects])

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
