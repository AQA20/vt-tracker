'use client'
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function ProjectRedirect() {
  const router = useRouter();
  const params = useParams();
  
  useEffect(() => {
    router.replace(`/dashboard/engineering-submissions/${params.projectId}/units`);
  }, [router, params.projectId]);

  return null;
}
