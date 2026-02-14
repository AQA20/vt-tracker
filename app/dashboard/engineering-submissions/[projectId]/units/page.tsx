'use client'

import { useEffect, use, useState } from 'react'
import { useProjectStore } from '@/store/useProjectStore'
import { UnitsTable } from '@/components/modules/units-table'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export default function ProjectUnitsPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = use(params)
  const {
    currentProject,
    fetchProjectById,
    units,
    stats,
    isLoading,
    fetchUnits,
    fetchProjectStats,
    page,
    totalPages,
    totalUnits,
  } = useProjectStore()
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId)
      fetchUnits(projectId, 1, searchTerm)
      fetchProjectStats(projectId)
    }
  }, [projectId, fetchProjectById, fetchUnits, fetchProjectStats, searchTerm])

  if (!currentProject) return null

  const technicalCategories = [
    { key: 'tech', label: 'Tech Sub' },
    { key: 'sample', label: 'Sample' },
    { key: 'layout', label: 'Layout' },
    { key: 'car_m_dwg', label: 'Car M DWG' },
    { key: 'cop_dwg', label: 'COP DWG' },
    { key: 'landing_dwg', label: 'Landing DWG' },
  ]

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/engineering-submissions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              {currentProject.name}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {currentProject.location} • {currentProject.client_name}
            </p>
          </div>
        </div>
        <div className="relative w-full sm:w-80 ml-auto">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <Input
            placeholder="Search units..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm shadow-sm border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-4 flex flex-col justify-between h-full min-h-[100px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Units
            </span>
            <div className="mt-2 text-2xl font-bold">{totalUnits}</div>
          </CardContent>
        </Card>

        {technicalCategories.map((cat) => {
          const catStats = stats?.[cat.key] || {
            submitted: 0,
            in_progress: 0,
            rejected: 0,
            approved: 0,
          }

          return (
            <Card
              key={cat.key}
              className="bg-card/50 backdrop-blur-sm shadow-sm border-zinc-200 dark:border-zinc-800"
            >
              <CardContent className="p-4 flex flex-col gap-3 h-full">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
                  {cat.label}
                </span>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold uppercase text-muted-foreground/70">
                      <span>Prog</span>
                      <span>{catStats.in_progress}%</span>
                    </div>
                    <Progress
                      value={catStats.in_progress}
                      className="h-1 bg-yellow-100 dark:bg-yellow-900/30 [&>div]:bg-yellow-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold uppercase text-muted-foreground/70">
                      <span>Sub</span>
                      <span>{catStats.submitted}%</span>
                    </div>
                    <Progress
                      value={catStats.submitted}
                      className="h-1 bg-blue-100 dark:bg-blue-900/30 [&>div]:bg-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold uppercase text-muted-foreground/70">
                      <span>Rej</span>
                      <span>{catStats.rejected}%</span>
                    </div>
                    <Progress
                      value={catStats.rejected}
                      className="h-1 bg-red-100 dark:bg-red-900/30 [&>div]:bg-red-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold uppercase text-muted-foreground/70">
                      <span>App</span>
                      <span>{catStats.approved}%</span>
                    </div>
                    <Progress
                      value={catStats.approved}
                      className="h-1 bg-green-100 dark:bg-green-900/30 [&>div]:bg-green-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex items-center justify-between">
        {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
      </div>

      <div className="w-full">
        {isLoading ? (
          <div className="flex flex-col gap-4 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 w-full bg-muted animate-pulse rounded"
              />
            ))}
          </div>
        ) : (
          <>
            <UnitsTable
              units={units}
              projectId={projectId}
              view="technical"
              showActions={true}
            />
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => fetchUnits(projectId, p, searchTerm)}
            />
          </>
        )}
      </div>
    </div>
  )
}
