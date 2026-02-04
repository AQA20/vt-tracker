'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import EngineeringSubmissionStepper from '@/components/engineering-submission/EngineeringSubmissionStepper';

export default function CreateEngineeringSubmissionPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/engineering-submissions">
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Create Engineering Submission</h1>
      </div>
      <EngineeringSubmissionStepper />
    </div>
  );
}
