import { useState, useCallback, useEffect } from 'react'
import {
  getProjects,
  getProjectStats,
} from '@/services/engineeringSubmissionService'
import { Project, ProjectStats } from '@/types'

export function useEngineeringDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<Record<string, ProjectStats>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [perPage, setPerPage] = useState(6)

  const fetchDashboardData = useCallback(
    async (currentPage: number) => {
      setIsLoading(true)
      try {
        // Fetch projects with pagination
        const response = await getProjects({
          page: currentPage,
          per_page: perPage,
        })

        // Handle both cases: response.data is the wrapper or response.data is the list
        const responseData = response.data
        const projectsData =
          responseData.data || (Array.isArray(responseData) ? responseData : [])
        const meta = responseData.meta || {}

        setProjects(projectsData)
        setTotalPages(meta.last_page || (meta.lastPage ?? 1))
        if (meta.per_page || meta.perPage) {
          setPerPage(meta.per_page || meta.perPage)
        }

        // Fetch stats for each project concurrently
        const statsPromises = projectsData.map((p: Project) =>
          getProjectStats(p.id).then((res) => ({
            id: p.id,
            data: res.data.data || res.data,
          })),
        )

        const statsResults = await Promise.all(statsPromises)
        const newStats: Record<string, ProjectStats> = {}
        statsResults.forEach((res) => {
          newStats[res.id] = res.data
        })

        setStats(newStats)
      } catch (error) {
        console.error('Failed to fetch engineering dashboard data', error)
      } finally {
        setIsLoading(false)
      }
    },
    [perPage],
  )

  useEffect(() => {
    fetchDashboardData(page)
  }, [page, fetchDashboardData])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  return {
    projects,
    stats,
    isLoading,
    page,
    totalPages,
    perPage,
    handlePageChange,
    refresh: () => fetchDashboardData(page),
  }
}
