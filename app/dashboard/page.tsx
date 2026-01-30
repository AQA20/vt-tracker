'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProjectStore } from '@/store/useProjectStore';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase, Building2, MapPin, LayoutGrid } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { CreateProjectPayload } from '@/types';

export default function DashboardPage() {
  const { projects, fetchProjects, isLoading, createProject } = useProjectStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProject, setNewProject] = useState<CreateProjectPayload>({ 
    name: '', 
    client_name: '',
    location: '', 
  });

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async () => {
    if (!newProject.name) return;
    try {
        await createProject(newProject);
        setIsCreateOpen(false);
        setNewProject({ name: '', client_name: '', location: '' });
    } catch (e) {
        console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Projects</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
                <Button className="cursor-pointer w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Create Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
                <DialogDescription>
                    Add a new installation project.
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input id="name" value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})} placeholder="Main Construction" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="client_name">Client Name</Label>
                        <Input id="client_name" value={newProject.client_name} onChange={(e) => setNewProject({...newProject, client_name: e.target.value})} placeholder="ACME Corp" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" value={newProject.location} onChange={(e) => setNewProject({...newProject, location: e.target.value})} placeholder="New York, NY" />
                    </div>
                </div>
                <DialogFooter>
                <Button type="submit" onClick={handleCreate}>Create Project</Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-[200px] w-full rounded-xl" />)}
        </div>
      ) : !projects || projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <Briefcase className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No projects found</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
                Get started by creating a new installation project.
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="cursor-pointer">Create Project</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="group">
                <Card className="h-full overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-3 border-b bg-muted/30">
                        <div className="flex justify-between items-start gap-2">
                             <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                                {project.name}
                            </CardTitle>
                            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                                <Building2 className="h-4 w-4" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-4">
                        <div className="grid gap-3">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-muted-foreground shrink-0 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                                    <Briefcase className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">Client</span>
                                    <span className="font-semibold line-clamp-1">{project.client_name}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-muted-foreground shrink-0 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">Location</span>
                                    <span className="font-semibold line-clamp-1">{project.location || 'No Location specified'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <LayoutGrid className="h-3.5 w-3.5" />
                                    <span>{project.units_count ?? 0} Units</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-600 dark:text-zinc-400 block truncate">Installation</span>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold">{project.installation_progress}%</span>
                                    </div>
                                    <Progress value={project.installation_progress} className="h-1 bg-zinc-100 dark:bg-zinc-800" />
                                </div>

                                <div className="space-y-1.5">
                                    <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-600 dark:text-zinc-400 block truncate">Commissioning</span>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold">{project.commissioning_progress}%</span>
                                    </div>
                                    <Progress value={project.commissioning_progress} className="h-1 bg-zinc-100 dark:bg-zinc-800" />
                                </div>

                                <div className="space-y-1.5">
                                    <span className="text-[11px] uppercase tracking-wider font-bold text-primary/70 block truncate">Average</span>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-primary">{project.completion_percentage}%</span>
                                    </div>
                                    <Progress value={project.completion_percentage} className="h-1 bg-primary/20" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
