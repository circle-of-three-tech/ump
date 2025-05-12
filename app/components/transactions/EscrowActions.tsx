'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface EscrowActionsProps {
  transactionId: string;
  escrowStatus: string;
  isBuyer: boolean;
  onStatusChange?: () => void;
}

export function EscrowActions({
  transactionId,
  escrowStatus,
  isBuyer,
  onStatusChange
}: EscrowActionsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (action: 'RELEASE' | 'DISPUTE') => {
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
        throw new Error(data.message || 'Failed to process action');
      }

      onStatusChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Only show actions for buyer and when escrow is in PENDING state
  if (!isBuyer || escrowStatus !== 'PENDING') {
    return null;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => handleAction('RELEASE')}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
        >
          {loading ? 'Processing...' : 'Release Funds'}
        </button>
        
        <button
          onClick={() => handleAction('DISPUTE')}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 disabled:opacity-50 transition"
        >
          {loading ? 'Processing...' : 'Open Dispute'}
        </button>
      </div>

      <p className="text-sm text-gray-500">
        Only release funds after receiving and verifying your item
      </p>
    </div>
  );
}