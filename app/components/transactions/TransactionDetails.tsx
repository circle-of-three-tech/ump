'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { CircleDollarSign, Clock, ShoppingBag } from 'lucide-react';
import { EscrowActions } from './EscrowActions';

interface TransactionDetailsProps {
  transaction: {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    listing: {
      id: string;
      title: string;
      price: number;
      seller: {
        id: string;
        name: string;
      };
    };
  };
  currentUserId: string;
}

export function TransactionDetails({ transaction, currentUserId }: TransactionDetailsProps) {
  const [status, setStatus] = useState(transaction.status);
  const isBuyer = currentUserId === transaction.buyerId;
  const isSeller = transaction.listing.seller.id === currentUserId;
  const formattedAmount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(transaction.amount);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'DISPUTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM d, yyyy');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Transaction Details
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Transaction ID: {transaction.id}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Item</p>
              <Link 
                href={`/listings/${transaction.listing.id}`}
                className="text-indigo-600 hover:text-indigo-700"
              >
                {transaction.listing.title}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CircleDollarSign className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="font-medium">{formattedAmount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">
                {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {transaction.escrow && (
            <>
              <div>
                <p className="text-sm text-gray-500">Escrow Status</p>
                <p className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${
                  getStatusColor(transaction.escrow.status)
                }`}>
                  {transaction.escrow.status}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Release Due Date</p>
                <p className="font-medium">
                  {formatDate(transaction.escrow.releaseDue)}
                </p>
              </div>

              {transaction.escrow.releaseDate && (
                <div>
                  <p className="text-sm text-gray-500">Released Date</p>
                  <p className="font-medium">
                    {formatDate(transaction.escrow.releaseDate)}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="pt-4 text-sm text-gray-500">
        <p>
          Transaction ID: {transaction.id}
        </p>
      </div>

      {transaction.escrow && (
        <EscrowActions
          transactionId={transaction.id}
          escrowStatus={transaction.escrow.status}
          isBuyer={isBuyer}
          onStatusChange={() => setStatus('COMPLETED')}
        />
      )}
    </div>
  );
}