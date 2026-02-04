import api from './api';
import { EngineeringSubmissionFormValues } from '@/schemas/engineeringSubmission';

export const getSubmissions = (params?: { page?: number; [key: string]: unknown }) => 
  api.get('/engineering-submissions', { params });

export const getSubmission = (id: string) => 
  api.get(`/engineering-submissions/${id}`);

export const createSubmission = (data: EngineeringSubmissionFormValues) => 
  api.post('/engineering-submissions', data);

export const updateSubmission = (id: string, data: EngineeringSubmissionFormValues) => 
  api.put(`/engineering-submissions/${id}`, data);

export const uploadStatusPdf = (id: string, field: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/engineering-submissions/${id}/status-pdfs/${field}`, formData, {
    headers: {
      'Content-Type': undefined
    }
  });
};

export const exportSubmissions = () => 
  api.get('/engineering-submissions/export', { responseType: 'blob' });

export const downloadTemplate = () => 
  api.get('/engineering-submissions/export?template=true', { responseType: 'blob' });

export const importSubmissions = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/engineering-submissions/import', formData, {
    headers: {
      'Content-Type': undefined
    }
  });
};

export const deleteStatusPdf = (id: string, field: string) => 
    api.delete(`/engineering-submissions/${id}/status-pdfs/${field}`);
