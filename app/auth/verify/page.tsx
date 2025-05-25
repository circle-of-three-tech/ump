'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { status: sessionStatus } = useSession();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      router.push('/');
      return;
    }

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Verification failed');
        }

        setStatus('success');
        setMessage('Email verified successfully!');

        // Redirect to sign in page after 3 seconds
        setTimeout(() => {
          router.push('/auth/signin');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'An error occurred during verification');
      }
    };

    verifyEmail();
  }, [token, router, sessionStatus]);

  // If authenticated, don't show anything while redirecting
  if (sessionStatus === 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Email Verification</CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center mx-auto">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-green-600">{message}</h2>
              <p className="mt-2 text-gray-600">Redirecting you to sign in...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center mx-auto">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-red-600">{message}</h2>
              <div className="mt-6">
                <Button
                  variant="outline"
                  asChild
                >
                  <Link href="/auth/signin">Return to sign in</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}