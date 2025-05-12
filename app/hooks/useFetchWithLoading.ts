'use client';

import { useLoading } from '../contexts/LoadingContext';
import toast from 'react-hot-toast';

interface FetchOptions extends RequestInit {
  successMessage?: string;
  loadingMessage?: string;
  errorMessage?: string;
}

export function useFetchWithLoading() {
  const { setIsLoading } = useLoading();

  const fetchWithLoading = async <T>(
    url: string,
    options?: FetchOptions
  ): Promise<T> => {
    const toastId = options?.loadingMessage ? 
      toast.loading(options.loadingMessage) : 
      undefined;

    try {
      setIsLoading(true);
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      if (toastId) {
        toast.dismiss(toastId);
      }

      if (options?.successMessage) {
        toast.success(options.successMessage);
      }
      
      return data;
    } catch (error: any) {
      if (toastId) {
        toast.dismiss(toastId);
      }
      
      toast.error(
        options?.errorMessage || 
        error.message || 
        'An unexpected error occurred'
      );
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchWithLoading };
}