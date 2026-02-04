'use client';

import { useEffect, useState, use } from 'react';
import EngineeringSubmissionStepper from '@/components/engineering-submission/EngineeringSubmissionStepper';
import { getSubmission } from '@/services/engineeringSubmissionService';
import { EngineeringSubmissionFormValues } from '@/schemas/engineeringSubmission';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useErrorStore } from '@/store/useErrorStore';

export default function EditEngineeringSubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const submissionId = resolvedParams.id;
  const [initialData, setInitialData] = useState<(EngineeringSubmissionFormValues & { id?: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const setError = useErrorStore((state) => state.setError);

  useEffect(() => {
    async function loadData() {
      if (!submissionId) return;
      setIsLoading(true);
      try {
        const response = await getSubmission(submissionId);
        const data = response.data.data; 
        
        // Correctly handle the nested status_update from the Resource
        const status_update = data.status_update || {};
        const statusFields = [
          'tech_sub_status', 'sample_status', 'layout_status', 
          'car_m_dwg_status', 'cop_dwg_status', 'landing_dwg_status'
        ];

        statusFields.forEach(field => {
          // Map tech_sub_status_pdf_url (from API) to tech_sub_status_pdf_path (expected by form)
          if (status_update[`${field}_pdf_url`]) {
            status_update[`${field}_pdf_path`] = status_update[`${field}_pdf_url`];
          }
        });

        const dg1_milestone = data.dg1_milestone || {};

        setInitialData({
          ...data,
          id: submissionId,
          status_update,
          dg1_milestone,
        });
      } catch (error) {
        console.error('Failed to load submission', error);
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 401) {
            setError('Your session has expired. Please log in again.');
        } else {
            setError('Failed to load submission details.');
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [submissionId, setError]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/engineering-submissions">
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Engineering Submission</h1>
      </div>
      <EngineeringSubmissionStepper initialData={initialData || undefined} />
    </div>
  );
}
