'use client';

import { useState } from 'react';
import { usePayment } from '../contexts/PaymentContext';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

interface UsePaymentTransactionProps {
  listingId: string;
  price: number;
  enableEscrow?: boolean;
}

export function usePaymentTransaction({ 
  listingId, 
  price,
  enableEscrow = true 
}: UsePaymentTransactionProps) {
  const router = useRouter();
  const { paystackPublicKey } = usePayment();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const transactionId = uuidv4();
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          amount: price,
          paymentMethod: 'PAYSTACK',
          escrowEnabled: enableEscrow,
          transactionId
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to initialize payment');
      }

      const { authorization_url } = await response.json();
      router.push(authorization_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const initializeCashPayment = async (meetupDetails: {
    location: string;
    time: Date;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const transactionId = uuidv4();
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          amount: price,
          paymentMethod: 'CASH',
          meetupLocation: meetupDetails.location,
          meetupTime: meetupDetails.time,
          transactionId
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to arrange cash payment');
      }

      const { transaction } = await response.json();
      router.push(`/transactions/success?id=${transaction.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/transactions/verify?reference=${reference}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Payment verification failed');
      }

      const { transaction } = await response.json();
      return transaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    initializePayment,
    initializeCashPayment,
    verifyPayment,
  };
}