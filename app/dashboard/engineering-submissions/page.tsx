'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSubmissions, exportSubmissions } from '@/services/engineeringSubmissionService';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Edit, ArrowLeft, Download, Upload } from 'lucide-react';
import { ImportSubmissionsModal } from '@/components/engineering-submission/ImportSubmissionsModal';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Info, Layers, Settings, FileText, Hash } from 'lucide-react';

export default function EngineeringSubmissionsListPage() {
  const [submissions, setSubmissions] = useState<{ 
    id: string | number; 
    asset_name?: string; 
    equip_n: number;
    unit_id?: string;
    material_code?: string;
    so_no?: number;
    network_no?: number;
    status_update?: Record<string, string>;
    dg1_milestone?: Record<string, string | number | null>;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImportOpen, setIsImportOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const statusFields = [
    { key: 'tech_sub_status', label: 'Tech Sub' },
    { key: 'sample_status', label: 'Sample' },
    { key: 'layout_status', label: 'Layout' },
    { key: 'car_m_dwg_status', label: 'Car M DWG' },
    { key: 'cop_dwg_status', label: 'COP DWG' },
    { key: 'landing_dwg_status', label: 'Landing DWG' },
  ];

  const milestoneFields = [
    { key: 'ms2', label: 'MS2' },
    { key: 'ms2a', label: 'MS2A' },
    { key: 'ms2c', label: 'MS2C' },
    { key: 'ms2z', label: 'MS2Z' },
    { key: 'ms3', label: 'MS3' },
    { key: 'ms3a_exw', label: 'MS3A EXW' },
    { key: 'ms3b', label: 'MS3B' },
    { key: 'ms3s_ksa_port', label: 'MS3S KSA Port' },
  ];

  const getStatusVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Under Review': return 'info';
      case 'Submitted': return 'default';
      case 'In Progress': return 'warning';
      case 'Re-Submission': return 'secondary';
      case 'Rejected': return 'destructive';
      default: return 'outline';
    }
  };

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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
           <Loader2 className="h-8 w-8 animate-spin mr-2" /> Loading Submissions...
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground">No submissions found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {submissions.map((submission) => (
            <Card key={submission.id} className="overflow-hidden border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-muted/30 border-b pb-4 px-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" />
                      {submission.asset_name || 'Unnamed Asset'}
                    </CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground font-medium">
                      <Hash className="h-3.5 w-3.5 mr-1" />
                      Equip No: <span className="text-foreground ml-1 font-mono">{submission.equip_n}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild className="cursor-pointer">
                    <Link href={`/dashboard/engineering-submissions/${submission.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Submission Info */}
                  <div className="p-6 space-y-6 border-r border-zinc-100">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Info className="h-3.5 w-3.5" />
                        Submission Overview
                      </h4>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                        <div className="text-muted-foreground">Unit ID:</div>
                        <div className="font-medium">{submission.unit_id || '-'}</div>
                        <div className="text-muted-foreground">Material:</div>
                        <div className="font-medium truncate" title={submission.material_code || undefined}>{submission.material_code || '-'}</div>
                        <div className="text-muted-foreground">SO No:</div>
                        <div className="font-medium">{submission.so_no || '-'}</div>
                        <div className="text-muted-foreground">Network No:</div>
                        <div className="font-medium">{submission.network_no || '-'}</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Settings className="h-3.5 w-3.5" />
                        Status Updates
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {statusFields.map(f => {
                          const val = submission.status_update?.[f.key];
                          if (!val) return null;
                          return (
                            <div key={f.key} className="flex flex-col gap-1">
                                <span className="text-[10px] text-muted-foreground font-semibold px-1">{f.label}</span>
                                <Badge variant={getStatusVariant(val)} className="text-[10px] h-5 py-0">
                                    {val}
                                </Badge>
                                {submission.status_update?.[`${f.key.replace('_status', '')}_rejection_count`] !== undefined && (
                                  <span className="text-[9px] text-muted-foreground px-1">
                                    Rejection count: {submission.status_update[`${f.key.replace('_status', '')}_rejection_count`]}
                                  </span>
                                )}
                            </div>
                          );
                        })}
                        {Object.values(submission.status_update || {}).filter(Boolean).length === 0 && (
                          <span className="text-xs text-muted-foreground italic">No status updates yet</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="p-6 bg-zinc-50/30">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                        DG1 Milestones
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {milestoneFields.map(m => {
                          const val = submission.dg1_milestone?.[m.key];
                          return (
                            <div key={m.key} className="space-y-1">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none">{m.label}</p>
                              <div className="flex items-center text-sm font-medium">
                                <FileText className="h-3 w-3 mr-1.5 text-zinc-400" />
                                {val || <span className="text-zinc-300">TBD</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && lastPage > 1 && (
        <div className="flex items-center justify-between mt-6 border-t pt-6">
          <div className="text-sm text-muted-foreground font-medium">
            Showing <span className="text-foreground">{submissions.length}</span> of <span className="text-foreground">{total}</span> results
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
            <div className="flex items-center px-4 text-sm font-bold bg-muted/40 rounded-md">
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
