'use client';

import { useFormContext } from 'react-hook-form';
import { EngineeringSubmissionFormValues } from '@/schemas/engineeringSubmission';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function StepCseDetails({ isEditing = false }: { isEditing?: boolean }) {
  const { register, formState: { errors } } = useFormContext<EngineeringSubmissionFormValues>();

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="asset_name">Asset Name</Label>
        <Input 
          id="asset_name" 
          placeholder="Enter Asset Name"
          {...register('asset_name')} 
          className={errors.asset_name ? 'border-red-500' : ''}
        />
        {errors.asset_name && (
          <p className="text-sm text-red-500">{errors.asset_name.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="so_no">SO Number</Label>
        <Input 
          type="number"
          id="so_no" 
          placeholder="Enter SO Number"
          {...register('so_no')} 
          className={errors.so_no ? 'border-red-500' : ''}
        />
        {errors.so_no && (
          <p className="text-sm text-red-500">{errors.so_no.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="network_no">Network Number</Label>
        <Input 
          type="number"
          id="network_no" 
          placeholder="Enter Network Number"
          {...register('network_no')} 
          className={errors.network_no ? 'border-red-500' : ''}
        />
        {errors.network_no && (
          <p className="text-sm text-red-500">{errors.network_no.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="equip_n">Equipment Number *</Label>
        <Input 
          type="number"
          id="equip_n" 
          placeholder="Enter Equipment Number"
          {...register('equip_n')} 
          readOnly={isEditing}
          className={`
            ${errors.equip_n ? 'border-red-500' : ''}
            ${isEditing ? 'bg-muted cursor-not-allowed' : ''}
          `}
        />
        {errors.equip_n && (
          <p className="text-sm text-red-500">{errors.equip_n.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="unit_id">Unit ID</Label>
        <Input 
          id="unit_id" 
          placeholder="Enter Unit ID"
          {...register('unit_id')} 
          className={errors.unit_id ? 'border-red-500' : ''}
        />
        {errors.unit_id && (
          <p className="text-sm text-red-500">{errors.unit_id.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="material_code">Material Code</Label>
        <Input 
          id="material_code" 
          placeholder="Enter Material Code"
          {...register('material_code')} 
          className={errors.material_code ? 'border-red-500' : ''}
        />
        {errors.material_code && (
          <p className="text-sm text-red-500">{errors.material_code.message}</p>
        )}
      </div>
    </div>
  );
}
