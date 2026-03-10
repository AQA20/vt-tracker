import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import api from '@/services/api'

export interface WIRUpload {
  id: string
  unit_id: string
  progress_group: 'installation' | 'commissioning'
  file_path: string
  file_name: string
  file_size: number
  uploaded_by: string
  created_at: string
  updated_at: string
}

export function useWIRUploadsQuery(unitId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.units.wirUploads(unitId),
    queryFn: async (): Promise<{ data: WIRUpload[] }> => {
      const response = await api.get(`/units/${unitId}/wir-uploads`)
      return response.data
    },
    enabled: !!unitId && enabled,
  })
}
