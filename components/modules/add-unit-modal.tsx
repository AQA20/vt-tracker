'use client';

import { useState } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddUnitModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
}


export function AddUnitModal({ isOpen, onClose, projectId }: AddUnitModalProps) {
  const { createUnit } = useProjectStore();
  const [formData, setFormData] = useState({
      unit_type: 'KONE MonoSpace 700',
      equipment_number: '',
      category: 'elevator',
  });

  const handleSubmit = async () => {
      try {
          await createUnit(projectId, formData);
          onClose();
          setFormData({
            unit_type: 'KONE MonoSpace 700',
            equipment_number: '',
            category: 'elevator',
          });
      } catch (e) {
          console.error(e);
      }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>Add Unit</DialogTitle>
            <DialogDescription>
                Manually add a single unit to the project.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="equipment_number">Equipment Number</Label>
                    <Input id="equipment_number" value={formData.equipment_number} onChange={(e) => setFormData({...formData, equipment_number: e.target.value})} placeholder="SKY-001" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="unit_type">Type Name</Label>
                    <Input id="unit_type" value={formData.unit_type} onChange={(e) => setFormData({...formData, unit_type: e.target.value})} placeholder="KONE MonoSpace 700" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="elevator">Elevator</SelectItem>
                            <SelectItem value="escalator" disabled>Escalator</SelectItem>
                            <SelectItem value="travelator" disabled>Travelator</SelectItem>
                            <SelectItem value="dumbwaiter" disabled>Dumbwaiter</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
            <Button type="submit" onClick={handleSubmit}>Create Unit</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
