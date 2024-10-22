import { NextResponse } from 'next/server';
import { paymentService } from '@/services/paymentService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderDetails } = body;

    const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
    const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
      return NextResponse.json(
        { error: 'Payment configuration error' },
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

    return NextResponse.json(orderResponse);
  } catch (error) {
    console.error('Payment API error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}