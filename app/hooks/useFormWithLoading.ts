'use client';

import { useState } from 'react';
import { useLoading } from '../contexts/LoadingContext';

interface UseFormWithLoadingOptions<T> {
  onSubmit: (data: T) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useFormWithLoading<T>({ 
  onSubmit, 
  onSuccess, 
  onError 
}: UseFormWithLoadingOptions<T>) {
  const { setIsLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: T) => {
    setError(null);
    setIsLoading(true);
    try {
      await onSubmit(data);
      onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error.message);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSubmit,
    error
  };
}