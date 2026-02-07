import { create } from 'zustand'
import api from '@/services/api'
import {
  Project,
  Unit,
  ProjectStats,
  CreateProjectPayload,
  CreateUnitPayload,
  UpdateTaskPayload,
} from '@/types'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  units: Unit[]
  stats: ProjectStats | null
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  perPage: number

  fetchProjects: (page?: number) => Promise<void>
  fetchProjectById: (id: string) => Promise<void>
  createProject: (data: CreateProjectPayload) => Promise<void>

  fetchUnits: (projectId: string) => Promise<void>
  fetchProjectStats: (projectId: string) => Promise<void>
  createUnit: (projectId: string, data: CreateUnitPayload) => Promise<void>
  fetchUnitStages: (unitId: string) => Promise<void>
  fetchStageTasks: (stageId: string) => Promise<void>

  updateTaskStatus: (
    unitId: string,
    taskId: string,
    payload: UpdateTaskPayload,
  ) => Promise<void>
  completeStage: (
    unitId: string,
    stageId: string,
    completed: boolean,
  ) => Promise<void>

  fetchRideComfortData: (unitId: string) => Promise<Record<string, unknown>>
  submitRideComfortData: (
    unitId: string,
    data: Record<string, unknown>,
  ) => Promise<void>
  deleteUnit: (unitId: string) => Promise<void>
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  units: [],
  stats: null,
  isLoading: false,
  error: null,
  page: 1,
  totalPages: 1,
  perPage: 6,

  fetchProjects: async (page = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get('/projects', {
        params: { page, per_page: 6 },
      })
      const responseData = response.data
      const data =
        responseData.data || (Array.isArray(responseData) ? responseData : [])
      const meta = responseData.meta || {}

      set({
        projects: data || [],
        page,
        totalPages: meta.last_page || (meta.lastPage ?? 1),
        perPage: meta.per_page || (meta.perPage ?? 6),
      })
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch projects'
      set({ error: message })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchProjectById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get(`/projects/${id}`)
      const data = response.data.data || response.data
      set({ currentProject: data })
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch project'
      set({ error: message })
    } finally {
      set({ isLoading: false })
    }
  },

  createProject: async (data) => {
    try {
      await api.post('/projects', data)
      await get().fetchProjects()
    } catch (error) {
      throw error
    }
  },

  fetchUnits: async (projectId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get(`/projects/${projectId}/units`, {
        params: {
          include:
            'statusUpdates,status_updates,statusUpdates.revisions,status_updates.revisions,statusUpdates.approvals,status_updates.approvals,stages.tasks',
        },
      })
      // Handle potential Laravel resource wrapper
      const data = response.data.data || response.data
      set({ units: data || [] })
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch units'
      set({ error: message })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchProjectStats: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/stats`)
      const data = response.data.data || response.data
      set({ stats: data })
    } catch (error) {
      console.error('Failed to fetch project stats', error)
    }
  },

  createUnit: async (projectId, data) => {
    try {
      await api.post(`/projects/${projectId}/units`, data)
      await get().fetchUnits(projectId)
    } catch (error) {
      throw error
    }
  },

  fetchUnitStages: async (unitId: string) => {
    try {
      const response = await api.get(`/units/${unitId}/stages`)
      // Handle Laravel resource wrapping
      let stages = response.data.data || response.data

      // Ensure stages is always an array
      if (!Array.isArray(stages)) {
        console.warn(`Stages for unit ${unitId} is not an array:`, stages)
        stages =
          typeof stages === 'object' && stages !== null
            ? Object.values(stages)
            : []
      }

      set((state) => ({
        units: state.units.map((u) =>
          u.id === unitId ? { ...u, stages: stages } : u,
        ),
      }))
    } catch (error) {
      console.error('Failed to fetch stages', error)
    }
  },

  fetchStageTasks: async (stageId: string) => {
    try {
      const response = await api.get(`/stages/${stageId}/tasks`)
      // Handle Laravel resource wrapping
      let tasks = response.data.data || response.data

      // Ensure tasks is always an array
      if (!Array.isArray(tasks)) {
        console.warn(`Tasks for stage ${stageId} is not an array:`, tasks)
        tasks =
          typeof tasks === 'object' && tasks !== null
            ? Object.values(tasks)
            : []
      }

      set((state) => {
        // Find the unit that contains this stage
        const newUnits = state.units.map((unit) => {
          if (!unit.stages || !Array.isArray(unit.stages)) return unit
          const stageIndex = unit.stages.findIndex((s) => s.id === stageId)
          if (stageIndex === -1) return unit

          const newStages = [...unit.stages]
          newStages[stageIndex] = { ...newStages[stageIndex], tasks: tasks }
          return { ...unit, stages: newStages }
        })
        return { units: newUnits }
      })
    } catch (error) {
      console.error('Failed to fetch tasks', error)
    }
  },

  updateTaskStatus: async (unitId, taskId, payload) => {
    // Optimistic update
    const { units } = get()
    const unitIndex = units.findIndex((u) => u.id === unitId)
    if (unitIndex === -1) return

    const newUnits = [...units]
    const unit = { ...newUnits[unitIndex] }

    if (unit.stages) {
      unit.stages = unit.stages.map((stage) => {
        // Check if this stage contains the task
        const taskIndex = stage.tasks?.findIndex((t) => t.id === taskId)
        if (taskIndex !== undefined && taskIndex !== -1 && stage.tasks) {
          const newTasks = [...stage.tasks]
          newTasks[taskIndex] = { ...newTasks[taskIndex], ...payload }

          // Check if all tasks are passed
          const allPassed = newTasks.every((t) => t.status === 'pass')
          const newStatus = allPassed ? 'completed' : 'pending' // or 'in_progress'

          return { ...stage, tasks: newTasks, status: newStatus }
        }
        return stage
      })
    }

    // Also update unit progress logic if needed, but for now just stage/task
    newUnits[unitIndex] = unit
    set({ units: newUnits })

    try {
      // We only send the task update to the backend.
      // Assuming backend handles stage rollup or we might need to send stage update too.
      // For now, consistent with request "stage only completes when tasks done".
      await api.put(`/tasks/${taskId}`, payload)
    } catch {
      // Revert optimistic update
      set({ units: units })
      console.error('Failed to update task')
    }
  },

  completeStage: async (unitId, stageId, completed) => {
    const { units } = get()
    const unitIndex = units.findIndex((u) => u.id === unitId)
    if (unitIndex === -1) return

    const newUnits = [...units]
    const unit = { ...newUnits[unitIndex] }

    if (unit.stages) {
      const stageIndex = unit.stages.findIndex((s) => s.id === stageId)
      if (stageIndex !== -1 && unit.stages[stageIndex].tasks) {
        const newStatus = completed ? 'pass' : 'pending'
        const newStageStatus = completed ? 'completed' : 'pending'

        const newTasks = unit.stages[stageIndex].tasks!.map((t) => ({
          ...t,
          status: newStatus,
        }))

        const newStages = [...unit.stages]
        newStages[stageIndex] = {
          ...newStages[stageIndex],
          tasks: newTasks,
          status: newStageStatus,
        }
        unit.stages = newStages

        // Optimistic update
        newUnits[unitIndex] = unit
        set({ units: newUnits })

        // API calls
        try {
          // Update stage status directly
          await api.put(`/stages/${stageId}`, { status: newStageStatus })

          // Also update tasks if they exist
          if (newTasks.length > 0) {
            await Promise.all(
              newTasks.map((task) =>
                api.put(`/tasks/${task.id}`, { status: newStatus }),
              ),
            )
          }
        } catch (error) {
          console.error('Failed to update stage/tasks on backend', error)
          // Revert optimistic update
          set({ units: units })
        }
      }
    }
  },

  fetchRideComfortData: async (unitId: string) => {
    try {
      const response = await api.get(`/units/${unitId}/ride-comfort`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch ride comfort data', error)
      throw error
    }
  },

  submitRideComfortData: async (
    unitId: string,
    data: Record<string, unknown>,
  ) => {
    try {
      await api.post(`/units/${unitId}/ride-comfort`, data)
    } catch (error) {
      console.error('Failed to submit ride comfort data', error)
      throw error
    }
  },

  deleteUnit: async (unitId: string) => {
    const { units } = get()
    // Optimistic update
    set({ units: units.filter((u) => u.id !== unitId) })

    try {
      await api.delete(`/units/${unitId}`)
    } catch (error) {
      // Rollback on failure
      set({ units: units })
      throw error
    }
  },
}))
