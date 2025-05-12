export interface PaystackProps {
  email: string;
  amount: number; // amount in kobo
  reference: string;
  metadata?: Record<string, any>;
  onSuccess: (response: PaystackResponse) => void;
  onCancel: () => void;
}

export interface PaystackResponse {
  reference: string;
  trans: string;
  status: string;
  message: string;
  transaction: string;
  trxref: string;
}

export interface PaystackVerificationResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      metadata: any;
    };
  };
}

export interface PaystackError {
  status: boolean;
  message: string;
}