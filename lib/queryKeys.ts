/**
 * Centralised query key factory.
 * Every key used by React Query should come from here so invalidation is consistent.
 */
export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    list: (params: { page?: number; search?: string; perPage?: number }) =>
      ['projects', params] as const,
    detail: (id: string) => ['projects', id] as const,
    stats: (id: string) => ['projects', id, 'stats'] as const,
  },
  units: {
    list: (projectId: string, params: { page?: number; search?: string; perPage?: number }) =>
      ['projects', projectId, 'units', params] as const,
    stages: (unitId: string) => ['units', unitId, 'stages'] as const,
    rideComfort: (unitId: string) => ['units', unitId, 'ride-comfort'] as const,
  },
  delivery: {
    projects: (params: { page?: number; search?: string; perPage?: number }) =>
      ['delivery', 'projects', params] as const,
  },
  engineering: {
    projects: (params: { page?: number; search?: string; perPage?: number }) =>
      ['engineering', 'projects', params] as const,
  },
} as const
