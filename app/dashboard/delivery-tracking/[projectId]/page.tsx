'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getProjectUnits } from '@/services/engineeringSubmissionService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Truck, LayoutGrid, Table as TableIcon } from 'lucide-react'
import { Unit } from '@/types'
import { DeliveryOverviewTable } from '@/components/delivery-tracking/DeliveryOverviewTable'

export default function ProjectDeliveryPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  useEffect(() => {
    const fetchUnits = async () => {
      setLoading(true)
      try {
        const response = await getProjectUnits(projectId)
        const data = response.data.data || response.data
        setUnits(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch units', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUnits()
  }, [projectId])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/delivery-tracking">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Project Delivery Units
          </h1>
          <p className="text-sm text-muted-foreground">
            Track delivery milestones across all units.
          </p>
        </div>
        <div className="flex items-center border rounded-md p-1 bg-muted/30 mr-2">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-8 px-2"
          >
            <LayoutGrid className="h-4 w-4 mr-1" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="h-8 px-2"
          >
            <TableIcon className="h-4 w-4 mr-1" />
            Table
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : units.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No units found in this project.
        </div>
      ) : viewMode === 'table' ? (
        <DeliveryOverviewTable units={units} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {units.map((unit) => (
            <Link
              key={unit.id}
              href={`/dashboard/delivery-tracking/${projectId}/units/${unit.id}`}
            >
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between">
                    {unit.equipment_number}
                    <Truck className="h-4 w-4 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Type: {unit.unit_type}</p>
                    <p>Category: {unit.category}</p>
                    {unit.fl_unit_name && <p>FL Name: {unit.fl_unit_name}</p>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
