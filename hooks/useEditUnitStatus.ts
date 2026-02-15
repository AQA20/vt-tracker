import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useProjectQuery } from '@/hooks/queries/useProjectQuery'
import { useUnitsQuery } from '@/hooks/queries/useUnitsQuery'
import {
  updateStatusUpdate,
  uploadStatusUpdatePdf,
  updateStatusApproval,
  createStatusApproval,
  createStatusRevision,
  updateStatusRevision,
  bulkCopyUnitStatus,
} from '@/services/engineeringSubmissionService'
import { toast } from 'sonner'

export function useEditUnitStatus(projectId: string, unitId: string) {
  const queryClient = useQueryClient()

  const { data: currentProject } = useProjectQuery(projectId)
  const { data: unitsData, isLoading } = useUnitsQuery(projectId, {
    page: 1,
    search: '',
    perPage: 100,
  })

  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [copyModalOpen, setCopyModalOpen] = useState(false)
  const [targetCopyCategory, setTargetCopyCategory] = useState<{
    key: string
    label: string
  } | null>(null)

  const units = unitsData?.data ?? []
  const unit = units.find((u) => u.id === unitId)

  const unitsQueryKey = ['projects', projectId, 'units']

  const refreshUnits = () => {
    queryClient.invalidateQueries({ queryKey: unitsQueryKey })
  }

  // --- Mutations ---

  const statusMutation = useMutation({
    mutationFn: ({ statusUpdateId, newStatus }: { statusUpdateId: string; newStatus: string }) =>
      updateStatusUpdate(statusUpdateId, newStatus),
    onMutate: ({ statusUpdateId }) => setUpdatingId(statusUpdateId),
    onSuccess: () => {
      toast.success('Status updated successfully')
      refreshUnits()
    },
    onError: (error) => console.error('Failed to update status', error),
    onSettled: () => setUpdatingId(null),
  })

  const fileUploadMutation = useMutation({
    mutationFn: ({ statusUpdateId, file }: { statusUpdateId: string; file: File }) =>
      uploadStatusUpdatePdf(statusUpdateId, file),
    onMutate: ({ statusUpdateId }) => setUpdatingId(statusUpdateId),
    onSuccess: () => {
      toast.success('PDF uploaded successfully')
      refreshUnits()
    },
    onError: (error) => console.error('Failed to upload PDF', error),
    onSettled: () => setUpdatingId(null),
  })

  const approvalDateMutation = useMutation({
    mutationFn: ({ approvalId, newDate }: { approvalId: string; newDate: string }) => {
      const formattedDateTime = `${newDate} 12:00:00`
      return updateStatusApproval(approvalId, formattedDateTime)
    },
    onMutate: ({ approvalId }) => setUpdatingId(`approval-${approvalId}`),
    onSuccess: () => {
      toast.success('Approval date updated')
      refreshUnits()
    },
    onError: (error) => console.error('Failed to update approval date', error),
    onSettled: () => setUpdatingId(null),
  })

  const createApprovalMutation = useMutation({
    mutationFn: ({ statusUpdateId, approvalCode }: { statusUpdateId: string; approvalCode: string }) => {
      const today = new Date().toISOString().split('T')[0]
      const approvedAt = `${today} 12:00:00`
      return createStatusApproval({
        status_update_id: statusUpdateId,
        approval_code: approvalCode,
        approved_at: approvedAt,
      })
    },
    onMutate: ({ statusUpdateId, approvalCode }) =>
      setUpdatingId(`create-${statusUpdateId}-${approvalCode}`),
    onSuccess: (_data, { approvalCode }) => {
      toast.success(`Code ${approvalCode} approval added`)
      refreshUnits()
    },
    onError: (error) => console.error('Failed to create approval', error),
    onSettled: () => setUpdatingId(null),
  })

  const createRevisionMutation = useMutation({
    mutationFn: ({
      statusUpdateId,
      revisionNumber,
      category,
    }: {
      statusUpdateId: string
      revisionNumber: number
      category: 'submitted' | 'rejected'
    }) => {
      const today = new Date().toISOString().split('T')[0]
      const revisionDate = `${today} 12:00:00`
      return createStatusRevision({
        status_update_id: statusUpdateId,
        revision_date: revisionDate,
        revision_number: revisionNumber,
        category,
      })
    },
    onMutate: ({ statusUpdateId, revisionNumber }) =>
      setUpdatingId(`rev-create-${statusUpdateId}-${revisionNumber}`),
    onSuccess: (_data, { revisionNumber }) => {
      toast.success(`REV${String(revisionNumber).padStart(2, '0')} added`)
      refreshUnits()
    },
    onError: (error) => console.error('Failed to create revision', error),
    onSettled: () => setUpdatingId(null),
  })

  const revisionDateMutation = useMutation({
    mutationFn: ({ revisionId, newDate }: { revisionId: string; newDate: string }) => {
      const formattedDate = `${newDate} 12:00:00`
      return updateStatusRevision(revisionId, formattedDate)
    },
    onMutate: ({ revisionId }) => setUpdatingId(`rev-update-${revisionId}`),
    onSuccess: () => {
      toast.success('Revision date updated')
      refreshUnits()
    },
    onError: (error) => console.error('Failed to update revision date', error),
    onSettled: () => setUpdatingId(null),
  })

  const copyStatusMutation = useMutation({
    mutationFn: (targetUnitIds: string[]) => {
      if (!targetCopyCategory) throw new Error('No target category')
      return bulkCopyUnitStatus(unitId, targetCopyCategory.key, {
        target_unit_ids: targetUnitIds,
      })
    },
    onSuccess: (_data, targetUnitIds) => {
      toast.success(`Status copied successfully to ${targetUnitIds.length} units`)
      refreshUnits()
      setCopyModalOpen(false)
    },
    onError: (error) => console.error('Failed to copy status', error),
  })

  // --- Handlers ---

  const handleStatusChange = (statusUpdateId: string, newStatus: string) => {
    statusMutation.mutate({ statusUpdateId, newStatus })
  }

  const handleFileUpload = (statusUpdateId: string, file: File) => {
    fileUploadMutation.mutate({ statusUpdateId, file })
  }

  const handleApprovalDateChange = (approvalId: string, newDate: string) => {
    if (!newDate) return
    approvalDateMutation.mutate({ approvalId, newDate })
  }

  const handleCreateApproval = (statusUpdateId: string, approvalCode: string) => {
    createApprovalMutation.mutate({ statusUpdateId, approvalCode })
  }

  const handleCreateRevision = (
    statusUpdateId: string,
    revisionNumber: number,
    category: 'submitted' | 'rejected',
  ) => {
    createRevisionMutation.mutate({ statusUpdateId, revisionNumber, category })
  }

  const handleRevisionDateChange = (revisionId: string, newDate: string) => {
    if (!newDate) return
    revisionDateMutation.mutate({ revisionId, newDate })
  }

  const handleCopyStatus = async (targetUnitIds: string[]) => {
    copyStatusMutation.mutateAsync(targetUnitIds)
  }

  const openCopyModal = (cat: { key: string; label: string }) => {
    setTargetCopyCategory(cat)
    setCopyModalOpen(true)
  }

  const closeCopyModal = () => {
    setCopyModalOpen(false)
    setTargetCopyCategory(null)
  }

  // --- Helpers ---

  const getCategoryLabel = (key: string) => {
    const labels: Record<string, string> = {
      tech: 'Tech Sub',
      sample: 'Sample',
      layout: 'Layout',
      car_m_dwg: 'Car M DWG',
      cop_dwg: 'COP DWG',
      landing_dwg: 'Landing DWG',
    }
    return labels[key] || key
  }

  const formatDate = (dateValue: string | number | null | undefined) => {
    if (!dateValue) return ''
    try {
      let date: Date
      if (typeof dateValue === 'number') {
        const timestamp = dateValue < 5000000000 ? dateValue * 1000 : dateValue
        date = new Date(timestamp)
      } else {
        const normalized = dateValue.includes(' ')
          ? dateValue.replace(' ', 'T')
          : dateValue
        date = new Date(normalized)
        if (isNaN(date.getTime())) {
          const num = Number(dateValue)
          if (!isNaN(num)) {
            const timestamp = num < 5000000000 ? num * 1000 : num
            date = new Date(timestamp)
          }
        }
      }
      if (isNaN(date.getTime())) return ''
      return date.toISOString().split('T')[0]
    } catch {
      return ''
    }
  }

  return {
    currentProject: currentProject ?? null,
    unit: unit ?? null,
    units,
    isLoading,
    isCopyLoading: copyStatusMutation.isPending,
    updatingId,
    copyModalOpen,
    targetCopyCategory,
    handleStatusChange,
    handleFileUpload,
    handleApprovalDateChange,
    handleCreateApproval,
    handleCreateRevision,
    handleRevisionDateChange,
    handleCopyStatus,
    openCopyModal,
    closeCopyModal,
    getCategoryLabel,
    formatDate,
  }
}
