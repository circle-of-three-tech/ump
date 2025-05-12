import { PaystackProps, PaystackResponse, PaystackVerificationResponse } from '@/types/paystack';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!;

export class PaystackService {
  private static instance: PaystackService;
  private baseUrl = 'https://api.paystack.co';
  private IS_SERVER = typeof window === 'undefined';

  private constructor() {}

  static getInstance(): PaystackService {
    if (!this.instance) {
      this.instance = new PaystackService();
    }
    return this.instance;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    // Only include Authorization header on server-side
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.IS_SERVER ? { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } : {}),
      ...options.headers,
    };

    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      throw new Error(`Paystack API error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async initializeTransaction(params: PaystackProps): Promise<PaystackResponse> {
    if (!this.IS_SERVER) {
      // Client-side: Use the public endpoint
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error('Failed to initialize transaction');
      }
      
      return response.json();
    }

    // Server-side: Direct Paystack API call
    return this.makeRequest('/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify({
        email: params.email,
        amount: Math.round(params.amount * 100), // Convert to kobo
        callback_url: params.callbackUrl,
        reference: params.reference,
        metadata: params.metadata,
      }),
    });
  }

  async verifyTransaction(reference: string): Promise<PaystackVerificationResponse> {
    if (!this.IS_SERVER) {
      // Client-side: Use the public endpoint
      const response = await fetch(`/api/transactions/verify?reference=${reference}`);
      if (!response.ok) {
        throw new Error('Failed to verify transaction');
      }
      return response.json();
    }

    // Server-side: Direct Paystack API call
    return this.makeRequest(`/transaction/verify/${reference}`);
  }

  async listTransactions(params?: { 
    perPage?: number; 
    page?: number; 
    from?: string; 
    to?: string; 
    status?: 'failed' | 'success' | 'abandoned';
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }

    return this.makeRequest(`/transaction?${queryParams.toString()}`);
  }

  async fetchTransaction(id: number) {
    return this.makeRequest(`/transaction/${id}`);
  }

  async refundTransaction(params: {
    transactionId: string;
    amount?: number;
    reason?: string;
  }) {
    return this.makeRequest('/refund', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getRefundStatus(reference: string) {
    return this.makeRequest(`/refund/${reference}`);
  }

  async getPaymentReceipt(transactionId: string) {
    return this.makeRequest(`/transaction/${transactionId}/receipt`);
  }

  async exportTransactions(params?: {
    from?: string;
    to?: string;
    settled?: boolean;
    payment_page?: number;
    customer?: number;
    currency?: string;
    settlement?: number;
    amount?: number;
    status?: 'failed' | 'success' | 'abandoned';
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }

    return this.makeRequest(`/transaction/export?${queryParams.toString()}`);
  }

  async releaseEscrowFunds(reference: string): Promise<any> {
    if (!this.IS_SERVER) {
      throw new Error('This method can only be called from the server');
    }

    const verification = await this.verifyTransaction(reference);
    
    const recipientResponse = await this.makeRequest('/transferrecipient', {
      method: 'POST',
      body: JSON.stringify({
        type: 'nuban',
        name: verification.data.customer.email,
        account_number: verification.data.authorization.account_number,
        bank_code: verification.data.authorization.bank_code,
        currency: 'NGN'
      })
    });

    return this.makeRequest('/transfer', {
      method: 'POST',
      body: JSON.stringify({
        source: 'balance',
        recipient: recipientResponse.data.recipient_code,
        amount: verification.data.amount,
        reference: `escrow_release_${reference}`,
        reason: `Escrow release for transaction ${reference}`
      })
    });
  }
}

export const paystack = PaystackService.getInstance();

export { PAYSTACK_PUBLIC_KEY };