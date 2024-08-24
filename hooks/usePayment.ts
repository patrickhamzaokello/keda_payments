// hooks/usePayment.ts

'use client';

import { useState } from 'react';
import { paymentService } from '../services/paymentService';
import { PaymentAuth, PaymentIPNResponse, PaymentOrderResponse, PaymentOrderStatus } from '../types/payment';

export const usePayment = () => {
  const [paymentAuth, setPaymentAuth] = useState<PaymentAuth | null>(null);
  const [ipnResponse, setIpnResponse] = useState<PaymentIPNResponse | null>(null);
  const [paymentOrderResponse, setPaymentOrderResponse] = useState<PaymentOrderResponse | null>(null);
  const [paymentOrderStatus, setPaymentOrderStatus] = useState<PaymentOrderStatus | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const requestAuthentication = async (consumer_key: string, consumer_secret: string) => {
    try {
      const auth = await paymentService.requestAuthentication({ consumer_key, consumer_secret });
      setPaymentAuth(auth);
    } catch (err) {
      setError(err as Error);
    }
  };

  const registerIPN = async (ipnRegisterData: any) => {
    try {
      const response = await paymentService.registerIPN(ipnRegisterData);
      setIpnResponse(response);
    } catch (err) {
      setError(err as Error);
    }
  };

  const submitOrderRequest = async (orderRequestData: any) => {
    if (!paymentAuth) {
      setError(new Error('Authentication token not available'));
      return;
    }
    try {
      const response = await paymentService.submitOrderRequest(orderRequestData, paymentAuth.token);
      setPaymentOrderResponse(response);
    } catch (err) {
      setError(err as Error);
    }
  };

  const getOrderStatus = async (orderTrackingId: string) => {
    if (!paymentAuth) {
      setError(new Error('Authentication token not available'));
      return;
    }
    try {
      const status = await paymentService.getOrderStatus(orderTrackingId, paymentAuth.token);
      setPaymentOrderStatus(status);
    } catch (err) {
      setError(err as Error);
    }
  };

  return {
    paymentAuth,
    ipnResponse,
    paymentOrderResponse,
    paymentOrderStatus,
    error,
    requestAuthentication,
    registerIPN,
    submitOrderRequest,
    getOrderStatus,
  };
};