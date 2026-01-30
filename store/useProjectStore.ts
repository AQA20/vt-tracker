import { create } from 'zustand';
import api from '@/services/api';
import { Project, Unit, CreateProjectPayload, CreateUnitPayload, UpdateTaskPayload } from '@/types';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  units: Unit[];
  isLoading: boolean;
  error: string | null;

  fetchProjects: () => Promise<void>;
  fetchProjectById: (id: string) => Promise<void>;
  createProject: (data: CreateProjectPayload) => Promise<void>;
  
  fetchUnits: (projectId: string) => Promise<void>;
  createUnit: (projectId: string, data: CreateUnitPayload) => Promise<void>;
  fetchUnitStages: (unitId: string) => Promise<void>;
  fetchStageTasks: (stageId: string) => Promise<void>;
  
  updateTaskStatus: (unitId: string, taskId: string, payload: UpdateTaskPayload) => Promise<void>;
  completeStage: (unitId: string, stageId: string, completed: boolean) => Promise<void>;
  
  fetchRideComfortData: (unitId: string) => Promise<Record<string, unknown>>;
  submitRideComfortData: (unitId: string, data: Record<string, unknown>) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  units: [],
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/projects');
      const data = response.data.data || response.data;
      set({ projects: data || [] });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch projects';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProjectById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/projects/${id}`);
      set({ currentProject: response.data });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch project';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  createProject: async (data) => {
    try {
      await api.post('/projects', data);
      await get().fetchProjects();
    } catch (error) {
      throw error;
    }
  },

  fetchUnits: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/projects/${projectId}/units`);
      // Handle potential Laravel resource wrapper
      const data = response.data.data || response.data;
      set({ units: data || [] });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch units';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  createUnit: async (projectId, data) => {
    try {
      await api.post(`/projects/${projectId}/units`, data);
      await get().fetchUnits(projectId);
    } catch (error) {
      throw error;
    }
  },

  fetchUnitStages: async (unitId) => {
    try {
        const response = await api.get(`/units/${unitId}/stages`);
        const stages = response.data;
        
        set((state) => ({
            units: state.units.map(u => 
                u.id === unitId ? { ...u, stages: stages } : u
            )
        }));
    } catch (error) {
        console.error("Failed to fetch stages", error);
    }
  },

  fetchStageTasks: async (stageId) => {
    try {
        const response = await api.get(`/stages/${stageId}/tasks`);
        const tasks = response.data;
        
        set((state) => {
             // Find the unit that contains this stage
             const newUnits = state.units.map(unit => {
                 if (!unit.stages) return unit;
                 const stageIndex = unit.stages.findIndex(s => s.id === stageId);
                 if (stageIndex === -1) return unit;
                 
                 const newStages = [...unit.stages];
                 newStages[stageIndex] = { ...newStages[stageIndex], tasks: tasks };
                 return { ...unit, stages: newStages };
             });
             return { units: newUnits };
        });
    } catch (error) {
        console.error("Failed to fetch tasks", error);
    }
  },

  updateTaskStatus: async (unitId, taskId, payload) => {
      // Optimistic update
      const { units } = get();
      const unitIndex = units.findIndex(u => u.id === unitId);
      if (unitIndex === -1) return;

      const newUnits = [...units];
      const unit = { ...newUnits[unitIndex] };

      if (unit.stages) {
          unit.stages = unit.stages.map(stage => {
              // Check if this stage contains the task
              const taskIndex = stage.tasks?.findIndex(t => t.id === taskId);
              if (taskIndex !== undefined && taskIndex !== -1 && stage.tasks) {
                  const newTasks = [...stage.tasks];
                  newTasks[taskIndex] = { ...newTasks[taskIndex], ...payload };
                  
                  // Check if all tasks are passed
                  const allPassed = newTasks.every(t => t.status === 'pass');
                  const newStatus = allPassed ? 'completed' : 'pending'; // or 'in_progress'

                  return { ...stage, tasks: newTasks, status: newStatus };
              }
              return stage;
          });
      }
      
      // Also update unit progress logic if needed, but for now just stage/task
      newUnits[unitIndex] = unit;
      set({ units: newUnits });

      try {
          // We only send the task update to the backend. 
          // Assuming backend handles stage rollup or we might need to send stage update too.
          // For now, consistent with request "stage only completes when tasks done".
          await api.put(`/tasks/${taskId}`, payload);
      } catch {
          // Revert optimistic update
          set({ units: units });
          console.error("Failed to update task");
      }
  },

  completeStage: async (unitId, stageId, completed) => {
      const { units } = get();
      const unitIndex = units.findIndex(u => u.id === unitId);
      if (unitIndex === -1) return;

      const newUnits = [...units];
      const unit = { ...newUnits[unitIndex] };

      if (unit.stages) {
          const stageIndex = unit.stages.findIndex(s => s.id === stageId);
          if (stageIndex !== -1 && unit.stages[stageIndex].tasks) {
               const newStatus = completed ? 'pass' : 'pending';
               const newStageStatus = completed ? 'completed' : 'pending';
               
               const newTasks = unit.stages[stageIndex].tasks!.map(t => ({ ...t, status: newStatus }));
               
               const newStages = [...unit.stages];
               newStages[stageIndex] = { 
                   ...newStages[stageIndex], 
                   tasks: newTasks, 
                   status: newStageStatus 
               };
               unit.stages = newStages;
               
               // Optimistic update
               newUnits[unitIndex] = unit;
               set({ units: newUnits });
               
                // API calls
                try {
                    // Update stage status directly
                    await api.put(`/stages/${stageId}`, { status: newStageStatus });
                    
                    // Also update tasks if they exist
                    if (newTasks.length > 0) {
                        await Promise.all(newTasks.map(task => 
                            api.put(`/tasks/${task.id}`, { status: newStatus })
                        ));
                    }
                } catch (error) {
                    console.error("Failed to update stage/tasks on backend", error);
                    // Revert optimistic update
                    set({ units: units });
                }
            }
        }
    },

  fetchRideComfortData: async (unitId: string) => {
      try {
          const response = await api.get(`/units/${unitId}/ride-comfort`);
          return response.data;
      } catch (error) {
          console.error("Failed to fetch ride comfort data", error);
          throw error;
      }
  },

  submitRideComfortData: async (unitId: string, data: Record<string, unknown>) => {
      try {
          await api.post(`/units/${unitId}/ride-comfort`, data);
      } catch (error) {
          console.error("Failed to submit ride comfort data", error);
          throw error;
      }
  }
}));
