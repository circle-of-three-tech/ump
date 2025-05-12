import { PaystackProps } from '@/types/paystack';

declare const PaystackPop: any;

export const usePaystack = () => {
  const initializePayment = async ({
    email,
    amount,
    reference,
    metadata,
    onSuccess,
    onCancel,
  }: PaystackProps) => {
    try {
      const handler = PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email,
        amount,
        ref: reference,
        metadata,
        callback: (response: any) => {
          onSuccess(response);
        },
        onClose: () => {
          onCancel();
        },
      });
      handler.openIframe();
    } catch (error) {
      console.error('Paystack initialization error:', error);
      throw error;
    }
  };

  return { initializePayment };
};