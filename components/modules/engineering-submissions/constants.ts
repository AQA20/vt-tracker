export const STATUS_CATEGORIES = {
  tech: 'Tech Sub Status',
  sample: 'Sample Status',
  layout: 'Layout Status',
  car_m_dwg: 'Car M DWG Status',
  cop_dwg: 'COP DWG Status',
  landing_dwg: 'Landing DWG Status',
} as const;

export type StatusCategory = keyof typeof STATUS_CATEGORIES;

export const STATUS_STATES = {
  submitted: 'Submitted',
  in_progress: 'In Progress',
  rejected: 'Rejected',
  approved: 'Approved',
} as const;

export type StatusState = keyof typeof STATUS_STATES;

export interface CategoryStats {
  submitted: number;
  in_progress: number;
  rejected: number;
  approved: number;
}

export interface ProjectStats {
  [key: string]: CategoryStats;
}
