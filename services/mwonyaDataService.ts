import {
    MwonyaPaymentDetails,
    MwonyaPostPaymentResponse,
  } from '@/types/payment';
  import { PaymentServiceError } from '@/services/PaymentServiceError';
  // import { PaymentServiceError } from '@/lib/PaymentServiceError';
  
  export class MwonyaDataService {
    private readonly API_BASE_URL = 'https://test.mwonya.com/Requests/endpoints/';
  
    private async fetchWithConfig<T>(
        endpoint: string,
        options: RequestInit = {},
        credentials?: { consumer_key: string; consumer_secret: string }
    ): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
        };
  
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
  
 

    async postPaymentDetailsToMwonya(
        ipnDetails: MwonyaPaymentDetails,
      ): Promise<MwonyaPostPaymentResponse> {
        
        try {
          return await this.fetchWithConfig<MwonyaPostPaymentResponse>(
            'post_order_details.php',
            {
              method: 'POST',
              body: JSON.stringify(ipnDetails),
            },
          );
        } catch (error) {
          throw new PaymentServiceError(
            `Payment Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }
  
    
  
  }
  
  // Export a singleton instance
  export const mwonyaService = new MwonyaDataService();