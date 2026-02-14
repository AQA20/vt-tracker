import { Unit } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface UnitsTableProps {
  units: Unit[]
}

export function UnitsTable({ units }: UnitsTableProps) {
  if (units.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No units found for this project.
      </div>
    )
  }

  return (
    <div className="max-h-[300px] overflow-auto scrollbar-thin">
      <Table>
        <TableHeader className="bg-muted/50 sticky top-0 z-10">
          <TableRow>
            <TableHead className="text-[10px] font-bold uppercase py-2">
              Equipment #
            </TableHead>
            <TableHead className="text-[10px] font-bold uppercase py-2">
              Type
            </TableHead>
            <TableHead className="text-[10px] font-bold uppercase py-2">
              Progress
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {units.map((unit) => (
            <TableRow
              key={unit.id}
              className="hover:bg-muted/30 transition-colors"
            >
              <TableCell className="py-2 text-xs font-medium">
                {unit.equipment_number}
              </TableCell>
              <TableCell className="py-2 text-xs text-muted-foreground">
                {unit.unit_type}
              </TableCell>
              <TableCell className="py-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${unit.progress_percent || 0}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold whitespace-nowrap">
                    {unit.progress_percent || 0}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
