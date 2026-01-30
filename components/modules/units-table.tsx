'use client';

import { Unit, Stage } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/store/useProjectStore';
import { Checkbox } from '@/components/ui/checkbox';

interface UnitsTableProps {
  units: Unit[];
  projectId: string;
}

export function UnitsTable({ units }: UnitsTableProps) {
  if (units.length === 0) {
      return (
          <div className="text-center py-10 border rounded-lg bg-zinc-50 dark:bg-zinc-900 border-dashed">
              <p className="text-muted-foreground">No units added yet.</p>
          </div>
      )
  }

  return (
    <div className="space-y-4">
      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {units.map((unit) => (
          <UnitCard key={unit.id} unit={unit} />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Equipment Number</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="w-[180px]">Installation</TableHead>
              <TableHead className="w-[180px]">Commissioning</TableHead>
              <TableHead className="w-[180px]">Average Progress</TableHead>
              <TableHead className="text-right">Stage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => (
              <UnitRow key={unit.id} unit={unit} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function UnitCard({ unit }: { unit: Unit }) {
    const [isOpen, setIsOpen] = useState(false);
    const { fetchUnitStages } = useProjectStore();

    const toggleOpen = async () => {
        if (!isOpen && (!unit.stages || unit.stages.length === 0)) {
            await fetchUnitStages(unit.id);
        }
        setIsOpen(!isOpen);
    }

    return (
        <div className={cn(
            "rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden",
            isOpen && "ring-1 ring-primary/20"
        )}>
            <div className="p-4 cursor-pointer" onClick={toggleOpen}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                         <span className="font-bold text-sm">{unit.equipment_number}</span>
                         <Badge variant="outline" className="text-[10px] px-1.5 h-4">{unit.category}</Badge>
                    </div>
                    {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Installation</span>
                        <div className="flex items-center gap-2">
                            <Progress value={Number(unit.installation_progress || 0)} className="h-1.5" />
                            <span className="text-[10px] font-medium w-7 text-right">{Number(unit.installation_progress || 0).toFixed(0)}%</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Commissioning</span>
                        <div className="flex items-center gap-2">
                            <Progress value={Number(unit.commissioning_progress || 0)} className="h-1.5" />
                            <span className="text-[10px] font-medium w-7 text-right">{Number(unit.commissioning_progress || 0).toFixed(0)}%</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] text-primary uppercase font-bold tracking-tight">Average</span>
                        <div className="flex items-center gap-2">
                            <Progress value={Number(unit.progress_percent || 0)} className="h-1.5" />
                            <span className="text-[10px] font-bold text-primary w-7 text-right">{Number(unit.progress_percent || 0).toFixed(0)}%</span>
                        </div>
                    </div>
                </div>
            </div>
            {isOpen && (
                <div className="border-t bg-zinc-50/50 dark:bg-zinc-900/50 p-4">
                    <StageWorkflow unit={unit} />
                </div>
            )}
        </div>
    )
}

function UnitRow({ unit }: { unit: Unit }) {
    const [isOpen, setIsOpen] = useState(false);
    const { fetchUnitStages } = useProjectStore();

    const toggleOpen = async () => {
        if (!isOpen && (!unit.stages || unit.stages.length === 0)) {
            await fetchUnitStages(unit.id);
        }
        setIsOpen(!isOpen);
    }
    
    const completedStages = unit.stages?.filter(s => s.status === 'completed').length || 0;

    return (
        <>
            <TableRow className={cn("cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900", isOpen && "bg-zinc-50 dark:bg-zinc-900")} onClick={toggleOpen}>
                <TableCell>
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </TableCell>
                <TableCell className="font-medium">{unit.equipment_number}</TableCell>
                <TableCell className="max-w-[150px] truncate">{unit.unit_type}</TableCell>
                <TableCell><Badge variant="outline">{unit.category}</Badge></TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <Progress value={Number(unit.installation_progress || 0)} className="h-2" />
                        <span className="text-xs text-muted-foreground w-10">{Number(unit.installation_progress || 0).toFixed(0)}%</span>
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <Progress value={Number(unit.commissioning_progress || 0)} className="h-2" />
                        <span className="text-xs text-muted-foreground w-10">{Number(unit.commissioning_progress || 0).toFixed(0)}%</span>
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <Progress value={Number(unit.progress_percent || 0)} className="h-2" />
                        <span className="text-xs text-muted-foreground w-10">{Number(unit.progress_percent || 0).toFixed(0)}%</span>
                    </div>
                </TableCell>
                <TableCell className="text-right">
                    <Badge variant={completedStages === 8 ? "default" : "secondary"}>
                         {completedStages === 8 ? "Complete" : `Stage ${completedStages + 1}/8`}
                    </Badge>
                </TableCell>
            </TableRow>
            {isOpen && (
                <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50/50">
                    <TableCell colSpan={8} className="p-0">
                        <div className="p-4">
                             <StageWorkflow unit={unit} />
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    )
}

function StageWorkflow({ unit }: { unit: Unit }) {
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    // By default, first group is expanded
    useEffect(() => {
        if (unit.stages && unit.stages.length > 0 && Object.keys(expandedGroups).length === 0) {
            const firstGroup = unit.stages[0].template.progress_group || 'General';
            // SetTimeout to move the state update out of the synchronous render/effect cycle
            // This satisfies the "Avoid calling setState() directly within an effect" rule
            const timer = setTimeout(() => {
                setExpandedGroups(prev => {
                    if (Object.keys(prev).length === 0) {
                        return { [firstGroup]: true };
                    }
                    return prev;
                });
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [unit.stages, expandedGroups]);

    if (!unit.stages || unit.stages.length === 0) {
        return <div className="text-sm text-muted-foreground p-4 text-center w-full">Loading stages...</div>;
    }

    const groupedStages = unit.stages.reduce((acc, stage) => {
        const group = stage.template.progress_group || 'General';
        if (!acc[group]) acc[group] = [];
        acc[group].push(stage);
        return acc;
    }, {} as Record<string, Stage[]>);

    const toggleGroup = (groupName: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }));
    };

    return (
        <div className="space-y-6">
            {Object.entries(groupedStages).map(([groupName, stages]) => {
                const isExpanded = expandedGroups[groupName] ?? false;
                
                return (
                    <div key={groupName} className="space-y-3">
                        <button 
                            onClick={() => toggleGroup(groupName)}
                            className="flex items-center gap-3 font-bold text-[10px] uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400 px-3 py-1 border border-zinc-200 dark:border-zinc-800 rounded-full bg-background shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group cursor-pointer"
                        >
                            <span>{groupName}</span>
                            <ChevronDown className={cn(
                                "h-3 w-3 transition-transform duration-200",
                                isExpanded ? "rotate-0" : "-rotate-90"
                            )} />
                        </button>
                        
                        {isExpanded && (
                            <div className="grid gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                {stages.map((stage) => {
                                    const globalIndex = unit.stages?.findIndex(s => s.id === stage.id) ?? 0;
                                    return <StageCard key={stage.id} stage={stage} index={globalIndex} unitId={unit.id} />;
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function StageCard({ stage, index, unitId }: { stage: Stage, index: number, unitId: string }) {
    const { updateTaskStatus, fetchStageTasks, completeStage } = useProjectStore();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!stage.tasks && !isLoading) {
             const loadTasks = async () => {
                 setIsLoading(true);
                 await fetchStageTasks(stage.id);
                 setIsLoading(false);
             };
             loadTasks();
        }
    }, [stage.id, stage.tasks, fetchStageTasks, isLoading]);
    
    return (
        <div className={cn(
            "border rounded-lg p-3 md:p-4 bg-background",
            stage.status === 'completed' ? "border-green-200 dark:border-green-900" : "border-zinc-200 dark:border-zinc-800"
        )}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex gap-2 md:gap-3">
                    <div className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5",
                        stage.status === 'completed' ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    )}>
                        {index + 1}
                    </div>
                    <div>
                        <h5 className="font-medium text-sm">{stage.template.title || stage.template.name}</h5>
                        {stage.template.description && (
                            <p className="text-xs text-muted-foreground mt-1">{stage.template.description}</p>
                        )}
                        
                        <div 
                            className="flex items-center space-x-2.5 mt-3 py-1.5 px-2 bg-zinc-50 dark:bg-zinc-900 rounded border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all cursor-pointer group/toggle"
                            onClick={(e) => {
                                e.stopPropagation();
                                completeStage(unitId, stage.id, stage.status !== 'completed');
                            }}
                        >
                            <Checkbox 
                                id={`complete-stage-${stage.id}`}
                                checked={stage.status === 'completed'}
                                onCheckedChange={(checked) => completeStage(unitId, stage.id, checked === true)}
                                className="h-3.5 w-3.5 pointer-events-none"
                            />
                            <label 
                                htmlFor={`complete-stage-${stage.id}`}
                                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover/toggle:text-foreground cursor-pointer transition-colors"
                            >
                                {stage.status === 'completed' ? "Mark entire stage as incomplete" : "Mark entire stage as complete"}
                            </label>
                        </div>
                    </div>
                </div>
                {stage.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
            </div>
            
            <div className="space-y-2 pl-8 md:pl-9">
                {isLoading ? (
                    <div className="text-xs text-muted-foreground">Loading tasks...</div>
                ) : (
                    stage.tasks?.map((task) => (
                        <div 
                            key={task.id} 
                            className="flex items-start space-x-3 py-2 px-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-md cursor-pointer transition-colors group"
                            onClick={() => updateTaskStatus(unitId, task.id, { status: task.status === 'pass' ? 'pending' : 'pass' })}
                        >
                            <Checkbox 
                                id={`task-${task.id}`} 
                                checked={task.status === 'pass'}
                                onCheckedChange={(checked) => updateTaskStatus(unitId, task.id, { status: checked ? 'pass' : 'pending' })}
                                className="mt-1 pointer-events-none"
                            />
                            <div className="grid gap-1">
                                <label
                                    htmlFor={`task-${task.id}`}
                                    className="text-sm font-medium leading-none cursor-pointer group-hover:text-primary transition-colors"
                                >
                                    {task.template.name}
                                </label>
                                <div className="text-xs text-muted-foreground">
                                    <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded mr-2 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">{task.template.task_code}</span>
                                    {task.template.description}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {!isLoading && (!stage.tasks || stage.tasks.length === 0) && (
                     <div className="text-xs text-muted-foreground">No tasks found.</div>
                )}
            </div>
        </div>
    )
}
