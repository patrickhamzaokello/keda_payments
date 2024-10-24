"use server"
import {paymentService} from '@/services/paymentService';


export async function handlePaymentStatusRequest(trackingId: string) {
    try {
        const credentials = {
            consumer_key: process.env.NEXT_PUBLIC_PESAPAL_CONSUMER_KEY,
            consumer_secret: process.env.NEXT_PUBLIC_PESAPAL_CONSUMER_SECRET
          };
      
          if (!credentials.consumer_key || !credentials.consumer_secret) {
            return { success: false, error: 'Payment configuration error' };
          }
      
          // Authenticate with Pesapal
          await paymentService.authenticate({
            consumer_key: credentials.consumer_key,
            consumer_secret: credentials.consumer_secret
          });

        // Submit the order
        const orderStatusResponse = await paymentService.getOrderStatus(trackingId, credentials);

        return {
            success: true,
            orderStatusResponse: orderStatusResponse,
        };
    } catch (error) {
        console.error('Payment API error:', error);
        return {success: false, error: 'Payment processing failed', status: 500};
    }
}