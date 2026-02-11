import api from './api'
import { DeliveryGroupItem, DeliveryModule } from '@/types'

export const getDeliveryModules = async () => {
  return api.get<{ data: DeliveryModule[] }>('/delivery-modules')
}

export const getDeliveryGroupItems = async (deliveryGroupId: string) => {
  return api.get<{ data: DeliveryGroupItem[] }>(
    `/delivery-groups/${deliveryGroupId}/items`,
  )
}

export const createDeliveryGroupItem = async (
  deliveryGroupId: string,
  data: {
    delivery_module_content_id: string
    remarks?: string | null
    package_type: string
    special_delivery_address?: string | null
  },
) => {
  return api.post<{ data: DeliveryGroupItem }>(
    `/delivery-groups/${deliveryGroupId}/items`,
    data,
  )
}

export const deleteDeliveryGroupItem = async (
  deliveryGroupId: string,
  itemId: string,
) => {
  return api.delete(`/delivery-groups/${deliveryGroupId}/items/${itemId}`)
}
