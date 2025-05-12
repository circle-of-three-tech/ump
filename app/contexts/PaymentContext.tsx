'use client';

import { createContext, useContext, ReactNode } from 'react';
import { PAYSTACK_PUBLIC_KEY } from '@/lib/paystack';

interface PaymentContextType {
  paystackPublicKey: string;
  currency: string;
  supportedPaymentMethods: string[];
}

const PaymentContext = createContext<PaymentContextType>({
  paystackPublicKey: PAYSTACK_PUBLIC_KEY,
  currency: 'NGN',
  supportedPaymentMethods: ['PAYSTACK', 'CASH']
});

export function PaymentProvider({ children }: { children: ReactNode }) {
  return (
    <PaymentContext.Provider
      value={{
        paystackPublicKey: PAYSTACK_PUBLIC_KEY,
        currency: 'NGN',
        supportedPaymentMethods: ['PAYSTACK', 'CASH']
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}