'use client';

import React, { useEffect, useState } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

interface RideComfortFormProps {
  unitId: string;
}

const DEVICES = [
  { label: 'EVA-625', value: 'eva_625' },
  { label: 'VIBXPERT-II', value: 'vibxpert_ii' },
  { label: 'LMS-TEST-LAB', value: 'lms_test_lab' },
  { label: 'KONE-RIDE-CHECK', value: 'kone_ride_check' },
  { label: 'BRUEL-KJAER-2250', value: 'bruel_kjaer_2250' },
  { label: 'OTHER-CERTIFIED', value: 'other_certified' },
];

const DEVICE_MAPPING: Record<string, string> = {
  'EVA-625': 'eva_625',
  'VIBXPERT-II': 'vibxpert_ii',
  'LMS-TEST-LAB': 'lms_test_lab',
  'KONE-RIDE-CHECK': 'kone_ride_check',
  'BRUEL-KJAER-2250': 'bruel_kjaer_2250',
  'OTHER-CERTIFIED': 'other_certified',
  'eva_625': 'eva_625',
  'vibxpert_ii': 'vibxpert_ii',
  'lms_test_lab': 'lms_test_lab',
  'kone_ride_check': 'kone_ride_check',
  'bruel_kjaer_2250': 'bruel_kjaer_2250',
  'other_certified': 'other_certified',
};

const getValidDeviceValue = (input: string) => {
  return DEVICE_MAPPING[input] || input.toLowerCase().replace(/-/g, '_');
};

export function RideComfortForm({ unitId }: RideComfortFormProps) {
  const { fetchRideComfortData, submitRideComfortData } = useProjectStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vibration_value: 0,
    noise_db: 0,
    jerk_value: 0,
    device_used: 'eva_625',
    notes: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchRideComfortData(unitId);
        if (data && typeof data === 'object') {
          const d = data as Record<string, unknown>;
          setFormData({
            vibration_value: (d.vibration_value as number) ?? 0,
            noise_db: (d.noise_db as number) ?? 0,
            jerk_value: (d.jerk_value as number) ?? 0,
            device_used: getValidDeviceValue((d.device_used as string) || 'eva_625'),
            notes: (d.notes as string) ?? '',
          });
        }
      } catch (err) {
        console.error("Error loading ride comfort data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [unitId, fetchRideComfortData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // STRICT mapping to valid backing value
    const finalDevice = getValidDeviceValue(formData.device_used);
    
    const payload = {
      ...formData,
      device_used: finalDevice
    };

    console.log('STRICT Submitting Payload:', payload);

    try {
      await submitRideComfortData(unitId, payload);
      // Optional: show success via a local mechanism if global alert is only for errors
    } catch (err: unknown) {
      console.error("Submission failed!", err);
      // The global interceptor will catch this error, but we can log more details
      console.table(payload);
      console.log(`(Sent: ${finalDevice})`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-3 md:p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900/50 w-full max-w-[300px]">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vibration_value">Vibration Value</Label>
          <Input
            id="vibration_value"
            type="number"
            step="0.01"
            value={formData.vibration_value}
            onChange={(e) => setFormData({ ...formData, vibration_value: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="noise_db">Noise (dB)</Label>
          <Input
            id="noise_db"
            type="number"
            step="0.1"
            value={formData.noise_db}
            onChange={(e) => setFormData({ ...formData, noise_db: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jerk_value">Jerk Value</Label>
          <Input
            id="jerk_value"
            type="number"
            step="0.01"
            value={formData.jerk_value}
            onChange={(e) => setFormData({ ...formData, jerk_value: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="device_used">Device Used</Label>
        <Select
          value={formData.device_used}
          onValueChange={(value) => setFormData({ ...formData, device_used: value })}
        >
          <SelectTrigger id="device_used">
            <SelectValue placeholder="Select device" />
          </SelectTrigger>
          <SelectContent>
            {DEVICES.map((device) => (
              <SelectItem key={device.value} value={device.value}>
                {device.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional observations..."
          className="resize-none min-h-[100px]"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit Ride Comfort Result
      </Button>
    </form>
  );
}
