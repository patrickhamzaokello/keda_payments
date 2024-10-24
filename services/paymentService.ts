import {
  PaymentAuth,
  TokenInfo,
  PaymentOrderResponse,
  PaymentOrderRequest,
  PaymentIPNRegister,
  PaymentIPNResponse,
  PaymentOrderStatus
} from '../types/payment';
import { PaymentServiceError } from '@/services/PaymentServiceError';
// import { PaymentServiceError } from '@/lib/PaymentServiceError';

export class PaymentService {
  private readonly API_BASE_URL = 'https://pay.pesapal.com/v3/';
  private tokenInfo?: TokenInfo;

  private async fetchWithConfig<T>(
      endpoint: string,
      options: RequestInit = {},
      credentials?: { consumer_key: string; consumer_secret: string }
  ): Promise<T> {
      const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
      };

      // Add auth header if we have a valid token
      if (this.tokenInfo && !this.isTokenExpired()) {
          headers['Authorization'] = `Bearer ${this.tokenInfo.token}`;
      }
      // If token is expired and we have credentials, authenticate first
      else if (credentials) {
          await this.authenticate(credentials);
          headers['Authorization'] = `Bearer ${this.tokenInfo!.token}`;
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
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const response = await fetch(url, {
              ...config,
              signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
              const errorData = await response.json()
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

          return response;
      } catch (error) {
          throw new PaymentServiceError(
              `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
      }
  }

  async submitOrder(
      orderRequest: PaymentOrderRequest,
      credentials: { consumer_key: string; consumer_secret: string }
  ): Promise<PaymentOrderResponse> {
      try {
          return await this.fetchWithConfig<PaymentOrderResponse>(
              'api/Transactions/SubmitOrderRequest',
              {
                  method: 'POST',
                  body: JSON.stringify(orderRequest),
              },
              credentials  // Pass credentials for auto-authentication if needed
          );
      } catch (error) {
          throw new PaymentServiceError(
              `Order submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
      }
  }

  async registerIPN(
      ipnDetails: PaymentIPNRegister,
      credentials: { consumer_key: string; consumer_secret: string }
    ): Promise<PaymentIPNResponse> {
      
      try {
        return await this.fetchWithConfig<PaymentIPNResponse>(
          'api/URLSetup/RegisterIPN',
          {
            method: 'POST',
            body: JSON.stringify(ipnDetails),
          },
          credentials
        );
      } catch (error) {
        throw new PaymentServiceError(
          `IPN registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

  async getOrderStatus(
      orderTrackingId: string,
      credentials: { consumer_key: string; consumer_secret: string }
  ): Promise<PaymentOrderStatus> {

      try {
          return await this.fetchWithConfig<PaymentOrderStatus>(
              `api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
              {
                  method: 'POST',
              },
              credentials
          );
      } catch (error) {
          throw new PaymentServiceError(
              `Failed to get order status: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
      }
  }

}

// Export a singleton instance
export const paymentService = new PaymentService();