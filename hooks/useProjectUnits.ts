import { useState, useCallback } from 'react'
import {
  getProjectUnits,
  getProjectStats,
} from '@/services/engineeringSubmissionService'
import { Unit, ProjectStats } from '@/types'

export function useProjectUnits(projectId: string) {
  const [units, setUnits] = useState<Unit[]>([])
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUnits = useCallback(async () => {
    if (!projectId) return
    setIsLoading(true)
    setError(null)
    try {
      const [unitsRes, statsRes] = await Promise.all([
        getProjectUnits(projectId),
        getProjectStats(projectId),
      ])

      const unitsData = unitsRes.data.data || unitsRes.data
      const statsData = statsRes.data.data || statsRes.data

      setUnits(unitsData || [])
      setStats(statsData)
    } catch (err) {
      console.error(`Failed to fetch units/stats for project ${projectId}`, err)
      setError('Failed to load project details')
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  return {
    units,
    stats,
    isLoading,
    error,
    fetchUnits,
  }
}
