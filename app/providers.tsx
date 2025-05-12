'use client';

import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { LoadingProvider } from './contexts/LoadingContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { Toaster, toast } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface ProvidersProps {
  children: React.ReactNode;
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Disable refetching when window gains focus
      retry: 1, // Only retry failed queries once
      staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
    },
  },
});

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Function to handle online status
    const handleOnline = () => {
      toast.success('Back online!', {
        icon: '🌐',
        duration: 3000
      });
    };

    // Function to handle offline status
    const handleOffline = () => {
      toast.error('You are offline', {
        icon: '⚠️',
        duration: 3000
      });
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <LoadingProvider>
          <PaymentProvider>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                success: {
                  duration: 2000,
                },
                error: {
                  duration: 4000,
                }
              }}
            />
          </PaymentProvider>
        </LoadingProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}