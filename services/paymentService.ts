// services/paymentService.ts

import axios, { AxiosInstance } from 'axios';
import { PaymentAuth, PaymentIPNResponse, PaymentOrderResponse, PaymentOrderStatus } from '../types/payment';

const API_BASE_URL = 'https://pay.pesapal.com/v3/';



// Create a function to get the axios instance
const getAxiosInstance = (token?: string): AxiosInstance => {     
  const headers: { [key: string]: string } = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return axios.create({
    baseURL: API_BASE_URL,
    headers,
  });
};

export const paymentService = {
  requestAuthentication: async (paymentKey: { consumer_key: string; consumer_secret: string }): Promise<PaymentAuth> => {
    const axiosInstance = getAxiosInstance();
    const response = await axiosInstance.post('api/Auth/RequestToken', paymentKey);
    return response.data;
  },

  registerIPN: async (paymentIPNRegister: any): Promise<PaymentIPNResponse> => {
    const axiosInstance = getAxiosInstance();
    const response = await axiosInstance.post('api/URLSetup/RegisterIPN', paymentIPNRegister);
    return response.data;
  },

  submitOrderRequest: async (paymentOrderRequest: any, token: string): Promise<PaymentOrderResponse> => {
    const axiosInstance = getAxiosInstance(token);
    const response = await axiosInstance.post('api/Transactions/SubmitOrderRequest', paymentOrderRequest);
    return response.data;
  },

  getOrderStatus: async (orderTrackingId: string, token: string): Promise<PaymentOrderStatus> => {
    const axiosInstance = getAxiosInstance(token);
    const response = await axiosInstance.get(`api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`);
    return response.data;
  },
};