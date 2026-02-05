'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { EngineeringSubmissionFormValues } from '@/schemas/engineeringSubmission';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileUp, File as FileIcon, Trash2, Loader2 } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Under Review', label: 'Under Review' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Re-Submission', label: 'Re-Submission' },
];

const FIELDS = [
  { key: 'tech_sub_status', label: 'Tech Sub Status' },
  { key: 'sample_status', label: 'Sample Status' },
  { key: 'layout_status', label: 'Layout Status' },
  { key: 'car_m_dwg_status', label: 'Car M DWG Status' },
  { key: 'cop_dwg_status', label: 'COP DWG Status' },
  { key: 'landing_dwg_status', label: 'Landing DWG Status' },
];

interface StepStatusUpdatesProps {
  onUploadFile?: (fieldKey: string, file: File) => Promise<void>;
  onDeleteFile?: (fieldKey: string) => Promise<void>;
}

export default function StepStatusUpdates({ onUploadFile, onDeleteFile }: StepStatusUpdatesProps) {
  const { control, watch, setValue, register } = useFormContext<EngineeringSubmissionFormValues>();
  const [uploadingFields, setUploadingFields] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    FIELDS.forEach(field => {
        register(`files.${field.key}_pdf`);
    });
  }, [register]);

  const handleFileChange = async (fieldKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    // Set local state for UI feedback
    setValue(`files.${fieldKey}_pdf`, file, { shouldValidate: true });

    // If callback is provided (Edit Mode), trigger immediate upload
    if (onUploadFile) {
        setUploadingFields(prev => ({ ...prev, [fieldKey]: true }));
        try {
            await onUploadFile(fieldKey, file);
        } catch {
            // Revert local state if upload failed
            setValue(`files.${fieldKey}_pdf`, null);
        } finally {
            setUploadingFields(prev => ({ ...prev, [fieldKey]: false }));
        }
    }
  };

  const handleRemoveFile = async (fieldKey: string) => {
    // Clear local file state
    setValue(`files.${fieldKey}_pdf`, null);
    
    // Clear backend-provided path/url states so UI updates immediately
    setValue(`status_update.${fieldKey}_pdf_path`, null);
    setValue(`status_update.${fieldKey}_file_url`, null);

    // If callback is provided (Edit Mode), trigger server-side deletion
    if (onDeleteFile) {
        setUploadingFields(prev => ({ ...prev, [fieldKey]: true }));
        try {
            await onDeleteFile(fieldKey);
        } catch {
            // Error handled by parent/toast
        } finally {
            setUploadingFields(prev => ({ ...prev, [fieldKey]: false }));
        }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {FIELDS.map((field) => (
        <StatusCard 
          key={field.key} 
          fieldKey={field.key} 
          label={field.label} 
          control={control} 
          watch={watch}
          isUploading={!!uploadingFields[field.key]}
          onFileChange={(e) => handleFileChange(field.key, e)}
          onRemoveFile={() => handleRemoveFile(field.key)}
        />
      ))}
    </div>
  );
}

interface StatusCardProps {
  fieldKey: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watch: any;
  isUploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
}



function StatusCard({ fieldKey, label, control, watch, isUploading, onFileChange, onRemoveFile }: StatusCardProps) {
  // Watch the file state to show UI updates
  const fileValue = watch(`files.${fieldKey}_pdf`);
  
  // Watch for existing file URL from backend data
  const existingFileUrl = watch(`status_update.${fieldKey}_pdf_path`) || watch(`status_update.${fieldKey}_file_url`); 

  // Watch for rejection count
  const rejectionCount = watch(`status_update.${fieldKey.replace('_status', '')}_rejection_count`);

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-medium">{label}</CardTitle>
        {rejectionCount !== undefined && rejectionCount !== null && (
           <Badge variant="destructive" className="h-5 py-0 px-2 text-[10px]">
             Rejections: {rejectionCount}
           </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Controller
            control={control}
            name={`status_update.${fieldKey}`}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-4">
          <Label>Attachment</Label>
          
          <div className="flex flex-col gap-3">
            {/* Download/Preview Section */}
            <div className={`flex items-center justify-between p-2 border rounded-md ${!existingFileUrl && !fileValue ? 'bg-muted/30 opacity-60' : 'bg-muted/10'}`}>
              <div className="flex items-center truncate text-sm">
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                ) : (
                  <FileIcon className={`mr-2 h-4 w-4 ${existingFileUrl || fileValue ? 'text-primary' : 'text-muted-foreground'}`} />
                )}
                <span className="truncate w-32 font-medium">
                  {isUploading ? 'Uploading...' : fileValue ? fileValue.name : existingFileUrl ? 'Existing PDF' : 'No Attachment'}
                </span>
              </div>
              
              <Button 
                variant="link" 
                size="sm" 
                className="cursor-pointer h-auto p-0"
                disabled={!existingFileUrl && !fileValue}
                asChild={!!(existingFileUrl || fileValue)}
              >
                {existingFileUrl || fileValue ? (
                  <a 
                    href={fileValue ? URL.createObjectURL(fileValue) : existingFileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Download
                  </a>
                ) : (
                  <span>Download</span>
                )}
              </Button>
            </div>

            {/* Action Section: Upload / Replace / Remove */}
            <div className="flex items-center gap-2">
              <Label 
                htmlFor={`file-${fieldKey}`} 
                className="flex h-9 flex-1 cursor-pointer items-center justify-center rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <FileUp className="mr-2 h-4 w-4" />
                {existingFileUrl || fileValue ? 'Replace PDF' : 'Upload PDF'}
              </Label>
              <input 
                id={`file-${fieldKey}`} 
                type="file" 
                accept="application/pdf"
                className="hidden" 
                onChange={onFileChange}
              />

              {(fileValue || existingFileUrl) && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9 text-destructive cursor-pointer"
                  onClick={onRemoveFile}
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
