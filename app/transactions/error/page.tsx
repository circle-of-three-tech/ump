'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';

export default function TransactionErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const errorMessage = searchParams.get('message') || 'An error occurred during payment processing';
  const reference = searchParams.get('reference');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Payment Failed
          </h1>

          <p className="text-gray-600 mb-2">
            {errorMessage}
          </p>
          {reference && (
            <p className="text-sm text-gray-500">
              Reference: {reference}
            </p>
          )}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Try Again
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
          >
            Back to Home
          </button>
        </div>

        <p className="text-sm text-gray-500">
          If you continue to experience issues, please contact our support team.
        </p>
      </div>
    </div>
  );
}