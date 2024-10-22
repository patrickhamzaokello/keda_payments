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
    description: string;
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

  export type PaymentOrderRequest = {
    id: string;
    currency: string;
    amount: number;
    description: string;
    callback_url: string;
    redirect_mode: string;
    cancellation_url: string;
    notification_id: string;
    branch: string;
    billing_address: {
      email_address: string;
      phone_number: string;
      country_code: string;
      first_name: string;
      middle_name?: string;
      last_name: string;
      line_1: string;
      line_2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      zip_code?: string;
    };
  };

  export interface PaymentIPNRegister {
    url: string;
    ipnNotificationType: string;
  }
  export interface TokenInfo {
    token: string;
    expiryDate: Date;
  } 