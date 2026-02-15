'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCopyStatusModal } from '@/hooks/useCopyStatusModal'

interface CopyStatusModalProps {
  isOpen: boolean
  onClose: () => void
  onCopy: (targetUnitIds: string[]) => Promise<void>
  projectId: string
  currentUnitId: string
  targetCategory: string
  targetCategoryLabel: string
}

export function CopyStatusModal({
  isOpen,
  onClose,
  onCopy,
  projectId,
  currentUnitId,
  targetCategoryLabel,
}: CopyStatusModalProps) {
  const {
    units,
    isLoading,
    selectedUnitIds,
    isSubmitting,
    isAllSelected,
    handleToggleUnit,
    handleSelectAll,
    handleCopy,
  } = useCopyStatusModal({
    isOpen,
    projectId,
    currentUnitId,
    onCopy,
    onClose,
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] flex flex-col p-4 sm:p-6 !rounded-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Bulk Copy {targetCategoryLabel} Status to Other Units
          </DialogTitle>
          <DialogDescription className="text-sm">
            Select the target units where you want to apply the current
            unit&apos;s **
            {targetCategoryLabel}** status, including all approvals, revisions,
            and PDF attachments.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden min-h-0 flex flex-col border-y my-2 border-zinc-100 dark:border-zinc-800">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="select-all"
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label
                    htmlFor="select-all"
                    className="font-bold text-sm cursor-pointer select-none"
                  >
                    Select All ({units.length})
                  </Label>
                </div>
                {selectedUnitIds.length > 0 && (
                  <Badge variant="secondary" className="font-bold">
                    {selectedUnitIds.length} selected
                  </Badge>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {units.map((unit) => (
                    <div
                      key={unit.id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none',
                        selectedUnitIds.includes(unit.id)
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/10'
                          : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900',
                      )}
                      onClick={() => handleToggleUnit(unit.id)}
                    >
                      <Checkbox
                        checked={selectedUnitIds.includes(unit.id)}
                        onCheckedChange={() => handleToggleUnit(unit.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex flex-col min-w-0">
                        <Label className="font-bold text-xs truncate cursor-pointer">
                          {unit.equipment_number}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 text-orange-700 dark:text-orange-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold mb-1 uppercase tracking-wider">
                Crucial Warning
              </p>
              This will **permanently overwrite** the current status, approvals,
              and revisions for all selected units. This action cannot be
              undone.
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-11"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleCopy}
              disabled={selectedUnitIds.length === 0 || isSubmitting}
              className="w-full sm:flex-1 h-11 font-bold shadow-lg shadow-destructive/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Bulk Copy...
                </>
              ) : (
                `Overwrite & Copy Status to ${selectedUnitIds.length} Unit${selectedUnitIds.length === 1 ? '' : 's'}`
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
