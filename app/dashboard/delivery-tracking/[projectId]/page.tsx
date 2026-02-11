'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getProjectUnits } from '@/services/engineeringSubmissionService'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'
import { Unit } from '@/types'
import { DeliveryOverviewTable } from '@/components/delivery-tracking/DeliveryOverviewTable'

export default function ProjectDeliveryPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)

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
    <div className="space-y-6 w-full min-w-0 overflow-hidden">
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
      ) : (
        <DeliveryOverviewTable units={units} />
      )}
    </div>
  )
}
