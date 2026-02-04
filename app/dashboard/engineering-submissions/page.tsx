'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSubmissions, exportSubmissions } from '@/services/engineeringSubmissionService';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Plus, Edit, ArrowLeft, Download, Upload } from 'lucide-react';
import { ImportSubmissionsModal } from '@/components/engineering-submission/ImportSubmissionsModal';
import { toast } from 'sonner';

export default function EngineeringSubmissionsListPage() {
  const [submissions, setSubmissions] = useState<{ id: string | number; asset_name?: string; so_no?: number; network_no?: number; equip_n: number; unit_id?: string; material_code?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImportOpen, setIsImportOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadSubmissions = async (page = 1) => {
    setIsLoading(true);
    try {
      const { data } = await getSubmissions({ page });
      // Unwrap Laravel paginated response
      const items = Array.isArray(data) ? data : data.data || [];
      const meta = data.meta || {};
      
      setSubmissions(items);
      setCurrentPage(meta.current_page || 1);
      setLastPage(meta.last_page || 1);
      setTotal(meta.total || items.length);
    } catch (error) {
      console.error('Failed to fetch submissions', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions(currentPage);
  }, [currentPage]);

  const handleExport = async () => {
    try {
      const response = await exportSubmissions();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'engineering_submissions.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export started');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Engineering Submissions</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setIsImportOpen(true)} className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" /> Import Excel
          </Button>
          <Button variant="outline" onClick={handleExport} className="cursor-pointer">
            <Download className="mr-2 h-4 w-4" /> Export Excel
          </Button>
          <Button asChild className="cursor-pointer">
            <Link href="/dashboard/engineering-submissions/create">
              <Plus className="mr-2 h-4 w-4" /> Create New
            </Link>
          </Button>
        </div>
      </div>

      <ImportSubmissionsModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        onSuccess={() => loadSubmissions(currentPage)} 
      />

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset Name</TableHead>
              <TableHead>SO Number</TableHead>
              <TableHead>Network Number</TableHead>
              <TableHead>Equipment Number</TableHead>
              <TableHead>Unit ID</TableHead>
              <TableHead>Material Code</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                     <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No submissions found.
                </TableCell>
              </TableRow>
            ) : (
                submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">{submission.asset_name || '-'}</TableCell>
                  <TableCell>{submission.so_no || '-'}</TableCell>
                  <TableCell>{submission.network_no || '-'}</TableCell>
                  <TableCell>{submission.equip_n}</TableCell>
                  <TableCell>{submission.unit_id || '-'}</TableCell>
                  <TableCell>{submission.material_code || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild title="Edit">
                      <Link href={`/dashboard/engineering-submissions/${submission.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {!isLoading && lastPage > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Showing {submissions.length} of {total} results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="cursor-pointer"
            >
              Previous
            </Button>
            <div className="flex items-center px-4 text-sm font-medium">
              Page {currentPage} of {lastPage}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
              disabled={currentPage === lastPage}
              className="cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
