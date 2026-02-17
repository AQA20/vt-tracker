'use client'

import { useState } from 'react'
import { useCreateUnit } from '@/hooks/mutations/useCreateUnit'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AddUnitModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
}

export function AddUnitModal({
  isOpen,
  onClose,
  projectId,
}: AddUnitModalProps) {
  const createUnit = useCreateUnit(projectId)
  const [formData, setFormData] = useState({
    unit_type: 'Company MonoSpace 700',
    equipment_number: '',
    category: 'elevator',
    sl_reference_no: '',
    fl_unit_name: '',
    unit_description: '',
  })

  const handleSubmit = async () => {
    try {
      await createUnit.mutateAsync(formData)
      onClose()
      setFormData({
        unit_type: 'Company MonoSpace 700',
        equipment_number: '',
        category: 'elevator',
        sl_reference_no: '',
        fl_unit_name: '',
        unit_description: '',
      })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Unit</DialogTitle>
          <DialogDescription>
            Manually add a single unit to the project.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
          <div className="grid gap-2">
            <Label htmlFor="equipment_number">Equipment Number</Label>
            <Input
              id="equipment_number"
              value={formData.equipment_number}
              onChange={(e) =>
                setFormData({ ...formData, equipment_number: e.target.value })
              }
              placeholder="SKY-001"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="unit_type">Type Name</Label>
            <Input
              id="unit_type"
              value={formData.unit_type}
              onChange={(e) =>
                setFormData({ ...formData, unit_type: e.target.value })
              }
              placeholder="Company MonoSpace 700"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(val) =>
                setFormData({ ...formData, category: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="elevator">Elevator</SelectItem>
                <SelectItem value="escalator" disabled>
                  Escalator
                </SelectItem>
                <SelectItem value="travelator" disabled>
                  Travelator
                </SelectItem>
                <SelectItem value="dumbwaiter" disabled>
                  Dumbwaiter
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sl_reference_no">SL Reference (Optional)</Label>
            <Input
              id="sl_reference_no"
              value={formData.sl_reference_no}
              onChange={(e) =>
                setFormData({ ...formData, sl_reference_no: e.target.value })
              }
              placeholder="SL-REF-123"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fl_unit_name">FL Unit Name (Optional)</Label>
            <Input
              id="fl_unit_name"
              value={formData.fl_unit_name}
              onChange={(e) =>
                setFormData({ ...formData, fl_unit_name: e.target.value })
              }
              placeholder="FL-01"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="unit_description">
              Unit Description (Optional)
            </Label>
            <Input
              id="unit_description"
              value={formData.unit_description}
              onChange={(e) =>
                setFormData({ ...formData, unit_description: e.target.value })
              }
              placeholder="Lobby elevator..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            Create Unit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
