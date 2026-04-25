'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { AxiosError } from 'axios';
import { importProjectUnits } from '@/services/engineeringSubmissionService';
import { UnitImportResponse } from '@/types';

interface BulkImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
}

export function BulkImportModal({ isOpen, onClose, projectId }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
    const [report, setReport] = useState<UnitImportResponse | null>(null);
    const [isReportOpen, setIsReportOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setFile(e.target.files[0]);
          setError(null);
          setReport(null);
      }
  };

  const handleUpload = async () => {
      if (!file) return;
      setIsUploading(true);
      setError(null);

      try {
          const response = await importProjectUnits(projectId, file);
          setReport(response.data);
          queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'units'] });
          queryClient.invalidateQueries({ queryKey: ['projects', projectId] });

          // Close the upload modal and show report in a separate dialog.
          setFile(null);
          setError(null);
          onClose();
          setIsReportOpen(true);
      } catch (err: unknown) {
          const axiosError = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
          const apiMessage = axiosError.response?.data?.message;
          const validationErrors = axiosError.response?.data?.errors;
          const firstValidationError = validationErrors
              ? validationErrors[Object.keys(validationErrors)[0]]?.[0]
              : null;

          setError(firstValidationError || apiMessage || "Failed to import file.");
      } finally {
          setIsUploading(false);
      }
  };

  const handleImportModalClose = () => {
      setFile(null);
      setError(null);
      onClose();
  };

  const handleReportClose = (open: boolean) => {
      setIsReportOpen(open);
      if (!open) {
          setReport(null);
      }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={handleImportModalClose}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
            <DialogTitle>Bulk Import Units</DialogTitle>
            <DialogDescription>
                Upload a CSV or Excel file to create multiple units at once.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 md:py-8">
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 md:p-10 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer relative">
                    <input 
                        type="file" 
                        accept=".csv,.xlsx,.xls" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={handleFileChange}
                    />
                    {file ? (
                        <div className="text-center">
                            <FileSpreadsheet className="h-8 w-8 md:h-10 md:w-10 text-green-600 mx-auto mb-2" />
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm font-medium">Click to upload or drag and drop</p>
                            <p className="text-xs text-muted-foreground">CSV, Excel files supported</p>
                        </div>
                    )}
                </div>
                {error && (
                    <div className="flex items-center gap-2 p-3 text-xs text-destructive bg-destructive/10 rounded-md">
                        <AlertCircle className="h-4 w-4" />
                        <p>{error}</p>
                    </div>
                )}
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Template available</span>
                    <Button variant="link" size="sm" className="h-auto p-0 cursor-pointer" asChild>
                        <a href="/templates/units_template.csv" download>Download Template</a>
                    </Button>
                </div>
            </div>
            <DialogFooter>
            <Button type="submit" onClick={handleUpload} disabled={!file || isUploading} className="cursor-pointer">
                {isUploading ? "Importing..." : "Import Units"}
            </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    <Dialog open={isReportOpen} onOpenChange={handleReportClose}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
            <DialogTitle>Import Report</DialogTitle>
            <DialogDescription>
                Review successful and failed rows from the latest import.
            </DialogDescription>
            </DialogHeader>
            {report && (
                <div className="space-y-3 py-2">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="rounded bg-muted p-2">
                            <p className="text-muted-foreground">Total</p>
                            <p className="text-sm font-semibold">{report.summary.total_rows}</p>
                        </div>
                        <div className="rounded bg-green-50 p-2">
                            <p className="text-muted-foreground">Success</p>
                            <p className="text-sm font-semibold text-green-700">{report.summary.successful_rows}</p>
                        </div>
                        <div className="rounded bg-destructive/10 p-2">
                            <p className="text-muted-foreground">Failed</p>
                            <p className="text-sm font-semibold text-destructive">{report.summary.failed_rows}</p>
                        </div>
                    </div>

                    {report.failed_rows.length > 0 ? (
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
                            {report.failed_rows.map((failedRow) => (
                                <div key={`${failedRow.row}-${failedRow.equipment_number ?? 'empty'}`} className="rounded border border-destructive/20 p-2">
                                    <p className="font-medium">
                                        Row {failedRow.row}
                                        {failedRow.equipment_number ? ` (${failedRow.equipment_number})` : ''}
                                    </p>
                                    <p className="text-destructive">{failedRow.errors.join(', ')}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-green-700">All rows were imported successfully.</p>
                    )}
                </div>
            )}
            <DialogFooter>
                <Button onClick={() => handleReportClose(false)} className="cursor-pointer">Close</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
