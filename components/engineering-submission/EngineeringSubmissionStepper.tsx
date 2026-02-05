'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { engineeringSubmissionSchema, EngineeringSubmissionFormValues } from '@/schemas/engineeringSubmission';
import { createSubmission, updateSubmission, uploadStatusPdf, deleteStatusPdf } from '@/services/engineeringSubmissionService';
import { Button } from '@/components/ui/button';
import StepCseDetails from './steps/StepCseDetails';
import StepStatusUpdates from './steps/StepStatusUpdates';
import StepDg1Milestones from './steps/StepDg1Milestones';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { useErrorStore } from '@/store/useErrorStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Props {
  initialData?: Partial<EngineeringSubmissionFormValues> & { id?: string };
}

const steps = ['CSE Details', 'Status Updates', 'DG-1 Milestones'];

export default function EngineeringSubmissionStepper({ initialData }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<string | number | undefined>(initialData?.id);
  const router = useRouter();
  const setError = useErrorStore((state) => state.setError);
  const [validationError, setValidationError] = useState<string | null>(null);

  const methods = useForm<EngineeringSubmissionFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(engineeringSubmissionSchema) as any,
    defaultValues: {
      asset_name: '',
      unit_id: '',
      material_code: '',
      equip_n: 0,
      so_no: 0,
      network_no: 0,
      status_update: {},
      dg1_milestone: {},
      files: {},
      ...initialData
    },
    mode: 'onChange',
  });

  const { trigger, handleSubmit, reset } = methods;

  // IMPORTANT: Form needs to reset when initialData is loaded asynchronously
  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setCreatedId(initialData.id);
    }
  }, [initialData, reset]);

  const sanitizeData = (data: EngineeringSubmissionFormValues) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { files, ...jsonData } = data;
    if (jsonData.status_update) {
      jsonData.status_update = { ...jsonData.status_update };
      Object.keys(jsonData.status_update).forEach(key => {
        if (key.endsWith('_url') || key.endsWith('_path')) {
          delete (jsonData.status_update as Record<string, unknown>)[key];
        }
      });
    }
    return jsonData;
  };

  const handleNext = async () => {
    let isValid = false;
    const currentData = methods.getValues();

    if (currentStep === 0) {
      const fields = ['asset_name', 'unit_id', 'material_code', 'equip_n', 'so_no', 'network_no'] as const;
      isValid = await trigger(fields);
      
      if (!isValid) {
        console.warn('Validation failed for Step 1. Current Errors:', methods.formState.errors);
        setValidationError('Please fix the errors in the form before proceeding.');
        return;
      }

      // Removed auto-save block to ensure submission only happens on final step
    } else if (currentStep === 1) {
      isValid = true; 
    } else {
      isValid = true;
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentStep < steps.length - 1) {
        handleNext();
      }
    }
  };

  const onSubmit: SubmitHandler<EngineeringSubmissionFormValues> = async (data) => {
    if (currentStep !== steps.length - 1) {
        console.log('onSubmit called prematurely on step:', currentStep);
        return;
    }

    console.log('Submitting form with data keys:', Object.keys(data));
    console.log('Raw form values debug:', methods.getValues().files ? 'files present' : 'files missing');
    setIsSubmitting(true);
    try {
      const jsonData = sanitizeData(data);
      const files = data.files || {};
      console.log('Extracted files count:', Object.keys(files).length);
      let submissionIdValue = createdId || initialData?.id;
      
      if (submissionIdValue) {
        console.log('Updating submission...', submissionIdValue);
        await updateSubmission(submissionIdValue.toString(), jsonData);
      } else {
        console.log('Creating submission...');
        const response = await createSubmission(jsonData);
        // Robust ID extraction from common Laravel patterns
        submissionIdValue = response.data?.id || response.data?.data?.id;
        
        if (!submissionIdValue && response.data?.data) {
           submissionIdValue = (typeof response.data.data === 'string' || typeof response.data.data === 'number') 
             ? response.data.data 
             : response.data.data.id;
        }
      }

      console.log('Final Submission ID for files:', submissionIdValue);

      if (submissionIdValue && files && Object.keys(files).length > 0) {
        console.log('Initiating file uploads for ID:', submissionIdValue);
        const uploadPromises = Object.entries(files).map(async ([key, file]) => {
          if (file instanceof File) {
             const fieldName = key;
             console.log(`Uploading ${fieldName} (${file.name})...`);
             await uploadStatusPdf(submissionIdValue!.toString(), fieldName, file);
          }
        });
        
        await Promise.all(uploadPromises);
        console.log('All files uploaded successfully.');
      }

      toast.success(initialData?.id ? 'Submission updated successfully!' : 'Submission created successfully!');
      router.push('/dashboard/engineering-submissions');
      router.refresh();

    } catch (error: unknown) {
      console.error('Submission error:', error);
      const message = error instanceof Error ? error.message : 'Failed to submit form';
       setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldFileUpload = async (fieldKey: string, file: File) => {
    const id = createdId || initialData?.id;
    if (!id) return;
    
    console.log('Immediate upload triggered for:', fieldKey);
    try {
      const fieldName = `${fieldKey}_pdf`;
      await uploadStatusPdf(id.toString(), fieldName, file);
      console.log('Immediate upload success:', fieldName);
    } catch (error) {
      console.error('Immediate upload failed:', error);
      setValidationError(`Failed to upload ${fieldKey}. Please try again.`);
      throw error;
    }
  };

  const handleFieldFileDelete = async (fieldKey: string) => {
    const id = createdId || initialData?.id;
    if (!id) return;

    console.log('Immediate delete triggered for:', fieldKey);
    try {
      const fieldName = `${fieldKey}_pdf`;
      await deleteStatusPdf(id.toString(), fieldName);
      console.log('Immediate delete success:', fieldName);
      toast.success('File removed successfully');
    } catch (error) {
      console.error('Immediate delete failed:', error);
      setValidationError(`Failed to delete ${fieldKey}. Please try again.`);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div 
            key={step} 
            className={`flex items-center ${index !== steps.length - 1 ? 'flex-1' : ''}`}
          >
            <div 
                onClick={() => {
                    if (index < currentStep && !isSubmitting) {
                        setCurrentStep(index);
                    }
                }}
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors shrink-0
                  ${index <= currentStep ? 'border-primary bg-primary text-primary-foreground' : 'border-muted text-muted-foreground'}
                  ${index < currentStep ? 'cursor-pointer hover:bg-primary/90' : ''}
                `}
            >
              {index + 1}
            </div>
            <div 
                onClick={() => {
                    if (index < currentStep && !isSubmitting) {
                         setCurrentStep(index);
                    }
                }}
                className={`
                    ml-2 text-xs md:text-sm font-medium transition-colors truncate
                    ${index === currentStep ? 'block' : 'hidden sm:block'}
                    ${index <= currentStep ? 'text-primary' : 'text-muted-foreground'}
                    ${index < currentStep ? 'cursor-pointer hover:underline' : ''}
                `}
            >
               {step}
            </div>
             {index !== steps.length - 1 && (
                <div className={`h-[2px] flex-1 mx-2 md:mx-4 ${index < currentStep ? 'bg-primary' : 'bg-muted'}`} />
             )}
          </div>
        ))}
      </div>

      <FormProvider {...methods}>
        <form 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onSubmit={handleSubmit(onSubmit as any)} 
          onKeyDown={handleFormKeyDown}
          className="space-y-8"
        >
            <div className="p-1">
                {currentStep === 0 && <StepCseDetails isEditing={!!initialData?.id} />}
                {currentStep === 1 && (
                  <StepStatusUpdates 
                    onUploadFile={(createdId || initialData?.id) ? handleFieldFileUpload : undefined} 
                    onDeleteFile={(createdId || initialData?.id) ? handleFieldFileDelete : undefined}
                  />
                )}
                {currentStep === 2 && <StepDg1Milestones />}
            </div>

            <div className="flex justify-between mt-8">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleBack} 
                    disabled={currentStep === 0 || isSubmitting}
                    className="cursor-pointer"
                >
                    Back
                </Button>

                {currentStep < steps.length - 1 ? (
                    <Button type="button" onClick={handleNext} className="cursor-pointer">
                        Next
                    </Button>
                ) : (
                    <Button 
                        type="button" 
                        disabled={isSubmitting}
                        onClick={() => {
                          methods.handleSubmit(
                            onSubmit,
                            (errors) => {
                              console.error('Validation errors on submit:', errors);
                              setValidationError('Please fix the errors in the form before submitting.');
                            }
                          )();
                        }}
                        className="cursor-pointer"
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData?.id ? 'Update' : 'Submit'}
                    </Button>
                )}
            </div>
        </form>
      </FormProvider>

      {/* Nice Relevant Modal for Validation Errors */}
      <Dialog open={!!validationError} onOpenChange={(open) => !open && setValidationError(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="flex flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
               <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-xl font-bold">Action Required</DialogTitle>
            <DialogDescription className="text-center pt-2">
              {validationError}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-4">
            <Button 
                type="button" 
                onClick={() => setValidationError(null)}
                className="w-full sm:w-auto cursor-pointer"
            >
              Understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
