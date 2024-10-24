"use server"
import {paymentService} from '@/services/paymentService';


export async function handlePaymentStatusRequest(trackingId: string) {
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
        const orderStatusResponse = await paymentService.getOrderStatus(trackingId, credentials);

        return {
            success: true,
            orderTrackingId: orderStatusResponse.orderTrackingId,
            statusCode: orderStatusResponse.statusCode,
            amount: orderStatusResponse.amount,
            currency: orderStatusResponse.currency,
            payment_status_description: orderStatusResponse.payment_status_description,
            paymentAccount: orderStatusResponse.paymentAccount,
            paymentMethod: orderStatusResponse.paymentMethod,
            confirmationCode: orderStatusResponse.confirmationCode,
            createdDate: orderStatusResponse.createdDate,
        };
    } catch (error) {
        console.error('Payment API error:', error);
        return {success: false, error: 'Payment processing failed', status: 500};
    }
}