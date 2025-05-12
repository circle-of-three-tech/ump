'use client';

import { useState } from 'react';
import { usePayment } from '../contexts/PaymentContext';

interface UseEscrowProps {
  transactionId: string;
}

export function useEscrow({ transactionId }: UseEscrowProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performAction = async (action: 'RELEASE' | 'REFUND' | 'DISPUTE') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/transactions/escrow', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, action }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to perform escrow action');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const releaseFunds = async () => {
    return performAction('RELEASE');
  };

  const disputeTransaction = async () => {
    return performAction('DISPUTE');
  };

  const requestRefund = async () => {
    return performAction('REFUND');
  };

  return {
    loading,
    error,
    releaseFunds,
    disputeTransaction,
    requestRefund,
  };
}