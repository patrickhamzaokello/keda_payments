// types/payment.ts

export interface PaymentAuth {
    token: string;
    expiryDate: string;
  }

  export interface PaymentIPNResponse {
    status: string;
    description: string;
  }
  
  export interface PaymentOrderResponse {
    order_tracking_id: string;
    merchant_reference: string;
    redirect_url: string;
    error: string | null;
    status: string;
  }
  
  export interface ResultResponse {
    // Define the structure of your ResultResponse
  }
  
  export interface PaymentOrderStatus {
    orderTrackingId: string;
    statusCode: number;
    amount: number;
    currency: string;
    payment_status_description: string;
    paymentAccount: string;
    paymentMethod: string;
    confirmationCode: string;
    createdDate: string;
  }
  
  export interface PaymentError {
    message: string;
    errorType?: string;
  }
  
export interface Repository {
    id: number;
    name: string;
    full_name: string;
}

  export interface MwonyaPaymentOrderRequest {
    orderTrackingId: string;
    userId: string;
    amount: number;
    currency: string;
    subscriptionType: string;
    subscriptionTypeId: string;
    statusCode: number;
    paymentStatusDescription: string;
    paymentAccount: string;
    paymentMethod: string;
    confirmationCode: string;
    paymentCreatedDate: string;
    planDuration: number;
    planDescription: string;
  }