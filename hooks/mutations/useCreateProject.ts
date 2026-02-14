import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { CreateProjectPayload } from '@/types'
import { queryKeys } from '@/lib/queryKeys'

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateProjectPayload) => {
      const response = await api.post('/projects', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
  })
}
