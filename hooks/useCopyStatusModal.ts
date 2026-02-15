import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { getProjectUnits } from '@/services/engineeringSubmissionService'
import { Unit } from '@/types'

interface UseCopyStatusModalOptions {
  isOpen: boolean
  projectId: string
  currentUnitId: string
  onCopy: (targetUnitIds: string[]) => Promise<void>
  onClose: () => void
}

export function useCopyStatusModal({
  isOpen,
  projectId,
  currentUnitId,
  onCopy,
  onClose,
}: UseCopyStatusModalOptions) {
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: units = [], isLoading } = useQuery({
    queryKey: queryKeys.units.list(projectId, { page: 1, search: '', perPage: 999 }),
    queryFn: async (): Promise<Unit[]> => {
      const res = await getProjectUnits(projectId)
      const unitsData = res.data.data || res.data
      return (unitsData as Unit[]).filter((u) => u.id !== currentUnitId)
    },
    enabled: isOpen && !!projectId,
  })

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedUnitIds([])
    }
  }, [isOpen])

  const handleToggleUnit = (unitId: string) => {
    setSelectedUnitIds((prev) =>
      prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId],
    )
  }

  const handleSelectAll = () => {
    if (selectedUnitIds.length === units.length) {
      setSelectedUnitIds([])
    } else {
      setSelectedUnitIds(units.map((u) => u.id))
    }
  }

  const handleCopy = async () => {
    if (selectedUnitIds.length === 0) return
    setIsSubmitting(true)
    try {
      await onCopy(selectedUnitIds)
      onClose()
    } catch (error) {
      console.error('Copy failed', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isAllSelected =
    units.length > 0 && selectedUnitIds.length === units.length

  return {
    units,
    isLoading,
    selectedUnitIds,
    isSubmitting,
    isAllSelected,
    handleToggleUnit,
    handleSelectAll,
    handleCopy,
  }
}
