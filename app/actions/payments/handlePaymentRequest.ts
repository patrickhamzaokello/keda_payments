"use server"
import {paymentService} from '@/services/paymentService';
import {PaymentOrderRequest} from '@/types/payment';


export async function handlePaymentRequest(orderDetails: PaymentOrderRequest) {
    try {
        const credentials = {
           consumer_key: process.env.NEXT_PUBLIC_PESAPAL_CONSUMER_KEY?? "",
            consumer_secret: process.env.NEXT_PUBLIC_PESAPAL_CONSUMER_SECRET?? ""
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
        const orderResponse = await paymentService.submitOrder(orderDetails,credentials);

        return {
            success: true,
            redirect_url: orderResponse.redirect_url,
        };
    } catch (error) {
        console.error('Payment API error:', error);
        return {success: false, error: 'Payment processing failed', status: 500};
    }
}