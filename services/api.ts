import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { useErrorStore } from '@/store/useErrorStore';

const api = axios.create({
  baseURL: 'http://vt-tracker.test/api', // Assumed API path
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`API Request [${config.method?.toUpperCase()}]:`, config.url, config.data);
  return config;
});

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.data);
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    
    const data = error.response?.data;
    let errorMessage = data?.message || error.message || 'An unexpected error occurred';
    
    // Handle Laravel-style validation errors or specific 'errors' objects
    if (data?.errors) {
      const firstKey = Object.keys(data.errors)[0];
      const firstError = data.errors[firstKey];
      if (Array.isArray(firstError) && firstError.length > 0) {
        errorMessage = firstError[0];
      } else if (typeof firstError === 'string') {
        errorMessage = firstError;
      }
    }

    useErrorStore.getState().setError(errorMessage);

    return Promise.reject(error);
  }
);

export default api;
