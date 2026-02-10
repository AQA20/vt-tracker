import {
  CreateDeliveryGroupPayload,
  UpdateDeliveryMilestonePayload,
  UpdateSupplyChainReferencePayload,
} from '@/types'
import api from './api'

export const getUnitDeliveryGroups = (unitId: string) =>
  api.get(`/units/${unitId}/delivery-groups`)

export const createDeliveryGroup = (
  unitId: string,
  data: CreateDeliveryGroupPayload,
) => api.post(`/units/${unitId}/delivery-groups`, data)

export const getDeliveryGroupMilestones = (groupId: string) =>
  api.get(`/delivery-groups/${groupId}/milestones`)

export const updateDeliveryMilestone = (
  milestoneId: string,
  data: UpdateDeliveryMilestonePayload,
) => api.patch(`/delivery-milestones/${milestoneId}`, data)

export const importDeliveryPlan = (projectId: string, file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  return api.post(`/projects/${projectId}/import-delivery-plan`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const updateSupplyChainReference = (
  unitId: string,
  data: UpdateSupplyChainReferencePayload,
) => api.patch(`/units/${unitId}/supply-chain-reference`, data)
