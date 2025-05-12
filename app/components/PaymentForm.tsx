'use client';

import { useState } from 'react';
import { usePaymentTransaction } from '../hooks/usePaymentTransaction';
import { Calendar } from 'lucide-react';
import { usePayment } from '../contexts/PaymentContext';

interface PaymentFormProps {
  listingId: string;
  listingTitle: string;
  price: number;
  onClose: () => void;
}

export function PaymentForm({
  listingId,
  listingTitle,
  price,
  onClose
}: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<'PAYSTACK' | 'CASH'>('PAYSTACK');
  const [meetupLocation, setMeetupLocation] = useState('');
  const [meetupTime, setMeetupTime] = useState('');
  const [enableEscrow, setEnableEscrow] = useState(true);
  const { supportedPaymentMethods } = usePayment();
  
  const { loading, error, initializePayment, initializeCashPayment } = usePaymentTransaction({
    listingId,
    price,
    enableEscrow
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'PAYSTACK') {
      await initializePayment();
    } else {
      await initializeCashPayment({
        location: meetupLocation,
        time: new Date(meetupTime)
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Complete Purchase</h2>
        
        <div className="mb-6">
          <p className="text-gray-600">Item: {listingTitle}</p>
          <p className="text-xl font-semibold">₦{price.toFixed(2)}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Method Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700">Payment Method</label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {supportedPaymentMethods.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method as 'PAYSTACK' | 'CASH')}
                  className={`px-4 py-2 border rounded-lg ${
                    paymentMethod === method
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {method === 'PAYSTACK' ? 'Pay Online' : 'Cash Payment'}
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === 'PAYSTACK' && (
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={enableEscrow}
                  onChange={(e) => setEnableEscrow(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Enable Escrow Protection (Recommended)
                </span>
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Funds will be held securely until you confirm receipt of the item
              </p>
            </div>
          )}

          {paymentMethod === 'CASH' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meetup Location
                </label>
                <input
                  type="text"
                  required
                  value={meetupLocation}
                  onChange={(e) => setMeetupLocation(e.target.value)}
                  placeholder="Enter a safe public location"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meetup Time
                </label>
                <div className="mt-1 relative">
                  <input
                    type="datetime-local"
                    required
                    value={meetupTime}
                    onChange={(e) => setMeetupTime(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-10"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}