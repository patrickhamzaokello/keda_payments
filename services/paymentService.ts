"use server"
import axios, { AxiosInstance, AxiosError } from 'axios';
import { PaymentServiceError } from '@/lib/PaymentServiceError';
import { 
  PaymentAuth,
  TokenInfo,
  PaymentIPNResponse, 
  PaymentOrderResponse, 
  PaymentOrderStatus,
  PaymentOrderRequest,
  PaymentIPNRegister
} from '../types/payment';


export class PaymentService {
  private readonly API_BASE_URL = 'https://pay.pesapal.com/v3/';
  private tokenInfo?: TokenInfo;

  private getAxiosInstance(requiresAuth: boolean = false): AxiosInstance {     
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    };

    if (requiresAuth) {
      if (!this.tokenInfo) {
        throw new PaymentServiceError(
          'No authentication token available. Call authenticate() first.'
        );
      }

      if (this.isTokenExpired()) {
        throw new PaymentServiceError(
          'Authentication token has expired. Please re-authenticate.'
        );
      }

      headers['Authorization'] = `Bearer ${this.tokenInfo.token}`;
    }

    return axios.create({
      baseURL: this.API_BASE_URL,
      headers,
      timeout: 10000,
    });
  }

  private async handleRequest<T>(
    requestFn: () => Promise<T>,
    errorMessage: string
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new PaymentServiceError(
          `${errorMessage}: ${error.message}`,
          error.response?.status,
          error.response?.data
        );
      }
      throw new PaymentServiceError(`${errorMessage}: Unknown error occurred`);
    }
  }

  private isTokenExpired(): boolean {
    if (!this.tokenInfo) return true;
    
    // Add 5 minute buffer before actual expiry
    const bufferMs = 5 * 60 * 1000;
    return new Date() >= new Date(this.tokenInfo.expiryDate.getTime() - bufferMs);
  }

  private async ensureValidToken(): Promise<void> {
    if (this.isTokenExpired()) {
      // Re-authenticate if we have stored credentials
      if (this.lastUsedCredentials) {
        await this.authenticate(this.lastUsedCredentials);
      } else {
        throw new PaymentServiceError(
          'Token expired and no stored credentials to re-authenticate'
        );
      }
    }
  }

  // Store the last used credentials for potential re-authentication
  private lastUsedCredentials?: {
    consumer_key: string;
    consumer_secret: string;
  };

  async authenticate(credentials: { 
    consumer_key: string; 
    consumer_secret: string 
  }): Promise<PaymentAuth> {
    return this.handleRequest(
      async () => {
        const response = await this.getAxiosInstance(false)
          .post<PaymentAuth>('api/Auth/RequestToken', credentials);
        
        // Store token info and credentials
        this.tokenInfo = {
          token: response.data.token,
          expiryDate: new Date(response.data.expiryDate)
        };
        this.lastUsedCredentials = credentials;

        return response.data;
      },
      'Authentication failed'
    );
  }

  async registerIPN(
    ipnDetails: PaymentIPNRegister
  ): Promise<PaymentIPNResponse> {
    await this.ensureValidToken();
    
    return this.handleRequest(
      async () => {
        const response = await this.getAxiosInstance(true)
          .post<PaymentIPNResponse>('api/URLSetup/RegisterIPN', ipnDetails);
        return response.data;
      },
      'IPN registration failed'
    );
  }

  async submitOrder(
    orderRequest: PaymentOrderRequest
  ): Promise<PaymentOrderResponse> {
    await this.ensureValidToken();

    return this.handleRequest(
      async () => {
        const response = await this.getAxiosInstance(true)
          .post<PaymentOrderResponse>(
            'api/Transactions/SubmitOrderRequest', 
            orderRequest
          );
        return response.data;
      },
      'Order submission failed'
    );
  }

  async getOrderStatus(
    orderTrackingId: string
  ): Promise<PaymentOrderStatus> {
    await this.ensureValidToken();

    return this.handleRequest(
      async () => {
        const response = await this.getAxiosInstance(true)
          .get<PaymentOrderStatus>(
            `api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`
          );
        return response.data;
      },
      'Failed to get order status'
    );
  }

  // Method to check if service is authenticated
  isAuthenticated(): boolean {
    return !!this.tokenInfo && !this.isTokenExpired();
  }

  // Method to get token expiry time
  getTokenExpiryTime(): Date | null {
    return this.tokenInfo?.expiryDate ?? null;
  }
}

// Export a singleton instance
export const paymentService = new PaymentService();