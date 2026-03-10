import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { queryKeys } from '@/lib/queryKeys'

export type WIRProgressGroup = 'installation' | 'commissioning'

export interface WIRUploadResponse {
  data: {
    id: string
    unit_id: string
    progress_group: WIRProgressGroup
    file_path: string
    file_name: string
    file_size: number
    uploaded_by: string
    created_at: string
    updated_at: string
  }
}

export function useWIRUpload(unitId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { file: File; progress_group: WIRProgressGroup }) => {
      const formData = new FormData()
      formData.append('file', payload.file)
      formData.append('progress_group', payload.progress_group)

      const response = await api.post<WIRUploadResponse>(
        `/units/${unitId}/wir-uploads`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.units.wirUploads(unitId) })
    },
  })
}

export function useDeleteWIRUpload(unitId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (wirId: string) => {
      await api.delete(`/wir-uploads/${wirId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.units.wirUploads(unitId) })
    },
  })
}

export function useGetWIRUploads(unitId: string) {
  return useMutation({
    mutationFn: async () => {
      const response = await api.get(`/units/${unitId}/wir-uploads`)
      return response.data
    },
  })
}

export function useGetWIRByGroup(unitId: string, progressGroup: WIRProgressGroup) {
  return useMutation({
    mutationFn: async () => {
      const response = await api.get(`/units/${unitId}/wir-uploads/${progressGroup}`)
      return response.data
    },
  })
}
