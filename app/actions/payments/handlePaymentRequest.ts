"use server"
import { paymentService } from '@/services/paymentService';
import { mwonyaService } from '@/services/mwonyaDataService';
import { ArtistDetailsResponse, MwonyaPaymentDetails, PaymentOrderRequest } from '@/types/payment';
import exp from 'constants';


export async function handlePaymentRequest(orderDetails: PaymentOrderRequest) {
  try {
    const credentials = {
      consumer_key: process.env.NEXT_PUBLIC_PESAPAL_CONSUMER_KEY ?? "",
      consumer_secret: process.env.NEXT_PUBLIC_PESAPAL_CONSUMER_SECRET ?? ""
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
    const orderResponse = await paymentService.submitOrder(orderDetails, credentials);

    return {
      success: true,
      redirect_url: orderResponse.redirect_url,
    };
  } catch (error) {
    console.error('Payment API error:', error);
    return { success: false, error: 'Payment processing failed', status: 500 };
  }
}

export async function fetchUserDetails(userID: string) {
  try {
    const response = await fetch(`https://test.mwonya.com/Requests/endpoints/getUserDetails.php?userID=${userID}`);
    const data = await response.json();
    return data;
  } catch (error) {
  }
}

export async function fetchArtistDetails(artistID: string): Promise<ArtistDetailsResponse> {
  try {
    const response = await fetch(`https://test.mwonya.com/Requests/endpoints/getArtistCircleDetails.php?artistID=${artistID}`);
    const data: ArtistDetailsResponse = await response.json();
    return data;
  } catch (error) {
    return { error: true, message: 'error', artistDetails: null };
  }
}


export async function postMwonyaOrder(paymentDetails: MwonyaPaymentDetails) {

  try {

    console.log({ paymentDetails })
    // Submit order to mwonya
    const response = await mwonyaService.postPaymentDetailsToMwonya(paymentDetails);

    return {
      success: !response.error,
      message: response.message,
    };
  } catch (error) {
    console.error('Payment API error:', error);
    return { success: false, error: 'Data processing failed', status: 500 };
  }

}