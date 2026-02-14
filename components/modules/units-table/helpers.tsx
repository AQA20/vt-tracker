import { StatusUpdate } from '@/types'

/** Locate the StatusUpdate for a given technical category key */
export function getTechnicalUpdate(unit: { status_updates?: unknown; statusUpdates?: unknown }, key: string): StatusUpdate | undefined {
  if (!unit) return undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let updates: any = (unit as any).status_updates || (unit as any).statusUpdates || []

  // Handle Laravel-style .data wrapping if present
  if (updates && !Array.isArray(updates) && typeof updates === 'object' && updates !== null && 'data' in updates) {
    updates = updates.data
  }

  const updatesArray = (
    Array.isArray(updates) ? updates : Object.values(updates || {})
  ) as StatusUpdate[]

  return updatesArray.find((u: StatusUpdate) => u && u.category === key)
}

/** Render revision / approval details beneath a technical badge */
export function renderTechnicalDetails(update?: StatusUpdate) {
  if (!update || !update.status) return null

  const status = update.status
  const formatDate = (dateValue: string | number | null | undefined) => {
    if (!dateValue) return ''
    try {
      let date: Date
      if (typeof dateValue === 'number') {
        const timestamp = dateValue < 5000000000 ? dateValue * 1000 : dateValue
        date = new Date(timestamp)
      } else {
        const normalized = dateValue.includes(' ')
          ? dateValue.replace(' ', 'T')
          : dateValue
        date = new Date(normalized)
        if (isNaN(date.getTime())) {
          const num = Number(dateValue)
          if (!isNaN(num)) {
            const timestamp = num < 5000000000 ? num * 1000 : num
            date = new Date(timestamp)
          }
        }
      }
      if (isNaN(date.getTime())) return ''
      return date.toISOString().split('T')[0]
    } catch {
      return ''
    }
  }

  if (status === 'submitted' || status === 'rejected') {
    const statusKey = status as 'submitted' | 'rejected'
    const revisions = update.revisions?.[statusKey] || []
    if (revisions.length === 0) return null
    const lastRev = [...revisions].sort(
      (a, b) => (a.revision_number || 0) - (b.revision_number || 0),
    )[revisions.length - 1]

    return (
      <div className="text-[9px] text-muted-foreground font-medium leading-tight whitespace-nowrap">
        REV{String(lastRev.revision_number).padStart(2, '0')}{' '}
        {formatDate(lastRev.revision_date)}
      </div>
    )
  }

  if (status === 'approved') {
    const approvals = update.approvals || []
    if (approvals.length === 0) return null
    const lastApproval = approvals[approvals.length - 1]
    const label =
      lastApproval.approval_code === 'A'
        ? 'Code A approved'
        : 'Code B approved with comment'
    return (
      <div className="text-[9px] text-muted-foreground font-medium leading-tight">
        {label}
        <br />
        {formatDate(lastApproval.approved_at)}
      </div>
    )
  }

  return null
}

/** Map status string to Badge variant */
export function getStatusBadgeVariant(
  status?: string | null,
):
  | 'default'
  | 'secondary'
  | 'outline'
  | 'destructive'
  | 'success'
  | 'warning'
  | 'info' {
  switch (status) {
    case 'approved':
      return 'success'
    case 'submitted':
      return 'info'
    case 'rejected':
      return 'destructive'
    case 'in_progress':
      return 'warning'
    default:
      return 'outline'
  }
}

/** Humanise a status string */
export function getStatusLabel(status?: string | null) {
  if (!status) return 'N/A'
  return status.replace('_', ' ').toUpperCase()
}

/** Map a technical category key to a human label */
export function getCategoryLabel(key: string) {
  const labels: Record<string, string> = {
    tech: 'Tech Sub',
    sample: 'Sample',
    layout: 'Layout',
    car_m_dwg: 'Car M DWG',
    cop_dwg: 'COP DWG',
    landing_dwg: 'Landing DWG',
  }
  return labels[key] || key
}
