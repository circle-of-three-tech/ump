'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { TransactionDetails } from '@/app/components/transactions/TransactionDetails';
import { useSession } from 'next-auth/react';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';

export default function TransactionSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reference = searchParams.get('reference');
  const transactionId = searchParams.get('transaction_id');

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        if (!transactionId) {
          throw new Error('Transaction ID is required');
        }

        const response = await fetch(`/api/transactions/${transactionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch transaction details');
        }

        const data = await response.json();
        setTransaction(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (transactionId) {
      fetchTransactionDetails();
    }
  }, [transactionId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="text-red-600 mb-4">
            {error || 'Transaction details not found'}
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Payment Successful
          </h1>
          
          <p className="text-gray-600 mb-2">
            Your payment has been processed successfully.
          </p>
          <p className="text-sm text-gray-500">
            Reference: {reference}
          </p>
        </div>

        {session?.user && transaction && (
          <TransactionDetails
            transaction={transaction}
            currentUserId={session.user.id}
          />
        )}

        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push(`/listings/${transaction.listingId}`)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            View Listing
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}