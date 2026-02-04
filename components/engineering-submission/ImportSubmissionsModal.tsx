'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileUp, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { importSubmissions, downloadTemplate } from '@/services/engineeringSubmissionService';
import { toast } from 'sonner';

interface ImportSubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportSubmissionsModal({ isOpen, onClose, onSuccess }: ImportSubmissionsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{
    processed: number;
    created: number;
    updated: number;
    errors: { sheet: string; row: number; message: string }[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || selectedFile.name.endsWith('.xlsx'))) {
      setFile(selectedFile);
      setResult(null);
    } else {
      toast.error('Please select a valid Excel (.xlsx) file');
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setResult(null);
    try {
      const response = await importSubmissions(file);
      const data = response.data;
      setResult(data);
      if (data.errors?.length === 0) {
        toast.success('Import completed successfully');
        onSuccess();
      } else {
        toast.warning('Import completed with some errors');
        onSuccess();
      }
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'engineering_submission_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Template downloaded');
    } catch (error) {
      console.error('Failed to download template:', error);
      toast.error('Failed to download template');
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Engineering Submissions</DialogTitle>
          <DialogDescription>
            Upload an Excel (.xlsx) file to bulk create or update submissions.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {!result ? (
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium leading-none">
                  Select Excel File
                </span>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
                    onClick={handleDownloadTemplate}
                >
                    <FileText className="mr-2 h-4 w-4" />
                    Download Template
                </Button>
              </div>
              
              <label 
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <FileUp className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-center">
                  {file ? file.name : 'Click to select or drag and drop'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Only .xlsx files are supported
                </p>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-primary/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{result.processed}</div>
                  <div className="text-[10px] uppercase font-bold text-primary/70">Processed</div>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{result.created}</div>
                  <div className="text-[10px] uppercase font-bold text-green-600/70">Created</div>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.updated}</div>
                  <div className="text-[10px] uppercase font-bold text-blue-600/70">Updated</div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-destructive mb-2">
                    <AlertCircle className="h-4 w-4" />
                    Errors ({result.errors.length})
                  </div>
                  <div className="max-h-[150px] overflow-y-auto border rounded-md p-2 bg-destructive/5 text-xs space-y-1">
                    {result.errors.map((err, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="font-bold whitespace-nowrap">Sheet: {err.sheet}, Row: {err.row}:</span>
                        <span className="text-muted-foreground">{err.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {!isImporting && result.errors.length === 0 && (
                 <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 py-3 rounded-lg border border-green-100 dark:border-green-800">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Import finished successfully</span>
                 </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {!result ? (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isImporting}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!file || isImporting} className="cursor-pointer">
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  'Start Import'
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose} className="w-full cursor-pointer">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
