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
        console.log({orderStatusResponse});

        return {
            success: true,
            trackingId: orderStatusResponse.order_tracking_id,
            code: orderStatusResponse.status_code,
            totalAmount: orderStatusResponse.amount,
            currencyType: orderStatusResponse.currency,
            statusDescription: orderStatusResponse.payment_status_description,
            account: orderStatusResponse.payment_account,
            method: orderStatusResponse.payment_method,
            confirmation: orderStatusResponse.confirmation_code,
            dateCreated: orderStatusResponse.created_date,
            description: orderStatusResponse.description,
            message: orderStatusResponse.message,
            callBackUrl: orderStatusResponse.call_back_url,
            merchantReference: orderStatusResponse.merchant_reference,
            accountNumber: orderStatusResponse.account_number,
            paymentStatusCode: orderStatusResponse.payment_status_code,
            // error: {
            //     errorType: orderStatusResponse.error.error_type,
            //     code: orderStatusResponse.error.code,
            //     message: orderStatusResponse.error.message
            // },
            status: orderStatusResponse.status
        };
    } catch (error) {
        console.error('Payment API error:', error);
        return {success: false, error: 'Payment processing failed', status: 500};
    }
}