'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TableCell } from '@/components/ui/table'

/** Expandable / collapsible cell for long unit descriptions (desktop table) */
export function ExpandableDescriptionCell({ description }: { description?: string | null }) {
  const [expanded, setExpanded] = useState(false)
  if (!description) return <TableCell>-</TableCell>
  const isLong = description.length > 60
  return (
    <TableCell className="max-w-55">
      <span>
        {expanded || !isLong ? description : description.slice(0, 60) + '...'}
      </span>
      {isLong && (
        <Button
          variant="link"
          size="sm"
          className="ml-2 px-1 text-xs h-auto min-h-0"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded((v) => !v)
          }}
        >
          {expanded ? 'Show less' : 'Show more'}
        </Button>
      )}
    </TableCell>
  )
}

/** Expandable / collapsible for mobile card */
export function ExpandableDescriptionCard({ description }: { description?: string | null }) {
  const [expanded, setExpanded] = useState(false)
  if (!description)
    return (
      <div>
        <span className="font-semibold text-muted-foreground">Description:</span> -
      </div>
    )
  const isLong = description.length > 60
  return (
    <div>
      <span className="font-semibold text-muted-foreground">Description:</span>{' '}
      <span>
        {expanded || !isLong ? description : description.slice(0, 60) + '...'}
      </span>
      {isLong && (
        <Button
          variant="link"
          size="sm"
          className="ml-2 px-1 text-xs h-auto min-h-0"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded((v) => !v)
          }}
        >
          {expanded ? 'Show less' : 'Show more'}
        </Button>
      )}
    </div>
  )
}
