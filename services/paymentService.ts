import { 
  PaymentAuth,
  TokenInfo,
  PaymentIPNResponse,
  PaymentOrderResponse,
  PaymentOrderStatus,
  PaymentOrderRequest,
  PaymentIPNRegister,
  PaymentError
} from '../types/payment';
import { PaymentServiceError } from '@/services/PaymentServiceError';
// import { PaymentServiceError } from '@/lib/PaymentServiceError';

export class PaymentService {
  private readonly API_BASE_URL = 'https://pay.pesapal.com/v3/';
  private tokenInfo?: TokenInfo;
  private lastUsedCredentials?: {
    consumer_key: string;
    consumer_secret: string;
  };

  private async fetchWithConfig<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = false
  ): Promise<T> {
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

    const url = `${this.API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: PaymentError = await response.json()
          .catch(() => ({ message: 'Failed to parse error response' }));
        
        throw new PaymentServiceError(
          errorData.message || response.statusText,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof PaymentServiceError) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new PaymentServiceError('Request timeout');
        }
        throw new PaymentServiceError(error.message);
      }
      throw new PaymentServiceError('Unknown error occurred');
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
      if (this.lastUsedCredentials) {
        await this.authenticate(this.lastUsedCredentials);
      } else {
        throw new PaymentServiceError(
          'Token expired and no stored credentials to re-authenticate'
        );
      }
    }
  }

  async authenticate(credentials: { 
    consumer_key: string; 
    consumer_secret: string 
  }): Promise<PaymentAuth> {
    try {
      const response = await this.fetchWithConfig<PaymentAuth>(
        'api/Auth/RequestToken',
        {
          method: 'POST',
          body: JSON.stringify(credentials),
        }
      );

      this.tokenInfo = {
        token: response.token,
        expiryDate: new Date(response.expiryDate)
      };
      this.lastUsedCredentials = credentials;

      return response;
    } catch (error) {
      throw new PaymentServiceError(
        `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async registerIPN(
    ipnDetails: PaymentIPNRegister
  ): Promise<PaymentIPNResponse> {
    await this.ensureValidToken();
    
    try {
      return await this.fetchWithConfig<PaymentIPNResponse>(
        'api/URLSetup/RegisterIPN',
        {
          method: 'POST',
          body: JSON.stringify(ipnDetails),
        },
        true
      );
    } catch (error) {
      throw new PaymentServiceError(
        `IPN registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async submitOrder(
    orderRequest: PaymentOrderRequest
  ): Promise<PaymentOrderResponse> {
    await this.ensureValidToken();

    try {
      return await this.fetchWithConfig<PaymentOrderResponse>(
        'api/Transactions/SubmitOrderRequest',
        {
          method: 'POST',
          body: JSON.stringify(orderRequest),
        },
        true
      );
    } catch (error) {
      throw new PaymentServiceError(
        `Order submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getOrderStatus(
    orderTrackingId: string
  ): Promise<PaymentOrderStatus> {
    await this.ensureValidToken();

    try {
      return await this.fetchWithConfig<PaymentOrderStatus>(
        `api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
        {
          method: 'GET',
        },
        true
      );
    } catch (error) {
      throw new PaymentServiceError(
        `Failed to get order status: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  isAuthenticated(): boolean {
    return !!this.tokenInfo && !this.isTokenExpired();
  }

  getTokenExpiryTime(): Date | null {
    return this.tokenInfo?.expiryDate ?? null;
  }
}

// Export a singleton instance
export const paymentService = new PaymentService();