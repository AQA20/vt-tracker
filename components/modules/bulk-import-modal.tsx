'use client';

import { useState } from 'react';
import { useCreateUnit } from '@/hooks/mutations/useCreateUnit';
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
import Papa from 'papaparse';
import { CreateUnitPayload } from '@/types';

interface BulkImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
}

export function BulkImportModal({ isOpen, onClose, projectId }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createUnit = useCreateUnit(projectId);
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setFile(e.target.files[0]);
          setError(null);
      }
  };

  const handleUpload = async () => {
      if (!file) return;
      setIsUploading(true);
      setError(null);

      Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
              const data = results.data as Record<string, string>[];
              
              if (data.length === 0) {
                  setError("The CSV file is empty.");
                  setIsUploading(false);
                  return;
              }

              // Basic validation of headers
              const requiredHeaders = ['equipment_number', 'unit_type', 'category'];
              const headers = results.meta.fields || [];
              const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

              if (missingHeaders.length > 0) {
                  setError(`Missing required columns: ${missingHeaders.join(', ')}`);
                  setIsUploading(false);
                  return;
              }

              try {
                  
                  // Process units sequentially
                  for (let i = 0; i < data.length; i++) {
                      const row = data[i];
                      const equipmentNumber = row.equipment_number?.trim();
                      const rawCategory = row.category?.trim().toLowerCase() || 'elevator';
                      
                      if (!equipmentNumber) continue;

                      if (rawCategory !== 'elevator') {
                          setError(`Row ${i + 1}: Category "${row.category}" is not supported. Only elevators are supported for bulk import at the moment.`);
                          setIsUploading(false);
                          return;
                      }

                      const payload: CreateUnitPayload = {
                          equipment_number: equipmentNumber,
                          unit_type: row.unit_type?.trim(),
                          category: rawCategory,
                      };

                      if (!payload.unit_type) {
                          continue; // Skip rows without unit_type
                      }

                      await createUnit.mutateAsync(payload);
                  }
                  
                  setIsUploading(false);
                  onClose();
              } catch (err: unknown) {
                  console.error("Bulk import failed:", err);
                  setError("Failed to import some units. Please check the file format.");
                  setIsUploading(false);
                  // Refresh units anyway to show what was imported
                  queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'units'] });
              }
          },
          error: (err) => {
              console.error("CSV Parsing error:", err);
              setError("Failed to parse the CSV file.");
              setIsUploading(false);
          }
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>Bulk Import Units</DialogTitle>
            <DialogDescription>
                Upload a CSV or Excel file to create multiple units at once. Serial numbers must be unique within the project. Only elevators are supported for bulk import at the moment.
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
  );
}
