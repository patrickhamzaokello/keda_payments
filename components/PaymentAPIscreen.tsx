'use client';

import React, { useEffect, useState } from 'react';
import { usePayment } from '../hooks/usePayment';

interface PaymentPageProps {
  amount: number;
  planDuration: number;
  planDescription: string;
  subscriptionType: string;
  subscriptionTypeId: string;
  userId: string;
  username: string;
  email: string;
  phone: string;
  onClose: () => void;
}

export const PaymentAPIscreen: React.FC<PaymentPageProps> = ({
  amount,
  planDuration,
  planDescription,
  subscriptionType,
  subscriptionTypeId,
  userId,
  username,
  email,
  phone,
  onClose,
}) => {
  const {
    paymentAuth,
    paymentOrderResponse,
    paymentOrderStatus,
    error,
    requestAuthentication,
    submitOrderRequest,
    getOrderStatus,
  } = usePayment();

  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    const consumer_key = process.env.NEXT_PUBLIC_CONSUMER_KEY;
    const consumer_secret = process.env.NEXT_PUBLIC_CONSUMER_SECRET;

    if (consumer_key && consumer_secret) {
      requestAuthentication(consumer_key, consumer_secret);
    } else {
      console.error('Whats your secrets :)');
    }
  }, []);

  const generateOrderId = (): string => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:.T]/g, '').slice(0, 15); // Format timestamp
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
    return `ORD${timestamp}${randomNum}`;
  };

  useEffect(() => {
    // Submit order request when we have authentication
    if (paymentAuth) {
      const orderRequestData = {
        amount,
        description: planDescription,
        id: generateOrderId(),
        currency: "UGX",
        callback_url: "https://mwonya.com",
        cancellation_url: "https://payments.mwonya.com/cancel_payment",
        notification_id: "e523e059-f93b-43ef-9e2b-dd2fb3d7497e",
        branch: "Mwonya HQ",
        billing_address: {
          email_address: email,
          phone_number: phone,
          country_code: "KE",
          first_name: username,
          middle_name: "",
          last_name: "okello",
          line_1: "Pesapal Limited",
          line_2: "",
          city: "",
          state: "",
          postal_code: "",
          zip_code: ""
        }
      };
      submitOrderRequest(orderRequestData);
    }
  }, [paymentAuth]);

  useEffect(() => {
    if (paymentOrderResponse) {
      setRedirectUrl(paymentOrderResponse.redirect_url);
    }
  }, [paymentOrderResponse]);

  useEffect(() => {
    if (paymentOrderResponse && paymentOrderResponse.order_tracking_id) {
      const intervalId = setInterval(() => {
        getOrderStatus(paymentOrderResponse.order_tracking_id);
      }, 5000); // Check status every 5 seconds

      return () => clearInterval(intervalId);
    }
  }, [paymentOrderResponse]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-4/5">
          <h2>Error</h2>
          <p>{error.message}</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  if (!paymentOrderResponse) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-4/5">
          <h2>Processing payment...</h2>
        </div>
      </div>
    );
  }

  if (redirectUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-4/5 max-w-3xl h-[80vh]">
          <iframe src={redirectUrl} className="w-full h-full border-none" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-4/5">
        <h2 className="text-2xl font-bold mb-4">Payment Status</h2>
        {paymentOrderStatus ? (
          <div>
            <p>Status: {paymentOrderStatus.payment_status_description}</p>
            <p>Amount: {paymentOrderStatus.amount}</p>
            <p>Currency: {paymentOrderStatus.currency}</p>
            {/* Add more status details as needed */}
          </div>
        ) : (
          <p>Checking payment status...</p>
        )}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};