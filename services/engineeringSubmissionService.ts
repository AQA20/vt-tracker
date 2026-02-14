import api from './api'

export const getProjects = (params?: Record<string, unknown>) =>
  api.get('/projects', { params })

export const getProjectStats = (projectId: string | number) =>
  api.get(`/projects/${projectId}/stats`)

export const getProjectUnits = (projectId: string | number, params: Record<string, unknown> = {}) =>
  api.get(`/projects/${projectId}/units`, {
    params: {
      include:
        'statusUpdates,status_updates,statusUpdates.revisions,status_updates.revisions,statusUpdates.approvals,status_updates.approvals,stages.tasks,deliveryGroups,deliveryGroups.milestones',
      ...params,
    },
  })

export const updateStatusUpdate = (id: string, status: string) =>
  api.patch(`/status-updates/${id}`, { status })

export const uploadStatusUpdatePdf = (statusUpdateId: string, file: File) => {
  const formData = new FormData()
  formData.append('pdf', file)
  return api.post(`/status-updates/${statusUpdateId}/upload-pdf`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const updateStatusApproval = (id: string, approvedAt: string) =>
  api.patch(`/status-approvals/${id}`, { approved_at: approvedAt })

export const createStatusApproval = (payload: {
  status_update_id: string
  approval_code: string
  approved_at: string
  comment?: string
}) => api.post(`/status-approvals`, payload)

export const createStatusRevision = (payload: {
  status_update_id: string
  revision_date: string
  revision_number: number
  category: string
}) => api.post(`/status-revisions`, payload)

export const copyUnitStatus = (
  targetUnitId: string,
  targetCategory: string,
  payload: {
    source_unit_id: string
    source_status_key: string
  },
) =>
  api.post(
    `/units/${targetUnitId}/statuses/${targetCategory}/copy-from`,
    payload,
  )

export const updateStatusRevision = (id: string, revisionDate: string) =>
  api.patch(`/status-revisions/${id}`, { revision_date: revisionDate })

export const bulkCopyUnitStatus = (
  sourceUnitId: string,
  category: string,
  payload: {
    target_unit_ids: string[]
  },
) =>
  api.post(`/units/${sourceUnitId}/statuses/${category}/copy-to-units`, payload)

export const deleteUnit = (id: string | number) => api.delete(`/units/${id}`)
