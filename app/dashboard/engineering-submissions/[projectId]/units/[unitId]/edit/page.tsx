'use client'

import { useEffect, use, useState } from 'react'
import { useProjectStore } from '@/store/useProjectStore'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Loader2,
  FileUp,
  FileDown,
  FileText,
  Plus,
  Copy,
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { STATUS_STATES } from '@/components/modules/engineering-submissions/constants'
import { StatusUpdate, StatusApproval, StatusRevision } from '@/types'
import {
  updateStatusUpdate,
  uploadStatusUpdatePdf,
  updateStatusApproval,
  createStatusApproval,
  createStatusRevision,
  updateStatusRevision,
  bulkCopyUnitStatus,
} from '@/services/engineeringSubmissionService'
import { CopyStatusModal } from '@/components/modules/engineering-submissions/copy-status-modal'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

export default function EditUnitStatusPage({
  params,
}: {
  params: Promise<{ projectId: string; unitId: string }>
}) {
  const { projectId, unitId } = use(params)
  const { currentProject, fetchProjectById, units, isLoading, fetchUnits } =
    useProjectStore()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Local state for fetching/loading
  const [isInternalLoading, setIsInternalLoading] = useState(false)

  // Copy Status Modal State
  const [copyModalOpen, setCopyModalOpen] = useState(false)
  const [targetCopyCategory, setTargetCopyCategory] = useState<{
    key: string
    label: string
  } | null>(null)

  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId)
      fetchUnits(projectId)
    }
  }, [projectId, fetchProjectById, fetchUnits])

  const unit = units.find((u) => u.id === unitId)

  if (!unit || (!currentProject && isLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : (
          <p>Unit not found</p>
        )}
      </div>
    )
  }

  const handleStatusChange = async (
    statusUpdateId: string,
    newStatus: string,
  ) => {
    setUpdatingId(statusUpdateId)
    try {
      await updateStatusUpdate(statusUpdateId, newStatus)
      toast.success('Status updated successfully')
      fetchUnits(projectId) // Refresh data
    } catch (error) {
      console.error('Failed to update status', error)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleFileUpload = async (statusUpdateId: string, file: File) => {
    setUpdatingId(statusUpdateId)
    try {
      await uploadStatusUpdatePdf(statusUpdateId, file)
      toast.success('PDF uploaded successfully')
      fetchUnits(projectId)
    } catch (error) {
      console.error('Failed to upload PDF', error)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleApprovalDateChange = async (
    approvalId: string,
    newDate: string,
  ) => {
    if (!newDate) return
    setUpdatingId(`approval-${approvalId}`)
    try {
      const formattedDateTime = `${newDate} 12:00:00`
      await updateStatusApproval(approvalId, formattedDateTime)
      toast.success('Approval date updated')
      fetchUnits(projectId)
    } catch (error) {
      console.error('Failed to update approval date', error)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleCreateApproval = async (
    statusUpdateId: string,
    approvalCode: string,
  ) => {
    setUpdatingId(`create-${statusUpdateId}-${approvalCode}`)
    try {
      const today = new Date().toISOString().split('T')[0]
      const approvedAt = `${today} 12:00:00`
      await createStatusApproval({
        status_update_id: statusUpdateId,
        approval_code: approvalCode,
        approved_at: approvedAt,
      })
      toast.success(`Code ${approvalCode} approval added`)
      fetchUnits(projectId)
    } catch (error) {
      console.error('Failed to create approval', error)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleCreateRevision = async (
    statusUpdateId: string,
    revisionNumber: number,
    category: 'submitted' | 'rejected',
  ) => {
    setUpdatingId(`rev-create-${statusUpdateId}-${revisionNumber}`)
    try {
      const today = new Date().toISOString().split('T')[0]
      const revisionDate = `${today} 12:00:00`
      await createStatusRevision({
        status_update_id: statusUpdateId,
        revision_date: revisionDate,
        revision_number: revisionNumber,
        category,
      })
      toast.success(`REV${String(revisionNumber).padStart(2, '0')} added`)
      fetchUnits(projectId)
    } catch (error) {
      console.error('Failed to create revision', error)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRevisionDateChange = async (
    revisionId: string,
    newDate: string,
  ) => {
    if (!newDate) return
    setUpdatingId(`rev-update-${revisionId}`)
    try {
      const formattedDate = `${newDate} 12:00:00`
      await updateStatusRevision(revisionId, formattedDate)
      toast.success('Revision date updated')
      fetchUnits(projectId)
    } catch (error) {
      console.error('Failed to update revision date', error)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleCopyStatus = async (targetUnitIds: string[]) => {
    if (!targetCopyCategory) return
    setIsInternalLoading(true)
    try {
      await bulkCopyUnitStatus(unitId, targetCopyCategory.key, {
        target_unit_ids: targetUnitIds,
      })
      toast.success(
        `Status copied successfully to ${targetUnitIds.length} units`,
      )
      await fetchUnits(projectId)
      setCopyModalOpen(false)
    } catch (error) {
      console.error('Failed to copy status', error)
    } finally {
      setIsInternalLoading(false)
    }
  }

  const getCategoryLabel = (key: string) => {
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

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-7xl">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/engineering-submissions/${projectId}/units`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Edit Status: {unit.equipment_number}
          </h1>
          <p className="text-sm text-muted-foreground">
            {currentProject?.name} • {unit.unit_type}
          </p>
        </div>
      </div>

      {(isLoading || isInternalLoading) && !unit && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(() => {
          let updates = unit.status_updates || unit.statusUpdates || []
          if (updates && !Array.isArray(updates) && 'data' in updates) {
            updates = (updates as { data: StatusUpdate[] }).data
          }

          const updatesArray = (
            Array.isArray(updates) ? updates : Object.values(updates || {})
          ) as StatusUpdate[]

          if (updatesArray.length === 0) return null

          const CATEGORY_ORDER = [
            'tech',
            'sample',
            'layout',
            'car_m_dwg',
            'cop_dwg',
            'landing_dwg',
          ]

          const sortedUpdates = [...updatesArray].sort(
            (a: StatusUpdate, b: StatusUpdate) => {
              const orderA = CATEGORY_ORDER.indexOf(a.category || '')
              const orderB = CATEGORY_ORDER.indexOf(b.category || '')
              const diff =
                (orderA === -1 ? 999 : orderA) - (orderB === -1 ? 999 : orderB)
              if (diff !== 0) return diff
              return String(a.id).localeCompare(String(b.id))
            },
          )

          return sortedUpdates.map((update: StatusUpdate, index: number) => {
            const isApproved = update.status === 'approved'
            const isInProgress = update.status === 'in_progress'
            const cat = {
              key: update.category || '',
              label: getCategoryLabel(update.category || ''),
            }

            let pdfPath = null
            if (isApproved) {
              const lastApproval =
                update.approvals?.[update.approvals.length - 1]
              if (
                lastApproval &&
                ['A', 'B'].includes(lastApproval.approval_code)
              ) {
                pdfPath = lastApproval.pdf_path
              }
            } else if (!isInProgress && update.status) {
              const statusKey = update.status as 'submitted' | 'rejected'
              const statusRevisions = update.revisions?.[statusKey] || []
              const lastRevision = statusRevisions[statusRevisions.length - 1]
              pdfPath = lastRevision?.pdf_path
            }

            return (
              <Card
                key={update.id}
                className="overflow-hidden border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col"
              >
                <div className="p-4 border-b bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm">{cat.label}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {units.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] gap-1.5 font-bold uppercase tracking-wider px-2 bg-background hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                        onClick={() => {
                          setTargetCopyCategory(cat)
                          setCopyModalOpen(true)
                        }}
                      >
                        <Copy className="h-3 w-3" />
                        Copy Status
                      </Button>
                    )}
                    <Badge
                      className="py-1 px-3 text-[10px] font-bold uppercase tracking-widest border-none shadow-sm"
                      variant={
                        update?.status === 'approved'
                          ? 'success'
                          : update?.status === 'rejected'
                            ? 'destructive'
                            : update?.status === 'submitted'
                              ? 'info'
                              : 'secondary'
                      }
                    >
                      {update?.status?.replace('_', ' ') || 'Not Started'}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6 flex-1 flex flex-col gap-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Current Status</p>
                      <p className="text-xs text-muted-foreground">
                        Select the new category status.
                      </p>
                    </div>

                    <div className="w-full">
                      <Select
                        value={update.status || ''}
                        onValueChange={(value) =>
                          handleStatusChange(update.id, value)
                        }
                        disabled={updatingId === update.id}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_STATES).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Approval Rows */}
                  {update.status === 'approved' && (
                    <div className="space-y-4 pt-2">
                      {(() => {
                        const hasCodeA = (update.approvals || []).some(
                          (a: StatusApproval) => a.approval_code === 'A',
                        )
                        const hasCodeB = (update.approvals || []).some(
                          (a: StatusApproval) => a.approval_code === 'B',
                        )

                        return (
                          <div className="flex items-center justify-between border-b pb-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Approval History
                            </p>
                            <div className="flex gap-1.5">
                              {(!hasCodeA || !hasCodeB) && (
                                <Select
                                  onValueChange={(val) =>
                                    handleCreateApproval(update.id, val)
                                  }
                                  disabled={
                                    updatingId === `create-${update.id}-A` ||
                                    updatingId === `create-${update.id}-B`
                                  }
                                >
                                  <SelectTrigger className="h-6 w-auto px-1.5 text-[9px] gap-1 border-none shadow-none text-primary hover:bg-primary/5 cursor-pointer">
                                    <Plus className="h-2.5 w-2.5" />
                                    <span>Add Approval</span>
                                  </SelectTrigger>
                                  <SelectContent align="end">
                                    {!hasCodeA && (
                                      <SelectItem value="A" className="text-xs">
                                        Code A
                                      </SelectItem>
                                    )}
                                    {!hasCodeB && (
                                      <SelectItem value="B" className="text-xs">
                                        Code B
                                      </SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          </div>
                        )
                      })()}

                      {[...(update.approvals || [])]
                        .sort((a, b) =>
                          String(a.approval_code).localeCompare(
                            String(b.approval_code),
                          ),
                        )
                        .map((approval: StatusApproval, idx: number) => {
                          const label =
                            approval.approval_code === 'A'
                              ? 'Code A approved'
                              : 'Code B approved with comment'

                          return (
                            <div
                              key={`${approval.approval_code}-${approval.id || idx}`}
                              className="space-y-1.5"
                            >
                              <Label className="text-xs font-semibold text-zinc-500">
                                {label}
                              </Label>
                              <Input
                                type="date"
                                value={formatDate(approval.approved_at)}
                                onChange={(e) =>
                                  handleApprovalDateChange(
                                    approval.id,
                                    e.target.value,
                                  )
                                }
                                disabled={
                                  updatingId === `approval-${approval.id}`
                                }
                                className="h-9 text-xs bg-white dark:bg-zinc-950 shadow-none border-zinc-200 dark:border-zinc-800 cursor-pointer"
                              />
                            </div>
                          )
                        })}
                      {(update.approvals || []).length === 0 && (
                        <p className="text-[10px] text-muted-foreground italic py-2">
                          No approval records found. Click buttons above to add.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Revision History Rows (Submitted or Rejected) */}
                  {(update.status === 'submitted' ||
                    update.status === 'rejected') && (
                    <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Revision History
                        </p>
                        <Select
                          key={`${update.id}-${update.status}-${
                            (
                              update.revisions?.[
                                update.status as 'submitted' | 'rejected'
                              ] || []
                            ).length
                          }`}
                          onValueChange={(val) => {
                            const statusKey = update.status as
                              | 'submitted'
                              | 'rejected'
                            handleCreateRevision(
                              update.id,
                              parseInt(val),
                              statusKey,
                            )
                          }}
                          disabled={
                            updatingId?.startsWith('rev-create-') ||
                            (
                              update.revisions?.[
                                update.status as 'submitted' | 'rejected'
                              ] || []
                            ).length >= 9
                          }
                        >
                          <SelectTrigger className="h-6 w-auto px-2 text-[9px] gap-1.5 border-none shadow-none text-primary hover:bg-primary/5 cursor-pointer">
                            <Plus className="h-2.5 w-2.5" />
                            <span>Add Revision</span>
                          </SelectTrigger>
                          <SelectContent align="end">
                            {Array.from({ length: 9 }, (_, i) => i)
                              .filter(
                                (num) =>
                                  !(
                                    update.revisions?.[
                                      update.status as 'submitted' | 'rejected'
                                    ] || []
                                  ).some(
                                    (r: StatusRevision) =>
                                      r.revision_number === num,
                                  ),
                              )
                              .map((num) => (
                                <SelectItem
                                  key={num}
                                  value={num.toString()}
                                  className="text-xs"
                                >
                                  REV{String(num).padStart(2, '0')}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        {(() => {
                          const statusKey = update.status as
                            | 'submitted'
                            | 'rejected'
                          const revisions = update.revisions?.[statusKey] || []
                          return [...revisions]
                            .sort(
                              (a, b) =>
                                (a.revision_number || 0) -
                                (b.revision_number || 0),
                            )
                            .map((rev: StatusRevision) => (
                              <div key={rev.id} className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                  REV
                                  {String(rev.revision_number).padStart(2, '0')}
                                </Label>
                                <Input
                                  type="date"
                                  value={formatDate(rev.revision_date)}
                                  onChange={(e) =>
                                    handleRevisionDateChange(
                                      rev.id,
                                      e.target.value,
                                    )
                                  }
                                  disabled={
                                    updatingId === `rev-update-${rev.id}`
                                  }
                                  className="h-9 text-xs bg-white dark:bg-zinc-950 shadow-none border-zinc-200 dark:border-zinc-800 cursor-pointer"
                                />
                              </div>
                            ))
                        })()}
                        {(
                          update.revisions?.[
                            update.status as 'submitted' | 'rejected'
                          ] || []
                        ).length === 0 && (
                          <div className="text-center py-4 rounded-md border border-dashed bg-muted/5">
                            <p className="text-[10px] text-muted-foreground italic">
                              No revisions tracked. Click &apos;Add
                              Revision&apos; to start.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PDF Upload/Download Section */}
                  {!isInProgress && update.id && update.status && (
                    <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-800 mt-auto">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Technical Attachment
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Download or upload the latest PDF.
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        {pdfPath ? (
                          <Button
                            variant="outline"
                            className="w-full justify-start gap-2 h-9 text-xs"
                            asChild
                          >
                            <a
                              href={
                                pdfPath.startsWith('http')
                                  ? pdfPath
                                  : `${process.env.NEXT_PUBLIC_API_URL || ''}/storage/${pdfPath}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FileDown className="h-3.5 w-3.5" />
                              Download Attachment
                            </a>
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30 text-muted-foreground text-[10px] border border-dashed">
                            <FileText className="h-3 w-3" />
                            No attachment found
                          </div>
                        )}

                        <div className="relative">
                          <input
                            type="file"
                            accept=".pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleFileUpload(update.id, file)
                            }}
                            disabled={updatingId === update.id}
                          />
                          <Button
                            variant="secondary"
                            className="w-full justify-start gap-2 h-9 text-xs"
                            disabled={updatingId === update.id}
                          >
                            <FileUp className="h-3.5 w-3.5" />
                            Upload New PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        })()}
      </div>

      <CopyStatusModal
        isOpen={copyModalOpen}
        onClose={() => {
          setCopyModalOpen(false)
          setTargetCopyCategory(null)
        }}
        onCopy={handleCopyStatus}
        projectId={projectId}
        currentUnitId={unitId}
        targetCategory={targetCopyCategory?.key || ''}
        targetCategoryLabel={targetCopyCategory?.label || ''}
      />
    </div>
  )
}
