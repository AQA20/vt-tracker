'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

const TECHNICAL_KEYS = ['tech', 'sample', 'layout', 'car_m_dwg', 'cop_dwg', 'landing_dwg'] as const

export function TechnicalUnitsTableSkeleton({ showActions = true }: { showActions?: boolean }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`technical-card-skeleton-${index}`}
            className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="grid grid-cols-2 gap-2 border-t pt-4">
                {TECHNICAL_KEYS.map((key) => (
                  <div key={`technical-card-skeleton-${key}`} className="flex flex-col gap-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipment Number</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Tech Sub</TableHead>
              <TableHead className="text-center">Sample</TableHead>
              <TableHead className="text-center">Layout</TableHead>
              <TableHead className="text-center">Car M DWG</TableHead>
              <TableHead className="text-center">COP DWG</TableHead>
              <TableHead className="text-center">Landing DWG</TableHead>
              {showActions && (
                <TableHead className="text-right w-25">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`technical-row-skeleton-${index}`}>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                {TECHNICAL_KEYS.map((key) => (
                  <TableCell key={`technical-row-skeleton-${index}-${key}`} className="text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </TableCell>
                ))}
                {showActions && (
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
