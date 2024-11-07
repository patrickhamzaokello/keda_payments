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

export interface MwonyaPostPaymentResponse {
  error: boolean;
  message: string;
}

export interface ResultResponse {
  // Define the structure of your ResultResponse
}

export interface PaymentOrderStatus {
  payment_method: string;
  amount: number;
  created_date: string;
  confirmation_code: string;
  order_tracking_id: string;
  payment_status_description: string;
  description: string | null;
  message: string;
  payment_account: string;
  call_back_url: string;
  status_code: number;
  merchant_reference: string;
  account_number: string | null;
  payment_status_code: string;
  currency: string;
  error: {
    error_type: string | null;
    code: string | null;
    message: string | null;
  };
  status: string;
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

export interface MwonyaPaymentDetails {
  merchant_reference: string;
  userId: string;
  amount: number;
  currency: string;
  subscriptionType: string;
  subscriptionTypeId: string;
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
  notification_id: string;
  branch: string;
  billing_address: {
    email_address: string;
    phone_number: string;
    country_code: string;
    first_name: string;
    last_name: string;
    line_1: string;
  };
};




export type UserDataResponse = {
  error: boolean;
  message: string;
  userDetails: UserDetails[];
};

export type UserDetails = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePic: string;
  signUpDate: string;
  verified: number;
  mwRole: string;
};

export type ArtistCircleDetails = {
  id: string,
  name: string,
  profilephoto: string,
  genre: string,
  verified: boolean,
  circle_cost: string,
  circle_duration: number
}

export type ArtistDetailsResponse = {
  error: boolean;
  message: string;
  artistDetails: ArtistCircleDetails | null;
};

export interface PaymentIPNRegister {
  url: string;
  ipnNotificationType: string;
}
export interface TokenInfo {
  token: string;
  expiryDate: Date;
} 