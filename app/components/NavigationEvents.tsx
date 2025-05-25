'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { LoadingScreen } from './LoadingScreen';

export function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Add a small delay before showing the loading screen to prevent flashing
  const startLoading = useCallback(() => {
    const timeout = setTimeout(() => {
      setIsLoading(true);
    }, 150); // Small delay to prevent flash on quick navigations
    return () => clearTimeout(timeout);
  }, []);

  // Add a small delay before hiding the loading screen for smoother transitions
  const stopLoading = useCallback(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Give time for the page to render
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    stopLoading();
  }, [pathname, searchParams, stopLoading]);

  useEffect(() => {
    const handleStart = () => {
      startLoading();
    };

    const handleStop = () => {
      stopLoading();
    };

    // Listen for Next.js route change events
    if (document) {
      document.addEventListener('navigationstart', handleStart);
      document.addEventListener('navigationend', handleStop);
      document.addEventListener('beforeunload', handleStart);
    }

    return () => {
      document.removeEventListener('navigationstart', handleStart);
      document.removeEventListener('navigationend', handleStop);
      document.removeEventListener('beforeunload', handleStart);
    };
  }, [startLoading, stopLoading]);

  return <LoadingScreen isLoading={isLoading} />;
}
