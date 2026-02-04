'use client';

import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { EngineeringSubmissionFormValues } from '@/schemas/engineeringSubmission';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MILESTONES = [
  { key: 'ms2', label: 'MS2 (FL SEND ORDER TO SL)' },
  { key: 'ms2a', label: 'MS2A (ORDER CHECK & LISTING RELEASE)' },
  { key: 'ms2c', label: 'MS2C (LISTING COMPLETION)' },
  { key: 'ms2z', label: 'MS2Z (ENGINEERING COMPLETION)' },
  { key: 'ms3', label: 'MS3 (NRP)' },
  { key: 'ms3a_exw', label: 'MS3A_EXW (MATERIAL IN DC)' },
  { key: 'ms3b', label: 'MS3B (ACTUAL SHIPPING DATE)' },
  { key: 'ms3s_ksa_port', label: 'MS3S_KSA_PORT (DELIVERY TO DAMMAM PORT)' },
];

export default function StepDg1Milestones() {
  const { register, setValue, control } = useFormContext<EngineeringSubmissionFormValues>();

  const ms2Value = useWatch({
    control,
    name: 'dg1_milestone.ms2'
  });

  const leadTime = useWatch({
    control,
    name: 'dg1_milestone.ms2_3s'
  });

  useEffect(() => {
    if (ms2Value && leadTime) {
      try {
        const date = new Date(ms2Value);
        if (!isNaN(date.getTime())) {
          date.setDate(date.getDate() + Number(leadTime));
          const formattedDate = date.toISOString().split('T')[0];
          setValue('dg1_milestone.ms3s_ksa_port', formattedDate, { shouldValidate: true });
        }
      } catch (e) {
        console.error('Failed to calculate ms3s_ksa_port', e);
      }
    }
  }, [ms2Value, leadTime, setValue]);

  return (
    <div className="space-y-6">
      <div className="grid gap-2 max-w-[200px]">
        <Label htmlFor="ms2_3s">Leadtime MS2-3s</Label>
        <Input 
          type="number"
          id="ms2_3s" 
          placeholder="Enter number"
          {...register('dg1_milestone.ms2_3s' as const)} 
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t">
        {MILESTONES.map((field) => (
          <div key={field.key} className="grid gap-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            <Input 
              type="date"
              id={field.key} 
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...register(`dg1_milestone.${field.key}` as any)} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
