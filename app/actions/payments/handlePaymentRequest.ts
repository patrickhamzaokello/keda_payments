"use server"
import {paymentService} from '@/services/paymentService';
import {PaymentOrderRequest} from '@/types/payment';


export async function handlePaymentRequest(orderDetails: PaymentOrderRequest) {
    try {

        const consumerKey = process.env.NEXT_PUBLIC_PESAPAL_CONSUMER_KEY;
        const consumerSecret = process.env.NEXT_PUBLIC_PESAPAL_CONSUMER_SECRET;

        if (!consumerKey || !consumerSecret) {
            return {success: false, error: 'Payment configuration error'};
        }

        // Authenticate with Pesapal
        await paymentService.authenticate({
            consumer_key: consumerKey,
            consumer_secret: consumerSecret
        });

        // Submit the order
        const orderResponse = await paymentService.submitOrder(orderDetails);

        return {
            success: true,
            redirect_url: orderResponse.redirect_url,
        };
    } catch (error) {
        console.error('Payment API error:', error);
        return {success: false, error: 'Payment processing failed', status: 500};
    }
}