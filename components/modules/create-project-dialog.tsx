import { CreateProjectPayload } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: CreateProjectPayload
  onProjectChange: (project: CreateProjectPayload) => void
  onSubmit: () => void
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  project,
  onProjectChange,
  onSubmit,
}: CreateProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Input
              id="name"
              value={project.name}
              onChange={(e) =>
                onProjectChange({ ...project, name: e.target.value })
              }
              placeholder="Main Construction"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="client_name">Client Name</Label>
            <Input
              id="client_name"
              value={project.client_name}
              onChange={(e) =>
                onProjectChange({ ...project, client_name: e.target.value })
              }
              placeholder="ACME Corp"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={project.location}
              onChange={(e) =>
                onProjectChange({ ...project, location: e.target.value })
              }
              placeholder="New York, NY"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="kone_project_id">Company Project ID</Label>
            <Input
              id="kone_project_id"
              value={project.kone_project_id}
              onChange={(e) =>
                onProjectChange({
                  ...project,
                  kone_project_id: e.target.value,
                })
              }
              placeholder="KP001610"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onSubmit}>
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
