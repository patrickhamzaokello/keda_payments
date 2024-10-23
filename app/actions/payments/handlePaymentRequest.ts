"use server"
import { NextResponse } from 'next/server';
import { paymentService } from '@/services/paymentService';
import { PaymentOrderRequest } from '@/types/payment';

export async function handlePaymentRequest(orderDetails: PaymentOrderRequest) {
  try {

    const consumerKey = process.env.NEXT_PUBLIC_PESAPAL_CONSUMER_KEY;
    const consumerSecret = process.env.NEXT_PUBLIC_PESAPAL_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
      return NextResponse.json(
        { error: 'Payment configuration error ' },
        { status: 500 }
      );
    }

    // Authenticate with Pesapal
    await paymentService.authenticate({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret
    });

    // Submit the order
    const orderResponse = await paymentService.submitOrder(orderDetails);
    const plainOrderResponse = {
      redirect_url: orderResponse.redirect_url,
      // Add other necessary properties from orderResponse
    };

    return NextResponse.json({
      success: true,
      ...plainOrderResponse,
      // Include any other necessary data from orderResponse
    });
  } catch (error) {
    console.error('Payment API error:', error);
    return NextResponse.json(
      { success: false, error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}