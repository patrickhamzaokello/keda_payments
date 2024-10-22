// components/PaymentScreen.tsx

'use client';

import React, { useEffect,useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";


interface PaymentScreenProps {
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

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
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
      console.error('Whats the password :)');
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
          email_address: "email",
          phone_number: "phone",
          country_code: "KE",
          first_name: "patrick",
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
      console.log("urs")
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
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <div>2Error: {error.message}</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!paymentOrderResponse) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <div>Processing payment...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (redirectUrl) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-3xl h-[80vh]">
          <iframe src={redirectUrl} className="w-full h-full border-none" />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
    <DialogContent>
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
    </DialogContent>
  </Dialog>
  );
};