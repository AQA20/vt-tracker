export interface User {
  id: number
  name: string
  email: string
  role?: string
  email_verified_at?: string
  created_at?: string
  updated_at?: string
}

export interface Project {
  id: string
  name: string
  client_name: string
  location: string
  created_at: string
  updated_at: string
  completion_percentage: number
  installation_progress: number
  commissioning_progress: number
  units_count?: number
  units?: Unit[]
}

export type StatusUpdateData = StatusUpdate[] | { data: StatusUpdate[] }

export interface Unit {
  id: string
  project_id: string
  unit_type: string
  equipment_number: string
  category: string
  progress_percent: number
  installation_progress: number
  commissioning_progress: number
  created_at?: string
  updated_at?: string
  stages?: Stage[]
  status_updates?: StatusUpdateData
  statusUpdates?: StatusUpdateData
}

export interface StatusRevision {
  id: string
  status_update_id: string
  revision_number: number
  pdf_path: string | null
  revision_date: string | number
  created_at?: string
  updated_at?: string
}

export interface StatusApproval {
  id: string
  status_update_id: string
  approval_code: string
  approved_at: string
  pdf_path: string | null
  comment?: string
  created_at?: string
  updated_at?: string
}

export interface StatusUpdate {
  id: string
  unit_id: string
  category: string
  category_key?: string
  status: 'submitted' | 'approved' | 'rejected' | 'in_progress' | null
  notes?: string
  created_at: string
  updated_at: string
  revisions?: StatusRevision[]
  approvals?: StatusApproval[]
}

export interface Stage {
  id: string
  unit_id: string
  stage_template_id: number
  status: string
  started_at: string | null
  completed_at: string | null
  template: {
    id: number
    name: string
    title?: string
    description?: string
    stage_number: number
    progress_group?: string
  }
  tasks?: Task[]
}

export interface Task {
  id: string
  unit_stage_id: string
  task_template_id: number
  status: string
  measured_value: number | null
  notes: string | null
  template: {
    id: number
    name: string
    task_code: string
    description?: string
    requires_measurement?: boolean
  }
}

export interface CreateProjectPayload {
  name: string
  client_name: string
  location: string
}

export interface CreateUnitPayload {
  unit_type: string
  equipment_number: string
  category: string
}

export interface UpdateTaskPayload {
  status: string
  measurement?: number | null
  notes?: string | null
}

export interface CategoryStats {
  submitted: number
  in_progress: number
  rejected: number
  approved: number
}

export interface ProjectStats {
  [key: string]: CategoryStats
}
